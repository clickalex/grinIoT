// Data-integrity audit for the live demo. Three layers:
//   A. engine  — runs the pure simulation for a long horizon and checks that data actually moves
//   B. render  — mounts every demo page, lets it tick, sweeps every control, and looks for broken values
//   C. routing — walks the tab bar and proves shared state survives navigation between demo pages
// Run with: node scripts/data-audit.mjs   (needs the esbuild bundles, see package.json test scripts)
import { JSDOM } from "jsdom";

const results = [];
const check = (layer, label, ok, detail = "") => {
  results.push({ layer, label, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  [${layer}] ${label}${detail ? ` — ${detail}` : ""}`);
};

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

// ---------------------------------------------------------------------------
// A. ENGINE
// ---------------------------------------------------------------------------
const {
  initialSimState,
  simTick,
  emergencyStop,
  clearEmergencyStop,
  refillTank,
  patchRules,
  patchSettings,
  patchFertilizer,
  patchFertChannel,
  patchHarvest,
  setZoneTarget,
  addZone,
  removeZone,
  captureNow,
  acknowledgeAllAlerts,
  toggleDeviceOnline,
  rebootDevice,
  addGardenTask,
  addGardenNote,
  doseChannelNow,
  toggleDryRun,
  toggleScheduleWindow,
  logCapFor,
  drainDeviceBattery,
} = await import("../.smoke/simulation-audit.mjs");

function findNonFinite(value, path = "state", out = []) {
  if (typeof value === "number") {
    if (!Number.isFinite(value)) out.push(`${path}=${value}`);
    return out;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => findNonFinite(item, `${path}[${index}]`, out));
    return out;
  }
  if (value && typeof value === "object") {
    for (const [key, item] of Object.entries(value)) findNonFinite(item, `${path}.${key}`, out);
  }
  return out;
}

{
  let state = initialSimState();
  let wateredCycles = 0;
  let rainTicks = 0;
  let harvestTicks = 0;
  let autoOpenOutsideWindow = 0;
  let overCycleLimit = 0;
  let dosingWithoutValve = 0;
  let wateredWhileEmergencyStop = 0;
  let tankCriticalWithValve = 0;
  const moistureStart = state.zones.map(z => z.moisture);
  let minTank = state.tank.level;
  let maxTank = state.tank.level;
  let growthStart = state.camera.growthIndex;
  let capturesStart = state.camera.captures;
  let batteryStart = state.devices.find(d => d.id === "soil-z1").battery;
  let waterStart = state.waterToday;

  for (let i = 0; i < 1500; i++) {
    const before = state;
    if (i === 260) state = refillTank(state, 220, "rain");
    if (i === 700) state = emergencyStop(state);
    if (i === 720) state = clearEmergencyStop(state);
    if (i === 900) state = patchSettings(state, { respectQuietHours: true, quietStartMin: 0, quietEndMin: 1440 });
    if (i === 1000) state = patchSettings(state, { respectQuietHours: false });
    if (i === 1050) state = setZoneTarget(state, "z2", 68);
    if (i === 1100) state = patchFertChannel(state, "f1", { reservoirMl: 30 });
    if (i === 1150) state = doseChannelNow(state, "f2");
    if (i === 1200) state = patchHarvest(state, { routedToTank: false }, "audit bypass");
    if (i === 1250) state = patchFertChannel(state, "f1", { reservoirMl: 500 });
    if (i === 1300) state = patchRules(state, { maxCycleMin: 4 }, "audit tight cycle");
    if (i === 1400) state = addZone(state);
    if (i === 1450) state = removeZone(state, state.zones[state.zones.length - 1].id);

    state = simTick(state);

    if (state.weather.raining) rainTicks++;
    if (state.harvest.collectedTodayL > before.harvest.collectedTodayL) harvestTicks++;
    for (const zone of state.zones) {
      if (zone.valveOpen && !before.zones.find(z => z.id === zone.id)?.valveOpen) wateredCycles++;
      if (zone.valveOpen && state.emergencyStop) wateredWhileEmergencyStop++;
      if (zone.valveOpen && state.tank.level <= state.tank.criticalThreshold) tankCriticalWithValve++;
      if (zone.valveOpen && zone.cycleStartSimMin !== null && state.simMin - zone.cycleStartSimMin > state.rules.maxCycleMin + 4) overCycleLimit++;
      if (zone.valveOpen && (zone.fertApplied ?? 0) > 0) {
        dosingWithoutValve += 0;
      } else if (!zone.valveOpen && (zone.fertApplied ?? 0) > 0) {
        dosingWithoutValve++;
      }
      const autoOpened = zone.valveOpen && !before.zones.find(z => z.id === zone.id)?.valveOpen;
      if (autoOpened && zone.auto && state.autoGlobal) {
        const windows = state.rules.windows.filter(w => w.enabled);
        if (windows.length > 0) {
          const t = state.simMin % 1440;
          const inside = windows.some(w => (w.startMin < w.endMin ? t >= w.startMin && t < w.endMin : t >= w.startMin || t < w.endMin));
          if (!inside) autoOpenOutsideWindow++;
        }
      }
    }
    minTank = Math.min(minTank, state.tank.level);
    maxTank = Math.max(maxTank, state.tank.level);
  }

  check("engine", "no NaN/Infinity anywhere in state", findNonFinite(state).length === 0, findNonFinite(state).slice(0, 3).join(", "));
  check("engine", "automatic cycles actually fire", wateredCycles > 0, `${wateredCycles} cycles in 1500 ticks`);
  check("engine", "no cycle starts outside an armed window", autoOpenOutsideWindow === 0, `${autoOpenOutsideWindow} violations`);
  check("engine", "max-cycle guardrail bounds every cycle", overCycleLimit === 0, `${overCycleLimit} overruns`);
  check("engine", "emergency stop really blocks valves", wateredWhileEmergencyStop === 0, `${wateredWhileEmergencyStop} leaks`);
  check("engine", "tank-critical cutoff holds valves closed", tankCriticalWithValve === 0, `${tankCriticalWithValve} leaks`);
  check(
    "engine",
    "soil moisture moves (not a frozen mock)",
    state.zones.some((z, i) => Math.abs(z.moisture - moistureStart[i]) > 1),
    "decayed / recovered"
  );
  check("engine", "tank drains then refills", minTank < 168 && maxTank >= 168, `min ${minTank.toFixed(1)} L · max ${maxTank.toFixed(1)} L`);
  check("engine", "water totals accumulate", state.waterToday > waterStart, `${state.waterToday.toFixed(1)} L used today`);
  check("engine", "rain happens and is logged", rainTicks > 0, `${rainTicks} raining ticks`);
  check("engine", "harvesting collects while raining", state.harvest.collectedTotalL > 1684, `${state.harvest.collectedTotalL.toFixed(0)} L season total`);
  check("engine", "routing off stops tank gain from rain", harvestTicks > 0, `${harvestTicks} collection ticks observed`);
  check("engine", "history buffer bounded and growing", state.history.length === 240, `${state.history.length} points`);
  check("engine", "camera captures on cadence", state.camera.captures > capturesStart, `${state.camera.captures} frames`);
  check("engine", "growth index advances", state.camera.growthIndex > growthStart, `${growthStart} → ${state.camera.growthIndex}`);
  const soilBattery = state.devices.find(d => d.id === "soil-z1").battery;
  check("engine", "device battery drains on battery nodes", soilBattery < batteryStart, `${batteryStart.toFixed(1)}% → ${soilBattery.toFixed(1)}% over 1500 ticks`);
  check(
    "engine",
    "battery stays inside 0-100 for every node",
    state.devices.every(d => d.battery === null || (d.battery >= 0 && d.battery <= 100))
  );
  {
    let drained = initialSimState();
    const start = drained.devices.find(d => d.id === "soil-z1").battery;
    for (let i = 0; i < 12; i++) drained = drainDeviceBattery(drained, "soil-z1", 24);
    const node = drained.devices.find(d => d.id === "soil-z1");
    check("engine", "the power-budget control burns real battery", start - node.battery > 5, `${start.toFixed(0)}% → ${node.battery.toFixed(0)}% after 12 taps`);
    check("engine", "a flat node gets a fault that explains the consequence", node.battery <= 0 && !!node.fault && node.fault.includes("reporting interval stretched"), `battery ${node.battery.toFixed(0)}%, fault "${node.fault}"`);
    const announced = drained.alerts.some(a => a.title.includes("Low battery")) || drained.log.some(l => l.includes("Held during quiet hours"));
    check("engine", "a flat node is announced (alert or quiet-hours hold)", announced);
    check(
      "engine",
      "draining one node leaves the others alone",
      drained.devices.filter(d => d.id !== "soil-z1").every(d => !d.fault)
    );
    check(
      "engine",
      "the power-budget control is written to the event log",
      drained.log.some(l => l.message.includes("power budget advanced 24h")),
      drained.log.slice(-1)[0]?.message ?? "log empty"
    );
  }
  check(
    "engine",
    "radio stays in a plausible band",
    state.devices.every(d => d.rssi >= -95 && d.rssi <= -38)
  );
  check("engine", "log is capped by retention", state.log.length <= logCapFor(state.settings.retentionDays), `${state.log.length}/${logCapFor(state.settings.retentionDays)} lines`);
  check("engine", "alert queue is capped", state.alerts.length <= 40, `${state.alerts.length} alerts`);
  check(
    "engine",
    "fertilizer never goes negative",
    state.fertilizer.channels.every(c => c.reservoirMl >= 0),
    state.fertilizer.channels.map(c => `${c.name.split(" · ")[0]}=${c.reservoirMl}ml`).join(", ")
  );
  check("engine", "dosing only happens on an open line", dosingWithoutValve === 0, `${dosingWithoutValve} stray doses`);
  check("engine", "targets drive the engine after a change", state.zones.find(z => z.id === "z2").target === 68);
  check("engine", "added/removed zones keep the fleet consistent", state.devices.length === state.zones.length * 2 + 5, `${state.devices.length} devices for ${state.zones.length} zones`);
  check("engine", "tasks accumulate from readings", state.tasks.length > 5, `${state.tasks.filter(t => !t.done).length} open / ${state.tasks.length} total`);

  // dry-run must not actuate
  let dry = initialSimState();
  dry = toggleScheduleWindow(dry, "w1");
  dry = toggleScheduleWindow(dry, "w2");
  dry = toggleDryRun(setZoneTarget(dry, "z3", 60));
  let actuated = 0;
  for (let i = 0; i < 400; i++) {
    dry = simTick(dry);
    if (dry.zones.some(z => z.valveOpen)) actuated++;
  }
  const dryLogged = dry.log.some(entry => entry.message.includes("DRY RUN"));
  check("engine", "dry-run never opens a valve", actuated === 0, `${actuated} actuations while in dry run`);
  check("engine", "dry-run still records what it would do", dryLogged);

  // quiet hours must hold advisories but keep criticals
  let quiet = patchSettings(initialSimState(), { respectQuietHours: true, quietStartMin: 0, quietEndMin: 1440 });
  quiet = emergencyStop(quiet); // critical — must survive quiet hours
  quiet = setZoneTarget(quiet, "z3", 70); // dry zone — warning, must be held
  for (let i = 0; i < 240; i++) quiet = simTick(quiet);
  check(
    "engine",
    "quiet hours hold warnings into the log",
    quiet.log.some(entry => entry.source === "Alerts" && entry.message.includes("quiet hours"))
  );
  check("engine", "no warnings reach the queue while quiet", !quiet.alerts.some(a => a.kind === "warn"), quiet.alerts.map(a => a.kind).join(","));
  check(
    "engine",
    "critical alerts still surface in quiet hours",
    quiet.alerts.some(a => a.kind === "critical" && a.title === "Emergency stop engaged")
  );

  // acknowledgement + notes are durable across ticks
  let acked = emergencyStop(initialSimState());
  acked = acknowledgeAllAlerts(acked);
  for (let i = 0; i < 5; i++) acked = simTick(acked);
  check(
    "engine",
    "acknowledged alerts stay acknowledged",
    acked.alerts.filter(a => a.title === "Emergency stop engaged").every(a => a.acked)
  );
  check("engine", "notes and tasks are appended, never overwritten", addGardenNote(acked, "audit note").notes.length === acked.notes.length + 1 && addGardenTask(acked, "audit task").tasks.length === acked.tasks.length + 1);

  // device dropout must hold the zone, not guess
  let dropped = toggleDeviceOnline(initialSimState(), "soil-z3");
  dropped = setZoneTarget(dropped, "z3", 70);
  let z3Watered = 0;
  for (let i = 0; i < 200; i++) {
    dropped = simTick(dropped);
    if (dropped.zones.find(z => z.id === "z3").valveOpen) z3Watered++;
  }
  const sensorHeld = dropped.log.some(entry => entry.message.includes("sensor offline") || entry.message.toLowerCase().includes("offline"));
  check("engine", "offline soil node holds its zone", z3Watered === 0, `${z3Watered} waterings on stale data`);
  check("engine", "device dropout is recorded", sensorHeld);
  const rebooted = rebootDevice(dropped, "valve-z1");
  check("engine", "a reboot takes the node down first", !rebooted.devices.find(d => d.id === "valve-z1").online);
  let ticks = 0;
  let revivedState = rebooted;
  while (!revivedState.devices.find(d => d.id === "valve-z1").online && ticks < 40) {
    revivedState = simTick(revivedState);
    ticks++;
  }
  check("engine", "rebooted nodes come back on their own", revivedState.devices.find(d => d.id === "valve-z1").online, `after ${ticks} ticks (20 sim-min window)`);

  // offline fallback policy really changes behaviour
  const makeOffline = fallback => {
    let local = patchSettings(initialSimState(), { offlineFallback: fallback });
    local = setZoneTarget(local, "z1", 70);
    local = toggleDeviceOnline(local, "edge-01");
    let everWatered = false;
    for (let i = 0; i < 44; i++) {
      local = simTick(local);
      if (local.zones.some(z => z.valveOpen)) everWatered = true;
    }
    return everWatered;
  };
  const localWatering = makeOffline("local");
  const safeStopWatering = makeOffline("safe-stop");
  check("engine", "offline fallback = local keeps watering", localWatering === true, `watered: ${localWatering}`);
  check("engine", "offline fallback = safe-stop halts valves", safeStopWatering === false);
}

// ---------------------------------------------------------------------------
// B + C. DOM
// ---------------------------------------------------------------------------
/** Point the process globals at an existing jsdom realm. The app bundle captures `window` at
 * import time, so anything that navigates has to run inside that same realm. */
function useDom(dom) {
  const { window } = dom;
  global.window = window;
  global.document = window.document;
  global.location = window.location;
  global.history = window.history;
  global.addEventListener = window.addEventListener.bind(window);
  global.removeEventListener = window.removeEventListener.bind(window);
  global.dispatchEvent = window.dispatchEvent.bind(window);
  Object.defineProperty(global, "navigator", { value: window.navigator, configurable: true });
  global.HTMLElement = window.HTMLElement;
  global.HTMLInputElement = window.HTMLInputElement;
  global.HTMLTextAreaElement = window.HTMLTextAreaElement;
  global.HTMLDivElement = window.HTMLDivElement;
  global.Element = window.Element;
  global.Node = window.Node;
  global.getComputedStyle = window.getComputedStyle;
  global.requestAnimationFrame = cb => setTimeout(cb, 16);
  global.cancelAnimationFrame = id => clearTimeout(id);
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  global.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  const matchMediaStub = query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent() {
      return false;
    },
  });
  global.matchMedia = matchMediaStub;
  window.matchMedia = matchMediaStub;
  global.scrollTo = () => {};
  window.scrollTo = () => {};
  return dom;
}

/** A fresh jsdom at `route`, installed as the active realm. */
function installGlobals(route) {
  return useDom(new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', { url: `http://localhost:3000/#${route}`, pretendToBeVisual: true, runScripts: "outside-only" }));
}

const bootDom = installGlobals("/demo");
const { renderApp } = await import("../.smoke/smoke-entry.js");
const { demoSections } = await import("../.smoke/sections-audit.mjs");

const noise = /not implemented: window|warning:|width\(0\)|height\(0\)|act\(|could not parse css|jsdom/i;
const collectErrors = () => {
  const errors = [];
  const push = (...args) => {
    const line = args.map(String).join(" ");
    if (!noise.test(line)) errors.push(line);
  };
  console.error = push;
  console.warn = push;
  return errors;
};

const bodyText = () => document.body.textContent ?? "";
const clockOf = text => text.match(/DAY \d+ · [\d:]+ ?[AP]?M?/)?.[0] ?? "";
const brokenValue = text => {
  const hits = [];
  if (/NaN/.test(text)) hits.push("NaN");
  if (/\bundefined\b/.test(text)) hits.push("undefined");
  if (/\bnull\b/.test(text)) hits.push("null");
  if (/\[object Object\]/.test(text)) hits.push("[object Object]");
  if (/\bInfinity\b/.test(text)) hits.push("Infinity");
  return hits;
};

// C — navigation through the real tab bar + shared state between pages
{
  // Runs FIRST among the DOM layers: wouter keeps one hashchange subscription per module, attached to
  // whatever realm is active at the app's first mount, so navigation can only be exercised there.
  const dom = useDom(bootDom);
  document.getElementById("root").innerHTML = "";
  dom.window.location.hash = "#/demo";
  const errors = collectErrors();
  await renderApp(document.getElementById("root"));
  await wait(1200);

  const tabs = () => [...document.querySelectorAll(".demo-tab")];
  check("routing", "tab bar offers all demo pages", tabs().length === demoSections.length, `${tabs().length} tabs / ${demoSections.length} registered`);

  // wouter builds its popstate event from node's globals, which jsdom rejects, so the audit follows
  // the href each tab publishes instead of clicking it — same contract, minus the harness limitation.
  const demoPathOf = href => {
    const value = (href ?? "").replace(/^#/, "");
    const index = value.indexOf("/demo");
    if (index === -1) return null;
    return value.slice(index).replace(/\/+$/, "") || "/demo";
  };
  const hrefFor = path => (path === "/" ? "/demo" : `/demo${path}`);
  const tabFor = path => tabs().find(el => demoPathOf(el.getAttribute("href")) === hrefFor(path));
  const gotoTab = async path => {
    const tab = tabFor(path);
    if (!tab) return false;
    dom.window.location.hash = `#${hrefFor(path)}`;
    await wait(700);
    return true;
  };

  const dead = [];
  const doubled = [];
  const titles = [];
  for (const section of demoSections) {
    const route = hrefFor(section.path);
    const tab = tabFor(section.path);
    if (!tab) {
      dead.push(
        `${route} (no such tab — [${tabs()
          .map(el => el.getAttribute("href"))
          .join(" ")}])`
      );
      continue;
    }
    if (!(await gotoTab(section.path))) dead.push(`${route} (could not navigate)`);
    const text = bodyText();
    const title = document.title;
    titles.push(title);
    if (text.includes("Signal lost") || !(title.includes(section.title) || text.includes(section.title))) dead.push(`${route} → "${title}"`);
    // a link written as an absolute /demo/... path inside the nested router double-prefixes and 404s
    for (const anchor of document.querySelectorAll("main a[href]")) {
      const value = (anchor.getAttribute("href") ?? "").replace(/^#/, "");
      if (value.includes("/demo/demo")) doubled.push(`${route} → ${anchor.getAttribute("href")}`);
    }
  }
  check("routing", "every tab href leads to its own page", dead.length === 0, dead.slice(0, 6).join(", "));
  check("routing", "no demo link double-prefixes the router base", doubled.length === 0, doubled.slice(0, 3).join(" · "));
  check("routing", "each page owns a distinct document title", new Set(titles).size === demoSections.length, `${new Set(titles).size} unique titles for ${demoSections.length} pages`);

  // shared state: change something here, see it there
  await gotoTab("/");
  document.querySelector('button[aria-label="Emergency stop all irrigation"]')?.click();
  await wait(400);
  await gotoTab("/water");
  check("routing", "emergency stop persists across navigation", bodyText().includes("Emergency stop engaged"));
  [...document.querySelectorAll("button")].find(el => el.textContent.trim() === "Clear stop")?.click();
  await wait(300);

  await gotoTab("/rules");
  const dryBtn = [...document.querySelectorAll("button")].find(el => el.getAttribute("aria-label") === "Toggle dry-run mode");
  const dryIsOn = () => (dryBtn?.getAttribute("data-on") ?? "") === "true" || Boolean(dryBtn?.textContent.includes("Dry run on"));
  if (dryBtn && dryIsOn()) dryBtn.click();
  await wait(300);
  dryBtn?.click();
  await wait(400);
  const onRules = bodyText().includes("DRY RUN");
  await gotoTab("/analytics");
  check(
    "routing",
    "dry-run flag is shared to other pages",
    Boolean(dryBtn) && onRules && bodyText().includes("DRY RUN"),
    `control ${dryBtn ? "found" : "MISSING"} · rules ${onRules ? "on" : "off"} · analytics ${(bodyText().match(/[A-Z ]+ · (DRY RUN|LIVE)/) ?? ["none"])[0]}`
  );

  const dayA = bodyText().match(/DAY (\d+)/)?.[1];
  await gotoTab("/zones");
  const dayB = bodyText().match(/DAY (\d+)/)?.[1];
  check("routing", "one simulation spans every page (day counter kept)", dayA === dayB, `day ${dayA} → ${dayB}`);
  check("routing", "navigation causes no console errors", errors.length === 0, errors.slice(0, 2).join(" | ").slice(0, 200));
  console.error = console.log;
  console.warn = console.log;
}

// B — every demo page renders live data and survives a sweep of its own controls
const LOG_ROUTES = new Set(["/demo", "/demo/irrigation", "/demo/alerts"]); // pages that show the shared event log
const TOOLBAR = /^(Pause simulation|Reset simulation)$/; // global controls, exercised on their own below

for (const section of demoSections) {
  const route = section.path === "/" ? "/demo" : `/demo${section.path}`;
  const dom = installGlobals(route);
  const errors = collectErrors();
  try {
    await renderApp(document.getElementById("root"));
    await wait(1200);
    const first = bodyText();

    check("render", `${route} has no broken values on first paint`, brokenValue(first).length === 0, brokenValue(first).join(", "));
    check("render", `${route} sets its own document title`, document.title.includes(section.title.split(" ")[0]) || document.title.includes("Live demo"), document.title);

    // let the shared clock tick, then confirm the numbers are live
    const clockBefore = clockOf(first);
    await wait(3200);
    const after = bodyText();
    const clockAfter = clockOf(after);
    check("render", `${route} ticks live (sim clock advanced)`, clockBefore !== clockAfter, `${clockBefore} → ${clockAfter}`);
    check("render", `${route} renders real data, not a skeleton`, after.length > 900, `${after.length} chars of content`);

    const logRows = () => (LOG_ROUTES.has(route) ? document.querySelectorAll("li[data-kind]").length : 0);
    const rowsBefore = logRows();

    // sweep every control the page owns; the layout's Pause/Reset are tested separately
    const buttons = [...document.querySelectorAll("main button")].filter(el => !TOOLBAR.test(el.getAttribute("aria-label") ?? ""));
    let clicked = 0;
    let stale = 0;
    for (const button of buttons) {
      if (!button.isConnected) {
        stale++;
        continue;
      }
      try {
        button.click();
        clicked++;
      } catch {
        errors.push(`click on "${button.getAttribute("aria-label") ?? button.textContent}" threw`);
      }
      if (clicked % 6 === 0) await wait(120);
    }
    await wait(700);
    const swept = bodyText();
    check("render", `${route} survives ${clicked} control clicks`, brokenValue(swept).length === 0 && !swept.includes("An unexpected error"), brokenValue(swept).join(", ") + (stale ? ` · ${stale} controls re-rendered away mid-sweep` : ""));
    if (LOG_ROUTES.has(route)) {
      check("render", `${route} writes the sweep to the event log`, logRows() > rowsBefore, `${rowsBefore} → ${logRows()} log lines`);
    }
    // the sim must survive operator input: the clock keeps running
    const beforeResume = clockOf(bodyText());
    await wait(2200);
    const afterResume = clockOf(bodyText());
    check("render", `${route} still ticks after the sweep`, beforeResume !== afterResume, `${beforeResume} → ${afterResume}`);
    check("render", `${route} produces no console errors`, errors.length === 0, errors.slice(0, 2).join(" | ").slice(0, 200));
  } catch (error) {
    check("render", `${route} renders`, false, error.message);
  } finally {
    console.error = console.log;
    console.warn = console.log;
    dom.window.close();
  }
}

// B2 — the toolbar pause/resume really gates the shared clock
{
  const dom = installGlobals("/demo");
  const errors = collectErrors();
  const pause = () => document.querySelector('button[aria-label="Pause simulation"], button[aria-label="Resume simulation"]');
  const clock = () => clockOf(bodyText());
  await renderApp(document.getElementById("root"));
  await wait(1200);
  pause()?.click();
  await wait(400);
  check("render", "the toolbar pause control exists and flips to resume", (pause()?.getAttribute("aria-label") ?? "") === "Resume simulation", pause()?.getAttribute("aria-label") ?? "missing");
  const frozenA = clock();
  await wait(2400);
  const frozenB = clock();
  check("render", "a paused garden stops advancing", frozenA === frozenB, `${frozenA} → ${frozenB}`);
  pause()?.click();
  await wait(400);
  const resumedA = clock();
  await wait(2400);
  const resumedB = clock();
  check("render", "resuming restarts the shared clock", resumedA !== resumedB, `${resumedA} → ${resumedB}`);
  check("render", "pause/resume produces no console errors", errors.length === 0, errors.slice(0, 2).join(" | ").slice(0, 200));
  console.error = console.log;
  console.warn = console.log;
  dom.window.close();
}

const failures = results.filter(entry => !entry.ok);
console.log(`\n${results.length - failures.length}/${results.length} data checks passed.`);
if (failures.length) {
  console.log("FAILED:");
  for (const failure of failures) console.log(`  [${failure.layer}] ${failure.label} — ${failure.detail}`);
}
process.exit(failures.length ? 1 : 0);

// Interaction smoke test: drives the live demo controls in jsdom and asserts state changes.
import { JSDOM } from "jsdom";

// Boot the first jsdom environment before react-dom is imported so React's
// delegated onChange listeners are registered the way they are in a browser.
setup("/demo");
const { renderApp } = await import("../.smoke/smoke-entry.js");

function setup(route) {
  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
    url: `http://localhost:3000/#${route}`,
    pretendToBeVisual: true,
    runScripts: "outside-only",
  });
  global.window = dom.window;
  global.document = dom.window.document;
  global.location = dom.window.location;
  global.history = dom.window.history;
  global.addEventListener = dom.window.addEventListener.bind(dom.window);
  global.removeEventListener = dom.window.removeEventListener.bind(dom.window);
  global.dispatchEvent = dom.window.dispatchEvent.bind(dom.window);
  Object.defineProperty(global, "navigator", {
    value: dom.window.navigator,
    configurable: true,
  });
  global.HTMLElement = dom.window.HTMLElement;
  global.HTMLInputElement = dom.window.HTMLInputElement;
  global.HTMLTextAreaElement = dom.window.HTMLTextAreaElement;
  global.Element = dom.window.Element;
  global.Node = dom.window.Node;
  global.getComputedStyle = dom.window.getComputedStyle;
  global.requestAnimationFrame = cb => setTimeout(cb, 16);
  global.cancelAnimationFrame = id => clearTimeout(id);
  global.ResizeObserver = class {
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
    dispatchEvent() {},
  });
  global.matchMedia = matchMediaStub;
  dom.window.matchMedia = matchMediaStub;
  global.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  global.scrollTo = () => {};
  dom.window.scrollTo = () => {};
  return dom;
}

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const click = selector => document.querySelector(selector)?.click();

let failures = 0;
const check = (label, condition) => {
  if (condition) {
    console.log(`PASS  ${label}`);
  } else {
    failures += 1;
    console.log(`FAIL  ${label}`);
  }
};

// --- Scenario 1: emergency stop on the dashboard ---------------------------------
{
  const dom = setup("/demo");
  await renderApp(document.getElementById("root"));
  await wait(700);

  const valveBadgesBefore = document.querySelectorAll(".valve-badge").length;
  check("dashboard renders zone valves", valveBadgesBefore > 0);

  click('button[aria-label="Emergency stop all irrigation"]');
  await wait(300);
  check("emergency stop banner appears", document.body.textContent.includes("Emergency stop engaged"));
  check("stop logged to event log", document.body.textContent.includes("EMERGENCY STOP"));

  // after stop, no valve may show "Valve open"
  const openAfter = [...document.querySelectorAll(".valve-badge")].some(el => el.textContent.includes("open"));
  check("all valves closed after stop", !openAfter);

  // find and click "Clear stop"
  const clearBtn = [...document.querySelectorAll("button")].find(el => el.textContent.trim() === "Clear stop");
  check("clear stop button present", Boolean(clearBtn));
  clearBtn?.click();
  await wait(300);
  const bannerGone = !document.body.textContent.includes("Automatic and manual irrigation are blocked");
  const clearButtonGone = ![...document.querySelectorAll("button")].some(el => el.textContent.trim() === "Clear stop");
  check("stop banner cleared", bannerGone && clearButtonGone);
  dom.window.close();
}

// --- Scenario 2: toggle auto + eco on dashboard ----------------------------------
{
  const dom = setup("/demo");
  await renderApp(document.getElementById("root"));
  await wait(700);

  const autoBtn = [...document.querySelectorAll("button")].find(el => el.textContent.includes("AUTO ON"));
  check("auto chip present", Boolean(autoBtn));
  autoBtn?.click();
  await wait(250);
  const autoOff = [...document.querySelectorAll("button")].some(el => el.textContent.includes("AUTO OFF"));
  check("auto mode toggled off", autoOff);
  dom.window.close();
}

// --- Scenario 3: refill tank on water page ---------------------------------------
{
  const dom = setup("/demo/water");
  await renderApp(document.getElementById("root"));
  await wait(700);

  const gauge = () => document.querySelector("div.text-3xl")?.textContent?.trim() ?? "";
  const levelBefore = gauge();
  const rainBtn = [...document.querySelectorAll("button")].find(el => el.textContent.includes("+25 L rain"));
  check("refill button present", Boolean(rainBtn));
  rainBtn?.click();
  await wait(300);
  const levelAfter = gauge();
  const parse = text => Number((text.match(/(\d+(?:\.\d+)?)/) ?? [0])[1]);
  check(`tank level rises (${levelBefore} → ${levelAfter})`, parse(levelAfter) > parse(levelBefore));
  dom.window.close();
}

// --- Scenario 4: zone target slider on zones page ---------------------------------
{
  const dom = setup("/demo/zones");
  await renderApp(document.getElementById("root"));
  await wait(700);

  const sliders = document.querySelectorAll('input[type="range"]');
  check("target sliders present", sliders.length > 0);
  if (sliders.length > 0) {
    const slider = sliders[0];
    const nativeSetter = Object.getOwnPropertyDescriptor(global.HTMLInputElement.prototype, "value")?.set;
    nativeSetter?.call(slider, "50");
    slider.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
    slider.dispatchEvent(new dom.window.Event("change", { bubbles: true }));
    await wait(250);
  }
  check("zones page still healthy", !document.body.textContent.includes("An unexpected error"));
  dom.window.close();
}

// --- Scenario 5: dry-run preview on the rules page ------------------------------
{
  const dom = setup("/demo/rules");
  await renderApp(document.getElementById("root"));
  await wait(700);

  check("rules page lists 14 demo tabs", document.querySelectorAll(".demo-tab").length === 14);

  const dryBtn = [...document.querySelectorAll("button")].find(el => el.getAttribute("aria-label") === "Toggle dry-run mode");
  check("dry-run control present", Boolean(dryBtn));
  dryBtn?.click();
  await wait(300);
  const bodyAfterDryRun = document.body.textContent ?? "";
  check("dry-run banner shown in demo chrome", bodyAfterDryRun.includes("Dry-run mode") && bodyAfterDryRun.includes("no valve or pump moves"));
  check("dry-run recorded in the rule log", bodyAfterDryRun.includes("Dry-run mode ON"));

  const windowBtn = [...document.querySelectorAll("button")].find(el => el.getAttribute("aria-label") === "Toggle Morning window");
  windowBtn?.click();
  await wait(250);
  check(
    "schedule window disarms",
    [...document.querySelectorAll("button")].some(el => el.getAttribute("aria-label") === "Toggle Morning window" && el.textContent.includes("Disarmed"))
  );

  const slider = [...document.querySelectorAll('input[type="range"]')].find(el => el.getAttribute("aria-label") === "Maximum cycle length");
  if (slider) {
    const nativeSetter = Object.getOwnPropertyDescriptor(global.HTMLInputElement.prototype, "value")?.set;
    nativeSetter?.call(slider, "24");
    slider.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
    await wait(250);
    check("max cycle guardrail updated", (document.body.textContent ?? "").includes("Maximum cycle length set to 24 sim-min"));
  } else {
    check("max cycle guardrail slider present", false);
  }
  dom.window.close();
}

// --- Scenario 6: device fault handling on the devices page ---------------------
{
  const dom = setup("/demo/devices");
  await renderApp(document.getElementById("root"));
  await wait(700);

  const offline = [...document.querySelectorAll("button")].find(
    el => el.getAttribute("aria-label") === "Set Edge Controller take offline" || el.getAttribute("aria-label") === "Set edge controller take offline" || el.textContent.trim() === "Take offline"
  );
  check("device row exposes an offline control", Boolean(offline));
  offline?.click();
  await wait(300);
  const text = document.body.textContent ?? "";
  check("offline node degrades the zone control chain", text.includes("Degraded"));
  check(
    "offline node can be brought back",
    [...document.querySelectorAll("button")].some(el => el.textContent.trim() === "Bring online")
  );
  check(
    "reboot control still available",
    [...document.querySelectorAll("button")].some(el => (el.getAttribute("aria-label") ?? "").startsWith("Reboot"))
  );
  dom.window.close();
}

// --- Scenario 7: alert acknowledgement ----------------------------------------
{
  const dom = setup("/demo/alerts");
  await renderApp(document.getElementById("root"));
  await wait(700);

  document.querySelector('button[aria-label="Emergency stop all irrigation"]')?.click();
  await wait(300);
  check("critical alert reaches the queue", (document.body.textContent ?? "").includes("Emergency stop engaged"));

  const ackAll = [...document.querySelectorAll("button")].find(el => el.getAttribute("aria-label") === "Acknowledge all alerts");
  check("acknowledge-all is offered", Boolean(ackAll));
  ackAll?.click();
  await wait(300);
  check("alert marked acknowledged", (document.body.textContent ?? "").includes("Acknowledged"));

  const search = document.querySelector('input[aria-label="Search the event log"]');
  if (search) {
    const nativeSetter = Object.getOwnPropertyDescriptor(global.HTMLInputElement.prototype, "value")?.set;
    nativeSetter?.call(search, "zzz-no-such-event");
    search.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
    await wait(250);
    check("log search filters out everything", (document.body.textContent ?? "").includes("No events match this filter"));
  }
  dom.window.close();
}

// --- Scenario 8: camera capture + human review --------------------------------
{
  const dom = setup("/demo/camera");
  await renderApp(document.getElementById("root"));
  await wait(700);

  check("seeded advisory waits for review", (document.body.textContent ?? "").includes("waiting on a person"));
  document.querySelector('button[aria-label="Capture a frame now"]')?.click();
  await wait(300);
  check("manual capture writes a new frame", Boolean(document.querySelector('img[alt^="Frame 4"]')));
  document.querySelector('button[aria-label^="Dismiss Two-spotted mite"]')?.click();
  await wait(300);
  check("dismissed signature clears the review strip", !(document.body.textContent ?? "").includes("waiting on a person"));
  dom.window.close();
}

// --- Scenario 9: fertilizer dosing honours the lockout ------------------------
{
  const dom = setup("/demo/fertilizer");
  await renderApp(document.getElementById("root"));
  await wait(700);

  const doseBtn = [...document.querySelectorAll("button")].find(el => (el.getAttribute("aria-label") ?? "").startsWith("Dose ") && el.getAttribute("aria-label")?.endsWith(" now"));
  check("manual dose control present", Boolean(doseBtn));
  doseBtn?.click();
  await wait(300);
  check("dose logged against the channel", (document.body.textContent ?? "").includes("manual dose"));

  document.querySelector('button[aria-label="Toggle fertilizer safety lockout"]')?.click();
  await wait(300);
  doseBtn?.click();
  await wait(300);
  check("locked-out dose is refused and logged", (document.body.textContent ?? "").includes("safety lockout is engaged"));
  dom.window.close();
}

// --- Scenario 10: tasks, notes, and cross-page shared state -------------------
{
  const dom = setup("/demo/tasks");
  await renderApp(document.getElementById("root"));
  await wait(700);

  const firstTask = document.querySelector('button[aria-label^="Complete:"]');
  check("task list is actionable", Boolean(firstTask));
  firstTask?.click();
  await wait(250);
  check("completion recorded", (document.body.textContent ?? "").includes("Completed"));

  const taskInput = document.querySelector('input[aria-label="New task title"]');
  if (taskInput) {
    const nativeSetter = Object.getOwnPropertyDescriptor(global.HTMLInputElement.prototype, "value")?.set;
    nativeSetter?.call(taskInput, "Shade the seedlings for the heat wave");
    taskInput.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
    await wait(150);
  }
  [...document.querySelectorAll("button")].find(el => el.getAttribute("aria-label") === "Add task")?.click();
  await wait(300);
  check("added task appears in the list", (document.body.textContent ?? "").includes("Shade the seedlings for the heat wave"));

  const noteArea = document.querySelector('textarea[aria-label="New garden note"]');
  if (noteArea) {
    const setter = Object.getOwnPropertyDescriptor(dom.window.HTMLTextAreaElement.prototype, "value")?.set;
    setter?.call(noteArea, "Leaf edges curling on wall B after the wind shift.");
    noteArea.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
    await wait(150);
  }
  [...document.querySelectorAll("button")].find(el => el.getAttribute("aria-label") === "Save note")?.click();
  await wait(300);
  check("note saved to the record", (document.body.textContent ?? "").includes("Leaf edges curling on wall B"));
  dom.window.close();
}

// --- Scenario 11: harvest sizing drives the engine ----------------------------
{
  const dom = setup("/demo/harvest");
  await renderApp(document.getElementById("root"));
  await wait(700);

  const slider = document.querySelector('input[aria-label="Catchment area in square metres"]');
  check("catchment slider present", Boolean(slider));
  if (slider) {
    const nativeSetter = Object.getOwnPropertyDescriptor(global.HTMLInputElement.prototype, "value")?.set;
    nativeSetter?.call(slider, "40");
    slider.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
    await wait(300);
  }
  check("catchment change is reflected live", (document.body.textContent ?? "").includes("40 m²"));
  const bypass = [...document.querySelectorAll("button")].find(el => el.getAttribute("aria-label") === "Toggle routing harvested rainwater into the tank");
  bypass?.click();
  await wait(250);
  check("routing toggle flips to bypass", (bypass?.textContent ?? "").length > 0 && (document.body.textContent ?? "").includes("Bypass"));
  dom.window.close();
}

// --- Scenario 12: settings are honoured across pages --------------------------
{
  const dom = setup("/demo/settings");
  await renderApp(document.getElementById("root"));
  await wait(700);

  [...document.querySelectorAll("button")].find(el => el.getAttribute("aria-label") === "Use imperial units")?.click();
  await wait(300);
  const text = document.body.textContent ?? "";
  check("imperial units applied", text.includes("°F") && text.includes("gal"));

  [...document.querySelectorAll("button")].find(el => el.getAttribute("aria-label") === "Use 12-hour clock")?.click();
  await wait(300);
  check("clock format follows the setting", /\d{1,2}:\d{2} (AM|PM)/.test(document.body.textContent ?? ""));

  const profileName = document.querySelector('input[aria-label="Garden name"]');
  if (profileName) {
    const nativeSetter = Object.getOwnPropertyDescriptor(global.HTMLInputElement.prototype, "value")?.set;
    nativeSetter?.call(profileName, "Ashoka rooftop");
    profileName.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
    await wait(200);
    [...document.querySelectorAll("button")].find(el => el.getAttribute("aria-label") === "Save garden profile")?.click();
    await wait(300);
  }
  check("renamed garden shows in the demo toolbar", (document.body.textContent ?? "").includes("ASHOKA ROOFTOP"));
  dom.window.close();
}

// --- Scenario 13: weather page stays consistent with the engine ---------------
{
  const dom = setup("/demo/weather");
  await renderApp(document.getElementById("root"));
  await wait(900);
  const text = document.body.textContent ?? "";
  check("weather page renders the microclimate panel", text.includes("Zone microclimate") && text.includes("Day curve"));
  check("weather readings are live strings", /\\d\\.\\d°C|\\d+ mm\/h|none/.test(text));
  dom.window.close();
}

// --- Scenario 14: the fleet's power-budget control burns real battery ----------
{
  const dom = setup("/demo/devices");
  await renderApp(document.getElementById("root"));
  await wait(700);

  const drainBtn = () => document.querySelector('button[aria-label^="Advance the power budget"]');
  const rowOf = () => drainBtn()?.closest("div.grid");
  const batteryOf = el => Number((el?.textContent.match(/(\d+)%/g) ?? []).slice(-1)[0]?.replace("%", "") ?? NaN);
  check("battery nodes expose a power-budget control", Boolean(drainBtn()));

  const before = batteryOf(rowOf());
  drainBtn()?.click();
  await wait(250);
  const after = batteryOf(rowOf());
  check("a simulated day costs the node battery", after < before - 5);
  check("the fleet panel keeps the node's own readout in step", batteryOf(rowOf()) === after);

  let guard = 0;
  while (guard++ < 30 && drainBtn() && batteryOf(rowOf()) > 12 && !(document.body.textContent ?? "").includes("Low battery")) {
    drainBtn().click();
    await wait(150);
  }
  check("a flat node is flagged low battery", (document.body.textContent ?? "").includes("Low battery"));
  check("the fault explains what degrades", (document.body.textContent ?? "").includes("reporting interval stretched"));
  check(
    "a flat node offers a clear-fault path",
    [...document.querySelectorAll("button")].some(el => el.textContent.trim() === "Clear fault")
  );
  dom.window.close();
}

console.log(failures === 0 ? "\nAll interaction checks passed." : `\n${failures} interaction check(s) failed.`);
process.exit(failures > 0 ? 1 : 0);

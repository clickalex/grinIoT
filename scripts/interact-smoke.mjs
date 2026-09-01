// Interaction smoke test: drives the live demo controls in jsdom and asserts state changes.
import { JSDOM } from "jsdom";
import { renderApp } from "../.smoke/smoke-entry.js";

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
  Object.defineProperty(global, "navigator", { value: dom.window.navigator, configurable: true });
  global.HTMLElement = dom.window.HTMLElement;
  global.HTMLInputElement = dom.window.HTMLInputElement;
  global.Element = dom.window.Element;
  global.Node = dom.window.Node;
  global.getComputedStyle = dom.window.getComputedStyle;
  global.requestAnimationFrame = (cb) => setTimeout(cb, 16);
  global.cancelAnimationFrame = (id) => clearTimeout(id);
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  const matchMediaStub = (query) => ({
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

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const click = (selector) => document.querySelector(selector)?.click();

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
  const openAfter = [...document.querySelectorAll(".valve-badge")].some((el) => el.textContent.includes("open"));
  check("all valves closed after stop", !openAfter);

  // find and click "Clear stop"
  const clearBtn = [...document.querySelectorAll("button")].find((el) => el.textContent.trim() === "Clear stop");
  check("clear stop button present", Boolean(clearBtn));
  clearBtn?.click();
  await wait(300);
  const bannerGone = !document.body.textContent.includes("Automatic and manual irrigation are blocked");
  const clearButtonGone = ![...document.querySelectorAll("button")].some((el) => el.textContent.trim() === "Clear stop");
  check("stop banner cleared", bannerGone && clearButtonGone);
  dom.window.close();
}

// --- Scenario 2: toggle auto + eco on dashboard ----------------------------------
{
  const dom = setup("/demo");
  await renderApp(document.getElementById("root"));
  await wait(700);

  const autoBtn = [...document.querySelectorAll("button")].find((el) => el.textContent.includes("AUTO ON"));
  check("auto chip present", Boolean(autoBtn));
  autoBtn?.click();
  await wait(250);
  const autoOff = [...document.querySelectorAll("button")].some((el) => el.textContent.includes("AUTO OFF"));
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
  const rainBtn = [...document.querySelectorAll("button")].find((el) => el.textContent.includes("+25 L rain"));
  check("refill button present", Boolean(rainBtn));
  rainBtn?.click();
  await wait(300);
  const levelAfter = gauge();
  const parse = (text) => Number((text.match(/(\d+(?:\.\d+)?)/) ?? [0])[1]);
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

console.log(failures === 0 ? "\nAll interaction checks passed." : `\n${failures} interaction check(s) failed.`);
process.exit(failures > 0 ? 1 : 0);

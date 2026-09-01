// Smoke test: renders every route of the Grinrex IoT app in jsdom, capturing
// console errors and asserting route-specific content. 10 chapter pages + the
// 14-page live demo = every route the site ships. The app is bundled by
// esbuild (see smoke-entry.tsx) so aliases and CJS deps resolve like production.
import { JSDOM } from "jsdom";

// The DOM environment must exist before react-dom is imported, otherwise its
// module-level capability detection runs without a document and delegated input
// events (onChange on sliders, fields, textareas) never reach React.
installGlobals(
  new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
    url: "http://localhost:3000/#/",
    pretendToBeVisual: true,
    runScripts: "outside-only",
  })
);
const { renderApp } = await import("../.smoke/smoke-entry.js");

const routes = [
  ["/", "Every drop has", "Open live demo"],
  ["/problem", "Urban growing needs an", "Failure modes"],
  ["/system", "Measure the garden", "Local first, connected second"],
  ["/capabilities", "One garden loop", "Weather & microclimate"],
  ["/platform", "Seven layers", "Hardware & field kit"],
  ["/roadmap", "Prove reliability", "Core prototype"],
  ["/safety", "safe before clever", "Emergency stop"],
  ["/commercial", "From balcony kit", "Starter kit"],
  ["/investor", "grounded in", "Evidence to earn next"],
  ["/documents", "Product Requirements Document", "Document control & purpose"],
  ["/demo", "running now", "Zones live"],
  ["/demo/zones", "Zones & thresholds", "Adjust target"],
  ["/demo/irrigation", "Irrigation console", "Emergency stop"],
  ["/demo/water", "Every drop, accounted", "Rainwater"],
  ["/demo/analytics", "Water intelligence", "Daily water use"],
  ["/demo/weather", "The sky, measured", "Ambient history"],
  ["/demo/harvest", "Rain in,", "Capture vs rainfall"],
  ["/demo/rules", "The decision layer", "Watering windows"],
  ["/demo/devices", "The fleet", "Node fleet"],
  ["/demo/camera", "Look at the plants", "Capture wall"],
  ["/demo/fertilizer", "Feed on the line", "Injecting right now"],
  ["/demo/tasks", "asks you to do", "Garden notes"],
  ["/demo/alerts", "something changed", "Alert queue"],
  ["/demo/settings", "One profile", "Garden profile"],
];

function installGlobals(dom) {
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
  global.HTMLDivElement = dom.window.HTMLDivElement;
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
  global.matchMedia = global.matchMedia || matchMediaStub;
  dom.window.matchMedia = matchMediaStub;
  global.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  global.scrollTo = () => {};
  dom.window.scrollTo = () => {};
}

let failures = 0;

for (const [route, ...expectations] of routes) {
  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
    url: `http://localhost:3000/#${route}`,
    pretendToBeVisual: true,
    runScripts: "outside-only",
  });
  installGlobals(dom);

  const errors = [];
  const originalError = console.error;
  console.error = (...args) => {
    errors.push(args.map(String).join(" "));
  };

  try {
    await renderApp(document.getElementById("root"));
    // let effects, the sim tick, and charts settle
    await new Promise(resolve => setTimeout(resolve, 700));

    const body = document.body.textContent || "";
    const missing = expectations.filter(text => !body.includes(text));
    // Links inside the nested /demo router resolve against /demo, so an href that already
    // carries the prefix (or points at a route that does not exist) renders as a dead link.
    const demoRoutes = new Set(routes.map(entry => entry[0]).filter(entry => entry.startsWith("/demo")));
    const badLinks = route.startsWith("/demo")
      ? [...document.querySelectorAll("main a[href]")].map(el => (el.getAttribute("href") ?? "").replace(/^#/, "")).filter(href => href.startsWith("/demo") && !demoRoutes.has(href.replace(/\/+$/, "")))
      : [];
    const realErrors = errors.filter(line => !/not implemented: window/i.test(line) && !line.includes("Warning:") && !line.includes("React will try to recreate this component tree") && !line.includes("act("));

    if (missing.length === 0 && badLinks.length === 0 && realErrors.length === 0) {
      console.log(`PASS  ${route}`);
    } else {
      failures += 1;
      console.log(`FAIL  ${route}`);
      if (missing.length) {
        console.log(`      missing content: ${JSON.stringify(missing)}`);
        console.log(`      rendered sample: ${JSON.stringify(body.slice(0, 160))}`);
      }
      if (badLinks.length) console.log(`      dead demo links: ${badLinks.slice(0, 3).join(" ")}`);
      if (realErrors.length) console.log(`      console errors: ${realErrors.slice(0, 3).join(" | ")}`);
    }
  } catch (error) {
    failures += 1;
    console.log(`CRASH ${route}: ${error.message}`);
  } finally {
    console.error = originalError;
    dom.window.close();
  }
}

process.exit(failures > 0 ? 1 : 0);

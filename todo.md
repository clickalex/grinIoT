# Grinrex IoT — Active Assessment Tasks

- [x] Review the current product scope, operating principles, and commercial assumptions.
- [x] Identify the highest-impact technical, operational, commercial, and adoption risks.
- [x] Prepare practical mitigations with clear priority and implementation timing.
- [x] Deliver the concise cons-and-solutions assessment to the user.
- [x] Deliver the full cons-and-solutions audit and integrate it into the on-site document library as record 07.

## Multi-Page Site & Working Demo

- [x] Restructure the single-page presentation into a routed multi-page site (one page per chapter).
- [x] Home landing page with chapter index and previews.
- [x] Chapter pages: Problem, System, Capabilities, Platform, Roadmap, Safety, Commercial, Investor, Documents.
- [x] Preserve the Signal Garden design system (spruce terrain, Signal Lime, Sunlit Amber, signal trail).
- [x] Replace remote /manus-storage images with bundled local imagery in client/public/images.
- [x] Build a live simulated garden: weather, soil moisture decay, rule-based irrigation, tank logic, rain events, eco mode.
- [x] Demo pages: Overview dashboard, Zones & thresholds, Irrigation console, Tank & water, Analytics.
- [x] Working controls: auto/eco toggles, zone targets, manual watering, emergency stop, tank refill, sim speed, reset.
- [x] Live charts (recharts) for moisture, tank level, flow, and 14-day water analytics.
- [x] Smoke tests: every route renders; demo interactions verified (pnpm test:smoke / pnpm test:interact).

## Consolidation Pass (single PRD)

- [x] Delete the seven-document library and the standalone audit file — replaced by one PRD page.
- [x] Consolidate everything into a single Product Requirements Document at /documents (19 sections, exportable .md, scroll-spy TOC).
- [x] Completeness audit: 14/14 feature modules, 30 cons (all 23 original + 7 found in cross-check), 4/4 guardrails, 14/14 future modules, 7/7 roadmap phases, 7/7 architecture layers, 3/3 tiers, full hardware BOM — all present.
- [x] Per-page SEO titles/meta via usePageMeta on every route.
- [x] Code-split all chapter and demo routes (entry chunk 943 kB → 355 kB).
- [x] Add simulated device-telemetry (MQTT-style topic) feed to the demo dashboard.

## Demo Page Parity (14 live pages)

- [x] Add the missing demo pages: Weather & microclimate, Rainwater harvest, Rules & schedules, Devices & telemetry, Alerts & event log, Growth & pest camera, Fertilizer dosing, Garden tasks & notes, Site settings.
- [x] Single demo page registry (`client/src/demo/sections.ts`) feeding the grouped tab bar, the footer column, page metadata, and the smoke-test route list.
- [x] Extend the simulation, not just the UI: schedule windows, max-cycle guardrail, rain hold-over, freeze guard, dry-run mode, device fleet (battery, radio, faults, OTA), fertilizer channels + lockout, camera captures + human pest review, generated tasks + notes, rain harvesting into the tank, retention-driven log buffer, unit system and quiet hours.
- [x] Cross-page coherence: every new control writes to the shared event log; settings (units, clock, notifications, offline fallback) change what other demo pages show.
- [x] Tests: 24/24 route smoke tests and 50/50 interaction checks (dry-run, window disarm, guardrail change, device dropout, alert ack + log search, capture + review, locked-out dose refusal, task/note capture, harvest sizing, settings propagation, battery burn-out).
- [x] Fix the jsdom harness to install the DOM before react-dom loads, so React's delegated `onChange` fires for sliders, inputs, and textareas in tests.
- [x] Docs: README demo map + URL list, PRD §18 delivery snapshot refreshed.
- [x] Keep device battery un-rounded in `simTick`: rounding to 0.1% per 4 sim-minutes rounded a real drain away, so batteries sat at one value forever. `+1 day power` on the fleet page fast-forwards a node's budget to reach the low-battery path on demand.
- [x] Fix every in-demo link: `<Link href="/demo/zones">` inside the nested router renders `#/demo/demo/zones` and 404s. Links between demo pages are now relative (`demoLink`); `demoHref` is only for the marketing pages.
- [x] `pnpm test:audit` — 156 data checks over three layers: the engine runs 1500 ticks with churn injected and every field is swept for non-finite values; each page is mounted, left to tick, and every control clicked; the tab bar is walked to prove each href lands and shared state (dry run, emergency stop, day counter) survives navigation.

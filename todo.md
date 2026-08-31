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

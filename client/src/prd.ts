// Grinrex IoT — the single-source PRD (product requirements document).
// Consolidated from the operating brief, technical dossier, investment brief, roadmap,
// risk register, full source specification, and the cons & solutions audit.
// Rendered as one page at /documents; exportable as Markdown.

export type PrdTable = { head: string[]; rows: string[][] };
export type PrdSub = { heading: string; text?: string; bullets?: string[] };
export type PrdSection = {
  id: string;
  number: string;
  title: string;
  intro?: string;
  paragraphs?: string[];
  bullets?: string[];
  table?: PrdTable;
  subs?: PrdSub[];
};

export const prdMeta = {
  docId: "GRINREX-PRD-2026-001",
  version: "1.0",
  status: "Draft for review — pre-pilot",
  owner: "Grinrex IoT product team",
  audience: "Founders, engineering, design, pilot partners, investors",
  tagline: "Every drop has a destination.",
};

export const prdSections: PrdSection[] = [
  {
    id: "document-control",
    number: "01",
    title: "Document control & purpose",
    paragraphs: [
      "This PRD is the single source of truth for the Grinrex IoT product. It consolidates the operating brief, technical dossier, investment brief, delivery roadmap, launch guardrails, the full source specification, and the cons & solutions audit into one requirements document. Earlier per-document records are retired; where they disagree, this document wins.",
      "Scope: the first marketable product (the garden water-control kit), the modular expansion path, and the commercial model around both. Out of scope for this revision: hardware manufacturing drawings, firmware source, and detailed cloud architecture — those follow from the requirements here.",
    ],
    table: {
      head: ["Field", "Value"],
      rows: [
        ["Document ID", prdMeta.docId],
        ["Version / status", `${prdMeta.version} — ${prdMeta.status}`],
        ["Owner", prdMeta.owner],
        ["Audience", prdMeta.audience],
        ["Review cadence", "Every release gate; risk register refreshed monthly"],
      ],
    },
  },
  {
    id: "vision",
    number: "02",
    title: "Vision, goals & non-goals",
    intro: "Grinrex IoT is the modular, water-intelligent operating system for people growing more with less space and less waste. Personality: measured, regenerative, quietly capable.",
    paragraphs: [
      "Product vision: every urban garden — balcony, rooftop, terrace, or vertical wall — runs on a measured local loop that senses conditions, decides with safe local rules, waters precisely, and keeps a readable record. The cloud adds visibility; it never becomes a prerequisite for plant care.",
    ],
    bullets: [
      "Goal 1 — Make watering measurable: owners see soil, climate, and tank state in real time and understand every action the system took or deferred.",
      "Goal 2 — Protect the garden locally: thresholds, cutoffs, and the emergency stop live on the edge controller and survive power and connectivity events.",
      "Goal 3 — Expand from evidence: each later module earns entry through pilot data, user value, and a support model — not feature volume.",
      "Goal 4 — Be commercially honest: hardware is useful without a subscription; recurring value is earned through analytics, insight, and service.",
    ],
    subs: [
      { heading: "Non-goals (v1)", text: "Camera-based disease AI, fertilizer dosing, automated shade/cooling, cellular/LoRa connectivity, multi-property management, and full hydroponics control are explicitly out of v1. They may arrive as later modules, gated by the roadmap." },
      { heading: "Must not do (standing)", bullets: ["Do not make cloud connectivity a requirement for local watering.", "Do not publish retail pricing before the lifecycle cost model exists.", "Do not scale manufacturing before pilot exit criteria are met.", "Do not gate core automation behind a subscription.", "Do not let a single stale sensor reading authorize unlimited watering."] },
    ],
  },
  {
    id: "problem",
    number: "03",
    title: "Problem statement & market context",
    paragraphs: [
      "Balconies, rooftops, terraces, and vertical gardens face the same compounding issue: care is managed as manual guesswork in conditions that are neither stable nor simple. The source specification records the failure set precisely: inconsistent manual watering; over- and underwatering; unknown soil moisture; rooftop heat and exposure; uneven vertical-garden watering and sunlight; empty tanks; underused collected rainwater; late pest and disease detection; manual fertilization; fragmented monitoring; untracked growth; and difficulty managing gardens while owners are away.",
      "Six signals make the problem concrete: manual watering is inconsistent; soil conditions are not visible; tanks run out without warning; heat and rainfall change the plan; vertical zones dry unevenly; owners cannot monitor while away. Each is a measurement problem, and a measurement problem is solvable with a loop, not a gadget.",
    ],
    table: {
      head: ["Segment", "Profile", "Primary need"],
      rows: [
        ["Households", "Balcony and terrace gardeners, 1–4 zones", "Visible conditions, safe automation, no subscription"],
        ["Growers", "Kitchen-garden and rooftop growers", "Water efficiency, multi-zone analytics, rainwater reuse"],
        ["Vertical / urban farms", "Vertical gardens, green walls, small farms", "Per-level control, expansion nodes, production reliability"],
        ["Hospitality & education", "Restaurants, hotels, schools", "Installation-led kits, visibility, low maintenance"],
        ["Offices & developers", "Workplaces, property developers", "Managed deployments, water data, brand value"],
        ["Nurseries & community", "Nurseries, community gardens", "Bulk monitoring, shared dashboards, training support"],
      ],
    },
    subs: [
      { heading: "Why now", text: "Urban green space is growing, water is metered and increasingly precious, and commodity sensors are cheap enough to make a reliable local loop affordable. The gap is not components — it is a trustworthy operating system that turns them into safe garden behavior." },
      { heading: "The answer in one sentence", text: "An operating loop: measure, decide with local rules, act safely, and keep a readable record." },
    ],
  },
  {
    id: "personas",
    number: "04",
    title: "Personas & target segments",
    bullets: [
      "Priya, balcony gardener — two zones, grows herbs and tomatoes, away at work daily. Wants: no wilted plants, no flood, no subscription. Buys Starter.",
      "Rahul, rooftop grower — eight zones, drip irrigation, water tank, cares about monsoon handling and water bills. Buys Pro; may take a maintenance contract.",
      "Meera, vertical-farm operator — tiered walls, needs per-level data and expandable nodes; values reliability over features. Buys Elite with installation.",
      "Vikram, facilities manager — school or office green space; needs one dashboard, remote visibility, and a service partner. B2B install-led.",
      "Anita, nursery owner — many plants, limited staff time; wants bulk monitoring and simple tasks. Pilot partner for community programs.",
    ],
    paragraphs: [
      "The beachhead for commercial launch is the rooftop/balcony grower who already uses drip irrigation or a tank (the source recommendation, retained). Broader segments are served later by the same operating base, differentiated by installation and support rather than separate products.",
    ],
  },
  {
    id: "concept",
    number: "05",
    title: "Product concept & core loop",
    paragraphs: [
      "The product is a physical loop: sensors collect the signal; the edge controller validates it; local rules protect the garden; actuators execute bounded actions; the application turns actions and conditions into a useful record.",
      "The four stages: Sense (soil, climate, light, rainfall, tank level, flow) → Decide (local thresholds first, analytics and recommendations later) → Act (pumps, valves, fans, optional equipment) → Learn (readable history of water use, conditions, and outcomes).",
    ],
    subs: [
      { heading: "Operating thesis", text: "Connect measured garden conditions to safe irrigation, then expand from clear evidence — not feature volume." },
      { heading: "Design principles", bullets: ["Water efficiency first.", "All AI is advisory; humans confirm.", "Critical rules live on the edge.", "Calibration is visible.", "Users can stop any physical system immediately.", "Modules add capacity without changing core operating logic."] },
    ],
  },
  {
    id: "architecture",
    number: "06",
    title: "System architecture",
    intro: "Seven layers, one safe data loop. Each layer has one responsibility and one failure boundary.",
    table: {
      head: ["Layer", "Responsibility"],
      rows: [
        ["01 · Sensor layer", "Capacitive soil moisture, temperature/humidity, light, rain, UV, wind, tank level, flow"],
        ["02 · Edge controller", "ESP32 or equivalent; input validation, local thresholds, offline-safe decisions, actuator commands"],
        ["03 · Communication", "Wi-Fi + BLE first; LoRa and cellular optional for larger or remote installations"],
        ["04 · Cloud & backend", "Device/user management, sensor records, alerts, irrigation logs, water analytics, plant profiles, subscriptions"],
        ["05 · AI & analytics", "Rule engine first; predictive watering, plant recommendations, human-confirmed visual insight after reliable data exists"],
        ["06 · Mobile & web app", "Dashboard, garden, zones, water, weather, pest, irrigation, fertilizer, growth, analytics, tasks, settings"],
        ["07 · Actuators", "Pumps, solenoid valves, optional peristaltic dosing, fans, shade mechanisms — all with manual override"],
      ],
    },
    subs: [
      { heading: "Failure-boundary rules", text: "A sensor fault cannot command a valve. A cloud outage cannot stop local care. An analytics failure cannot flood a garden. Every actuator command carries a maximum duration, a stop path, and a normally safe fallback." },
    ],
  },
  {
    id: "features",
    number: "07",
    title: "Feature requirements (module atlas)",
    intro: "All fourteen source modules, in operating order. Priority: CORE = MVP water-control kit; EXPAND = early expansion after core reliability; GATED = evidence-gated; LATER = deliberate later stage.",
    table: {
      head: ["#", "Module", "Requirements", "Priority"],
      rows: [
        ["01", "Weather & microclimate", "Temperature, humidity, rainfall, UV/light, wind, history, heat/rain alerts", "CORE"],
        ["02", "Plant & soil health", "Zone moisture, soil temperature, light exposure, dry-soil/overwatering detection, trends", "CORE"],
        ["03", "Smart irrigation", "Drip, micro-drip, misting, sprinkler, zone watering, local schedules, triggers, history, emergency stop", "CORE"],
        ["04", "Water tank monitor", "Level, percentage, low/critical thresholds, overflow warning, remaining estimate, consumption tracking", "CORE"],
        ["05", "Garden assistant", "Dashboard, plant profiles, zones, care, fertilizing, pruning, harvest reminders, notes, history, alerts", "CORE"],
        ["06", "Water analytics", "Daily/weekly/monthly use, rainwater share, refills, estimated savings, per-zone consumption", "EXPAND"],
        ["07", "Rainwater reuse", "Collection monitoring, rainwater-first logic, municipal fallback, routing valves, utilization analytics", "EXPAND"],
        ["08", "Vertical farming", "Vertical-zone data model, per-zone sensors and irrigation, imbalance detection, expansion nodes", "EXPAND"],
        ["09", "Predictive watering", "Historical conditions, weather, plant type, season, water availability, eco mode, explainable recommendations", "GATED"],
        ["10", "Pest & plant insight", "Periodic photography, advisory image analysis, plant-condition alerts, image history, human confirmation", "GATED"],
        ["11", "Growth time-lapse", "Scheduled photography, visual growth records, comparisons, export-ready video", "GATED"],
        ["12", "Fertilizer injector", "Optional peristaltic dosing, zone schedules, watering-linked application, logs, override, safety lockout", "LATER"],
        ["13", "Microclimate control", "Optional fans, shade mechanisms, temperature/light triggers, schedules, extreme-heat protection", "LATER"],
        ["14", "Modular expansion", "Add sensors, zones, cameras, tanks, fertilizer channels, solar power, environmental sensors", "LATER"],
      ],
    },
    subs: [
      { heading: "MVP boundary (v1)", text: "One-to-four-zone irrigation, capacitive soil monitoring, ambient temperature and humidity, tank-level sensing, safe pump control, manual override, and a clear dashboard. Deferred from v1: fertilizer dosing, image diagnosis, shade automation, complex AI, cellular, multi-property workflows." },
      { heading: "Module admission rule", text: "A module ships only when it (a) improves water efficiency or garden safety, (b) has pilot evidence, (c) carries a margin and support model, and (d) passes the release-gate review." },
    ],
  },
  {
    id: "flows",
    number: "08",
    title: "Core user flows",
    subs: [
      { heading: "F1 · Setup & onboarding", bullets: ["Unbox: pre-assembled, color-coded kit with a quick-start card.", "Power on: status LEDs walk through pairing; BLE-assisted Wi-Fi setup.", "Name zones, pick plant type → medium preset sets conservative moisture targets.", "Confirm a test watering cycle (10 s) — system records calibration baseline.", "Done in under 15 minutes; app shows live readings immediately."] },
      { heading: "F2 · Automatic watering decision", bullets: ["Every tick: edge reads soil, weather, and tank state.", "Rule: if zone below target, not raining, tank above critical, and auto on → open valve.", "Guard: maximum duration bound; close at target + eco margin; tank-low cutoff overrides.", "Rainfall: pause automatic watering while rain is falling; resume after.", "Every decision is logged with its reasons — visible to the user."] },
      { heading: "F3 · Alert & intervention", bullets: ["Alert fires (low tank, dry zone, heat, high moisture) → notification with context.", "User taps: see zone, reading, and suggested action.", "Actions: water now, stop, adjust target, switch to manual.", "Emergency stop is one physical tap — halts everything regardless of state."] },
      { heading: "F4 · Away-from-home monitoring", bullets: ["Remote dashboard shows last-known-good readings with timestamps.", "Connectivity loss: local rules keep running; telemetry stores and forwards on reconnect.", "Owner can intervene remotely, but the garden is never dependent on the connection."] },
      { heading: "F5 · Installer & B2B flow", bullets: ["Site survey → zone plan → kit configuration (Pro/Elite).", "Guided calibration per zone; installer runs the acceptance checklist.", "Handover: owner account linked, maintenance contract option presented.", "Post-install: remote health checks and scheduled service visits."] },
    ],
  },
  {
    id: "hardware",
    number: "09",
    title: "Hardware & BOM requirements",
    paragraphs: [
      "The field kit must be serviceable outdoors: replaceable sensors, weatherproof enclosures, protected connectors, drainage, strain relief, and sensor holders.",
    ],
    bullets: [
      "Controller: ESP32-class; low-power with battery backup; one weatherproof power feed per kit.",
      "Sensing: capacitive soil moisture, BME280 temperature/humidity, BH1750 light, rain sensor, UV, anemometer, waterproof ultrasonic tank level, flow meter.",
      "Actuation: DC pump, solenoid valves, optional peristaltic pump, fan, servo; physical manual override on every actuator.",
      "Vision (optional): ESP32-CAM or Raspberry Pi camera, opt-in only.",
      "Power: DC supply, battery backup, optional solar (later module).",
      "Plumbing: tubing, drippers, brackets, cable protection, inlet filters (clogging protection), spare-part kit in box.",
      "Certification: certified power components from day one; BIS/electrical-safety and water-contact compliance review before manufacturing.",
    ],
  },
  {
    id: "safety",
    number: "10",
    title: "Operating rules & safety requirements",
    intro: "The non-negotiable safety floor. A smart garden must be safe before clever.",
    table: {
      head: ["Rule domain", "Requirement"],
      rows: [
        ["Watering", "Evaluate soil thresholds, confirm tank water, consider rainfall/forecast, prioritize configured rainwater, stop at target moisture or critical tank level"],
        ["Weather", "Pause/reduce watering in significant rainfall; raise heat alerts; recommend shade/cooling; issue storm-preparation alerts where configured"],
        ["Tank", "Low and overflow alerts; pause irrigation at critical level; flow measurement tracks consumption"],
        ["Vertical zones", "Independent per-level monitoring; per-zone irrigation; surface moisture/light imbalance; expansion nodes"],
        ["Maximum duration", "Every watering event is bounded in time — a stuck valve or lost signal cannot flood a zone"],
        ["Tank-low cutoff", "Irrigation pauses automatically at the critical threshold"],
        ["Emergency stop", "Physical one-tap stop path halts every pump and valve regardless of schedule or rule state"],
        ["Local fallback", "Core thresholds live on the edge controller; basic care continues during connectivity loss"],
        ["Stale-reading guard", "A single old or unverified reading can never authorize unlimited watering"],
        ["Failure rehearsal", "Stuck valves, dry pumps, sensor faults, and power loss are bench-tested before pilots"],
      ],
    },
    subs: [
      { heading: "The four named launch guardrails", bullets: [
        "Scope containment (CRITICAL): freeze the first release around one-to-four-zone irrigation, tank protection, local rules, and manual override; defer camera AI, fertilizer dosing, shade control, cellular, and multi-property workflows.",
        "Safe physical control (CRITICAL): bound every watering action with a maximum duration, tank-low cutoff, emergency stop, and normally safe fallback; test stuck valves, dry pumps, sensor faults, and power loss before pilots.",
        "Outdoor durability (HIGH): replaceable capacitive sensors, weatherproof enclosures, protected connectors, drainage, strain relief, and a defined heat, moisture, and ingress test plan.",
        "Commercial proof (HIGH): choose a single beachhead market, model lifecycle costs before public pricing, and keep basic plant safety hardware-owned instead of forcing a subscription.",
      ] },
    ],
  },
  {
    id: "security",
    number: "11",
    title: "Security, privacy & compliance",
    paragraphs: [
      "A connected pump-and-valve controller is an attack surface. Requirements below are binding for pilots and mandatory before public launch.",
    ],
    bullets: [
      "Signed OTA for all firmware updates; per-device keys; no default credentials.",
      "Local-first control: the cloud may not command a valve without edge confirmation.",
      "Rate-limited API; threat-model review before pilots; penetration test before manufacturing.",
      "Data minimization: collect only what the product needs; retain telemetry on a published schedule.",
      "India DPDP Act readiness: consent, purpose limitation, and data-principal rights for garden telemetry, location, and images.",
      "Cameras opt-in only; local-first image analysis; no cloud video by default.",
      "Advisory AI is framed as recommendation with human confirmation — with clear disclaimers to manage advisory liability.",
      "E-waste responsibility: replaceable sensors come with a take-back/recycling program.",
    ],
  },
  {
    id: "nfrs",
    number: "12",
    title: "Non-functional requirements",
    table: {
      head: ["Category", "Target"],
      rows: [
        ["Offline window", "Core rules run indefinitely without connectivity; telemetry stores ≥ 7 days and forwards on reconnect"],
        ["Power resilience", "Battery backup ≥ 24 h of sensing; graceful recovery from power loss with state persisted"],
        ["Environmental", "Operating range 0–50 °C ambient; weatherproof enclosure per defined heat/moisture/ingress test plan; full-monsoon pilot season before manufacturing"],
        ["Sensor reliability", "Replaceable probes; per-zone calibration status and last-reading timestamps; drift tracked from pilot telemetry"],
        ["Response & usability", "Local valve decisions ≤ 5 s from reading; remote visibility ≤ 30 s when connected; 15-minute setup; 3-step onboarding"],
        ["Accessibility", "Reduced-motion support; contrast-compliant dark UI; keyboard-navigable controls; local-language UI post-MVP"],
        ["Serviceability", "Field-replaceable parts; on-device diagnostics; readable event logs; remote health checks"],
        ["Scale (later)", "Cloud platform sized for multi-property and multi-site management before that module ships"],
      ],
    },
  },
  {
    id: "commercial",
    number: "13",
    title: "Commercial model",
    table: {
      head: ["Tier", "Target", "Includes", "Indicative price"],
      rows: [
        ["Starter", "Small balcony gardens", "Soil, temperature/humidity, light, basic irrigation, tank monitoring, mobile dashboard", "₹6,999–7,999"],
        ["Pro", "Rooftops & larger balconies", "Starter + multi-zone monitoring, weather/rainwater monitoring, assisted watering, alerts, analytics", "₹9,999–11,999"],
        ["Elite", "Urban farms & vertical gardens", "Pro + advisory pest insight, vertical zones, fertilizer injection, time-lapse, shade/cooling, advanced analytics, solar option", "₹12,999–16,999"],
      ],
    },
    subs: [
      { heading: "Software subscriptions (proposed)", bullets: ["Free ₹0 — core local automation, dashboard, manual control.", "Pro ₹149/month or ₹999/year — history, multi-zone analytics, priority support.", "Elite ₹249/month or ₹1,699/year — advanced analytics, advisory insights, collaboration tools."] },
      { heading: "Revenue streams", bullets: ["Hardware kits (Starter/Pro/Elite).", "Premium app subscriptions.", "Expansion modules: zones, sensors, rainwater, solar, fertilizer channels.", "Services: professional installation, maintenance contracts, B2B projects.", "Partnerships: white-label deployments for developers, hospitality, and community programs."] },
      { heading: "Pricing discipline", text: "All prices are planning estimates. Validate against components, manufacturing, taxes, logistics, warranty, installation, and support before public pricing. Essential local automation stays hardware-owned; subscription value must be earned." },
    ],
  },
  {
    id: "roadmap",
    number: "14",
    title: "Roadmap & exit criteria",
    table: {
      head: ["Phase", "Scope", "Exit criterion"],
      rows: [
        ["01 · Core prototype", "ESP32, soil + temperature/humidity sensing, tank monitoring, basic irrigation, web/mobile dashboard", "Safe, repeatable irrigation in real gardens; survives weather, power, connectivity loss"],
        ["02 · Smart water management", "Multi-zone irrigation, flow monitoring, rainwater collection monitoring, water analytics, low-water protection", "Clear per-zone water baseline; visible reduction in unnecessary watering"],
        ["03 · Weather & microclimate", "Rain, light/UV, wind; weather-based irrigation decisions", "Reliable operation across varied layouts without support burden rising disproportionately"],
        ["04 · Vertical farming", "Vertical-zone data model, per-zone sensors and irrigation, expandable nodes", "Explained recommendations with measurable adoption; no automation beyond what pilots trust"],
        ["05 · AI layer", "Predictive watering, plant recommendations, advisory pest-image analysis, health scoring", "Pilot-validated accuracy with human confirmation; clear advisory framing"],
        ["06 · Automation expansion", "Fertilizer injection, automatic shade, cooling-fan control, advanced routines", "Safety lockouts and maintenance workflows proven before ship"],
        ["07 · Growth & commercial product", "Time-lapse, production PCB, weatherproof enclosure, app, cloud, subscriptions, manufacturing, quality testing", "Pilot exit criteria met; cost model and certifications complete"],
      ],
    },
  },
  {
    id: "metrics",
    number: "15",
    title: "Metrics & success criteria",
    bullets: [
      "Product: water saved per garden, reduced manual watering, plant survival/growth improvement, sensor reliability, irrigation accuracy.",
      "Pilot evidence gates: installation completion and early activation; sensor stability and successful irrigation events; 30-day automation retention; expansion-module and service attachment; measurable reduction in avoidable watering.",
      "Business: units sold, acquisition cost, gross margin, subscription conversion, retention, add-on revenue, B2B installations.",
      "Support: time-to-resolve, remote-resolution rate, per-device support load, warranty return rate.",
    ],
  },
  {
    id: "risks",
    number: "16",
    title: "Risks, cons & mitigations",
    intro: "Consolidated from the cons & solutions audit, including the completeness check. Each con states why it hurts, the mitigation, and when it must land. Severity: CRITICAL blocks a trustworthy product; HIGH erodes margin/retention/quality; MEDIUM watch-and-plan.",
    table: {
      head: ["Con & why it hurts", "Severity", "Mitigation", "Timing"],
      rows: [
        ["Wi-Fi/BLE-only connectivity — balconies and rooftops sit at the edge of home range; the device appears dead exactly when owners are away", "CRITICAL", "Edge-local rules; store-and-forward telemetry; BLE setup; LoRa/cellular as paid module", "MVP + pilot"],
        ["Sensor drift & calibration — capacitive probes drift with salinity, fertilizer residue, and growing medium; wrong readings destroy trust", "CRITICAL", "Replaceable sensors; per-zone medium presets; visible calibration; conservative under-watering defaults", "MVP"],
        ["Installation is real plumbing — abandoned installs cause returns, support load, and bad reviews", "CRITICAL", "Pre-assembled color-coded kit; 15-minute guided setup; installer network for Pro/Elite", "MVP + pilot"],
        ["Trust in automation — users fear flooding their plants; adoption stalls at the moment the product should do its job", "CRITICAL", "Dry-run mode (demo previews it); conservative defaults; will-water-in-X notifications; manual override", "MVP + pilot"],
        ["Price–value gap — ₹6,999–7,999 competes with manual watering and ₹500 timers; value must be demonstrated, not asserted", "CRITICAL", "Savings calculator; 30-day water reports; published pilot evidence; ROI framing", "Before consumer launch"],
        ["Zero pilot evidence — pricing, demand, and reliability are paper claims until real gardens run a season", "CRITICAL", "Structured pilot program with exit criteria; no manufacturing scale before exit", "Immediately"],
        ["IoT security — a connected pump controller is an attack surface; one incident kills the category", "HIGH", "Signed OTA, per-device keys, local-first control, threat-model review, pen-test (§11 is binding)", "Before pilots"],
        ["Water quality — hard municipal water clogs emitters; clogged zones fail silently", "HIGH", "Inlet filters in base BOM; flush cycles; flow verification to detect clogs", "Phase 1–2"],
        ["Power dependency — pumps need mains power; summer brings scheduled outages", "HIGH", "Battery backup; one weatherproof feed per kit; bench-tested power-loss recovery", "Phase 1"],
        ["Monsoon & heat endurance — 45 °C summers and humidity stress seals, UV, and cabling; failures define word-of-mouth", "HIGH", "Defined heat/moisture/ingress test plan; shaded mounting; full-monsoon pilot season", "Before manufacturing"],
        ["Thin hardware margins — unvalidated price points risk selling every unit at a loss", "HIGH", "Lifecycle cost model enforced before pricing; subscription and service revenue; quarterly review", "Before pricing"],
        ["Subscription resistance — Indian consumers resist recurring fees for garden tools", "HIGH", "Core automation hardware-owned; premium tiers for heavy growers; WTP tested in pilots", "Pilots"],
        ["Commoditization — cheap sensors and smart-home ecosystems can copy the feature list", "HIGH", "Water-first local safety; vertical/rooftop specialization; install-led B2B; garden data", "Continuous"],
        ["Support spikes — heat waves and monsoons create simultaneous support floods for a small team", "HIGH", "On-device diagnostics; readable logs; remote health checks; tiered support; playbook", "Before launch"],
        ["Scope gravity — the 14-module atlas pulls toward feature sprawl and reliability regressions", "HIGH", "Module admission rule (§07); release gates at every roadmap phase", "Every gate"],
        ["Supply chain & components — MCU/sensor lead times and shortages can stall a hardware program", "HIGH", "Multi-source BOM; buffer stock; validated alternate components", "Phase 1 onward"],
        ["Data compliance — India DPDP Act obligations for garden telemetry and location", "HIGH", "Consent, minimization, retention schedule; readiness review before pilots", "Before pilots"],
        ["Team bandwidth — hardware + firmware + cloud + app + installation is multi-company scope", "HIGH", "Outsource PCB/assembly; managed cloud; contractor installers; slow cadence", "Ongoing"],
        ["Maintenance as recurring cost — sensors degrade, valves stick, seals age; unplanned field service can exceed unit margin", "HIGH", "Replaceable parts everywhere; spare-part kits; annual maintenance contracts positioned as revenue", "Before pricing"],
        ["Setup friction & tech comfort — Wi-Fi pairing, app install, and zone naming are real barriers for non-technical users; drop-off before the first watering is the largest churn point", "HIGH", "BLE-assisted setup wizard; status LEDs; three-step onboarding; local-language UI", "MVP"],
        ["Seasonality — demand peaks with planting seasons and heat waves; revenue is lumpy", "MEDIUM", "B2B contracts; off-season maintenance packages; festival retail pushes", "G2M calendar"],
        ["Channel dependency — a single failed channel stalls a whole season", "MEDIUM", "Piloted nursery/contractor/developer partnerships; QR onboarding; co-branded demo gardens", "Parallel to pilots"],
        ["Compliance & certifications — pumps and adapters need electrical-safety certification; water-contact materials have standards; imports carry paperwork", "MEDIUM", "Certified components from the start; compliance review before manufacturing; legal check on all claims", "Phase 1–7"],
        ["Camera privacy — optional vision modules raise in-home privacy concerns", "MEDIUM", "Opt-in only; local-first analysis; no cloud video by default", "Before camera module"],
        ["Warranty & fraud — returns and fraudulent claims erode margin without evidence trails", "MEDIUM", "Clear terms; remote diagnostic evidence; serialized parts", "Before launch"],
        ["IP protection — hardware cloners can follow quickly", "MEDIUM", "Brand, service, ecosystem, and data moat; patents impractical early", "Continuous"],
        ["Import duties & cost volatility — component imports add duties and BIS timeline risk", "MEDIUM", "Duties and certification timeline in the cost model from day one", "Phase 1"],
        ["Advisory AI liability — recommendation errors invite blame", "MEDIUM", "Human-confirmation framing; disclaimers; conservative recommendations", "Before AI layer"],
        ["E-waste — replaceable sensors accumulate", "MEDIUM", "Take-back/recycling program; responsible materials", "Before launch"],
        ["Slow-to-show value — savings and plant health take weeks; week-one churn risk is high", "MEDIUM", "Day-one alerts; weekly water reports; before/after comparisons; referrals", "MVP"],
      ],
    },
  },
  {
    id: "expansion",
    number: "17",
    title: "Future expansion",
    paragraphs: [
      "The full source expansion surface, in deliberate order. Each item follows the module admission rule — evidence, margin model, and support model before it ships.",
    ],
    bullets: [
      "Hydroponics", "Aquaponics", "Greenhouse automation", "Autonomous solar station", "LoRa networks",
      "Disease detection", "Plant recommendations", "Harvest assistance", "Water-quality sensing",
      "Compost monitoring", "Seedling nursery", "Commercial dashboard", "Multi-property management", "Third-party API",
    ],
  },
  {
    id: "implementation",
    number: "18",
    title: "Implementation & platform notes",
    intro: "Current build reality. The live site and demo are the working surface of this PRD; the product requirements remain the binding target.",
    table: {
      head: ["Aspect", "Current implementation", "Product target"],
      rows: [
        ["Frontend", "React 19 + Vite + Tailwind 4, multi-page site (9 chapters + live demo)", "Mobile app (dashboard, garden, zones, water, weather, pest, irrigation, fertilizer, growth, analytics, tasks, settings)"],
        ["Live demo", "In-browser simulation: weather, soil decay, rule engine, tank, rain, eco mode, event log; per-page SEO titles; lazy-loaded routes", "Dry-run/simulation mode on-device before first automatic watering — the demo previews it"],
        ["Telemetry", "Simulated MQTT-style topic feed (grinrex/edge/…)", "Real MQTT/WebSocket from the edge controller to the app and cloud"],
        ["Charts & analytics", "Recharts: live moisture, tank, flow; 14-day water record", "Product analytics: daily/weekly/monthly, rainwater share, savings, per-zone consumption"],
        ["Documents", "Single consolidated PRD page with Markdown export (this page)", "Living PRD reviewed at every release gate; risk register refreshed monthly"],
        ["Deployment", "Static SPA; Express static server; Vite dev on port 3000", "Managed cloud platform; device provisioning; signed OTA pipeline"],
        ["Quality", "TypeScript strict; 15/15 route smoke tests; 12/12 demo interaction checks", "Bench tests for stuck valves, dry pumps, sensor faults, power loss; pilot telemetry review"],
        ["Security", "No credentials or backend in the demo; static content only", "Full §11 security requirements before pilots"],
      ],
    },
  },
  {
    id: "open-questions",
    number: "19",
    title: "Open questions",
    bullets: [
      "Which city and pilot cohort first? (Recommendation: one beachhead metro, 10–20 rooftop/balcony gardens.)",
      "Retail vs install-led for the Starter tier in season one?",
      "Which cloud platform and device-provisioning flow? (Managed platform recommended.)",
      "Language coverage for the MVP app — English + Hindi first?",
      "Camera module: ship as accessory or skip until the AI layer proves out?",
      "Warranty window and spares policy — to be settled with the cost model.",
    ],
  },
];

export function prdToMarkdown(): string {
  const lines: string[] = [
    `# Grinrex IoT — Product Requirements Document`,
    ``,
    `> ${prdMeta.tagline}`,
    ``,
    `| Field | Value |`,
    `|---|---|`,
    `| Document ID | ${prdMeta.docId} |`,
    `| Version / status | ${prdMeta.version} — ${prdMeta.status} |`,
    `| Owner | ${prdMeta.owner} |`,
    `| Audience | ${prdMeta.audience} |`,
    ``,
    `---`,
    ``,
  ];
  for (const section of prdSections) {
    lines.push(`## ${section.number} — ${section.title}`, ``);
    if (section.intro) lines.push(section.intro, ``);
    for (const paragraph of section.paragraphs ?? []) lines.push(paragraph, ``);
    for (const bullet of section.bullets ?? []) lines.push(`- ${bullet}`);
    if ((section.bullets?.length ?? 0) > 0) lines.push(``);
    if (section.table) {
      lines.push(`| ${section.table.head.join(" | ")} |`, `|${section.table.head.map(() => "---").join("|")}|`);
      for (const row of section.table.rows) lines.push(`| ${row.join(" | ")} |`);
      lines.push(``);
    }
    for (const sub of section.subs ?? []) {
      lines.push(`### ${sub.heading}`, ``);
      if (sub.text) lines.push(sub.text, ``);
      for (const bullet of sub.bullets ?? []) lines.push(`- ${bullet}`);
      if ((sub.bullets?.length ?? 0) > 0) lines.push(``);
    }
    lines.push(`---`, ``);
  }
  return lines.join("\n");
}

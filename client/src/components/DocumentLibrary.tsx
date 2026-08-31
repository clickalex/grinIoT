// Signal Garden document library — embeds the internal brief, investor story, and delivery roadmap in reading order.
import { useState } from "react";
import { ArrowDownToLine, BookOpenText, Cpu, FileChartColumn, Map, ScrollText, ShieldAlert, ShieldCheck, type LucideIcon } from "lucide-react";

type DocumentSpec = {
  number: string;
  id: string;
  label: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  sections: { heading: string; text: string }[];
};

const documents: DocumentSpec[] = [
  {
    number: "01",
    id: "internal",
    label: "Internal document",
    title: "Operating brief",
    subtitle: "How Grinrex IoT should build, test, and expand without diluting the core product.",
    icon: BookOpenText,
    sections: [
      { heading: "Product center", text: "Grinrex IoT is a water-intelligent control system for urban gardens. Its first obligation is to measure zone conditions, protect the water supply, and execute safe irrigation locally—even when connectivity is interrupted." },
      { heading: "MVP boundary", text: "Begin with one to four irrigation zones, capacitive soil monitoring, ambient temperature and humidity, tank-level sensing, safe pump control, manual override, and a clear dashboard. Avoid fertilizer dosing, image diagnosis, shade automation, and complex AI in the first release." },
      { heading: "Operating principles", text: "Water efficiency first. Treat all AI as advisory. Keep critical rules on the edge controller. Make calibration visible. Permit users to stop any physical system immediately. Design modules so a starter garden can grow without a hardware redesign." },
      { heading: "Pilot evidence", text: "Track reading completeness, sensor stability, watering-event success, emergency stops, manual interventions, per-zone water use, and user confidence. Do not scale manufacturing until the core system performs consistently across different soil, weather, and installation conditions." },
    ],
  },
  {
    number: "02",
    id: "investor",
    label: "Investor document",
    title: "Investment brief",
    subtitle: "A staged hardware-and-software story anchored in water efficiency and modular expansion.",
    icon: FileChartColumn,
    sections: [
      { heading: "The opportunity", text: "Urban growers need better control, but existing tools tend to fragment sensing, irrigation, weather, and water storage. Grinrex IoT brings the operational loop together around an outcome people can understand: healthier plants with fewer manual checks and less waste." },
      { heading: "Why the wedge matters", text: "The initial product should be useful on day one without a subscription. A dependable starter system creates the installed base for multi-zone hardware, rainwater modules, analytics, professional installation, maintenance, and later decision-support services." },
      { heading: "Commercial progression", text: "Starter addresses small balconies. Pro extends into rooftop and multi-zone installations through weather context, water analytics, and rainwater handling. Elite becomes an installation-led offer for vertical gardens, small farms, and organizations managing higher-value green spaces." },
      { heading: "What to validate", text: "Prioritize installation completion, 30-day active use, automation retention, support incidents, expansion module adoption, and a demonstrable reduction in avoidable watering. These signals establish whether the product can earn hardware margin and recurring software value." },
    ],
  },
  {
    number: "03",
    id: "system-dossier",
    label: "Technical dossier",
    title: "System & product dossier",
    subtitle: "The seven-layer operating model, MVP boundary, modular path, product variants, and proof metrics in one reference document.",
    icon: Cpu,
    sections: [
      { heading: "Seven connected layers", text: "The system separates sensing, edge control, communication, backend records, intelligence, user application, and physical actuation. Sensors capture soil, climate, light, rain, water level, and flow. The edge controller validates inputs and operates locally safe rules. Cloud services organize records and improve visibility, but should not be required for basic plant care." },
      { heading: "Minimum viable system", text: "The first garden water-control kit consists of a weatherproof ESP32 controller, capacitive soil sensing, ambient temperature and humidity sensing, tank-level sensing, one pump, one to four valves or zones, manual controls, irrigation history, and a responsive dashboard. It must recover safely from internet interruption and power events." },
      { heading: "Modular path", text: "After the core loop proves reliable, Grinrex can add flow analytics, rainwater tracking, local rain and heat context, vertical-zone nodes, and explainable decision support. Fertilizer injection, automated shade, cooling, camera insight, LoRa, cellular, and multi-property management remain deliberate later-stage modules." },
      { heading: "Packaging & proof", text: "Starter is a complete small-balcony system. Pro adds multi-zone control, weather context, rainwater handling, alerts, and analytics. Elite is an installation-led package for vertical gardens and small commercial sites. Pilots should track sensor uptime, data completeness, watering-event success, false watering prevention, per-zone consumption, activation, 30-day retention, support load, and expansion attachment." },
    ],
  },
  {
    number: "04",
    id: "roadmap-doc",
    label: "Roadmap document",
    title: "Delivery sequence",
    subtitle: "The work is ordered so reliability is proven before intelligence and physical complexity are added.",
    icon: Map,
    sections: [
      { heading: "Stage 1 — Reliable core", text: "Build the ESP32 controller, basic sensors, tank protection, one-to-four zones, local rules, and dashboard. The exit condition is safe, repeatable irrigation in real gardens." },
      { heading: "Stage 2 — Water intelligence", text: "Add flow metering, zone-level consumption, rainwater monitoring, and low-water safeguards. The exit condition is a clear water baseline and a visible reduction in unnecessary watering." },
      { heading: "Stage 3 — Context and modules", text: "Introduce local rain, light, heat context, plus vertical-zone expansion. The exit condition is reliable operation across more varied garden layouts without support burden rising disproportionately." },
      { heading: "Stage 4 — Assisted intelligence", text: "Launch explainable predictive recommendations and human-confirmed visual insights. Add advanced automation only after reliability, maintenance workflows, and safety lockouts are proven." },
    ],
  },
  {
    number: "05",
    id: "risk-register",
    label: "Risk & safeguards",
    title: "Launch guardrails",
    subtitle: "The non-negotiable controls that prevent the project from becoming a broad feature catalogue before it becomes a reliable product.",
    icon: ShieldAlert,
    sections: [
      { heading: "Scope containment", text: "Treat the first release as water-smart garden control, not all-in-one AI farming. Freeze the MVP around one to four zones, safe sensing, tank protection, manual override, and simple records. Add a module only when it improves water efficiency without disproportionate installation or support burden." },
      { heading: "Measurement integrity", text: "Use replaceable capacitive sensors, soil-specific calibration, last-reading timestamps, and visible fault status. Never allow a single stale or unverified sensor reading to produce unlimited watering. Show users what the system measured and why it acted or deferred action." },
      { heading: "Physical safety", text: "Every actuator needs a manual stop path, maximum-duration guardrail, tank-low cut-off, and normally safe fallback. Where feasible, use flow verification, physical fuses, protected connectors, drainage, strain relief, and a bench-tested response to power loss, sensor faults, dry running, and stuck valves." },
      { heading: "Commercial discipline", text: "Choose one beachhead segment before commercial launch; rooftop and balcony growers already using drip irrigation or a tank are the recommended starting point. Price only after assembly, warranty, support, logistics, installer time, and failed-part rates are modeled. Keep essential local automation hardware-owned; reserve subscription value for insight, history, collaboration, and premium service." },
    ],
  },
  {
    number: "06",
    id: "complete-source-specification",
    label: "Complete specification",
    title: "Full source specification",
    subtitle: "The complete rebranded project record from Pasted_Content_10.txt, retained in a structured, readable sequence for review and download.",
    icon: ScrollText,
    sections: [
      { heading: "Project record & vision", text: "Grinrex IoT is a concept/prototype-planning project in IoT, smart gardening, and urban farming. It is a modular garden-care platform for balconies, rooftops, terraces, vertical gardens, green walls, small urban farms, residential gardens, apartments, offices, restaurants, schools, and community gardens. Its goal is to reduce manual work, optimize water use, improve plant-care consistency, and enable scalable smart urban farming through an affordable, modular, increasingly automated ecosystem." },
      { heading: "Problem record", text: "The source identifies inconsistent manual watering; over- and underwatering; unknown soil moisture; rooftop heat and exposure; uneven vertical-garden watering and sunlight; empty tanks; underused collected rainwater; late pest and disease detection; manual fertilization; fragmented monitoring; untracked growth; and difficulty managing gardens while owners are away." },
      { heading: "Core solution & value", text: "The proposed solution continuously monitors garden conditions, evaluates plant-zone signals, and controls irrigation and optional equipment. Its intended value is water savings, less manual work, consistent care, earlier environmental insight, vertical-farming support, rainwater reuse, centralized analytics, and a path to AI-assisted automation." },
      { heading: "01 — Weather & microclimate monitoring", text: "Sensors: temperature, humidity, rainfall, UV/light intensity, and wind speed. Functions: real-time and historical environmental readings; extreme-heat, rain, and high-humidity alerts; and weather-aware irrigation decisions." },
      { heading: "02 — Plant & soil health monitoring", text: "Parameters: soil moisture, soil temperature, light exposure, ambient temperature, and humidity. Functions: zone-level monitoring, dry-soil and overwatering detection, light-deficiency detection, plant-zone health scoring, and historical trend analysis." },
      { heading: "03 — Vertical farming support", text: "Supports vertical towers, green walls, stacked and tiered planters, hydroponic-style structures, and balcony vertical farms. Functions: multiple vertical zones, per-level soil and light sensing, zone-specific irrigation, uneven moisture and sunlight detection, expandable sensor nodes, and expandable valves." },
      { heading: "04 — Smart irrigation", text: "Supports drip, micro-drip, misting, sprinkler, and zone-based irrigation. Functions: automatic, manual, scheduled, moisture-triggered, weather-aware, and zone-specific watering; watering history; and emergency irrigation stop." },
      { heading: "05 — Smart water tank monitor", text: "Functions: real-time water level, percentage calculation, low and critical alerts, overflow warning, estimated remaining water, consumption tracking, and irrigation pause when water is critically low. Optional components: water-level sensor, ultrasonic sensor, and water-flow meter." },
      { heading: "06 — Rainwater collection & reuse", text: "Functions: rainfall detection, collection and tank monitoring, collected-water estimation, rainwater usage tracking, rainwater-first irrigation logic, municipal-water fallback, and utilization analytics. Possible components: rain sensor, flow meter, tank-level sensor, collection tank, and water-routing valves." },
      { heading: "07 — AI-based predictive watering", text: "Inputs: soil moisture, temperature, humidity, rainfall, weather forecast, plant type, watering history, water availability, and season. Functions: predict requirement, skip watering before expected rain, adjust duration, recommend schedule, provide eco mode, and create plant-specific recommendations." },
      { heading: "08 — AI pest detection", text: "Functions: periodic plant photography, advisory pest-image analysis, possible identification, plant-condition alerts, image history, and a human-confirmation workflow. AI output must be treated as advisory, not as a guaranteed agricultural or medical diagnosis." },
      { heading: "09 — Smart fertilizer injector", text: "Optional automated nutrient dosing linked to irrigation. Functions: scheduled and zone-based dosing, watering-linked dosing, fertilizer usage logs, manual override, and safety lockout. Hardware: peristaltic pump, fertilizer reservoir, tubing, and relay or MOSFET." },
      { heading: "10 — Microclimate control", text: "Optional control of shade and cooling equipment. Functions: fan control, temperature-triggered cooling, light-triggered shade, manual override, scheduled operation, and extreme-heat protection. Hardware: DC fan, relay or MOSFET, servo motor, and shade mechanism." },
      { heading: "11 — Plant growth time-lapse", text: "Functions: scheduled photography, growth timeline, time-lapse generation, image history, plant-progress comparison, and export/share-ready videos." },
      { heading: "12 — Smart gardening assistant", text: "Centralized application functions: dashboard, plant profiles, zone management, care, fertilizing, pruning, and harvest reminders; plant notes; watering history; and garden alerts." },
      { heading: "13 — Water management analytics", text: "Metrics: daily, weekly, and monthly consumption; rainwater collected and used; tank refills; estimated water savings; and water consumption by zone." },
      { heading: "14 — Modular expansion system", text: "Expansion options: additional soil and light sensors, irrigation and vertical zones, cameras, tanks, fertilizer channels, solar power, and environmental sensors." },
      { heading: "System architecture & data flow", text: "Layers: sensor, edge controller, communication, cloud/backend, AI/analytics, mobile/web application, and actuator. Data flows from sensors to ESP32 or equivalent; the controller validates and processes readings; the backend stores data when connected; analytics evaluates conditions; the AI/rule engine recommends or triggers actions; actuators control pumps, valves, fans, and optional shades; and the application presents status, alerts, and analytics." },
      { heading: "Hardware, power & physical build", text: "Main controller: ESP32. Recommended sensors: capacitive soil moisture, BME280 temperature/humidity, BH1750 light, rain, UV, anemometer, waterproof ultrasonic water level, and flow. Cameras: ESP32-CAM and optional Raspberry Pi. Actuators: DC pump, solenoid valves, peristaltic pump, cooling fan, and servo. Power: DC adapter, battery backup, optional solar panel, and battery-management system. Physical components: weatherproof enclosure, waterproof connectors, tubing, drippers, brackets, cable protection, and sensor holders." },
      { heading: "Software, backend & connectivity", text: "The Android and iOS application includes Dashboard, Garden, Plant Zones, Water Management, Weather, Pest Alerts, Irrigation, Fertilizer, Growth Camera, Analytics, Tasks, and Settings. Backend functions include device and user management, sensor-data storage, alerts, irrigation logs, water analytics, plant profiles, AI processing, and subscription management. Connectivity includes Wi-Fi, Bluetooth Low Energy, optional LoRa for larger sites, and optional cellular for remote deployments." },
      { heading: "Automation rules", text: "Watering: evaluate a low soil-moisture threshold, check tank availability, consider rainfall and forecast, prioritize collected rainwater where configured, stop at target moisture, and stop at critical tank level. Weather: reduce watering in significant rain, send heat alerts, recommend shade/cooling, and issue configured storm-preparation alerts. Tank: alert at low threshold and overflow approach, pause at critical level, and track flow where installed. Vertical farming: monitor every level, adjust per zone, detect moisture/light imbalance, and permit further zones." },
      { heading: "Product variants", text: "Starter: small balcony gardens with soil, temperature/humidity, light, basic irrigation, tank monitoring, and mobile dashboard. Pro: rooftops and larger balconies with Starter features plus multi-zone monitoring, weather, rainwater, assisted watering, advanced irrigation, alerts, and water analytics. Elite: advanced urban farms and vertical gardens with Pro features plus advisory pest insight, vertical zones, fertilizer injector, time-lapse, shade/cooling, advanced analytics, and a solar option." },
      { heading: "Business model & customers", text: "Revenue streams: hardware kits, premium subscription, additional sensor zones, vertical expansion kits, fertilizer, solar and rainwater add-ons, professional installation, maintenance contracts, B2B installations, and white-label partnerships. Target customers: urban households, balcony and terrace gardeners, vertical-farming operators, restaurants, cafés, hotels, schools, offices, nurseries, real-estate developers, and community gardens." },
      { heading: "Indicative pricing", text: "Planning estimates, subject to validation against components, manufacturing, taxes, logistics, warranty, and installation: Starter ₹6,999–7,999; Pro ₹9,999–11,999; Elite ₹12,999–16,999. Subscription planning: free ₹0; Pro ₹149/month or ₹999/year; Elite ₹249/month or ₹1,699/year." },
      { heading: "Seven-phase development roadmap", text: "1: Core Prototype—ESP32, soil and temperature/humidity monitoring, tank monitoring, basic irrigation, basic dashboard. 2: Smart Water Management—multi-zone, flow, rainwater collection, analytics, low-water protection. 3: Weather & Microclimate—rain, light/UV, wind, weather-based irrigation. 4: Vertical Farming—architecture, per-zone sensors and irrigation, expansion nodes. 5: AI Layer—predictive watering, plant recommendations, pest-image analysis, health scoring. 6: Automation Expansion—fertilizer, shade, cooling, advanced irrigation. 7: Growth & Commercial Product—time-lapse, production PCB, weatherproof enclosure, application, cloud, subscriptions, manufacturing, quality testing." },
      { heading: "SWOT record", text: "Strengths: integrated platform, balcony/rooftop/vertical support, water management, rainwater reuse, modularity, AI-assisted automation, and recurring-revenue potential. Weaknesses: hardware cost, advanced installation complexity, calibration requirements, outdoor weatherproofing, AI training-data dependence, and a new brand. Opportunities: urban gardening, vertical farming, water conservation, smart homes, sustainable real estate, hospitality, schools, and B2B. Threats: low-cost IoT, large smart-home entrants, outdoor sensor failures, subscription resistance, seasonality, and maintenance burden." },
      { heading: "Future expansion", text: "Hydroponics, aquaponics, greenhouse automation, solar-powered autonomous stations, LoRa sensor networks, advanced disease detection, an AI recommendation engine, harvesting assistance, water-quality monitoring, smart compost and compost-temperature monitoring, a seedling-nursery module, commercial urban-farming dashboard, multi-property management, and a third-party integration API." },
      { heading: "Success metrics & principles", text: "Product metrics: water saved per garden, reduced manual watering, plant survival/growth improvement, sensor reliability, and irrigation accuracy. Business metrics: units sold, acquisition cost, gross margin, subscription conversion, retention, add-on revenue, and B2B installations. Governing principles: water efficiency first; modularity; simple installation; reliable readings; offline-safe automation; manual override; weatherproof hardware; a user-friendly application; AI as assistant rather than unquestioned authority; and safety-first automation." },
    ],
  },
  {
    number: "07",
    id: "cons-and-solutions",
    label: "Cons & solutions",
    title: "Cons & solutions audit",
    subtitle: "The honest-risk audit: every con the project faces, why it hurts, the practical solution, and when the solution must land — covering technical, operational, commercial, adoption, and execution risks.",
    icon: ShieldCheck,
    sections: [
      { heading: "Technical & hardware", text: "Connectivity: Wi-Fi/BLE-only coverage is thin on balconies and rooftops; keep all critical rules on the edge, add store-and-forward telemetry, and reserve LoRa/cellular for paid remote modules. Sensors: capacitive probes drift with salinity, fertilizer residue, and growing medium; ship replaceable sensors, per-zone medium presets, visible calibration status, and conservative defaults that under-water rather than over-water. Security: a connected pump controller needs signed OTA, per-device keys, local-first control, and a threat-model review before pilots — the site documents did not cover security before this audit. Water quality: hard water clogs emitters; inlet filters belong in the base BOM, with flow verification to detect clogged lines. Power: pumps need mains power and outages are scheduled in summer; battery backup, one weatherproof feed per kit, and bench-tested power-loss recovery are required. Endurance: 45 °C summers and monsoon humidity demand a defined heat, moisture, and ingress test plan plus a full-monsoon pilot season before manufacturing." },
      { heading: "Operational & support", text: "Installation is real plumbing, not plug-and-play; pre-assembled color-coded kits, a 15-minute guided setup, and an installer network for Pro/Elite tiers prevent abandonment and returns. Support spikes during heat waves and monsoons; on-device diagnostics, readable event logs, remote health checks, and tiered support keep a small team afloat. Maintenance is priced in whether planned or not; replaceable parts, spare kits, and annual maintenance contracts turn it into a revenue line instead of warranty claims." },
      { heading: "Commercial & market", text: "Price-value: ₹6,999–7,999 competes with manual watering and ₹500 timers; value must be demonstrated with savings calculators, 30-day water reports, and published pilot evidence, not asserted. Margins: the published price ranges are planning estimates; enforce the lifecycle cost model before manufacturing and revisit quarterly. Subscriptions: Indian consumers resist recurring fees for garden tools; keep core automation hardware-owned and sell premium tiers to the users who grow most. Competition: commodity sensors can copy features quickly; the defensible position is water-first local safety, vertical/rooftop specialization, and install-led B2B. Seasonality and channel dependency are managed with B2B contracts, maintenance packages, and piloted nursery/contractor partnerships." },
      { heading: "Adoption, trust & UX", text: "Trust in automation is the core adoption risk: users fear flooding their plants; ship a dry-run/simulation mode (the live demo is its preview), conservative defaults, will-water-in-X notifications, and always-available manual override. Setup friction is the largest churn point; BLE-assisted pairing, a three-step onboarding, status LEDs, and local-language UI reduce drop-off. Cameras are opt-in only with local-first analysis and no cloud video by default. Early value: day-one alerts and weekly water reports keep users engaged before savings become visible." },
      { heading: "Execution & governance", text: "Pilot evidence is currently zero; pricing, demand, and reliability remain paper claims until 10–20 gardens run a full season, so no manufacturing scale before pilot exit. Scope gravity: the 14-module atlas pulls toward sprawl; module admission requires evidence, a margin model, and a support model. Compliance: certified electrical components, water-contact material standards, and a legal check on savings claims prevent launch delays. Team bandwidth: outsource PCB/assembly, use a managed cloud platform, and keep the feature cadence slow." },
      { heading: "What we must not do", text: "Do not ship camera AI, fertilizer dosing, or shade automation before the water loop proves itself. Do not make cloud connectivity a requirement for local watering. Do not publish retail pricing before the lifecycle cost model exists. Do not scale manufacturing before pilot exit criteria are met. Do not gate core automation behind a subscription. The non-negotiable safety floor stands: maximum-duration bounds, tank-low cutoff, physical emergency stop, normally-safe fallback, stale-reading guard, and local rules on the edge." },
    ],
  },
];

export function DocumentLibrary() {
  const [activeId, setActiveId] = useState("internal");
  const active = documents.find((document) => document.id === activeId) ?? documents[0];
  const ActiveIcon = active.icon;

  const download = () => {
    const body = `# Grinrex IoT — ${active.title}\n\n${active.subtitle}\n\n${active.sections.map((section) => `## ${section.heading}\n\n${section.text}`).join("\n\n")}`;
    const url = URL.createObjectURL(new Blob([body], { type: "text/markdown" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `grinrex-iot-${active.id}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-white/15 bg-[#143021] shadow-2xl shadow-black/25">
      <div className="flex flex-col border-b border-white/10 px-5 py-4 md:flex-row md:items-center md:justify-between md:px-8">
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          {documents.map((document) => (
            <button key={document.id} className="document-tab interface flex shrink-0 items-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-[.08em] text-[#b5c9ae]" data-state={activeId === document.id ? "active" : "inactive"} onClick={() => setActiveId(document.id)}>
              <span className="text-[#d9a35c]">{document.number}</span>{document.label}
            </button>
          ))}
        </div>
        <button onClick={download} className="cta-button cta-secondary mt-3 self-start px-4 py-2 text-[.62rem] md:mt-0"><ArrowDownToLine size={14} /> Export record .md</button>
      </div>
      <article className="dark-document p-6 sm:p-9 lg:p-11">
        <div className="mb-10 flex flex-col gap-5 border-b border-[#a7c48e]/60 pb-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="eyebrow flex items-center gap-3 text-[#5f8138]"><span>Grinrex IoT / controlled circulation</span><span className="document-stamp">RECORD {active.number}</span></div>
            <h3 className="display mt-3 text-4xl leading-none text-[#173024] sm:text-5xl">{active.title}</h3>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#506853]">{active.subtitle}</p>
          </div>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#d8f8a8] text-[#23452f]"><ActiveIcon size={23} /></div>
        </div>
        <div className="grid gap-x-10 gap-y-8 lg:grid-cols-2">
          {active.sections.map((section, index) => (
            <section key={section.heading} className="border-l-2 border-[#9ec75e] pl-5">
              <div className="interface text-[.66rem] font-extrabold uppercase tracking-[.16em] text-[#5f8138]">{String(index + 1).padStart(2, "0")}</div>
              <h4 className="mt-2 text-lg font-bold text-[#1f3d2b]">{section.heading}</h4>
              <p className="mt-2 text-[.96rem] leading-7 text-[#4e6553]">{section.text}</p>
            </section>
          ))}
        </div>
      </article>
    </div>
  );
}

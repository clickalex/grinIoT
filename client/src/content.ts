// Grinrex IoT — shared site content. Single source of truth for all chapter pages and the demo system.
import { Bot, Check, CircleGauge, CloudRain, Droplets, Sprout, Waves, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type Chapter = {
  id: string;
  number: string;
  label: string;
  path: string;
};

// Ordered chapters — used for navigation, the home rail, and prev/next paging.
export const chapters: Chapter[] = [
  { id: "problem", number: "01", label: "Problem", path: "/problem" },
  { id: "system", number: "02", label: "System", path: "/system" },
  { id: "capabilities", number: "03", label: "Capabilities", path: "/capabilities" },
  { id: "platform", number: "04", label: "Platform", path: "/platform" },
  { id: "roadmap", number: "05", label: "Roadmap", path: "/roadmap" },
  { id: "safety", number: "06", label: "Safety", path: "/safety" },
  { id: "commercial", number: "07", label: "Commercial", path: "/commercial" },
  { id: "investor", number: "08", label: "Investor", path: "/investor" },
  { id: "documents", number: "09", label: "Documents", path: "/documents" },
];

export const problemSignals = [
  "Manual watering is inconsistent.",
  "Soil conditions are not visible.",
  "Tanks run out without warning.",
  "Heat and rainfall change the plan.",
  "Vertical zones dry unevenly.",
  "Owners cannot monitor while away.",
] as const;

export const problemCosts = [
  ["Wasted water", "Overwatering from guesswork can push consumption well beyond what plants actually use."],
  ["Lost plants", "A single missed check during a heat wave can undo months of careful growing."],
  ["Hidden risk", "Stale readings, empty tanks, and drifting schedules compound quietly between visits."],
  ["Uneven care", "Every balcony and rooftop has its own microclimate; one generic routine cannot serve all of them."],
] as const;

export const systemLoop = [
  ["01", "Sense", "Soil, climate, light, rainfall, tank level, and flow."],
  ["02", "Decide", "Local thresholds first; analytics and recommendations later."],
  ["03", "Act", "Pumps, valves, fans, and optional garden equipment."],
  ["04", "Learn", "A readable history of water use, conditions, and outcomes."],
] as const;

export const featureModules: readonly [LucideIcon, string, string][] = [
  [CircleGauge, "Weather & microclimate", "Temperature, humidity, rainfall, UV/light, wind, historical readings, and heat or rain alerts."],
  [Sprout, "Plant & soil health", "Zone moisture, soil temperature, light exposure, dry-soil and overwatering detection, and trend history."],
  [Waves, "Vertical farming", "Independent levels, per-zone monitoring, uneven moisture and sunlight detection, plus expandable nodes."],
  [Droplets, "Smart irrigation", "Drip, micro-drip, misting, sprinkler, zone watering, local schedules, triggers, history, and emergency stop."],
  [Waves, "Water tank monitor", "Level, percentage, low and critical thresholds, overflow warning, remaining-water estimate, and consumption tracking."],
  [CloudRain, "Rainwater reuse", "Collection monitoring, rainwater-first logic, municipal fallback, routing valves, and utilization analytics."],
  [Bot, "Predictive watering", "Historical conditions, weather, plant type, season, water availability, eco mode, and explainable recommendations."],
  [Bot, "Pest & plant insight", "Periodic photography, advisory image analysis, plant-condition alerts, image history, and human confirmation."],
  [Droplets, "Fertilizer injector", "Optional peristaltic dosing, zone schedules, watering-linked application, logs, override, and safety lockout."],
  [CircleGauge, "Microclimate control", "Optional fans, shade mechanisms, temperature and light triggers, schedules, and extreme-heat protection."],
  [Sprout, "Growth time-lapse", "Scheduled photography, visual growth records, image history, plant comparisons, and export-ready video."],
  [Check, "Garden assistant", "Dashboard, plant profiles, zones, care, fertilizing, pruning, harvest reminders, notes, history, and alerts."],
  [Waves, "Water analytics", "Daily, weekly, monthly, rainwater, refill, estimated savings, and per-zone consumption records."],
  [Zap, "Modular expansion", "Add sensors, zones, cameras, tanks, fertilizer channels, solar power, and environmental sensors over time."],
];

export const systemLayers = [
  ["01", "Sensor layer", "Capacitive soil moisture, temperature/humidity, light, rain, UV, wind, tank level, and flow signals."],
  ["02", "Edge controller", "ESP32 or equivalent validation, local thresholds, offline-safe decisions, and actuator commands."],
  ["03", "Communication", "Wi-Fi and Bluetooth Low Energy first; LoRa and cellular are optional for larger or remote installations."],
  ["04", "Cloud & backend", "Device and user management, sensor records, alerts, irrigation logs, water analytics, plant profiles, and subscriptions."],
  ["05", "AI & analytics", "Rule engine first; predictive watering, plant recommendations, and human-confirmed visual insight after reliable data exists."],
  ["06", "Mobile & web app", "Dashboard, garden, zones, water, weather, pest, irrigation, fertilizer, growth, analytics, tasks, and settings."],
  ["07", "Actuators", "Pumps, solenoid valves, optional peristaltic dosing, fans, and shade mechanisms with manual override."],
] as const;

export const hardwareKit = [
  "ESP32 controller",
  "Capacitive soil sensors",
  "BME280 temperature / humidity",
  "BH1750 light sensor",
  "Rain sensor",
  "UV sensor",
  "Anemometer",
  "Waterproof ultrasonic tank level",
  "Flow meter",
  "DC pump & solenoid valves",
  "Optional ESP32-CAM / Pi camera",
  "Optional peristaltic pump, fan & servo",
  "DC power + battery backup",
  "Optional solar",
  "Weatherproof enclosure & connectors",
  "Tubing, drippers, brackets & holders",
] as const;

export const operatingRules = [
  ["Watering", "Evaluate soil thresholds, confirm tank water, consider rainfall and forecast, prioritize configured rainwater, stop at target moisture or critical tank level."],
  ["Weather", "Pause or reduce watering during significant rainfall; raise configured heat alerts; recommend shade/cooling; issue storm-preparation alerts where configured."],
  ["Tank", "Raise low and overflow alerts, pause irrigation at critical levels, and use installed flow measurement to track consumption."],
  ["Vertical zones", "Monitor every level independently, adjust irrigation per zone, surface moisture and light imbalance, and permit expansion nodes."],
] as const;

export const roadmaps = [
  ["01", "Core prototype", "ESP32 controller, soil sensing, temperature/humidity, tank monitoring, basic irrigation, and web/mobile dashboard."],
  ["02", "Smart water management", "Multi-zone irrigation, flow monitoring, rainwater collection monitoring, water analytics, and low-water protection."],
  ["03", "Weather & microclimate", "Rain, light/UV, wind, and weather-based irrigation decisions."],
  ["04", "Vertical farming", "Vertical-zone data model, per-zone sensors and irrigation, plus expandable sensor nodes."],
  ["05", "AI layer", "Predictive watering, plant recommendations, advisory pest-image analysis, and garden health scoring."],
  ["06", "Automation expansion", "Fertilizer injection, automatic shade, cooling-fan controls, and advanced irrigation routines."],
  ["07", "Growth & commercial product", "Time-lapse, production PCB, weatherproof enclosure, mobile app, cloud, subscriptions, manufacturing, and quality testing."],
] as const;

export const guardrails = [
  ["Critical", "Scope containment", "Freeze the first release around one-to-four-zone irrigation, tank protection, local rules, and manual override. Defer camera AI, fertilizer dosing, shade control, cellular, and multi-property workflows."],
  ["Critical", "Safe physical control", "Bound every watering action with a maximum duration, tank-low cutoff, emergency stop, and normally safe fallback. Test stuck valves, dry pumps, sensor faults, and power loss before pilots."],
  ["High", "Outdoor durability", "Use replaceable capacitive sensors, weatherproof enclosures, protected connectors, drainage, strain relief, and a defined heat, moisture, and ingress test plan."],
  ["High", "Commercial proof", "Choose a single beachhead market, model lifecycle costs before public pricing, and keep basic plant safety hardware-owned instead of forcing a subscription."],
] as const;

export const safetyControls = [
  ["Maximum duration", "Every watering event is bounded in time so a stuck valve or lost signal cannot flood a zone."],
  ["Tank-low cutoff", "Irrigation pauses automatically when the reserve level reaches the critical threshold."],
  ["Emergency stop", "A physical, one-tap stop path halts every pump and valve regardless of schedule or rule state."],
  ["Local fallback", "Core thresholds live on the edge controller, so basic care continues during connectivity loss."],
  ["Stale-reading guard", "A single old or unverified sensor reading can never authorize unlimited watering."],
] as const;

export const commercialItems = [
  ["Starter", "Small balcony gardens", "Soil, temperature/humidity, light, basic irrigation, tank monitoring, and mobile dashboard."],
  ["Pro", "Rooftops & larger balconies", "Starter plus multi-zone monitoring, weather and rainwater monitoring, assisted watering, alerts, and analytics."],
  ["Elite", "Urban farms & vertical gardens", "Pro plus advisory pest insight, vertical zones, fertilizer injection, time-lapse, shade/cooling, advanced analytics, and solar option."],
] as const;

export const pricePlans = [
  ["Starter kit", "₹6,999 – 7,999", "One-to-two zones, core sensing, tank monitoring, basic dashboard."],
  ["Pro kit", "₹9,999 – 11,999", "Multi-zone control, weather context, rainwater handling, analytics."],
  ["Elite kit", "₹12,999 – 16,999", "Installation-led package for vertical gardens and small commercial sites."],
] as const;

export const subscriptionPlans = [
  ["Free", "₹0", "Core local automation, dashboard, and manual control."],
  ["Pro", "₹149 / month · ₹999 / year", "History, multi-zone analytics, and priority support."],
  ["Elite", "₹249 / month · ₹1,699 / year", "Advanced analytics, advisory insights, and collaboration tools."],
] as const;

export const futureModules = ["Hydroponics", "Aquaponics", "Greenhouse automation", "Autonomous solar station", "LoRa networks", "Disease detection", "Plant recommendations", "Harvest assistance", "Water-quality sensing", "Compost monitoring", "Seedling nursery", "Commercial dashboard", "Multi-property management", "Third-party API"] as const;

export const investorPoints = [
  ["A usable wedge", "A starter product that saves manual checking and supports core automation without a subscription."],
  ["Expansion economics", "Additional zones, water modules, installation, maintenance, and analytics build from the same operating base."],
  ["Disciplined sequence", "Reliability and outdoor proof come before high-risk AI, chemical dosing, and complex mechanical systems."],
] as const;

export const validationSignals = [
  "Installation completion and early activation",
  "Sensor stability and successful irrigation events",
  "30-day automation retention",
  "Expansion-module and service attachment",
  "Measurable reduction in avoidable watering",
] as const;

export const revenueStreams = [
  ["Hardware kits", "Starter, Pro, and Elite garden systems sold as complete field kits."],
  ["Premium app", "Subscription tiers for history, analytics, and advisory insight."],
  ["Expansion modules", "Additional zones, sensors, rainwater, solar, and fertilizer channels."],
  ["Services", "Professional installation, maintenance contracts, and B2B projects."],
  ["Partnerships", "White-label deployments for developers, hospitality, and community programs."],
] as const;

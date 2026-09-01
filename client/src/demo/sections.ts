// Grinrex IoT — demo section registry. Single source of truth for the demo tab bar, the
// site footer's "working demo" column, and the demo route list used by the smoke tests.
// Every path here is a real page under /demo in App.tsx.
import { BellRing, Camera, CloudSun, Cpu, Droplets, FlaskConical, Gauge, LayoutDashboard, ListChecks, Scale, Settings, SlidersHorizontal, Sprout, Waves, type LucideIcon } from "lucide-react";

export type DemoSection = {
  label: string; // tab label
  path: string; // path inside the /demo router
  title: string; // full page title
  blurb: string; // one-line description used in the tab strip tooltips and the footer
  icon: LucideIcon;
  metaTitle: string;
  metaDescription: string;
};

export type DemoGroup = {
  id: string;
  label: string;
  sections: DemoSection[];
};

// Ordered exactly as the demo tab bar renders them.
export const demoGroups: DemoGroup[] = [
  {
    id: "loop",
    label: "Garden loop",
    sections: [
      {
        label: "Overview",
        path: "/",
        title: "Overview",
        blurb: "Live garden summary, charts, and telemetry.",
        icon: LayoutDashboard,
        metaTitle: "Live demo — Overview · Grinrex IoT",
        metaDescription: "Watch the Grinrex garden loop run live: zones, valves, tank, and water rules on an accelerated clock.",
      },
      {
        label: "Zones",
        path: "/zones",
        title: "Zones & thresholds",
        blurb: "Per-zone soil telemetry and moisture targets.",
        icon: Gauge,
        metaTitle: "Live demo — Zones & thresholds · Grinrex IoT",
        metaDescription: "Per-zone soil telemetry, moisture targets, and watering control in the live Grinrex garden simulation.",
      },
      {
        label: "Irrigation",
        path: "/irrigation",
        title: "Irrigation console",
        blurb: "Valves, flow, emergency stop, and the operating log.",
        icon: Droplets,
        metaTitle: "Live demo — Irrigation console · Grinrex IoT",
        metaDescription: "Rule state, zone valves, flow, and the emergency stop in the live Grinrex irrigation simulation.",
      },
      {
        label: "Tank & water",
        path: "/water",
        title: "Tank & water",
        blurb: "Storage, rainwater-first routing, and refill controls.",
        icon: Waves,
        metaTitle: "Live demo — Tank & water · Grinrex IoT",
        metaDescription: "Tank levels, rainwater-first logic, refill controls, and consumption tracking in the live Grinrex simulation.",
      },
      {
        label: "Harvest",
        path: "/harvest",
        title: "Rainwater harvest",
        blurb: "Catchment, rainfall capture, and overflow to the tank.",
        icon: Sprout,
        metaTitle: "Live demo — Rainwater harvest · Grinrex IoT",
        metaDescription: "Catchment area, rainfall capture, first-flush losses, and tank overflow in the live Grinrex rainwater simulation.",
      },
    ],
  },
  {
    id: "garden",
    label: "Garden intelligence",
    sections: [
      {
        label: "Weather",
        path: "/weather",
        title: "Weather & microclimate",
        blurb: "Ambient conditions driving evaporation and rain.",
        icon: CloudSun,
        metaTitle: "Live demo — Weather & microclimate · Grinrex IoT",
        metaDescription: "Temperature, humidity, light, wind, and rainfall — the live microclimate the Grinrex rule engine reads.",
      },
      {
        label: "Camera",
        path: "/camera",
        title: "Growth & pest camera",
        blurb: "Interval captures, growth index, and advisory review.",
        icon: Camera,
        metaTitle: "Live demo — Growth & pest camera · Grinrex IoT",
        metaDescription: "Simulated interval photography, growth time-lapse index, and human-confirmed advisory pest signatures.",
      },
      {
        label: "Fertilizer",
        path: "/fertilizer",
        title: "Fertilizer dosing",
        blurb: "Peristaltic channels, doses, and safety lockout.",
        icon: FlaskConical,
        metaTitle: "Live demo — Fertilizer dosing · Grinrex IoT",
        metaDescription: "Optional peristaltic dosing channels, cycle-linked application, reservoir stock, and the safety lockout.",
      },
      {
        label: "Tasks",
        path: "/tasks",
        title: "Garden tasks & notes",
        blurb: "Assistant-generated care tasks, due dates, and notes.",
        icon: ListChecks,
        metaTitle: "Live demo — Garden tasks & notes · Grinrex IoT",
        metaDescription: "The garden assistant turning live readings into due tasks, plus the gardener's own notes.",
      },
    ],
  },
  {
    id: "system",
    label: "System & evidence",
    sections: [
      {
        label: "Rules",
        path: "/rules",
        title: "Rules & schedules",
        blurb: "Windows, guardrails, and dry-run preview.",
        icon: SlidersHorizontal,
        metaTitle: "Live demo — Rules & schedules · Grinrex IoT",
        metaDescription: "Watering windows, cycle limits, rain hold-over, freeze protection, and dry-run preview in the live Grinrex demo.",
      },
      {
        label: "Devices",
        path: "/devices",
        title: "Devices & telemetry",
        blurb: "Node health, battery, radio, faults, and OTA.",
        icon: Cpu,
        metaTitle: "Live demo — Devices & telemetry · Grinrex IoT",
        metaDescription: "Device fleet health: battery, radio, sensor faults, stuck-valve detection, reboots, and simulated firmware updates.",
      },
      {
        label: "Alerts",
        path: "/alerts",
        title: "Alerts & event log",
        blurb: "Every alert and event the loop has raised.",
        icon: BellRing,
        metaTitle: "Live demo — Alerts & event log · Grinrex IoT",
        metaDescription: "Filterable alert queue with acknowledgement and the full event log of the live Grinrex garden loop.",
      },
      {
        label: "Analytics",
        path: "/analytics",
        title: "Analytics",
        blurb: "Water history, rain offset, and per-zone totals.",
        icon: Scale,
        metaTitle: "Live demo — Analytics · Grinrex IoT",
        metaDescription: "Water analytics with daily consumption, rainwater utilization, and estimated savings in the live Grinrex demo.",
      },
      {
        label: "Settings",
        path: "/settings",
        title: "Site settings",
        blurb: "Units, quiet hours, notifications, offline fallback.",
        icon: Settings,
        metaTitle: "Live demo — Site settings · Grinrex IoT",
        metaDescription: "Garden profile, units, quiet hours, notification routing, retention, and the offline fallback policy.",
      },
    ],
  },
];

export const demoSections: DemoSection[] = demoGroups.flatMap(group => group.sections);

export const demoTabMeta = new Map(demoSections.map(section => [section.path, section]));

/** Absolute href for a demo section, e.g. "/zones" → "/demo/zones". */
/** Link out of the marketing pages into the demo: absolute, `/demo/...`. */
export const demoHref = (path: string) => (path === "/" ? "/demo" : `/demo${path}`);

/**
 * Link between demo pages. The demo lives inside `<Route path="/demo" nest>`, and wouter resolves
 * a nested `Link` against the parent path — so these hrefs must stay relative to `/demo`, or they
 * come out as `#/demo/demo/zones` and land on the 404.
 */
export const demoLink = (path: string) => path;

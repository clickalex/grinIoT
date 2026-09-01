// Grinrex IoT — shared demo widgets: status lights, moisture bars, tank gauge, stat tiles,
// and the simulated device-telemetry (MQTT-style) feed.
import type { ReactNode } from "react";
import { Radio } from "lucide-react";
import type { SimState } from "./simulation";
import { formatSimClock } from "./simulation";
import { usePageMeta } from "@/hooks/usePageMeta";
import { demoTabMeta } from "./sections";

export type DemoStatus = "ok" | "warn" | "critical" | "idle";

export function StatusLight({ state, label }: { state: DemoStatus; label: string }) {
  return (
    <span className="telemetry-capsule">
      <span className="status-light" data-state={state} />
      <span className="interface text-[.58rem] font-extrabold uppercase tracking-[.12em] text-[#d7e9cc]">{label}</span>
    </span>
  );
}

export function MoistureBar({ moisture, target, height = 10 }: { moisture: number; target: number; height?: number }) {
  const fill = Math.min(100, Math.max(0, moisture));
  const targetPos = Math.min(97, Math.max(3, target));
  const tone = moisture < target - 6 ? "#d9a35c" : moisture > target + 12 ? "#8fd3b4" : "#b8f15a";
  return (
    <div className="relative" style={{ height }}>
      <div className="absolute inset-0 overflow-hidden rounded-full bg-white/[.07]">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${fill}%`, background: tone, opacity: 0.85 }} />
      </div>
      <div className="absolute top-1/2 h-full w-[2px] -translate-y-1/2 rounded bg-[#efffd3]/80" style={{ left: `${targetPos}%` }} title={`Target ${target}%`} />
    </div>
  );
}

export function StatTile({ label, value, sub, tone = "text-[#efffd3]", icon }: { label: string; value: ReactNode; sub?: ReactNode; tone?: string; icon?: ReactNode }) {
  return (
    <div className="metric-tile">
      <div className="flex items-center justify-between">
        <span className="metric-label">{label}</span>
        {icon}
      </div>
      <div className={`metric-value mt-2.5 ${tone}`}>{value}</div>
      {sub && <div className="mt-1.5 text-xs text-[#8fae93]">{sub}</div>}
    </div>
  );
}

export function TankGauge({ level, capacity, low, critical, unit = "L" }: { level: number; capacity: number; low: number; critical: number; unit?: string }) {
  const pct = Math.max(0, Math.min(100, (level / capacity) * 100));
  const R = 64;
  const C = 2 * Math.PI * R;
  const offset = C * (1 - pct / 100);
  const tone = level <= critical ? "#ff6b57" : level <= low ? "#d9a35c" : "#b8f15a";
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={170} height={170} viewBox="0 0 170 170" className="-rotate-90">
        <circle cx={85} cy={85} r={R} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth={12} />
        <circle cx={85} cy={85} r={R} fill="none" stroke={tone} strokeWidth={12} strokeLinecap="round" strokeDasharray={C} strokeDashoffset={offset} className="gauge-arc" />
      </svg>
      <div className="absolute text-center">
        <div className="interface text-3xl font-extrabold" style={{ color: tone }}>
          {Math.round(level)}
          <span className="text-base"> {unit}</span>
        </div>
        <div className="interface mt-0.5 text-[.58rem] font-extrabold tracking-[.14em] text-[#8fae93]">{Math.round(pct)}% FULL</div>
      </div>
    </div>
  );
}

export const chartColors = {
  lime: "#b8f15a",
  amber: "#d9a35c",
  aqua: "#8fd3b4",
  ivory: "#efffd3",
  grid: "rgba(224,255,188,.08)",
  axis: "rgba(160,190,160,.6)",
};

export function clockTicks(history: { t: number }[], count = 5) {
  if (history.length < 2) return [0, 1];
  const first = history[0].t;
  const last = history[history.length - 1].t;
  const step = Math.max(1, Math.floor((last - first) / count));
  const ticks: number[] = [];
  for (let t = first; t <= last; t += step) ticks.push(t);
  return ticks;
}

export const tickClockLabel = (t: number, clock24h = true) => formatSimClock(t, clock24h);

// Simulated device telemetry: in production firmware these are real MQTT topics
// (Wi-Fi/BLE to the edge gateway). The demo renders the same message shapes in-browser.
export function TelemetryFeed({ state }: { state: SimState }) {
  const topics: [string, string, string][] = [
    ["grinrex/edge/status", state.emergencyStop ? "EMERGENCY_STOP" : "online", state.emergencyStop ? "#ff6b57" : "#b8f15a"],
    ["grinrex/edge/weather/temp", `${state.weather.temp.toFixed(1)} °C`, "#d9a35c"],
    ["grinrex/edge/weather/humidity", `${state.weather.humidity.toFixed(0)} %`, "#d9a35c"],
    ["grinrex/edge/weather/rain", state.weather.raining ? `active ${Math.round(state.weather.rainIntensity * 100)}%` : "none", state.weather.raining ? "#8fd3b4" : "#8fae93"],
    ...state.zones.map(zone => [`grinrex/edge/${zone.id}/moisture`, `${zone.moisture.toFixed(1)} %`, "#b8f15a"] as [string, string, string]),
    ...state.zones.map(zone => [`grinrex/edge/${zone.id}/valve`, zone.valveOpen ? "OPEN" : "CLOSED", zone.valveOpen ? "#b8f15a" : "#8fae93"] as [string, string, string]),
    ["grinrex/edge/tank/level", `${state.tank.level.toFixed(1)} L`, "#8fd3b4"],
    ["grinrex/edge/flow", state.history.length ? `${state.history[state.history.length - 1].flowRate.toFixed(1)} L/min` : "0.0 L/min", "#8fd3b4"],
    ["grinrex/edge/rules/eco", state.eco ? "on" : "off", "#b8f15a"],
  ];

  return (
    <div className="demo-panel overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
        <span className="interface flex items-center gap-2 text-[.62rem] font-extrabold uppercase tracking-[.14em] text-[#d9a35c]">
          <Radio size={13} /> Device telemetry bus
        </span>
        <span className="interface text-[.54rem] font-extrabold uppercase tracking-[.12em] text-[#8fae93]">Simulated MQTT feed — device firmware publishes these topics in production</span>
      </div>
      <div className="grid gap-x-8 gap-y-1 px-5 py-4 font-mono text-[.68rem] leading-5 sm:grid-cols-2 xl:grid-cols-3">
        {topics.map(([topic, value, color]) => (
          <div key={topic + value} className="flex items-baseline gap-2">
            <span className="truncate text-[#7e9a80]">{topic}</span>
            <span className="mx-1 shrink-0 text-[#4a624f]">→</span>
            <span className="shrink-0" style={{ color }}>
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- shared page furniture used by the demo pages --------------------------
export const tooltipStyle = {
  background: "rgba(13,30,21,.96)",
  border: "1px solid rgba(184,241,90,.25)",
  borderRadius: "0.8rem",
  fontSize: "0.72rem",
  color: "#e3f1d5",
};

/** Page metadata for a demo route, sourced from the demo section registry. */
export function useDemoMeta(path: string) {
  const section = demoTabMeta.get(path);
  usePageMeta(section?.metaTitle ?? "Live demo · Grinrex IoT", section?.metaDescription ?? section?.blurb);
}

export function DemoPageHeader({ path, title, accent, copy, aside }: { path: string; title: string; accent?: string; copy: string; aside?: ReactNode }) {
  const section = demoTabMeta.get(path);
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <div className="eyebrow text-[#b8f15a]">Live demo / {section?.title ?? ""}</div>
        <h1 className="display mt-3 text-4xl leading-[1.02] text-[#f4ffe5] sm:text-5xl">
          {title}
          {accent ? (
            <>
              ,<br />
              <em className="font-normal text-[#b8f15a]">{accent}</em>
            </>
          ) : (
            "."
          )}
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-[#a9c1a2]">{copy}</p>
      </div>
      {aside && <div className="flex flex-wrap items-end gap-3">{aside}</div>}
    </div>
  );
}

export function DemoSectionTitle({ title, note, action }: { title: string; note?: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <h2 className="interface text-[.68rem] font-extrabold uppercase tracking-[.16em] text-[#d9a35c]">{title}</h2>
      {action ?? (note ? <span className="interface text-[.58rem] font-extrabold uppercase tracking-[.1em] text-[#8fae93]">{note}</span> : null)}
    </div>
  );
}

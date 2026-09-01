// Grinrex IoT — demo Irrigation console. Rule state, per-zone valve control, live flow, and the full event log.
import { CloudRain, Droplets, Hand, Info, OctagonX, Play, ShieldCheck, Square } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DemoLayout } from "./DemoLayout";
import { useGarden } from "./GardenContext";
import { formatSimClock } from "./simulation";
import { chartColors, clockTicks, StatTile, tickClockLabel } from "./ui";
import { usePageMeta } from "@/hooks/usePageMeta";

const tooltipStyle = {
  background: "rgba(13,30,21,.96)",
  border: "1px solid rgba(184,241,90,.25)",
  borderRadius: "0.8rem",
  fontSize: "0.72rem",
  color: "#e3f1d5",
};

export default function IrrigationPage() {
  usePageMeta("Live demo — Irrigation console · Grinrex IoT", "Rule state, zone valves, flow, and the emergency stop in the live Grinrex irrigation simulation.");
  const { state, actions } = useGarden();
  const openValves = state.zones.filter(z => z.valveOpen).length;
  const runningFlow = state.history.length > 0 ? state.history[state.history.length - 1].flowRate : 0;

  return (
    <DemoLayout>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="eyebrow text-[#b8f15a]">Live demo / Irrigation</div>
            <h1 className="display mt-3 text-4xl leading-[1.02] text-[#f4ffe5] sm:text-5xl">Irrigation console.</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#a9c1a2]">
              The same controls a garden owner sees: global rules, per-zone valves, the emergency stop, and the operating log. Watch the flow rise when a valve opens — and stop instantly when the red button is pressed.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <StatTile label="Valves open" value={`${openValves}/${state.zones.length}`} sub="live" tone="text-[#b8f15a]" icon={<Droplets size={15} className="text-[#b8f15a]" />} />
            <StatTile label="Flow rate" value={`${runningFlow.toFixed(1)} L/min`} sub="pump output" tone="text-[#8fd3b4]" icon={<Play size={15} className="text-[#8fd3b4]" />} />
          </div>
        </div>

        {/* Global rules */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <article className="demo-panel p-5">
            <div className="flex items-center justify-between">
              <span className="interface text-[.6rem] font-extrabold uppercase tracking-[.14em] text-[#d9a35c]">Automatic mode</span>
              <span className={`status-light ${state.autoGlobal ? "" : "status-light"}`} data-state={state.autoGlobal ? "ok" : "idle"} />
            </div>
            <p className="mt-3 text-sm leading-6 text-[#afc5a7]">Rule engine opens valves when a zone falls below its target — and closes them at the stop moisture.</p>
            <button className="demo-chip mt-4" data-on={state.autoGlobal} onClick={actions.toggleAuto}>
              {state.autoGlobal ? "Auto on" : "Auto off"}
            </button>
          </article>
          <article className="demo-panel p-5">
            <div className="flex items-center justify-between">
              <span className="interface text-[.6rem] font-extrabold uppercase tracking-[.14em] text-[#d9a35c]">Eco mode</span>
              <span className="status-light" data-state={state.eco ? "ok" : "idle"} />
            </div>
            <p className="mt-3 text-sm leading-6 text-[#afc5a7]">Rainwater first, leaner cycles: valves close closer to the target instead of overshooting it.</p>
            <button className="demo-chip mt-4" data-on={state.eco} onClick={actions.toggleEco}>
              {state.eco ? "Eco on" : "Eco off"}
            </button>
          </article>
          <article className="demo-panel p-5">
            <div className="flex items-center justify-between">
              <span className="interface text-[.6rem] font-extrabold uppercase tracking-[.14em] text-[#d9a35c]">Rain pause</span>
              <span className="status-light" data-state={state.weather.raining ? "warn" : "idle"} />
            </div>
            <p className="mt-3 text-sm leading-6 text-[#afc5a7]">
              {state.weather.raining ? `Rain falling at ${Math.round(state.weather.rainIntensity * 100)}% intensity — automatic watering is paused.` : "No rain detected. Automatic watering rules are armed."}
            </p>
            <span className="demo-chip mt-4 !cursor-default" data-on={state.weather.raining}>
              <CloudRain size={13} /> {state.weather.raining ? "Paused" : "Armed"}
            </span>
          </article>
          <article className={`rounded-[1.25rem] border p-5 ${state.emergencyStop ? "border-[#ff6b57]/50 bg-[#3a1610]" : "border-[#b8f15a]/20 bg-[#163425]"}`}>
            <div className="flex items-center justify-between">
              <span className="interface text-[.6rem] font-extrabold uppercase tracking-[.14em] text-[#d9a35c]">Emergency stop</span>
              <ShieldCheck size={16} className={state.emergencyStop ? "text-[#ff8d7a]" : "text-[#b8f15a]"} />
            </div>
            <p className="mt-3 text-sm leading-6 text-[#afc5a7]">One physical action halts every pump and valve, regardless of schedule or rule state.</p>
            {state.emergencyStop ? (
              <button className="demo-chip mt-4 !border-[#ff8d7a]/50 !text-[#ffc9bd]" onClick={actions.clearStop}>
                <Play size={13} /> Clear stop
              </button>
            ) : (
              <button
                className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-[#ff6b57]/50 bg-[#ff6b57]/15 px-3.5 py-2 font-semibold text-[#ffc9bd] transition-colors hover:bg-[#ff6b57]/25"
                onClick={actions.emergencyStop}
              >
                <OctagonX size={14} /> STOP ALL
              </button>
            )}
          </article>
        </div>

        {/* Per-zone valves */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="interface text-[.68rem] font-extrabold uppercase tracking-[.16em] text-[#d9a35c]">Zone valves</h2>
            <span className="interface text-[.58rem] font-extrabold uppercase tracking-[.1em] text-[#8fae93]">Max cycle 12 sim-min · cutoff at critical tank</span>
          </div>
          <div className="overflow-hidden rounded-[1.3rem] border border-white/12">
            <div className="hidden grid-cols-[1.6fr_1fr_1fr_.9fr] gap-4 border-b border-white/10 bg-white/[.03] px-5 py-3 md:grid">
              {["Zone", "Moisture / target", "Valve", "Control"].map(label => (
                <span key={label} className="interface text-[.56rem] font-extrabold uppercase tracking-[.14em] text-[#8fae93]">
                  {label}
                </span>
              ))}
            </div>
            {state.zones.map(zone => (
              <div key={zone.id} className="grid gap-3 border-b border-white/[.07] px-5 py-4 last:border-0 md:grid-cols-[1.6fr_1fr_1fr_.9fr] md:items-center md:gap-4">
                <div>
                  <div className="font-bold text-[#effadf]">{zone.name}</div>
                  <div className="text-xs text-[#8fae93]">
                    {zone.plant}
                    {zone.pausedByRain ? " · paused by rain" : ""}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`interface text-lg font-extrabold ${zone.moisture < zone.target - 6 ? "text-[#ffd49c]" : "text-[#efffd3]"}`}>{zone.moisture.toFixed(0)}%</span>
                  <span className="interface text-[.58rem] font-extrabold text-[#8fae93]">/ {zone.target.toFixed(0)}%</span>
                </div>
                <div>
                  <span className={`valve-badge ${zone.valveOpen ? "valve-open" : "valve-closed"}`}>{zone.valveOpen ? "Open" : "Closed"}</span>
                </div>
                <div className="flex gap-2">
                  {zone.valveOpen ? (
                    <button className="demo-chip !border-[#ff8d7a]/50 !text-[#ffb3a4]" onClick={() => actions.stopZone(zone.id)}>
                      <Square size={12} /> Stop
                    </button>
                  ) : (
                    <button className="demo-chip !border-[#b8f15a]/45 !text-[#b8f15a]" onClick={() => actions.startZone(zone.id)}>
                      <Play size={12} /> Start
                    </button>
                  )}
                  <button className="demo-chip hidden sm:inline-flex" data-on={zone.auto} onClick={() => actions.setZoneAuto(zone.id, !zone.auto)}>
                    <Hand size={12} /> {zone.auto ? "Auto" : "Manual"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Flow chart */}
        <div className="demo-panel p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="interface text-[.68rem] font-extrabold uppercase tracking-[.16em] text-[#d9a35c]">Live flow rate</h2>
            <span className="text-xs text-[#8fae93]">L/min · pump output</span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={state.history} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="flowFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={chartColors.lime} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={chartColors.lime} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 6" vertical={false} />
                <XAxis dataKey="t" ticks={clockTicks(state.history)} tickFormatter={t => tickClockLabel(t, state.settings.clock24h)} stroke={chartColors.axis} fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke={chartColors.axis} fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} labelFormatter={t => formatSimClock(Number(t), state.settings.clock24h)} />
                <Area type="stepAfter" dataKey="flowRate" name="L/min" stroke={chartColors.lime} strokeWidth={2} fill="url(#flowFill)" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Event log */}
        <div className="demo-panel p-5">
          <div className="mb-4 flex items-center gap-2">
            <Info size={15} className="text-[#d9a35c]" />
            <h2 className="interface text-[.68rem] font-extrabold uppercase tracking-[.16em] text-[#d9a35c]">Operating log</h2>
            <span className="interface ml-auto text-[.56rem] font-extrabold uppercase tracking-[.1em] text-[#8fae93]">latest {Math.min(state.log.length, 60)} events</span>
          </div>
          <ul className="demo-scroll max-h-96 space-y-1.5 overflow-y-auto pr-1">
            {state.log.map(entry => (
              <li key={entry.id} className="alert-item flex items-start gap-3 rounded-lg bg-white/[.03] px-3 py-2" data-kind={entry.kind}>
                <span className="interface mt-0.5 shrink-0 text-[.56rem] font-extrabold text-[#d9a35c]">{formatSimClock(entry.simMin)}</span>
                <span className="interface mt-0.5 w-20 shrink-0 text-[.56rem] font-extrabold uppercase tracking-[.1em] text-[#8fae93]">{entry.source}</span>
                <p className="text-xs leading-5 text-[#b8cbb0]">{entry.message}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </DemoLayout>
  );
}

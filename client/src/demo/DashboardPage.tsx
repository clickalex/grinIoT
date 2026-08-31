// Grinrex IoT — demo Overview. Live garden summary: telemetry, zones, charts, alerts, and the event log.
import { AlertTriangle, CheckCircle2, CloudRain, Droplets, Gauge as GaugeIcon, Info, ShieldAlert, Sprout, Thermometer, Waves, Wind } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Link } from "wouter";
import { DemoLayout } from "./DemoLayout";
import { useGarden } from "./GardenContext";
import { formatSimClock } from "./simulation";
import { chartColors, clockTicks, MoistureBar, StatTile, StatusLight, tickClockLabel } from "./ui";

const tooltipStyle = {
  background: "rgba(13,30,21,.96)",
  border: "1px solid rgba(184,241,90,.25)",
  borderRadius: "0.8rem",
  fontSize: "0.72rem",
  color: "#e3f1d5",
};

function alertIcon(kind: string) {
  switch (kind) {
    case "critical":
      return <ShieldAlert size={15} className="shrink-0 text-[#ff6b57]" />;
    case "warn":
      return <AlertTriangle size={15} className="shrink-0 text-[#d9a35c]" />;
    case "ok":
      return <CheckCircle2 size={15} className="shrink-0 text-[#b8f15a]" />;
    default:
      return <Info size={15} className="shrink-0 text-[#8fd3b4]" />;
  }
}

export default function DashboardPage() {
  const { state, actions } = useGarden();
  const avgMoisture = state.zones.reduce((sum, z) => sum + z.moisture, 0) / Math.max(1, state.zones.length);
  const openValves = state.zones.filter((z) => z.valveOpen).length;
  const autoZones = state.zones.filter((z) => z.auto).length;
  const tankPct = Math.round((state.tank.level / state.tank.capacity) * 100);
  const w = state.weather;

  return (
    <DemoLayout>
      <div className="flex flex-col gap-8">
        {/* Page heading */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="eyebrow text-[#b8f15a]">Live demo / Overview</div>
            <h1 className="display mt-3 text-4xl leading-[1.02] text-[#f4ffe5] sm:text-5xl">The garden loop,<br /><em className="font-normal text-[#b8f15a]">running now.</em></h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#a9c1a2]">
              This is a simulated garden on an accelerated clock. Soil moisture decays, rules open valves, the tank drains, rain pauses watering —
              every control on this site is live and shared across all demo pages.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusLight state={state.emergencyStop ? "critical" : "ok"} label={state.emergencyStop ? "Emergency stop" : "Controller online"} />
            <StatusLight state={state.weather.raining ? "warn" : "idle"} label={state.weather.raining ? "Rain pause" : "No rain"} />
            <StatusLight state={state.eco ? "ok" : "idle"} label={state.eco ? "Eco mode" : "Standard"} />
          </div>
        </div>

        {/* KPI tiles */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          <StatTile label="Avg soil moisture" value={`${avgMoisture.toFixed(0)}%`} sub="across all zones" icon={<Sprout size={16} className="text-[#b8f15a]" />} />
          <StatTile label="Tank level" value={`${tankPct}%`} sub={`${state.tank.level.toFixed(0)} / ${state.tank.capacity} L`} tone={tankPct <= 14 ? "text-[#ff9c8c]" : tankPct <= 30 ? "text-[#ffd49c]" : "text-[#efffd3]"} icon={<Waves size={16} className="text-[#8fd3b4]" />} />
          <StatTile label="Valves open" value={`${openValves}/${state.zones.length}`} sub={`${autoZones} zones in auto`} tone="text-[#b8f15a]" icon={<Droplets size={16} className="text-[#b8f15a]" />} />
          <StatTile label="Water today" value={`${state.waterToday.toFixed(1)} L`} sub={`${state.rainwaterToday.toFixed(1)} L from rain`} icon={<CloudRain size={16} className="text-[#8fd3b4]" />} />
          <StatTile label="Temperature" value={`${w.temp.toFixed(1)}°C`} sub={`${w.humidity.toFixed(0)}% humidity`} icon={<Thermometer size={16} className="text-[#d9a35c]" />} />
          <StatTile label="Sim clock" value={formatSimClock(state.simMin)} sub={`day ${Math.floor(state.simMin / 1440) + 1} · ${state.speed}× speed`} icon={<GaugeIcon size={16} className="text-[#8fae93]" />} />
        </div>

        {/* Zone summary cards */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="interface text-[.68rem] font-extrabold uppercase tracking-[.16em] text-[#d9a35c]">Zones live</h2>
            <Link href="/demo/zones" className="interface text-[.62rem] font-extrabold uppercase tracking-[.1em] text-[#b8f15a] hover:text-[#d0ff88]">Manage zones →</Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {state.zones.map((zone) => (
              <article className="glass-panel rounded-[1.3rem] p-5" key={zone.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-[#effadf]">{zone.name}</h3>
                    <p className="mt-0.5 text-xs text-[#8fae93]">{zone.plant}</p>
                  </div>
                  <span className={`valve-badge ${zone.valveOpen ? "valve-open" : "valve-closed"}`}>
                    {zone.valveOpen ? "Valve open" : zone.auto ? "Auto" : "Manual"}
                  </span>
                </div>
                <div className="mt-5 flex items-baseline justify-between">
                  <span className={`interface text-2xl font-extrabold ${zone.moisture < zone.target - 6 ? "text-[#ffd49c]" : "text-[#efffd3]"}`}>{zone.moisture.toFixed(0)}%</span>
                  <span className="interface text-[.58rem] font-extrabold tracking-[.1em] text-[#8fae93]">TARGET {zone.target.toFixed(0)}%</span>
                </div>
                <div className="mt-2"><MoistureBar moisture={zone.moisture} target={zone.target} /></div>
                <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-[.68rem] text-[#8fae93]">
                  <span>{zone.temp.toFixed(1)}°C</span>
                  <button
                    className={`interface rounded-full px-3 py-1.5 text-[.56rem] font-extrabold uppercase tracking-[.1em] transition-colors ${zone.auto ? "bg-[#b8f15a]/14 text-[#b8f15a]" : "bg-white/[.06] text-[#9dbd9f]"}`}
                    onClick={() => actions.setZoneAuto(zone.id, !zone.auto)}
                  >
                    {zone.auto ? "Auto on" : "Auto off"}
                  </button>
                  <span>{zone.consumedToday.toFixed(1)} L today</span>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Live charts */}
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="demo-panel p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="interface text-[.68rem] font-extrabold uppercase tracking-[.16em] text-[#d9a35c]">Average soil moisture</h2>
              <span className="text-xs text-[#8fae93]">% · live</span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={state.history} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="moistureFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={chartColors.lime} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={chartColors.lime} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 6" vertical={false} />
                  <XAxis dataKey="t" ticks={clockTicks(state.history)} tickFormatter={tickClockLabel} stroke={chartColors.axis} fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 100]} stroke={chartColors.axis} fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={tooltipStyle} labelFormatter={(t) => formatSimClock(Number(t))} />
                  <Area type="monotone" dataKey="avgMoisture" name="Moisture %" stroke={chartColors.lime} strokeWidth={2} fill="url(#moistureFill)" isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="demo-panel p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="interface text-[.68rem] font-extrabold uppercase tracking-[.16em] text-[#d9a35c]">Tank level</h2>
              <span className="text-xs text-[#8fae93]">liters · live</span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={state.history} margin={{ top: 4, right: 8, left: -14, bottom: 0 }}>
                  <defs>
                    <linearGradient id="tankFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={chartColors.aqua} stopOpacity={0.4} />
                      <stop offset="100%" stopColor={chartColors.aqua} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 6" vertical={false} />
                  <XAxis dataKey="t" ticks={clockTicks(state.history)} tickFormatter={tickClockLabel} stroke={chartColors.axis} fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, state.tank.capacity]} stroke={chartColors.axis} fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={tooltipStyle} labelFormatter={(t) => formatSimClock(Number(t))} />
                  <ReferenceLine y={state.tank.criticalThreshold} stroke="#ff6b57" strokeDasharray="4 4" />
                  <ReferenceLine y={state.tank.lowThreshold} stroke="#d9a35c" strokeDasharray="4 4" />
                  <Area type="monotone" dataKey="tankLevel" name="Liters" stroke={chartColors.aqua} strokeWidth={2} fill="url(#tankFill)" isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Alerts + event log */}
        <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
          <div className="demo-panel p-5">
            <h2 className="interface text-[.68rem] font-extrabold uppercase tracking-[.16em] text-[#d9a35c]">Active alerts</h2>
            {state.alerts.length === 0 ? (
              <p className="mt-4 text-sm text-[#8fae93]">No active alerts. The loop is calm.</p>
            ) : (
              <ul className="mt-4 space-y-2.5">
                {state.alerts.slice(0, 6).map((alert) => (
                  <li key={alert.id} className="alert-item rounded-lg bg-white/[.035] p-3" data-kind={alert.kind}>
                    <div className="flex items-center gap-2.5">
                      {alertIcon(alert.kind)}
                      <span className="text-sm font-bold text-[#effadf]">{alert.title}</span>
                      <span className="interface ml-auto text-[.56rem] font-extrabold text-[#8fae93]">{formatSimClock(alert.simMin)}</span>
                    </div>
                    <p className="mt-1.5 text-xs leading-5 text-[#a9c1a2]">{alert.detail}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="demo-panel p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="interface text-[.68rem] font-extrabold uppercase tracking-[.16em] text-[#d9a35c]">Event log</h2>
              <Link href="/demo/irrigation" className="interface text-[.62rem] font-extrabold uppercase tracking-[.1em] text-[#b8f15a] hover:text-[#d0ff88]">Irrigation console →</Link>
            </div>
            <ul className="demo-scroll max-h-72 space-y-2 overflow-y-auto pr-1">
              {state.log.slice(0, 40).map((entry) => (
                <li key={entry.id} className="alert-item rounded-lg bg-white/[.03] px-3 py-2" data-kind={entry.kind}>
                  <div className="flex items-center gap-2">
                    {alertIcon(entry.kind)}
                    <span className="interface text-[.56rem] font-extrabold uppercase tracking-[.1em] text-[#d9a35c]">{entry.source}</span>
                    <span className="interface ml-auto text-[.56rem] font-extrabold text-[#8fae93]">{formatSimClock(entry.simMin)}</span>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-[#b8cbb0]">{entry.message}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Weather context strip */}
        <div className="demo-panel grid grid-cols-2 gap-4 p-5 sm:grid-cols-3 lg:grid-cols-6">
          {[
            [Thermometer, "Ambient", `${w.temp.toFixed(1)}°C`],
            [CloudRain, "Rain", w.raining ? `${Math.round(w.rainIntensity * 100)}%` : "None"],
            [Droplets, "Humidity", `${w.humidity.toFixed(0)}%`],
            [Sprout, "Light", `${w.light.toFixed(0)}%`],
            [Wind, "Wind", `${w.wind.toFixed(1)} km/h`],
            [Waves, "Rain share", `${state.tank.rainShare.toFixed(0)} L`],
          ].map(([Icon, label, value]) => {
            const IconCmp = Icon as typeof Thermometer;
            return (
              <div key={label as string} className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#b8f15a]/12 text-[#b8f15a]"><IconCmp size={16} /></div>
                <div>
                  <div className="interface text-[.56rem] font-extrabold uppercase tracking-[.12em] text-[#8fae93]">{label as string}</div>
                  <div className="interface mt-0.5 text-sm font-extrabold text-[#efffd3]">{value as string}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DemoLayout>
  );
}

// Grinrex IoT — demo Rainwater harvest. Catchment, rainfall capture, first-flush losses, and
// what the storage tank can actually accept before water goes to the drain.
import { CloudRain, Droplets, Gauge, ShieldAlert, Waves } from "lucide-react";
import { Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Link } from "wouter";
import { DemoLayout } from "./DemoLayout";
import { useGarden } from "./GardenContext";
import { demoLink } from "./sections";
import { formatDepth, formatSimClock, formatVolume } from "./simulation";

export default function HarvestPage() {
  useDemoMeta("/harvest");
  const { state, actions } = useGarden();
  const h = state.harvest;
  const units = state.settings.units;
  const free = Math.max(0, state.tank.capacity - state.tank.level);
  const captureRate = state.weather.raining ? (state.weather.rainMmPerHour / 60) * h.catchmentM2 * h.efficiency : 0;
  const fillMinutes = captureRate > 0 ? Math.round(free / captureRate) : null;
  const last7 = h.daily.slice(-7);
  const weekLiters = last7.reduce((sum, day) => sum + day.liters, 0);
  const weekMm = last7.reduce((sum, day) => sum + day.mm, 0);
  const overflowShare = Math.round((h.overflowCount / Math.max(1, h.overflowCount + 10)) * 100);

  return (
    <DemoLayout>
      <div className="flex flex-col gap-8">
        <DemoPageHeader
          path="/harvest"
          title="Rain in,"
          accent="waste out."
          copy="Every millimetre on the catchment is a litre the mains did not have to supply. The demo meters the roof, the gutter losses, and the moment the tank is full enough that water starts going to the drain."
          aside={
            <>
              <StatTile label="Captured today" value={formatVolume(h.collectedTodayL, units)} sub={`${formatDepth(h.rainMmToday, units)} on the gauge`} tone="text-[#8fd3b4]" icon={<CloudRain size={15} className="text-[#8fd3b4]" />} />
              <StatTile
                label="Live capture"
                value={captureRate > 0 ? `${formatVolume(captureRate, units)} / min` : "idle"}
                sub={state.weather.raining ? "raining on the catchment" : "no rain event"}
                tone={captureRate > 0 ? "text-[#b8f15a]" : "text-[#efffd3]"}
                icon={<Droplets size={15} className="text-[#b8f15a]" />}
              />
            </>
          }
        />

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          <StatTile label="Catchment" value={`${h.catchmentM2.toFixed(0)} m²`} sub="roof / balcony area" icon={<Gauge size={15} className="text-[#8fae93]" />} />
          <StatTile label="System efficiency" value={`${(h.efficiency * 100).toFixed(0)}%`} sub="gutter + first-flush loss" icon={<ShieldAlert size={15} className="text-[#d9a35c]" />} />
          <StatTile label="Stored in tank" value={formatVolume(state.tank.rainShare, units)} sub="rainwater share" tone="text-[#8fd3b4]" icon={<Waves size={15} className="text-[#8fd3b4]" />} />
          <StatTile label="Free capacity" value={formatVolume(free, units)} sub={fillMinutes !== null ? `~${fillMinutes} min to full at this rate` : "of tank"} icon={<Droplets size={15} className="text-[#b8f15a]" />} />
          <StatTile label="Season total" value={formatVolume(h.collectedTotalL, units)} sub="since installation" tone="text-[#d9a35c]" icon={<CloudRain size={15} className="text-[#d9a35c]" />} />
          <StatTile label="Overflow events" value={h.overflowCount} sub={`${overflowShare}% of rain lost`} tone={h.overflowCount > 4 ? "text-[#ffd49c]" : "text-[#efffd3]"} icon={<ShieldAlert size={15} className="text-[#ff9c8c]" />} />
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.15fr_.85fr]">
          {/* 7-day capture */}
          <div className="demo-panel p-5">
            <DemoSectionTitle title="Capture vs rainfall" note="last 7 days · mm and litres" />
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={last7} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                  <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 6" vertical={false} />
                  <XAxis dataKey="day" stroke={chartColors.axis} fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="left" stroke={chartColors.axis} fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="right" orientation="right" stroke={chartColors.axis} fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    cursor={{ fill: "rgba(184,241,90,.06)" }}
                    formatter={(value: number | string, name: string) => (name === "mm" ? [formatDepth(Number(value), units), "Rainfall"] : [formatVolume(Number(value), units), "Captured"])}
                  />
                  <Bar yAxisId="left" dataKey="liters" name="liters" fill="rgba(143,211,180,.55)" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                  <Line yAxisId="right" type="monotone" dataKey="mm" name="mm" stroke={chartColors.amber} strokeWidth={2} dot={false} isAnimationActive={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3 border-t border-white/10 pt-4">
              <div>
                <div className="metric-label">7-day rainfall</div>
                <div className="interface mt-1 text-lg font-extrabold text-[#efffd3]">{formatDepth(weekMm, units)}</div>
              </div>
              <div>
                <div className="metric-label">7-day capture</div>
                <div className="interface mt-1 text-lg font-extrabold text-[#8fd3b4]">{formatVolume(weekLiters, units)}</div>
              </div>
              <div>
                <div className="metric-label">Lost to overflow</div>
                <div className="interface mt-1 text-lg font-extrabold text-[#ffd49c]">{last7.filter(day => day.overflow).length} days</div>
              </div>
            </div>
          </div>

          {/* sizing controls */}
          <div className="demo-panel p-5">
            <DemoSectionTitle title="Sizing the system" note="live — the engine uses these numbers" />
            <div className="space-y-6">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="interface text-[.58rem] font-extrabold uppercase tracking-[.12em] text-[#8fae93]">Catchment area</span>
                  <span className="interface text-sm font-extrabold text-[#b8f15a]">{h.catchmentM2.toFixed(0)} m²</span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={60}
                  step={1}
                  value={h.catchmentM2}
                  onChange={event => actions.patchHarvest({ catchmentM2: Number(event.target.value) }, `Catchment area set to ${event.target.value} m².`)}
                  className="demo-slider"
                  style={
                    {
                      "--fill": `${((h.catchmentM2 - 2) / 58) * 100}%`,
                    } as React.CSSProperties
                  }
                  aria-label="Catchment area in square metres"
                />
                <p className="mt-2 text-xs leading-5 text-[#8fae93]">One millimetre of rain on one square metre is one litre. A 12 m² balcony is a 12-litre gift per millimetre.</p>
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="interface text-[.58rem] font-extrabold uppercase tracking-[.12em] text-[#8fae93]">Efficiency after first flush</span>
                  <span className="interface text-sm font-extrabold text-[#b8f15a]">{(h.efficiency * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min={30}
                  max={92}
                  step={1}
                  value={Math.round(h.efficiency * 100)}
                  onChange={event => actions.patchHarvest({ efficiency: Number(event.target.value) / 100 }, `Harvest efficiency set to ${event.target.value}%.`)}
                  className="demo-slider"
                  style={
                    {
                      "--fill": `${((h.efficiency * 100 - 30) / 62) * 100}%`,
                    } as React.CSSProperties
                  }
                  aria-label="Harvest efficiency percent"
                />
                <p className="mt-2 text-xs leading-5 text-[#8fae93]">Gutter debris, first-flush diverter, and evaporation. Real systems rarely beat 85%.</p>
              </div>
              <div className="rounded-xl border border-white/12 bg-white/[.035] p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="interface text-[.58rem] font-extrabold uppercase tracking-[.12em] text-[#d9a35c]">Route capture into the tank</div>
                    <p className="mt-1.5 text-xs leading-5 text-[#8fae93]">When on, harvested water feeds storage and the rainwater-first logic. When off, it fills a barrel the pump cannot see.</p>
                  </div>
                  <button
                    className="demo-chip shrink-0"
                    data-on={h.routedToTank}
                    onClick={() => actions.patchHarvest({ routedToTank: !h.routedToTank }, `Rainwater routing ${h.routedToTank ? "moved to the bypass barrel" : "into the storage tank"}.`)}
                    aria-label="Toggle routing harvested rainwater into the tank"
                  >
                    {h.routedToTank ? "To tank" : "Bypass"}
                  </button>
                </div>
              </div>
            </div>
            <Link href={demoLink("/water")} className="interface mt-6 inline-block text-[.6rem] font-extrabold uppercase tracking-[.1em] text-[#b8f15a] hover:text-[#d0ff88]">
              See what the tank did with it →
            </Link>
          </div>
        </div>

        {/* daily ledger */}
        <div className="overflow-hidden rounded-[1.3rem] border border-white/12">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/[.03]">
                {["Day", "Rainfall", "Captured", "Into tank", "Status"].map(label => (
                  <th key={label} className="interface px-4 py-3 text-[.56rem] font-extrabold uppercase tracking-[.14em] text-[#8fae93]">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {h.daily
                .slice()
                .reverse()
                .map(day => (
                  <tr key={day.day} className="border-b border-white/[.06] last:border-0">
                    <td className="px-4 py-3 font-bold text-[#effadf]">{day.day}</td>
                    <td className="px-4 py-3 text-[#d7e9cc]">{formatDepth(day.mm, units)}</td>
                    <td className="px-4 py-3 text-[#8fd3b4]">{formatVolume(day.liters, units)}</td>
                    <td className="px-4 py-3 text-[#a9c1a2]">{h.routedToTank || day.day !== "Today" ? formatVolume(day.liters * (day.overflow ? 0.72 : 1), units) : "barrel"}</td>
                    <td className="px-4 py-3">
                      <span className={`valve-badge ${day.overflow ? "valve-open" : "valve-closed"}`}>{day.overflow ? "Overflow" : "Fully captured"}</span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-white/[.02] px-4 py-3">
            <span className="interface text-[.58rem] font-extrabold uppercase tracking-[.12em] text-[#8fae93]">Ledger holds {h.daily.length} days · retention set on the settings page</span>
            <span className="interface text-[.58rem] font-extrabold uppercase tracking-[.12em] text-[#d9a35c]">
              Last overflow {h.lastOverflowSimMin === null ? "not this session" : formatSimClock(h.lastOverflowSimMin, state.settings.clock24h)}
            </span>
          </div>
        </div>
      </div>
    </DemoLayout>
  );
}
import { DemoPageHeader, DemoSectionTitle, StatTile, chartColors, tooltipStyle, useDemoMeta } from "./ui";

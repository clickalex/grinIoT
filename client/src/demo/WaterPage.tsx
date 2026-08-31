// Grinrex IoT — demo Tank & Water. Tank state, rainwater-first logic, refill controls, and consumption.
import { CloudRain, Droplets, LandPlot, ShieldAlert, Waves } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DemoLayout } from "./DemoLayout";
import { useGarden } from "./GardenContext";
import { formatSimClock } from "./simulation";
import { chartColors, clockTicks, StatTile, TankGauge, tickClockLabel } from "./ui";

const tooltipStyle = {
  background: "rgba(13,30,21,.96)",
  border: "1px solid rgba(184,241,90,.25)",
  borderRadius: "0.8rem",
  fontSize: "0.72rem",
  color: "#e3f1d5",
};

export default function WaterPage() {
  const { state, actions } = useGarden();
  const tank = state.tank;
  const pct = Math.round((tank.level / tank.capacity) * 100);
  const rainPct = tank.rainShare + tank.muniShare > 0 ? Math.round((tank.rainShare / (tank.rainShare + tank.muniShare)) * 100) : 0;

  const tankState = tank.level <= tank.criticalThreshold ? "critical" : tank.level <= tank.lowThreshold ? "warn" : "ok";

  return (
    <DemoLayout>
      <div className="flex flex-col gap-8">
        <div>
          <div className="eyebrow text-[#b8f15a]">Live demo / Tank &amp; water</div>
          <h1 className="display mt-3 text-4xl leading-[1.02] text-[#f4ffe5] sm:text-5xl">Every drop, accounted.</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#a9c1a2]">
            The tank monitor measures level, tracks rainwater against municipal supply, and protects the reserve.
            Drop below the low threshold and the system warns; reach critical and every valve closes.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[.9fr_1.1fr]">
          {/* Tank panel */}
          <div className="demo-panel flex flex-col items-center justify-center gap-6 p-7">
            <TankGauge level={tank.level} capacity={tank.capacity} low={tank.lowThreshold} critical={tank.criticalThreshold} />
            <div className="grid w-full grid-cols-2 gap-3">
              <div className="metric-tile">
                <div className="metric-label flex items-center gap-1"><CloudRain size={11} /> Rainwater</div>
                <div className="metric-value mt-2 text-xl text-[#8fd3b4]">{tank.rainShare.toFixed(1)} L</div>
                <div className="mt-1 text-[.62rem] text-[#8fae93]">{rainPct}% of stored supply</div>
              </div>
              <div className="metric-tile">
                <div className="metric-label flex items-center gap-1"><Droplets size={11} /> Municipal</div>
                <div className="metric-value mt-2 text-xl text-[#efffd3]">{tank.muniShare.toFixed(1)} L</div>
                <div className="mt-1 text-[.62rem] text-[#8fae93]">{100 - rainPct}% of stored supply</div>
              </div>
              <div className="metric-tile">
                <div className="metric-label flex items-center gap-1"><Waves size={11} /> Low threshold</div>
                <div className="metric-value mt-2 text-xl text-[#ffd49c]">{tank.lowThreshold} L</div>
                <div className="mt-1 text-[.62rem] text-[#8fae93]">warning point</div>
              </div>
              <div className="metric-tile">
                <div className="metric-label flex items-center gap-1"><ShieldAlert size={11} /> Critical</div>
                <div className="metric-value mt-2 text-xl text-[#ff9c8c]">{tank.criticalThreshold} L</div>
                <div className="mt-1 text-[.62rem] text-[#8fae93]">irrigation cutoff</div>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <button className="demo-chip !border-[#8fd3b4]/45 !text-[#8fd3b4]" onClick={() => actions.refill(25, "rain")}><CloudRain size={13} /> +25 L rain</button>
              <button className="demo-chip" onClick={() => actions.refill(25, "municipal")}><Droplets size={13} /> +25 L municipal</button>
              <button className="demo-chip" onClick={() => actions.refill(tank.capacity, tank.rainShare >= tank.muniShare ? "rain" : "municipal")}>Fill tank</button>
            </div>
          </div>

          {/* Level chart */}
          <div className="demo-panel p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="interface text-[.68rem] font-extrabold uppercase tracking-[.16em] text-[#d9a35c]">Tank level over time</h2>
              <span className={`interface text-[.58rem] font-extrabold uppercase tracking-[.12em] ${tankState === "ok" ? "text-[#b8f15a]" : tankState === "warn" ? "text-[#ffd49c]" : "text-[#ff9c8c]"}`}>
                {tankState === "ok" ? "Healthy" : tankState === "warn" ? "Low" : "Critical"}
              </span>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={state.history} margin={{ top: 4, right: 8, left: -14, bottom: 0 }}>
                  <defs>
                    <linearGradient id="waterTankFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={chartColors.aqua} stopOpacity={0.4} />
                      <stop offset="100%" stopColor={chartColors.aqua} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 6" vertical={false} />
                  <XAxis dataKey="t" ticks={clockTicks(state.history)} tickFormatter={tickClockLabel} stroke={chartColors.axis} fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, tank.capacity]} stroke={chartColors.axis} fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={tooltipStyle} labelFormatter={(t) => formatSimClock(Number(t))} />
                  <ReferenceLine y={tank.criticalThreshold} stroke="#ff6b57" strokeDasharray="4 4" label={{ value: "critical", fill: "#ff9c8c", fontSize: 9, position: "insideBottomLeft" }} />
                  <ReferenceLine y={tank.lowThreshold} stroke="#d9a35c" strokeDasharray="4 4" label={{ value: "low", fill: "#ffd49c", fontSize: 9, position: "insideBottomLeft" }} />
                  <Area type="monotone" dataKey="tankLevel" name="Liters" stroke={chartColors.aqua} strokeWidth={2} fill="url(#waterTankFill)" isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Consumption */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="interface text-[.68rem] font-extrabold uppercase tracking-[.16em] text-[#d9a35c]">Water use today</h2>
            <span className="text-xs text-[#8fae93]">{formatSimClock(state.simMin)} · day {Math.floor(state.simMin / 1440) + 1}</span>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatTile label="Used today" value={`${state.waterToday.toFixed(1)} L`} sub="all zones" tone="text-[#b8f15a]" icon={<Droplets size={15} className="text-[#b8f15a]" />} />
            <StatTile label="From rainwater" value={`${state.rainwaterToday.toFixed(1)} L`} sub="rain-first routing" tone="text-[#8fd3b4]" icon={<CloudRain size={15} className="text-[#8fd3b4]" />} />
            <StatTile label="Yesterday" value={`${state.waterYesterday.toFixed(1)} L`} sub="comparison day" icon={<Waves size={15} className="text-[#8fae93]" />} />
            <StatTile label="Savings estimate" value={`${state.estimatedSavingsL.toFixed(0)} L`} sub="since installation" tone="text-[#d9a35c]" icon={<LandPlot size={15} className="text-[#d9a35c]" />} />
          </div>
          <div className="mt-4 space-y-2.5">
            {state.zones.map((zone) => {
              const max = Math.max(1, ...state.zones.map((z) => z.consumedToday));
              const width = Math.round((zone.consumedToday / max) * 100);
              return (
                <div key={zone.id} className="flex items-center gap-4">
                  <span className="interface w-32 shrink-0 truncate text-[.62rem] font-extrabold uppercase tracking-[.08em] text-[#c9dcbf]">{zone.name}</span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/[.06]">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#8fd3b4] to-[#b8f15a] transition-all duration-700" style={{ width: `${width}%` }} />
                  </div>
                  <span className="interface w-16 shrink-0 text-right text-xs font-extrabold text-[#efffd3]">{zone.consumedToday.toFixed(1)} L</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DemoLayout>
  );
}

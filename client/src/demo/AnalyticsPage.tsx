// Grinrex IoT — demo Analytics. Deterministic 14-day garden water record with savings and per-zone rollups.
import { useMemo } from "react";
import { ArrowDownRight, ArrowUpRight, CloudRain, Droplets, LandPlot, Waves } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DemoLayout } from "./DemoLayout";
import { useGarden } from "./GardenContext";
import { chartColors, StatTile } from "./ui";
import { usePageMeta } from "@/hooks/usePageMeta";

const tooltipStyle = {
  background: "rgba(13,30,21,.96)",
  border: "1px solid rgba(184,241,90,.25)",
  borderRadius: "0.8rem",
  fontSize: "0.72rem",
  color: "#e3f1d5",
};

type DayRecord = {
  day: string;
  usage: number;
  rain: number;
  muni: number;
  savings: number;
  events: number;
  temperature: number;
};

function mulberry(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildHistory(): DayRecord[] {
  const rand = mulberry(20260831);
  const days: DayRecord[] = [];
  let cumulative = 0;
  for (let i = 13; i >= 0; i--) {
    const hot = rand();
    const usage = Math.round((26 + hot * 34 + rand() * 8) * 10) / 10;
    const rainShare = 0.3 + rand() * 0.55;
    const rain = Math.round(usage * rainShare * 10) / 10;
    const muni = Math.round((usage - rain) * 10) / 10;
    const savings = Math.round(rain * 10) / 10;
    cumulative = Math.round((cumulative + savings) * 10) / 10;
    days.push({
      day: i === 0 ? "Today" : i === 1 ? "Yesterday" : `Day -${i}`,
      usage,
      rain,
      muni,
      savings,
      events: Math.round(4 + rand() * 9),
      temperature: Math.round((24 + hot * 12) * 10) / 10,
    });
  }
  return days;
}

export default function AnalyticsPage() {
  usePageMeta("Live demo — Water analytics · Grinrex IoT", "14-day water record, rainwater utilization, and per-zone lifetime use in the live Grinrex simulation.");
  const { state } = useGarden();
  const history = useMemo(buildHistory, []);

  const liveToday = history[history.length - 1];
  const liveTomorrow = { ...liveToday, usage: Math.round((liveToday.usage + state.waterToday) * 10) / 10, rain: Math.round((liveToday.rain + state.rainwaterToday) * 10) / 10, muni: Math.round((liveToday.muni + Math.max(0, state.waterToday - state.rainwaterToday)) * 10) / 10 };
  const series = [...history.slice(0, -1), liveTomorrow];

  const totalUsage = series.reduce((sum, d) => sum + d.usage, 0);
  const totalSavings = series.reduce((sum, d) => sum + d.rain, 0);
  const rainUtilization = Math.round((totalSavings / Math.max(1, totalUsage)) * 100);
  const avgUsage = totalUsage / series.length;
  const todayDelta = liveTomorrow.usage - liveToday.usage;

  const zoneTotals = state.zones
    .map((zone) => ({ name: zone.name, total: Math.round(zone.consumedTotal * 10) / 10 }))
    .sort((a, b) => b.total - a.total);

  return (
    <DemoLayout>
      <div className="flex flex-col gap-8">
        <div>
          <div className="eyebrow text-[#b8f15a]">Live demo / Analytics</div>
          <h1 className="display mt-3 text-4xl leading-[1.02] text-[#f4ffe5] sm:text-5xl">Water intelligence.</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#a9c1a2]">
            The analytics layer turns the operating log into evidence: daily consumption, rainwater utilization,
            and estimated savings. Today’s live demo data is folded into the record as it happens.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatTile label="14-day use" value={`${totalUsage.toFixed(0)} L`} sub={`avg ${avgUsage.toFixed(1)} L/day`} icon={<Droplets size={15} className="text-[#b8f15a]" />} />
          <StatTile label="Rainwater used" value={`${totalSavings.toFixed(0)} L`} sub={`${rainUtilization}% utilization`} tone="text-[#8fd3b4]" icon={<CloudRain size={15} className="text-[#8fd3b4]" />} />
          <StatTile label="Municipal offset" value={`${(totalUsage - totalSavings).toFixed(0)} L`} sub="still from mains" icon={<Waves size={15} className="text-[#8fae93]" />} />
          <StatTile
            label="Live today"
            value={`+${todayDelta.toFixed(1)} L`}
            sub="since page load"
            tone={todayDelta > 0 ? "text-[#ffd49c]" : "text-[#b8f15a]"}
            icon={todayDelta > 0 ? <ArrowUpRight size={15} className="text-[#ffd49c]" /> : <ArrowDownRight size={15} className="text-[#b8f15a]" />}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="demo-panel p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="interface text-[.68rem] font-extrabold uppercase tracking-[.16em] text-[#d9a35c]">Daily water use</h2>
              <span className="text-xs text-[#8fae93]">liters · 14 days</span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={series} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                  <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 6" vertical={false} />
                  <XAxis dataKey="day" stroke={chartColors.axis} fontSize={10} tickLine={false} axisLine={false} interval={1} />
                  <YAxis stroke={chartColors.axis} fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(184,241,90,.06)" }} />
                  <Bar dataKey="rain" name="Rainwater" stackId="w" fill={chartColors.aqua} radius={[0, 0, 0, 0]} isAnimationActive={false} />
                  <Bar dataKey="muni" name="Municipal" stackId="w" fill="rgba(255,255,255,.14)" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="demo-panel p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="interface text-[.68rem] font-extrabold uppercase tracking-[.16em] text-[#d9a35c]">Cumulative rainwater offset</h2>
              <span className="text-xs text-[#8fae93]">liters saved from mains</span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={series} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="savingsFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={chartColors.aqua} stopOpacity={0.4} />
                      <stop offset="100%" stopColor={chartColors.aqua} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 6" vertical={false} />
                  <XAxis dataKey="day" stroke={chartColors.axis} fontSize={10} tickLine={false} axisLine={false} interval={1} />
                  <YAxis stroke={chartColors.axis} fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="rain" name="Rainwater L" stroke={chartColors.aqua} strokeWidth={2} fill="url(#savingsFill)" isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
          <div className="demo-panel p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="interface text-[.68rem] font-extrabold uppercase tracking-[.16em] text-[#d9a35c]">Irrigation events &amp; temperature</h2>
              <span className="text-xs text-[#8fae93]">per day</span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={series} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                  <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 6" vertical={false} />
                  <XAxis dataKey="day" stroke={chartColors.axis} fontSize={10} tickLine={false} axisLine={false} interval={1} />
                  <YAxis yAxisId="left" stroke={chartColors.axis} fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="right" orientation="right" stroke={chartColors.axis} fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line yAxisId="left" type="monotone" dataKey="events" name="Watering events" stroke={chartColors.lime} strokeWidth={2} dot={false} isAnimationActive={false} />
                  <Line yAxisId="right" type="monotone" dataKey="temperature" name="°C" stroke={chartColors.amber} strokeWidth={2} dot={false} strokeDasharray="5 4" isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="demo-panel p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="interface text-[.68rem] font-extrabold uppercase tracking-[.16em] text-[#d9a35c]">Per-zone lifetime use</h2>
              <span className="text-xs text-[#8fae93]">liters</span>
            </div>
            <div className="space-y-3.5 pt-2">
              {zoneTotals.map((zone, index) => {
                const max = zoneTotals[0]?.total ?? 1;
                return (
                  <div key={zone.name}>
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="interface text-[.62rem] font-extrabold uppercase tracking-[.08em] text-[#c9dcbf]">
                        <span className="mr-2 text-[#d9a35c]">{String(index + 1).padStart(2, "0")}</span>{zone.name}
                      </span>
                      <span className="interface text-xs font-extrabold text-[#efffd3]">{zone.total.toFixed(0)} L</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-white/[.06]">
                      <div className="h-full rounded-full bg-gradient-to-r from-[#b8f15a] to-[#8fd3b4]" style={{ width: `${Math.round((zone.total / max) * 100)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 rounded-xl border border-[#d9a35c]/25 bg-[#332b1c] p-4">
              <div className="interface flex items-center gap-2 text-[.58rem] font-extrabold uppercase tracking-[.12em] text-[#d9a35c]"><LandPlot size={13} /> Reading</div>
              <p className="mt-2 text-sm leading-6 text-[#d6c8aa]">Rainwater covers {rainUtilization}% of total use. Shifting two more zones to evening cycles would raise that share further.</p>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-[1.3rem] border border-white/12">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/[.03]">
                {["Day", "Total use", "Rainwater", "Municipal", "Events", "High temp"].map((label) => (
                  <th key={label} className="interface px-4 py-3 text-[.56rem] font-extrabold uppercase tracking-[.14em] text-[#8fae93]">{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {series.slice(-7).reverse().map((day) => (
                <tr key={day.day} className="border-b border-white/[.06] last:border-0">
                  <td className="px-4 py-3 font-bold text-[#effadf]">{day.day}</td>
                  <td className="px-4 py-3 text-[#d7e9cc]">{day.usage.toFixed(1)} L</td>
                  <td className="px-4 py-3 text-[#8fd3b4]">{day.rain.toFixed(1)} L</td>
                  <td className="px-4 py-3 text-[#a9c1a2]">{day.muni.toFixed(1)} L</td>
                  <td className="px-4 py-3 text-[#a9c1a2]">{day.events}</td>
                  <td className="px-4 py-3 text-[#d9a35c]">{day.temperature.toFixed(0)}°C</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DemoLayout>
  );
}

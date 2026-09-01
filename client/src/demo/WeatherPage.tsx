// Grinrex IoT — demo Weather & microclimate. The ambient signal the rule engine evaporates,
// pauses, and protects against — plus per-zone microclimate deviation and the day curve.
import { AlertTriangle, CloudRain, Droplets, Snowflake, Sun, Thermometer, Wind } from "lucide-react";
import { Area, Bar, CartesianGrid, ComposedChart, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Link } from "wouter";
import { DemoLayout } from "./DemoLayout";
import { useGarden } from "./GardenContext";
import { demoLink } from "./sections";
import { daylightAt, formatDepth, formatSimClock, formatTemp } from "./simulation";

export default function WeatherPage() {
  useDemoMeta("/weather");
  const { state } = useGarden();
  const w = state.weather;
  const units = state.settings.units;

  const rainHoldLeft = state.lastRainEndSimMin === null ? 0 : Math.max(0, Math.round(state.rules.rainSkipMin - (state.simMin - state.lastRainEndSimMin)));
  const freezeActive = w.temp <= state.rules.freezeProtectC;
  const heatActive = w.temp >= 34;
  const windDry = w.wind > 18;

  // next four hours of the modelled daylight curve — the same curve the engine uses
  const curve = Array.from({ length: 25 }, (_, i) => {
    const t = state.simMin + i * 15;
    const day = daylightAt(t);
    return {
      t,
      light: Math.round(day * 100),
      temp: Number((16 + 11 * day).toFixed(1)),
      evap: Number(((0.055 + 0.011 * day + Math.max(0, 16 + 11 * day - 16) * 0.0035) * 4 * 15).toFixed(2)),
    };
  });

  const evapNow = state.zones.length
    ? state.zones.map(zone => ({
        zone: zone.name,
        moisture: zone.moisture,
        target: zone.target,
        temp: zone.temp,
        light: zone.light,
        drift: Number((zone.temp - w.temp).toFixed(1)),
      }))
    : [];

  const rainAlerts = state.log.filter(entry => entry.source === "Weather").slice(0, 6);

  return (
    <DemoLayout>
      <div className="flex flex-col gap-8">
        <DemoPageHeader
          path="/weather"
          title="The sky, measured"
          accent="every four minutes."
          copy="Weather is not a decoration on this page — temperature, humidity, light, wind, and rainfall feed the evaporation model and the pause rules. What the mast reads, the engine acts on."
          aside={
            <>
              <StatTile label="Ambient" value={formatTemp(w.temp, units)} sub={`${w.humidity.toFixed(0)}% humidity`} tone="text-[#ffd49c]" icon={<Thermometer size={15} className="text-[#d9a35c]" />} />
              <StatTile
                label="Rain rate"
                value={w.raining ? `${w.rainMmPerHour.toFixed(0)} mm/h` : "none"}
                sub={w.raining ? `${Math.round(w.rainIntensity * 100)}% intensity` : "dry"}
                tone={w.raining ? "text-[#8fd3b4]" : "text-[#efffd3]"}
                icon={<CloudRain size={15} className="text-[#8fd3b4]" />}
              />
            </>
          }
        />

        {/* conditions strip */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          <StatTile label="Temperature" value={formatTemp(w.temp, units)} sub={`freeze guard ${formatTemp(state.rules.freezeProtectC, units, 0)}`} icon={<Thermometer size={15} className="text-[#d9a35c]" />} />
          <StatTile label="Humidity" value={`${w.humidity.toFixed(0)}%`} sub="slows evaporation" icon={<Droplets size={15} className="text-[#8fd3b4]" />} />
          <StatTile label="Daylight" value={`${w.light.toFixed(0)}%`} sub={w.light > 5 ? "sun up" : "night"} icon={<Sun size={15} className="text-[#b8f15a]" />} />
          <StatTile label="Wind" value={`${w.wind.toFixed(1)} km/h`} sub={windDry ? "extra drying" : "light"} tone={windDry ? "text-[#ffd49c]" : "text-[#efffd3]"} icon={<Wind size={15} className="text-[#8fae93]" />} />
          <StatTile label="Rain today" value={formatDepth(state.harvest.rainMmToday, units)} sub="on the gauge" icon={<CloudRain size={15} className="text-[#8fd3b4]" />} />
          <StatTile label="Rain hold-over" value={`${rainHoldLeft} min`} sub="auto watering paused" tone={rainHoldLeft > 0 ? "text-[#ffd49c]" : "text-[#b8f15a]"} icon={<AlertTriangle size={15} className="text-[#d9a35c]" />} />
        </div>

        {/* how the sky is being used right now */}
        <div className="grid gap-4 lg:grid-cols-3">
          <article className={`demo-panel p-5 ${freezeActive ? "!border-[#8fd3b4]/45" : ""}`}>
            <div className="flex items-center justify-between">
              <span className="interface text-[.6rem] font-extrabold uppercase tracking-[.14em] text-[#d9a35c]">Freeze protection</span>
              <Snowflake size={16} className={freezeActive ? "text-[#8fd3b4]" : "text-[#5f7a68]"} />
            </div>
            <p className="mt-3 text-sm leading-6 text-[#afc5a7]">
              Irrigation is held at or below {formatTemp(state.rules.freezeProtectC, units, 0)}. Ambient is <span className="font-bold text-[#efffd3]">{formatTemp(w.temp, units)}</span> —{" "}
              {freezeActive ? "the guard is active." : "clear of the guard."}
            </p>
            <Link href={demoLink("/rules")} className="interface mt-4 inline-block text-[.6rem] font-extrabold uppercase tracking-[.1em] text-[#b8f15a] hover:text-[#d0ff88]">
              Adjust in rules →
            </Link>
          </article>
          <article className={`demo-panel p-5 ${heatActive ? "!border-[#ff6b57]/45" : ""}`}>
            <div className="flex items-center justify-between">
              <span className="interface text-[.6rem] font-extrabold uppercase tracking-[.14em] text-[#d9a35c]">Heat load</span>
              <Thermometer size={16} className={heatActive ? "text-[#ff8d7a]" : "text-[#5f7a68]"} />
            </div>
            <p className="mt-3 text-sm leading-6 text-[#afc5a7]">
              {heatActive ? "Above 34°C the engine shifts preference to the evening window and recommends shade." : "Below the heat-alert line. Evaporation is running at the modelled daytime rate."}
            </p>
            <Link href={demoLink("/alerts")} className="interface mt-4 inline-block text-[.6rem] font-extrabold uppercase tracking-[.1em] text-[#b8f15a] hover:text-[#d0ff88]">
              See heat alerts →
            </Link>
          </article>
          <article className="demo-panel p-5">
            <div className="flex items-center justify-between">
              <span className="interface text-[.6rem] font-extrabold uppercase tracking-[.14em] text-[#d9a35c]">Rain response</span>
              <CloudRain size={16} className={w.raining ? "text-[#8fd3b4]" : "text-[#5f7a68]"} />
            </div>
            <p className="mt-3 text-sm leading-6 text-[#afc5a7]">
              {w.raining
                ? `Raining now — automatic watering is paused and the catchment is filling the tank.`
                : rainHoldLeft > 0
                  ? `Rain has just ended. Auto watering resumes in ${rainHoldLeft} sim-min.`
                  : "No rain. Harvested water still sits in the tank and is used first."}
            </p>
            <Link href={demoLink("/harvest")} className="interface mt-4 inline-block text-[.6rem] font-extrabold uppercase tracking-[.1em] text-[#b8f15a] hover:text-[#d0ff88]">
              Rainwater harvest →
            </Link>
          </article>
        </div>

        {/* live conditions chart */}
        <div className="demo-panel p-5">
          <DemoSectionTitle
            title="Ambient history"
            note={
              <span className="flex items-center gap-3">
                <span className="text-[#ffd49c]">°{units === "imperial" ? "F" : "C"}</span>
                <span className="text-[#8fd3b4]">humidity %</span>
                <span className="text-[#b8f15a]">light %</span>
                <span className="text-[#8fae93]">rain mm/h</span>
              </span>
            }
          />
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={state.history} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="lightFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={chartColors.lime} stopOpacity={0.28} />
                    <stop offset="100%" stopColor={chartColors.lime} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 6" vertical={false} />
                <XAxis dataKey="t" ticks={clockTicks(state.history)} tickFormatter={t => formatSimClock(Number(t), state.settings.clock24h)} stroke={chartColors.axis} fontSize={10} tickLine={false} axisLine={false} />
                <YAxis yAxisId="left" domain={[0, 100]} stroke={chartColors.axis} fontSize={10} tickLine={false} axisLine={false} />
                <YAxis yAxisId="right" orientation="right" stroke={chartColors.axis} fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  labelFormatter={t => formatSimClock(Number(t), state.settings.clock24h)}
                  formatter={(value: number | string, name: string) =>
                    name === "temp" ? [formatTemp(Number(value), units), "Temperature"] : [`${Number(value).toFixed(1)}${name === "rain" ? " mm/h" : "%"}`, name === "humidity" ? "Humidity" : name === "light" ? "Light" : "Wind"]
                  }
                />
                <Area yAxisId="left" type="monotone" dataKey="light" name="light" stroke={chartColors.lime} strokeWidth={1.5} fill="url(#lightFill)" isAnimationActive={false} />
                <Line yAxisId="left" type="monotone" dataKey="humidity" name="humidity" stroke={chartColors.aqua} strokeWidth={2} dot={false} isAnimationActive={false} />
                <Line yAxisId="left" type="monotone" dataKey="temp" name="temp" stroke={chartColors.amber} strokeWidth={2} dot={false} isAnimationActive={false} />
                <Line yAxisId="left" type="monotone" dataKey="wind" name="wind" stroke="rgba(255,255,255,.28)" strokeWidth={1.5} strokeDasharray="4 4" dot={false} isAnimationActive={false} />
                <Bar yAxisId="right" dataKey="rain" name="rain" fill="rgba(143,211,180,.5)" barSize={5} isAnimationActive={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.05fr_.95fr]">
          {/* forward curve */}
          <div className="demo-panel p-5">
            <DemoSectionTitle title="Day curve" note="modelled ahead · evaporation %" />
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={curve} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                  <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 6" vertical={false} />
                  <XAxis dataKey="t" ticks={clockTicks(curve, 4)} tickFormatter={t => formatSimClock(Number(t), state.settings.clock24h)} stroke={chartColors.axis} fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke={chartColors.axis} fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    labelFormatter={t => formatSimClock(Number(t), state.settings.clock24h)}
                    formatter={(value: number | string, name: string) => (name === "temp" ? [formatTemp(Number(value), units), "Temp"] : name === "evap" ? [`${value}% moisture`, "Evaporation"] : [`${value}%`, "Daylight"])}
                  />
                  <ReferenceLine x={state.simMin} stroke="rgba(255,255,255,.25)" />
                  <Area type="monotone" dataKey="light" name="light" stroke={chartColors.lime} strokeWidth={1.5} fill="rgba(184,241,90,.12)" isAnimationActive={false} />
                  <Line type="monotone" dataKey="temp" name="temp" stroke={chartColors.amber} strokeWidth={2} dot={false} isAnimationActive={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-3 text-xs leading-5 text-[#8fae93]">
              The demo does not fetch a forecast — the curve is the same sinusoidal daylight model the engine decays moisture against, so a rule change here and a reading there always agree.
            </p>
          </div>

          {/* per-zone microclimate */}
          <div className="demo-panel p-5">
            <DemoSectionTitle title="Zone microclimate" note="deviation from ambient" />
            <div className="space-y-2.5">
              {evapNow.map(row => (
                <div key={row.zone} className="rounded-xl bg-white/[.035] p-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-bold text-[#effadf]">{row.zone}</span>
                    <span className="interface text-[.58rem] font-extrabold uppercase tracking-[.1em] text-[#8fae93]">
                      {formatTemp(row.temp, units)} · light {row.light.toFixed(0)}%
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[.07]">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${Math.min(100, Math.abs(row.drift) * 14)}%`,
                          background: row.drift > 0 ? chartColors.amber : chartColors.aqua,
                        }}
                      />
                    </div>
                    <span className={`interface w-14 shrink-0 text-right text-[.62rem] font-extrabold ${row.drift > 0.4 ? "text-[#ffd49c]" : "text-[#8fd3b4]"}`}>
                      {row.drift > 0 ? "+" : ""}
                      {row.drift.toFixed(1)}°
                    </span>
                    <span className="interface w-24 shrink-0 text-right text-[.62rem] font-extrabold text-[#c9dcbf]">
                      {row.moisture.toFixed(0)}/{row.target.toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs leading-5 text-[#8fae93]">Vertical walls run hotter and drier than the mast reading — that gap is why each zone keeps its own target.</p>
          </div>
        </div>

        {/* weather log */}
        <div className="demo-panel p-5">
          <DemoSectionTitle title="Weather record" note="last readings the engine reacted to" />
          {rainAlerts.length === 0 ? (
            <p className="text-sm text-[#8fae93]">No weather-driven events yet in this session. Start the sim at 20× and wait for a rain cell.</p>
          ) : (
            <ul className="space-y-2">
              {rainAlerts.map(entry => (
                <li key={entry.id} className="alert-item flex flex-wrap items-baseline gap-x-3 rounded-lg bg-white/[.03] px-3 py-2" data-kind={entry.kind}>
                  <span className="interface text-[.56rem] font-extrabold uppercase tracking-[.1em] text-[#d9a35c]">{formatSimClock(entry.simMin, state.settings.clock24h)}</span>
                  <span className="text-xs leading-5 text-[#b8cbb0]">{entry.message}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </DemoLayout>
  );
}
import { DemoPageHeader, DemoSectionTitle, StatTile, chartColors, clockTicks, tooltipStyle, useDemoMeta } from "./ui";

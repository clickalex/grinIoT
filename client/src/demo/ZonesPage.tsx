// Grinrex IoT — demo Zones. Per-zone telemetry, thresholds, and control.
import { Droplets, Hand, MinusCircle, Plus, Sprout, Thermometer, Timer } from "lucide-react";
import { DemoLayout } from "./DemoLayout";
import { useGarden } from "./GardenContext";
import { formatSimClock } from "./simulation";
import { MoistureBar, StatTile } from "./ui";
import { usePageMeta } from "@/hooks/usePageMeta";

export default function ZonesPage() {
  usePageMeta("Live demo — Zones & thresholds · Grinrex IoT", "Per-zone soil telemetry, moisture targets, and watering control in the live Grinrex garden simulation.");
  const { state, actions } = useGarden();
  const avgMoisture = state.zones.reduce((sum, z) => sum + z.moisture, 0) / Math.max(1, state.zones.length);

  return (
    <DemoLayout>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="eyebrow text-[#b8f15a]">Live demo / Zones</div>
            <h1 className="display mt-3 text-4xl leading-[1.02] text-[#f4ffe5] sm:text-5xl">Zones &amp; thresholds.</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#a9c1a2]">
              Each zone is an independent sensing and watering unit. Move a target slider and the rule engine reacts on the
              next tick — dry zones trigger the valve, rain pauses it, and the tank cutoff overrides everything.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <StatTile label="Zones" value={state.zones.length} sub="in the loop" icon={<Sprout size={15} className="text-[#b8f15a]" />} />
            <StatTile label="Avg moisture" value={`${avgMoisture.toFixed(0)}%`} sub="network mean" icon={<Droplets size={15} className="text-[#8fd3b4]" />} />
            <button className="demo-chip" onClick={actions.addZone}><Plus size={14} /> Add zone</button>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          {state.zones.map((zone) => {
            const dry = zone.moisture < zone.target - 6;
            const wet = zone.moisture > zone.target + 12;
            return (
              <article className="glass-panel rounded-[1.4rem] p-6" key={zone.id}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-[#effadf]">{zone.name}</h3>
                    <p className="mt-1 text-sm text-[#8fae93]">{zone.plant}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`valve-badge ${zone.valveOpen ? "valve-open" : "valve-closed"}`}>
                      {zone.valveOpen ? "Valve open" : "Valve closed"}
                    </span>
                    {state.zones.length > 1 && (
                      <button className="text-[#7e9a80] transition-colors hover:text-[#ff8d7a]" onClick={() => actions.removeZone(zone.id)} aria-label={`Remove ${zone.name}`}>
                        <MinusCircle size={17} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="metric-tile">
                    <div className="metric-label">Moisture</div>
                    <div className={`metric-value mt-2 text-xl ${dry ? "text-[#ffd49c]" : wet ? "text-[#8fd3b4]" : "text-[#efffd3]"}`}>{zone.moisture.toFixed(0)}%</div>
                    {zone.pausedByRain && <div className="mt-1 text-[.62rem] font-bold text-[#8fd3b4]">PAUSED · RAIN</div>}
                  </div>
                  <div className="metric-tile">
                    <div className="metric-label flex items-center gap-1"><Thermometer size={11} /> Temp</div>
                    <div className="metric-value mt-2 text-xl text-[#efffd3]">{zone.temp.toFixed(1)}°</div>
                  </div>
                  <div className="metric-tile">
                    <div className="metric-label flex items-center gap-1"><Timer size={11} /> Today</div>
                    <div className="metric-value mt-2 text-xl text-[#efffd3]">{zone.consumedToday.toFixed(1)}<span className="text-xs"> L</span></div>
                  </div>
                  <div className="metric-tile">
                    <div className="metric-label flex items-center gap-1"><Hand size={11} /> Last water</div>
                    <div className="metric-value mt-2 text-xl text-[#efffd3]">{zone.lastWateredSimMin ? formatSimClock(zone.lastWateredSimMin) : "—"}</div>
                  </div>
                </div>

                <div className="mt-5">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="interface text-[.58rem] font-extrabold uppercase tracking-[.12em] text-[#8fae93]">Moisture vs target</span>
                    <span className="interface text-[.58rem] font-extrabold tracking-[.1em] text-[#d9a35c]">TARGET {zone.target.toFixed(0)}%</span>
                  </div>
                  <MoistureBar moisture={zone.moisture} target={zone.target} height={12} />
                </div>

                <div className="mt-5">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="interface text-[.58rem] font-extrabold uppercase tracking-[.12em] text-[#8fae93]">Adjust target</span>
                    <span className="interface text-sm font-extrabold text-[#b8f15a]">{zone.target.toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min={20}
                    max={70}
                    step={1}
                    value={zone.target}
                    onChange={(event) => actions.setZoneTarget(zone.id, Number(event.target.value))}
                    className="demo-slider"
                    style={{ "--fill": `${((zone.target - 20) / 50) * 100}%` } as React.CSSProperties}
                    aria-label={`Moisture target for ${zone.name}`}
                  />
                </div>

                <div className="mt-6 flex flex-wrap gap-2 border-t border-white/10 pt-5">
                  <button className="demo-chip" data-on={zone.auto} onClick={() => actions.setZoneAuto(zone.id, !zone.auto)}>
                    {zone.auto ? "Auto on" : "Auto off"}
                  </button>
                  {zone.valveOpen ? (
                    <button className="demo-chip !border-[#ff8d7a]/50 !text-[#ffb3a4]" onClick={() => actions.stopZone(zone.id)}>
                      <Droplets size={13} /> Stop watering
                    </button>
                  ) : (
                    <button className="demo-chip !border-[#b8f15a]/45 !text-[#b8f15a]" onClick={() => actions.startZone(zone.id)}>
                      <Droplets size={13} /> Water now
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </DemoLayout>
  );
}

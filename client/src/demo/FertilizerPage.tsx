// Grinrex IoT — demo Fertilizer dosing. Optional peristaltic channels that ride the irrigation
// line, with reservoir stock, per-cycle dose limits, and a safety lockout that outranks the schedule.
import { AlertTriangle, Droplets, FlaskConical, OctagonX, ShieldAlert, ShieldCheck, Sprout, Timer } from "lucide-react";
import { Link } from "wouter";
import { DemoLayout } from "./DemoLayout";
import { useGarden } from "./GardenContext";
import { demoLink } from "./sections";
import { formatSimClock } from "./simulation";

export default function FertilizerPage() {
  useDemoMeta("/fertilizer");
  const { state, actions } = useGarden();
  const fert = state.fertilizer;
  const dosingZones = state.zones.filter(zone => zone.valveOpen && zone.fertApplied > 0);
  const todayMl = fert.channels.reduce((sum, channel) => sum + channel.todayMl, 0);
  const totalMl = fert.channels.reduce((sum, channel) => sum + channel.totalMl, 0);
  const lowStock = fert.channels.filter(channel => channel.reservoirMl < 120);
  const fertLog = state.log.filter(entry => entry.source === "Fertilizer").slice(0, 8);
  const blocked = fert.lockout || !fert.enabled || state.emergencyStop;

  return (
    <DemoLayout>
      <div className="flex flex-col gap-8">
        <DemoPageHeader
          path="/fertilizer"
          title="Feed on the line,"
          accent="never over the roots."
          copy="Dosing is an expansion module, not a core promise: small peristaltic channels inject into an open irrigation line, so fertilizer only travels where water is already going. The safety lockout outranks every schedule, and a dry zone never gets a concentrated dose."
          aside={
            <>
              <StatTile label="Dosed today" value={`${todayMl.toFixed(1)} ml`} sub={`${fert.channels.length} channels`} tone="text-[#b8f15a]" icon={<FlaskConical size={15} className="text-[#b8f15a]" />} />
              <StatTile label="Lifetime" value={`${totalMl.toFixed(0)} ml`} sub="since installation" icon={<Droplets size={15} className="text-[#8fd3b4]" />} />
              <StatTile
                label="Injector"
                value={fert.enabled ? (fert.lockout ? "Locked" : "Armed") : "Off"}
                sub={state.emergencyStop ? "stop is engaged" : dosingZones.length ? "dosing now" : "waiting for a cycle"}
                tone={fert.lockout || !fert.enabled ? "text-[#ffd49c]" : "text-[#b8f15a]"}
                icon={<ShieldAlert size={15} className="text-[#d9a35c]" />}
              />
            </>
          }
        />

        {/* global controls */}
        <div className="grid gap-4 md:grid-cols-3">
          <article className="demo-panel p-5">
            <div className="flex items-center justify-between">
              <span className="interface text-[.6rem] font-extrabold uppercase tracking-[.14em] text-[#d9a35c]">Injector enabled</span>
              <span className="status-light" data-state={fert.enabled ? "ok" : "idle"} />
            </div>
            <p className="mt-3 text-sm leading-6 text-[#afc5a7]">Master enable for dosing. With it off, irrigation keeps running exactly as before — feeding is additive, never load-bearing.</p>
            <button
              className="demo-chip mt-4"
              data-on={fert.enabled}
              onClick={() => actions.patchFertilizer({ enabled: !fert.enabled }, `Fertilizer injector ${fert.enabled ? "disabled" : "enabled"}.`)}
              aria-label="Toggle fertilizer injector"
            >
              {fert.enabled ? "Dosing enabled" : "Dosing disabled"}
            </button>
          </article>
          <article className={`demo-panel p-5 ${fert.lockout ? "!border-[#ff6b57]/45" : ""}`}>
            <div className="flex items-center justify-between">
              <span className="interface text-[.6rem] font-extrabold uppercase tracking-[.14em] text-[#d9a35c]">Safety lockout</span>
              <span className="status-light" data-state={fert.lockout ? "critical" : "idle"} />
            </div>
            <p className="mt-3 text-sm leading-6 text-[#afc5a7]">Engaged for maintenance, stock changes, or after an overdose. Refused doses are logged, not silently skipped.</p>
            <button
              className="demo-chip mt-4"
              data-on={!fert.lockout}
              onClick={() => actions.patchFertilizer({ lockout: !fert.lockout }, `Fertilizer lockout ${fert.lockout ? "released" : "engaged"}.`)}
              aria-label="Toggle fertilizer safety lockout"
            >
              <OctagonX size={13} /> {fert.lockout ? "Release lockout" : "Engage lockout"}
            </button>
          </article>
          <article className="demo-panel p-5">
            <div className="flex items-center justify-between">
              <span className="interface text-[.6rem] font-extrabold uppercase tracking-[.14em] text-[#d9a35c]">Current state</span>
              <ShieldCheck size={16} className={blocked ? "text-[#ffd49c]" : "text-[#b8f15a]"} />
            </div>
            <p className="mt-3 text-sm leading-6 text-[#afc5a7]">
              {state.emergencyStop
                ? "Emergency stop is engaged — dosing follows the valve state, so nothing moves."
                : blocked
                  ? "Dosing is blocked by the injector or lockout setting."
                  : dosingZones.length
                    ? `Injecting into ${dosingZones.map(zone => zone.name).join(", ")} while the line is open.`
                    : "Armed and waiting. A dose is applied only while a zone is actively watering."}
            </p>
            <Link href={demoLink("/irrigation")} className="interface mt-4 inline-block text-[.6rem] font-extrabold uppercase tracking-[.1em] text-[#b8f15a] hover:text-[#d0ff88]">
              Open the valve console →
            </Link>
          </article>
        </div>

        {/* channels */}
        <div className="grid gap-4 xl:grid-cols-3">
          {fert.channels.map(channel => {
            const zone = state.zones.find(z => z.id === channel.zoneId);
            const stockPct = Math.max(0, Math.min(100, (channel.reservoirMl / 1000) * 100));
            const active = zone?.valveOpen && fert.enabled && !fert.lockout && channel.enabled;
            return (
              <article key={channel.id} className="glass-panel rounded-[1.3rem] p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate font-bold text-[#effadf]">{channel.name}</h3>
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-[#8fae93]">
                      <Sprout size={12} className="text-[#b8f15a]" /> {zone?.name ?? "unassigned zone"}
                    </p>
                  </div>
                  <span className={`valve-badge ${active ? "valve-open" : "valve-closed"}`}>{active ? "Injecting" : channel.enabled ? "Ready" : "Off"}</span>
                </div>

                <div className="mt-4">
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="interface text-[.56rem] font-extrabold uppercase tracking-[.12em] text-[#8fae93]">Reservoir</span>
                    <span className={`interface text-[.62rem] font-extrabold ${channel.reservoirMl < 120 ? "text-[#ffd49c]" : "text-[#d7e9cc]"}`}>{channel.reservoirMl.toFixed(0)} ml left</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-white/[.07]">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${stockPct}%`,
                        background: stockPct < 12 ? "#ff6b57" : stockPct < 35 ? "#d9a35c" : "#b8f15a",
                      }}
                    />
                  </div>
                  {channel.reservoirMl < 120 && (
                    <p className="mt-1.5 flex items-center gap-1.5 text-[.66rem] font-semibold text-[#ffd49c]">
                      <AlertTriangle size={11} /> Stock low — a nearly empty line pulls air and mis-doses.
                    </p>
                  )}
                </div>

                <div className="mt-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="interface text-[.56rem] font-extrabold uppercase tracking-[.12em] text-[#8fae93]">Dose per cycle</span>
                    <span className="interface text-sm font-extrabold text-[#b8f15a]">{channel.doseMl} ml</span>
                  </div>
                  <input
                    type="range"
                    min={4}
                    max={60}
                    step={2}
                    value={channel.doseMl}
                    onChange={event => actions.patchFertChannel(channel.id, { doseMl: Number(event.target.value) }, `${channel.name}: dose set to ${event.target.value} ml per cycle.`)}
                    className="demo-slider"
                    style={
                      {
                        "--fill": `${((channel.doseMl - 4) / 56) * 100}%`,
                      } as React.CSSProperties
                    }
                    aria-label={`Dose per cycle for ${channel.name}`}
                  />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="metric-tile">
                    <div className="metric-label flex items-center gap-1">
                      <Timer size={11} /> Today
                    </div>
                    <div className="metric-value mt-2 text-xl text-[#efffd3]">
                      {channel.todayMl.toFixed(1)}
                      <span className="text-xs"> ml</span>
                    </div>
                  </div>
                  <div className="metric-tile">
                    <div className="metric-label">Last dose</div>
                    <div className="metric-value mt-2 text-xl text-[#efffd3]">{channel.lastDosedSimMin ? formatSimClock(channel.lastDosedSimMin, state.settings.clock24h) : "—"}</div>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2 border-t border-white/10 pt-4">
                  <button
                    className="demo-chip"
                    data-on={channel.enabled}
                    onClick={() => actions.patchFertChannel(channel.id, { enabled: !channel.enabled }, `${channel.name} channel ${channel.enabled ? "closed" : "opened"}.`)}
                    aria-label={`Toggle ${channel.name} channel`}
                  >
                    {channel.enabled ? "Channel on" : "Channel off"}
                  </button>
                  <button className="demo-chip !border-[#b8f15a]/45 !text-[#b8f15a]" onClick={() => actions.doseChannel(channel.id)} aria-label={`Dose ${channel.name} now`}>
                    <Droplets size={12} /> Dose now
                  </button>
                  <button className="demo-chip" onClick={() => actions.patchFertChannel(channel.id, { reservoirMl: 1000 }, `${channel.name} reservoir refilled to 1000 ml.`)} aria-label={`Refill ${channel.name} reservoir`}>
                    Refill
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        {/* live injection + log */}
        <div className="grid gap-4 lg:grid-cols-[.95fr_1.05fr]">
          <div className="demo-panel p-5">
            <DemoSectionTitle title="Injecting right now" note="only while a valve is open" />
            {dosingZones.length === 0 ? (
              <p className="text-sm text-[#8fae93]">No open line, so nothing is being fed. Start a manual cycle on a dosing zone and the channel will meter through it.</p>
            ) : (
              <ul className="space-y-2.5">
                {dosingZones.map(zone => {
                  const channel = fert.channels.find(c => c.zoneId === zone.id);
                  return (
                    <li key={zone.id} className="flex items-center justify-between gap-3 rounded-xl bg-white/[.035] p-3">
                      <span className="text-sm font-bold text-[#effadf]">{zone.name}</span>
                      <span className="interface text-[.58rem] font-extrabold uppercase tracking-[.1em] text-[#b8f15a]">{(zone.fertApplied ?? 0).toFixed(1)} ml this cycle</span>
                      <span className="interface text-[.56rem] font-extrabold uppercase tracking-[.1em] text-[#8fae93]">{channel?.name.split(" · ")[0]}</span>
                    </li>
                  );
                })}
              </ul>
            )}
            {lowStock.length > 0 && (
              <p className="mt-4 flex items-start gap-2 rounded-xl border border-[#d9a35c]/25 bg-[#332b1c] p-3 text-xs leading-5 text-[#d6c8aa]">
                <AlertTriangle size={13} className="mt-0.5 shrink-0" /> {lowStock.length} channel{lowStock.length > 1 ? "s" : ""} under 120 ml. Dosing keeps going but the plan wants a refill before the next scheduled feed.
              </p>
            )}
          </div>
          <div className="demo-panel p-5">
            <DemoSectionTitle title="Dosing log" note="accepted and refused actions" />
            {fertLog.length === 0 ? (
              <p className="text-sm text-[#8fae93]">Nothing logged yet. Engage the lockout and try a manual dose to see a refusal recorded.</p>
            ) : (
              <ul className="demo-scroll max-h-64 space-y-2 overflow-y-auto pr-1">
                {fertLog.map(entry => (
                  <li key={entry.id} className="alert-item rounded-lg bg-white/[.03] px-3 py-2" data-kind={entry.kind}>
                    <div className="flex items-center gap-2">
                      <span className="interface text-[.56rem] font-extrabold uppercase tracking-[.1em] text-[#d9a35c]">{formatSimClock(entry.simMin, state.settings.clock24h)}</span>
                      <span className="interface ml-auto text-[.54rem] font-extrabold uppercase tracking-[.12em] text-[#8fae93]">{entry.kind}</span>
                    </div>
                    <p className="mt-1 text-xs leading-5 text-[#b8cbb0]">{entry.message}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </DemoLayout>
  );
}
import { DemoPageHeader, DemoSectionTitle, StatTile, useDemoMeta } from "./ui";

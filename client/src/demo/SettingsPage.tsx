// Grinrex IoT — demo Site settings. The profile every other demo page reads from: units, clock,
// quiet hours, notification routing, retention, and the offline fallback policy.
import { Bell, BellOff, Clock, Gauge, HardDrive, Ruler, Save, Settings2, ShieldCheck, WifiOff } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { DemoLayout } from "./DemoLayout";
import { useGarden } from "./GardenContext";
import { demoLink } from "./sections";
import { formatSimClock, formatTemp, formatVolume, logCapFor, minutesToTimeInput, timeInputToMinutes } from "./simulation";

export default function SettingsPage() {
  useDemoMeta("/settings");
  const { state, actions } = useGarden();
  const s = state.settings;
  const [name, setName] = useState(s.gardenName);
  const [location, setLocation] = useState(s.location);
  const dirty = name.trim() !== s.gardenName || location.trim() !== s.location;

  const heldWarn = state.log.filter(entry => entry.source === "Alerts").length;

  return (
    <DemoLayout>
      <div className="flex flex-col gap-8">
        <DemoPageHeader
          path="/settings"
          title="One profile,"
          accent="every page."
          copy="Settings are not a form for show: the unit system changes how temperature and volume are written on the weather, harvest, and water pages; quiet hours decide whether a warning becomes a ping or a log line; retention decides how long the event buffer holds; and the offline fallback decides what the garden does without the cloud."
          aside={
            <>
              <StatTile label="Garden" value={s.gardenName} sub={s.location} icon={<Settings2 size={15} className="text-[#b8f15a]" />} />
              <StatTile label="Units" value={s.units === "metric" ? "Metric" : "Imperial"} sub={s.clock24h ? "24-hour clock" : "12-hour clock"} icon={<Ruler size={15} className="text-[#d9a35c]" />} />
            </>
          }
        />

        <div className="grid gap-4 lg:grid-cols-2">
          {/* profile */}
          <div className="demo-panel p-5">
            <DemoSectionTitle title="Garden profile" note="shown in the toolbar and reports" />
            <div className="space-y-4">
              <label className="block">
                <span className="interface block text-[.56rem] font-extrabold uppercase tracking-[.14em] text-[#8fae93]">Garden name</span>
                <input value={name} onChange={event => setName(event.target.value)} className="demo-field mt-1.5 w-full" aria-label="Garden name" placeholder="Terrace garden" />
              </label>
              <label className="block">
                <span className="interface block text-[.56rem] font-extrabold uppercase tracking-[.14em] text-[#8fae93]">Location</span>
                <input value={location} onChange={event => setLocation(event.target.value)} className="demo-field mt-1.5 w-full" aria-label="Garden location" placeholder="Delhi, IN" />
              </label>
              <div className="flex items-center justify-between gap-3">
                <span className="interface text-[.56rem] font-extrabold uppercase tracking-[.12em] text-[#7e9a80]">In production this also seeds season, sunrise tables, and municipal tariffs.</span>
                <button
                  className="demo-chip !border-[#b8f15a]/45 !text-[#b8f15a]"
                  disabled={!dirty}
                  aria-label="Save garden profile"
                  onClick={() => {
                    actions.patchSettings({
                      gardenName: name.trim() || "Terrace garden",
                      location: location.trim() || "Unset",
                    });
                  }}
                >
                  <Save size={12} /> {dirty ? "Save profile" : "Saved"}
                </button>
              </div>
            </div>
          </div>

          {/* units & clock */}
          <div className="demo-panel p-5">
            <DemoSectionTitle title="Units & clock" note="live on every reading" />
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-white/12 bg-white/[.035] p-4">
                <div className="interface text-[.56rem] font-extrabold uppercase tracking-[.14em] text-[#8fae93]">Measurement system</div>
                <div className="mt-2.5 flex gap-1.5">
                  {(["metric", "imperial"] as const).map(unit => (
                    <button key={unit} className="demo-chip" data-on={s.units === unit} onClick={() => actions.patchSettings({ units: unit })} aria-label={`Use ${unit} units`}>
                      {unit === "metric" ? "°C · litres · mm" : "°F · gallons · in"}
                    </button>
                  ))}
                </div>
                <p className="mt-2.5 text-xs leading-5 text-[#8fae93]">
                  Ambient now {formatTemp(state.weather.temp, s.units)} · tank {formatVolume(state.tank.level, s.units)} · {s.units === "metric" ? "1 mm on 1 m² = 1 L" : "1 in on 100 ft² ≈ 63 gal"}
                </p>
                <Link href={demoLink("/weather")} className="interface mt-2 inline-block text-[.56rem] font-extrabold uppercase tracking-[.1em] text-[#b8f15a] hover:text-[#d0ff88]">
                  Check the weather page →
                </Link>
              </div>
              <div className="rounded-xl border border-white/12 bg-white/[.035] p-4">
                <div className="interface flex items-center gap-1.5 text-[.56rem] font-extrabold uppercase tracking-[.14em] text-[#8fae93]">
                  <Clock size={11} /> Clock format
                </div>
                <div className="mt-2.5 flex gap-1.5">
                  <button className="demo-chip" data-on={s.clock24h} onClick={() => actions.patchSettings({ clock24h: true })} aria-label="Use 24-hour clock">
                    24-hour
                  </button>
                  <button className="demo-chip" data-on={!s.clock24h} onClick={() => actions.patchSettings({ clock24h: false })} aria-label="Use 12-hour clock">
                    12-hour
                  </button>
                </div>
                <p className="mt-2.5 text-xs leading-5 text-[#8fae93]">Sim clock reads {formatSimClock(state.simMin, s.clock24h)} — the toolbar, logs, and schedules all follow it.</p>
              </div>
            </div>
          </div>

          {/* quiet hours */}
          <div className="demo-panel p-5">
            <DemoSectionTitle title="Quiet hours" note={s.respectQuietHours ? "active window" : "not enforced"} />
            <div className="flex flex-wrap items-center gap-3">
              <button
                className="demo-chip"
                data-on={s.respectQuietHours}
                onClick={() =>
                  actions.patchSettings({
                    respectQuietHours: !s.respectQuietHours,
                  })
                }
                aria-label="Toggle quiet hours"
              >
                {s.respectQuietHours ? <Bell size={12} /> : <BellOff size={12} />} {s.respectQuietHours ? "Enforced" : "Off"}
              </button>
              <label className="flex items-center gap-2">
                <span className="interface text-[.54rem] font-extrabold uppercase tracking-[.14em] text-[#8fae93]">From</span>
                <input
                  type="time"
                  step={900}
                  value={minutesToTimeInput(s.quietStartMin)}
                  onChange={event =>
                    actions.patchSettings({
                      quietStartMin: timeInputToMinutes(event.target.value),
                    })
                  }
                  className="demo-field"
                  aria-label="Quiet hours start"
                />
              </label>
              <label className="flex items-center gap-2">
                <span className="interface text-[.54rem] font-extrabold uppercase tracking-[.14em] text-[#8fae93]">Until</span>
                <input
                  type="time"
                  step={900}
                  value={minutesToTimeInput(s.quietEndMin)}
                  onChange={event =>
                    actions.patchSettings({
                      quietEndMin: timeInputToMinutes(event.target.value),
                    })
                  }
                  className="demo-field"
                  aria-label="Quiet hours end"
                />
              </label>
            </div>
            <p className="mt-3 text-xs leading-5 text-[#8fae93]">
              During the window, warnings and advisories are written to the log instead of the alert queue — {heldWarn} event
              {heldWarn === 1 ? "" : "s"} have been held or muted this session. Critical safety alerts ignore this setting entirely.{" "}
              <Link href={demoLink("/alerts")} className="text-[#b8f15a] underline decoration-dotted">
                See the queue
              </Link>
            </p>
          </div>

          {/* notifications */}
          <div className="demo-panel p-5">
            <DemoSectionTitle title="Notification routing" note="what is allowed to wake you" />
            <ul className="space-y-2.5">
              <li className="flex items-start justify-between gap-3 rounded-xl bg-white/[.035] p-3.5">
                <div>
                  <div className="flex items-center gap-2 text-sm font-bold text-[#effadf]">
                    <ShieldCheck size={14} className="text-[#ff8d7a]" /> Critical safety alerts
                  </div>
                  <p className="mt-1 text-xs leading-5 text-[#8fae93]">Tank critical, heat, stuck valve, plant-stress risk. Delivered always; muting them is not offered, because the failure is silent otherwise.</p>
                </div>
                <span className="valve-badge valve-open shrink-0">Forced on</span>
              </li>
              <li className="flex items-start justify-between gap-3 rounded-xl bg-white/[.035] p-3.5">
                <div>
                  <div className="flex items-center gap-2 text-sm font-bold text-[#effadf]">
                    <Bell size={14} className="text-[#d9a35c]" /> Warnings
                  </div>
                  <p className="mt-1 text-xs leading-5 text-[#8fae93]">Low tank, dry zone, camera advisories. When off, they are logged only — a warning nobody sees is still a record.</p>
                </div>
                <button className="demo-chip shrink-0" data-on={s.notifyWarn} onClick={() => actions.patchSettings({ notifyWarn: !s.notifyWarn })} aria-label="Toggle warning notifications">
                  {s.notifyWarn ? "On" : "Off"}
                </button>
              </li>
              <li className="flex items-start justify-between gap-3 rounded-xl bg-white/[.035] p-3.5">
                <div>
                  <div className="flex items-center gap-2 text-sm font-bold text-[#effadf]">
                    <Gauge size={14} className="text-[#8fd3b4]" /> Daily digest
                  </div>
                  <p className="mt-1 text-xs leading-5 text-[#8fae93]">One summary at the end of the day: cycles, water used, warnings, tasks due. Drives the digest card on the tasks page.</p>
                </div>
                <button className="demo-chip shrink-0" data-on={s.dailyDigest} onClick={() => actions.patchSettings({ dailyDigest: !s.dailyDigest })} aria-label="Toggle daily digest">
                  {s.dailyDigest ? "On" : "Off"}
                </button>
              </li>
            </ul>
          </div>

          {/* data & retention */}
          <div className="demo-panel p-5">
            <DemoSectionTitle title="Data retention" note="how long the record lives" />
            <div className="flex items-baseline justify-between">
              <span className="interface text-[.58rem] font-extrabold uppercase tracking-[.12em] text-[#8fae93]">Keep readings and events for</span>
              <span className="interface text-sm font-extrabold text-[#b8f15a]">{s.retentionDays} days</span>
            </div>
            <input
              type="range"
              min={30}
              max={730}
              step={5}
              value={s.retentionDays}
              onChange={event =>
                actions.patchSettings({
                  retentionDays: Number(event.target.value),
                })
              }
              className="demo-slider mt-3"
              style={
                {
                  "--fill": `${((s.retentionDays - 30) / 700) * 100}%`,
                } as React.CSSProperties
              }
              aria-label="Retention in days"
            />
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="metric-tile">
                <div className="metric-label flex items-center gap-1">
                  <HardDrive size={11} /> Event buffer
                </div>
                <div className="metric-value mt-2 text-xl text-[#efffd3]">{logCapFor(s.retentionDays)}</div>
                <div className="mt-1 text-[.62rem] text-[#8fae93]">events held in the demo</div>
              </div>
              <div className="metric-tile">
                <div className="metric-label flex items-center gap-1">
                  <WifiOff size={11} /> Currently held
                </div>
                <div className="metric-value mt-2 text-xl text-[#8fd3b4]">{state.log.length}</div>
                <div className="mt-1 text-[.62rem] text-[#8fae93]">oldest {state.log.length ? formatSimClock(state.log[state.log.length - 1].simMin, s.clock24h) : "—"}</div>
              </div>
            </div>
            <p className="mt-3 text-xs leading-5 text-[#8fae93]">Shorten retention and the buffer visibly truncates — a cheap reminder that an evidence record is a bounded, configured thing, not an infinite feed.</p>
          </div>

          {/* offline + danger */}
          <div className="demo-panel p-5">
            <DemoSectionTitle title="Offline & maintenance" note="what happens without the cloud" />
            <div className="grid gap-3 sm:grid-cols-2">
              <div className={`rounded-xl border p-4 transition-colors ${s.offlineFallback === "local" ? "border-[#b8f15a]/45 bg-[#b8f15a]/8" : "border-white/12 bg-white/[.035]"}`}>
                <div className="interface text-[.56rem] font-extrabold uppercase tracking-[.14em] text-[#d9a35c]">Local rules</div>
                <p className="mt-2 text-xs leading-5 text-[#a9c1a2]">The edge keeps watering and protecting with the last validated thresholds. Cloud features pause; the garden does not notice.</p>
                <button className="demo-chip mt-3" data-on={s.offlineFallback === "local"} onClick={() => actions.patchSettings({ offlineFallback: "local" })} aria-label="Set offline fallback to local rules">
                  Use local rules
                </button>
              </div>
              <div className={`rounded-xl border p-4 transition-colors ${s.offlineFallback === "safe-stop" ? "border-[#ff8d7a]/45 bg-[#ff6b57]/8" : "border-white/12 bg-white/[.035]"}`}>
                <div className="interface text-[.56rem] font-extrabold uppercase tracking-[.14em] text-[#d9a35c]">Safe stop</div>
                <p className="mt-2 text-xs leading-5 text-[#a9c1a2]">If the controller loses its reporting path, every valve is held closed until it returns. Conservative, and it will dry a bed in a heat wave.</p>
                <button className="demo-chip mt-3" data-on={s.offlineFallback === "safe-stop"} onClick={() => actions.patchSettings({ offlineFallback: "safe-stop" })} aria-label="Set offline fallback to safe stop">
                  Hold all valves
                </button>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
              <div className="flex flex-wrap gap-2">
                <StatusLight state={state.settings.offlineFallback === "local" ? "ok" : "warn"} label={state.settings.offlineFallback === "local" ? "Autonomy: edge" : "Autonomy: held"} />
                <StatusLight state={s.notifyWarn ? "ok" : "idle"} label={s.notifyWarn ? "Warnings routed" : "Warnings logged only"} />
              </div>
              <button className="demo-chip !border-[#ff8d7a]/50 !text-[#ffb3a4]" onClick={actions.reset} aria-label="Reset the demo state">
                Reset demo state
              </button>
            </div>
            <p className="mt-3 text-xs leading-5 text-[#8fae93]">
              Try it: take the edge controller offline on the{" "}
              <Link href={demoLink("/devices")} className="text-[#b8f15a] underline decoration-dotted">
                devices page
              </Link>{" "}
              and watch what this policy makes the garden do.
            </p>
          </div>
        </div>
      </div>
    </DemoLayout>
  );
}
import { DemoPageHeader, DemoSectionTitle, StatTile, StatusLight, useDemoMeta } from "./ui";

// Grinrex IoT — demo Rules & schedules. The decision layer: watering windows, hard guardrails,
// rain hold-over, freeze protection, dry-run preview, and why each zone is or is not being watered.
import { CalendarClock, CloudRain, Droplets, Gauge, OctagonX, Pause, Play, ShieldCheck, Snowflake, Timer } from "lucide-react";
import { Link } from "wouter";
import { DemoLayout } from "./DemoLayout";
import { useGarden } from "./GardenContext";
import { demoLink } from "./sections";
import { autoWindowOpen, formatSimClock, logCapFor, minutesToTimeInput, timeInputToMinutes } from "./simulation";

const DAY_MIN = 1440;

export default function RulesPage() {
  useDemoMeta("/rules");
  const { state, actions } = useGarden();
  const rules = state.rules;
  const units = state.settings.units;
  const nowMin = ((state.simMin % DAY_MIN) + DAY_MIN) % DAY_MIN;
  const windowOpen = autoWindowOpen(state);
  const ruleLog = state.log.filter(entry => ["Rules", "Safety"].includes(entry.source)).slice(0, 12);
  const waitingZones = state.zones.filter(zone => zone.wantsWater && !zone.valveOpen);
  const wateringZones = state.zones.filter(zone => zone.valveOpen);

  const guardrails: {
    key: string;
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    unit: string;
    icon: typeof Timer;
    note: string;
    patch: (value: number) => void;
  }[] = [
    {
      key: "maxCycleMin",
      label: "Maximum cycle length",
      value: rules.maxCycleMin,
      min: 4,
      max: 40,
      step: 1,
      unit: "sim-min",
      icon: Timer,
      note: "A hard time bound. A stuck valve or a lost reading cannot flood a bed, because the engine closes the line regardless of moisture.",
      patch: value => actions.patchRules({ maxCycleMin: value }, `Maximum cycle length set to ${value} sim-min.`),
    },
    {
      key: "rainSkipMin",
      label: "Rain hold-over",
      value: rules.rainSkipMin,
      min: 0,
      max: 240,
      step: 5,
      unit: "sim-min",
      icon: CloudRain,
      note: "After rain stops, automatic watering waits this long so soaked soil can be measured before the mains is used.",
      patch: value => actions.patchRules({ rainSkipMin: value }, `Rain hold-over set to ${value} sim-min.`),
    },
    {
      key: "freezeProtectC",
      label: "Freeze protection",
      value: rules.freezeProtectC,
      min: -6,
      max: 12,
      step: 1,
      unit: units === "imperial" ? "°F" : "°C",
      icon: Snowflake,
      note: "Below this temperature irrigation is held: wet soil at freezing damages roots and wastes the cycle.",
      patch: value => actions.patchRules({ freezeProtectC: value }, `Freeze protection set to ${value}°C.`),
    },
  ];

  return (
    <DemoLayout>
      <div className="flex flex-col gap-8">
        <DemoPageHeader
          path="/rules"
          title="The decision layer"
          accent="written down."
          copy="Everything that opens or holds a valve lives on this page: the windows the engine may act inside, the bounds a single cycle cannot exceed, and the hold reasons it applies when conditions argue against watering. Change one and the loop obeys on the next tick."
          aside={
            <>
              <StatTile
                label="Schedule"
                value={windowOpen ? "Open" : "Closed"}
                sub={`${rules.windows.filter(w => w.enabled).length} of ${rules.windows.length} windows armed`}
                tone={windowOpen ? "text-[#b8f15a]" : "text-[#ffd49c]"}
                icon={<CalendarClock size={15} className="text-[#b8f15a]" />}
              />
              <StatTile
                label="Mode"
                value={rules.dryRun ? "Dry run" : state.autoGlobal ? "Live auto" : "Manual"}
                sub={rules.dryRun ? "decisions logged, actuators held" : wateringZones.length ? `${wateringZones.length} zone(s) watering` : "no cycle running"}
                tone={rules.dryRun ? "text-[#ffd49c]" : "text-[#efffd3]"}
                icon={<Gauge size={15} className="text-[#d9a35c]" />}
              />
              <StatTile label="Hold reasons" value={waitingZones.length} sub="zones wanting water" tone={waitingZones.length ? "text-[#ffd49c]" : "text-[#b8f15a]"} icon={<OctagonX size={15} className="text-[#d9a35c]" />} />
            </>
          }
        />

        {/* the three big switches */}
        <div className="grid gap-4 md:grid-cols-3">
          <article className="demo-panel p-5">
            <div className="flex items-center justify-between">
              <span className="interface text-[.6rem] font-extrabold uppercase tracking-[.14em] text-[#d9a35c]">Automatic mode</span>
              <span className="status-light" data-state={state.autoGlobal ? "ok" : "idle"} />
            </div>
            <p className="mt-3 text-sm leading-6 text-[#afc5a7]">Master switch for the rule engine. Off means nothing waters on its own — manual cycles still work.</p>
            <button className="demo-chip mt-4" data-on={state.autoGlobal} onClick={actions.toggleAuto}>
              <Play size={13} /> {state.autoGlobal ? "Auto on" : "Auto off"}
            </button>
          </article>
          <article className="demo-panel p-5">
            <div className="flex items-center justify-between">
              <span className="interface text-[.6rem] font-extrabold uppercase tracking-[.14em] text-[#d9a35c]">Eco mode</span>
              <span className="status-light" data-state={state.eco ? "ok" : "idle"} />
            </div>
            <p className="mt-3 text-sm leading-6 text-[#afc5a7]">Draws from stored rainwater first and stops closer to target instead of overshooting into the drain.</p>
            <button className="demo-chip mt-4" data-on={state.eco} onClick={actions.toggleEco}>
              <Droplets size={13} /> {state.eco ? "Eco on" : "Eco off"}
            </button>
          </article>
          <article className={`demo-panel p-5 ${rules.dryRun ? "!border-[#d9a35c]/45" : ""}`}>
            <div className="flex items-center justify-between">
              <span className="interface text-[.6rem] font-extrabold uppercase tracking-[.14em] text-[#d9a35c]">Dry-run preview</span>
              <span className="status-light" data-state={rules.dryRun ? "warn" : "idle"} />
            </div>
            <p className="mt-3 text-sm leading-6 text-[#afc5a7]">The adoption answer: run the rules against live readings for a day and read the log, before any valve is trusted. Nothing is actuated.</p>
            <button className="demo-chip mt-4" data-on={rules.dryRun} onClick={actions.toggleDryRun} aria-label="Toggle dry-run mode">
              <Pause size={13} /> {rules.dryRun ? "Dry run on — turn off" : "Start dry run"}
            </button>
          </article>
        </div>

        {/* schedule windows */}
        <div className="demo-panel p-5">
          <DemoSectionTitle title="Watering windows" note={`${formatSimClock(state.simMin, state.settings.clock24h)} · engine ${windowOpen ? "may act now" : "holds now"}`} />

          {/* 24h strip */}
          <div className="relative mb-6 h-12 overflow-hidden rounded-xl border border-white/12 bg-white/[.03]">
            {rules.windows.map(w => {
              if (!w.enabled) return null;
              const spans =
                w.endMin > w.startMin
                  ? [[w.startMin, w.endMin]]
                  : [
                      [w.startMin, DAY_MIN],
                      [0, w.endMin],
                    ];
              return (
                <div key={w.id}>
                  {spans.map(([from, to], index) => (
                    <div
                      key={`${w.id}-${index}`}
                      className="absolute inset-y-0 bg-[#b8f15a]/22"
                      style={{
                        left: `${(from / DAY_MIN) * 100}%`,
                        width: `${((to - from) / DAY_MIN) * 100}%`,
                      }}
                      title={`${w.label}: ${minutesToTimeInput(from)}–${minutesToTimeInput(to)}`}
                    />
                  ))}
                </div>
              );
            })}
            <div className="absolute inset-y-0 w-[2px] bg-[#d9a35c]" style={{ left: `${(nowMin / DAY_MIN) * 100}%` }}>
              <span className="pulse-dot absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-[#d9a35c]" />
            </div>
            {[0, 6, 12, 18, 24].map(hour => (
              <span key={hour} className="interface absolute bottom-1 -translate-x-1/2 text-[.5rem] font-extrabold tracking-[.1em] text-[#7e9a80]" style={{ left: `${(hour / 24) * 100}%` }}>
                {String(hour % 24).padStart(2, "0")}
              </span>
            ))}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {rules.windows.map(w => (
              <div key={w.id} className="rounded-xl border border-white/12 bg-white/[.035] p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-bold text-[#effadf]">{w.label}</span>
                  <button className="demo-chip" data-on={w.enabled} onClick={() => actions.toggleWindow(w.id)} aria-label={`Toggle ${w.label}`}>
                    {w.enabled ? "Armed" : "Disarmed"}
                  </button>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <label className="flex-1">
                    <span className="interface block text-[.54rem] font-extrabold uppercase tracking-[.14em] text-[#8fae93]">Opens</span>
                    <input
                      type="time"
                      step={900}
                      value={minutesToTimeInput(w.startMin)}
                      onChange={event => actions.setWindowTime(w.id, "startMin", timeInputToMinutes(event.target.value))}
                      className="demo-field mt-1 w-full"
                      aria-label={`${w.label} start time`}
                    />
                  </label>
                  <label className="flex-1">
                    <span className="interface block text-[.54rem] font-extrabold uppercase tracking-[.14em] text-[#8fae93]">Closes</span>
                    <input
                      type="time"
                      step={900}
                      value={minutesToTimeInput(w.endMin)}
                      onChange={event => actions.setWindowTime(w.id, "endMin", timeInputToMinutes(event.target.value))}
                      className="demo-field mt-1 w-full"
                      aria-label={`${w.label} end time`}
                    />
                  </label>
                </div>
                <p className="mt-2.5 text-xs leading-5 text-[#8fae93]">{w.enabled ? "Actuator actions are allowed inside this band." : "Disarmed — contributes nothing; if no window is armed the rules run all day."}</p>
              </div>
            ))}
          </div>
        </div>

        {/* guardrails */}
        <div className="grid gap-4 lg:grid-cols-3">
          {guardrails.map(guard => {
            const Icon = guard.icon;
            const active =
              guard.key === "freezeProtectC"
                ? state.weather.temp <= rules.freezeProtectC
                : guard.key === "rainSkipMin"
                  ? state.weather.raining || (state.lastRainEndSimMin !== null && state.simMin - state.lastRainEndSimMin < rules.rainSkipMin)
                  : wateringZones.length > 0;
            return (
              <article key={guard.key} className="demo-panel p-5">
                <div className="flex items-center justify-between">
                  <span className="interface text-[.6rem] font-extrabold uppercase tracking-[.14em] text-[#d9a35c]">{guard.label}</span>
                  <Icon size={16} className={active ? "text-[#b8f15a]" : "text-[#5f7a68]"} />
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="interface text-3xl font-extrabold text-[#efffd3]">{guard.key === "freezeProtectC" ? (units === "imperial" ? ((guard.value * 9) / 5 + 32).toFixed(0) : guard.value) : guard.value}</span>
                  <span className="interface text-[.6rem] font-extrabold uppercase tracking-[.1em] text-[#8fae93]">{guard.unit}</span>
                </div>
                <input
                  type="range"
                  min={guard.min}
                  max={guard.max}
                  step={guard.step}
                  value={guard.value}
                  onChange={event => guard.patch(Number(event.target.value))}
                  className="demo-slider mt-4"
                  style={
                    {
                      "--fill": `${((guard.value - guard.min) / (guard.max - guard.min)) * 100}%`,
                    } as React.CSSProperties
                  }
                  aria-label={guard.label}
                />
                <p className="mt-3 text-xs leading-5 text-[#8fae93]">{guard.note}</p>
              </article>
            );
          })}
        </div>

        {/* live decision preview */}
        <div className="demo-panel p-5">
          <DemoSectionTitle
            title="What the engine is doing right now"
            action={
              <Link href={demoLink("/irrigation")} className="interface text-[.62rem] font-extrabold uppercase tracking-[.1em] text-[#b8f15a] hover:text-[#d0ff88]">
                Valve console →
              </Link>
            }
          />
          <div className="space-y-2.5">
            {state.zones.map(zone => {
              const cycleAge = zone.cycleStartSimMin === null ? 0 : state.simMin - zone.cycleStartSimMin;
              const cyclePct = Math.min(100, Math.round((cycleAge / Math.max(1, rules.maxCycleMin)) * 100));
              return (
                <div key={zone.id} className="grid items-center gap-3 rounded-xl bg-white/[.035] p-3.5 md:grid-cols-[1.3fr_.9fr_1.1fr_.8fr]">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-bold text-[#effadf]">{zone.name}</div>
                    <div className="text-xs text-[#8fae93]">{zone.plant}</div>
                  </div>
                  <div className="interface text-xs font-extrabold uppercase tracking-[.1em] text-[#c9dcbf]">
                    {zone.moisture.toFixed(0)}% <span className="text-[#8fae93]">/ {zone.target.toFixed(0)}% target</span>
                  </div>
                  <div>
                    {zone.valveOpen ? (
                      <span className="valve-badge valve-open">
                        Watering · cycle {cycleAge} / {rules.maxCycleMin} min
                      </span>
                    ) : zone.holdReason ? (
                      <span className="valve-badge valve-closed !text-[#ffd49c]">Held — {zone.holdReason}</span>
                    ) : zone.wantsWater ? (
                      <span className="valve-badge valve-closed !text-[#8fd3b4]">Would water</span>
                    ) : (
                      <span className="valve-badge valve-closed">At target</span>
                    )}
                    {zone.valveOpen && (
                      <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[.08]">
                        <div className={`h-full rounded-full ${cyclePct > 80 ? "bg-[#ff6b57]" : "bg-[#b8f15a]"}`} style={{ width: `${cyclePct}%` }} />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5 md:justify-end">
                    <button className="demo-chip" data-on={!zone.auto} onClick={() => actions.setZoneAuto(zone.id, !zone.auto)} aria-label={`Toggle automatic mode for ${zone.name}`}>
                      {zone.auto ? "Auto" : "Manual"}
                    </button>
                    {zone.wantsWater && !zone.valveOpen && !rules.dryRun ? (
                      <button className="demo-chip !border-[#b8f15a]/45 !text-[#b8f15a]" onClick={() => actions.startZone(zone.id)}>
                        Water now
                      </button>
                    ) : zone.valveOpen ? (
                      <button className="demo-chip !border-[#ff8d7a]/50 !text-[#ffb3a4]" onClick={() => actions.stopZone(zone.id)}>
                        Stop
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 grid gap-3 border-t border-white/10 pt-4 sm:grid-cols-2">
            <p className="flex items-start gap-2 text-xs leading-5 text-[#8fae93]">
              <ShieldCheck size={14} className="mt-0.5 shrink-0 text-[#b8f15a]" />
              Tank safety is not configurable on purpose: below {state.tank.criticalThreshold} L every valve closes regardless of what these rules want.{" "}
              <Link href={demoLink("/water")} className="text-[#b8f15a] underline decoration-dotted">
                Tank
              </Link>
            </p>
            <p className="flex items-start gap-2 text-xs leading-5 text-[#8fae93]">
              <OctagonX size={14} className="mt-0.5 shrink-0 text-[#ff8d7a]" />
              Emergency stop outranks everything on this page, including a manual start. Offline fallback is set to <span className="font-bold text-[#c9dcbf]">
                {state.settings.offlineFallback === "local" ? "local rules" : "safe-stop"}
              </span>{" "}
              —{" "}
              <Link href={demoLink("/settings")} className="text-[#b8f15a] underline decoration-dotted">
                change it
              </Link>
              .
            </p>
          </div>
        </div>

        {/* rule change log */}
        <div className="demo-panel p-5">
          <DemoSectionTitle title="Rule & safety log" note={`buffer holds ${logCapFor(state.settings.retentionDays)} events`} />
          {ruleLog.length === 0 ? (
            <p className="text-sm text-[#8fae93]">No rule changes yet this session. Move a slider and it will be recorded here.</p>
          ) : (
            <ul className="space-y-2">
              {ruleLog.map(entry => (
                <li key={entry.id} className="alert-item flex flex-wrap items-baseline gap-x-3 rounded-lg bg-white/[.03] px-3 py-2" data-kind={entry.kind}>
                  <span className="interface text-[.56rem] font-extrabold uppercase tracking-[.1em] text-[#d9a35c]">{formatSimClock(entry.simMin, state.settings.clock24h)}</span>
                  <span className="interface text-[.56rem] font-extrabold uppercase tracking-[.1em] text-[#7e9a80]">{entry.source}</span>
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
import { DemoPageHeader, DemoSectionTitle, StatTile, useDemoMeta } from "./ui";

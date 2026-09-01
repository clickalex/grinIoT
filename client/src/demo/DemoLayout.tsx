// Grinrex IoT — demo chrome. Sticky control toolbar (sim clock, speed, eco/auto state,
// emergency stop, reset) plus the grouped demo tab bar, wrapped around every live demo page.
import { CloudSun, Gauge, OctagonX, Pause, Play, Plus, RotateCcw, ShieldAlert } from "lucide-react";
import type { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { SiteNav } from "@/components/SiteNav";
import { useGarden } from "./GardenContext";
import { demoGroups, demoLink } from "./sections";
import { formatSimClock, simDay } from "./simulation";

const speeds = [1, 6, 20] as const;

export function DemoLayout({ children }: { children: ReactNode }) {
  const { state, actions } = useGarden();
  const [location] = useLocation();

  const weatherLabel = state.weather.raining ? `RAINING · ${Math.round(state.weather.rainIntensity * 100)}%` : state.weather.light > 5 ? "DAYLIGHT" : "NIGHT";
  const activeAlerts = state.alerts.filter(alert => !alert.acked && (alert.kind === "critical" || alert.kind === "warn")).length;
  const faultedDevices = state.devices.filter(device => device.fault || !device.online).length;
  const dryRun = state.rules.dryRun;

  return (
    <div className="signal-page min-h-screen">
      <SiteNav />
      <main className="pt-[4.75rem]">
        {/* Demo toolbar */}
        <div className="sticky top-[4.75rem] z-40 border-b border-white/10 bg-[#0d1e15]/95 backdrop-blur-xl">
          <div className="mx-auto flex max-w-[1520px] flex-col gap-3 px-4 py-3 sm:px-6 lg:px-10">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className={`flex items-center gap-2 rounded-full border px-3 py-1.5 ${dryRun ? "border-[#d9a35c]/40 bg-[#d9a35c]/10" : "border-[#b8f15a]/30 bg-[#b8f15a]/10"}`}>
                  <span className={`pulse-dot h-1.5 w-1.5 rounded-full ${dryRun ? "bg-[#d9a35c]" : "bg-[#b8f15a]"}`} />
                  <span className={`interface text-[.58rem] font-extrabold tracking-[.14em] ${dryRun ? "text-[#e8c084]" : "text-[#b8f15a]"}`}>
                    {state.settings.gardenName.toUpperCase()} · {dryRun ? "DRY RUN" : "LIVE"}
                  </span>
                </span>
                <span className="interface hidden text-[.62rem] font-bold tracking-[.1em] text-[#d9a35c] sm:inline">
                  DAY {simDay(state.simMin)} · {formatSimClock(state.simMin, state.settings.clock24h)}
                </span>
                <span className={`interface hidden text-[.62rem] font-bold tracking-[.1em] md:inline ${state.weather.raining ? "text-[#8fd3b4]" : "text-[#8fae93]"}`}>
                  <CloudSun size={12} className="mr-1 inline" />
                  {weatherLabel}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {faultedDevices > 0 && (
                  <Link
                    href="/devices"
                    className="interface hidden items-center gap-1.5 rounded-full border border-[#d9a35c]/40 bg-[#d9a35c]/10 px-3 py-1.5 text-[.58rem] font-extrabold tracking-[.1em] text-[#e8c084] transition-colors hover:bg-[#d9a35c]/20 lg:flex"
                  >
                    <Gauge size={12} /> {faultedDevices} DEVICE
                  </Link>
                )}
                {activeAlerts > 0 && (
                  <Link
                    href="/alerts"
                    className="interface hidden items-center gap-1.5 rounded-full border border-[#ff6b57]/40 bg-[#ff6b57]/10 px-3 py-1.5 text-[.58rem] font-extrabold tracking-[.1em] text-[#ff9c8c] transition-colors hover:bg-[#ff6b57]/25 lg:flex"
                  >
                    <ShieldAlert size={12} /> {activeAlerts} ACTIVE
                  </Link>
                )}
                <div className="hidden items-center gap-1 rounded-full border border-white/12 bg-white/[.04] p-1 md:flex" aria-label="Simulation speed">
                  {speeds.map(speed => (
                    <button
                      key={speed}
                      onClick={() => actions.setSpeed(speed)}
                      className={`interface rounded-full px-2.5 py-1 text-[.56rem] font-extrabold tracking-[.08em] ${state.speed === speed ? "bg-[#b8f15a] text-[#143021]" : "text-[#9dbd9f]"}`}
                    >
                      {speed}×
                    </button>
                  ))}
                </div>
                <button className="demo-chip" onClick={state.running ? actions.pause : actions.resume} aria-label={state.running ? "Pause simulation" : "Resume simulation"}>
                  {state.running ? <Pause size={13} /> : <Play size={13} />} {state.running ? "Pause" : "Run"}
                </button>
                <button className="demo-chip" onClick={actions.reset} aria-label="Reset simulation">
                  <RotateCcw size={13} /> Reset
                </button>
                <button
                  className="interface inline-flex items-center gap-1.5 rounded-full border border-[#ff6b57]/50 bg-[#ff6b57]/15 px-3 py-1.5 text-[.58rem] font-extrabold tracking-[.1em] text-[#ff9c8c] transition-colors hover:bg-[#ff6b57]/25"
                  onClick={actions.emergencyStop}
                  aria-label="Emergency stop all irrigation"
                >
                  <OctagonX size={13} /> STOP
                </button>
              </div>
            </div>

            {/* Tabs — grouped so fourteen demo pages stay scannable */}
            <nav className="demo-scroll -mx-1 flex items-center gap-x-4 gap-y-1 overflow-x-auto px-1 xl:flex-wrap xl:overflow-visible" aria-label="Demo sections">
              {demoGroups.map(group => (
                <div key={group.id} className="flex items-center gap-1" role="group" aria-label={group.label}>
                  <span className="interface hidden shrink-0 pl-1 pr-1.5 text-[.5rem] font-extrabold uppercase tracking-[.18em] text-[#6f8c76] 2xl:inline">{group.label}</span>
                  {group.sections.map(tab => {
                    const Icon = tab.icon;
                    // inside the nested /demo router, useLocation returns the relative path
                    const active = tab.path === "/" ? location === "/" : location.startsWith(tab.path);
                    return (
                      <Link key={tab.path} href={demoLink(tab.path)} className="demo-tab flex shrink-0 items-center gap-2" data-active={active} title={tab.blurb}>
                        <Icon size={14} /> {tab.label}
                      </Link>
                    );
                  })}
                </div>
              ))}
              <div className="ml-auto hidden shrink-0 items-center gap-2 lg:flex">
                <button className="demo-chip" data-on={state.eco} onClick={actions.toggleEco}>
                  ECO {state.eco ? "ON" : "OFF"}
                </button>
                <button className="demo-chip" data-on={state.autoGlobal} onClick={actions.toggleAuto}>
                  AUTO {state.autoGlobal ? "ON" : "OFF"}
                </button>
                <button className="demo-chip" onClick={actions.addZone}>
                  <Plus size={13} /> ADD ZONE
                </button>
              </div>
            </nav>
          </div>
        </div>

        {/* Emergency stop banner */}
        {state.emergencyStop && (
          <div className="border-b border-[#ff6b57]/40 bg-[#3a1610]">
            <div className="mx-auto flex max-w-[1520px] flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-10">
              <p className="flex items-center gap-2 text-sm font-semibold text-[#ffc9bd]">
                <OctagonX size={16} className="text-[#ff8d7a]" /> Emergency stop engaged — all pumps and valves are off. Automatic and manual irrigation are blocked.
              </p>
              <button
                className="interface inline-flex items-center gap-1.5 self-start rounded-full border border-[#ff8d7a]/50 bg-[#ff6b57]/15 px-3.5 py-1.5 text-[.6rem] font-extrabold tracking-[.1em] text-[#ffc9bd] sm:self-auto"
                onClick={actions.clearStop}
              >
                Clear stop
              </button>
            </div>
          </div>
        )}

        {/* Dry-run banner */}
        {dryRun && !state.emergencyStop && (
          <div className="border-b border-[#d9a35c]/35 bg-[#2b2515]">
            <div className="mx-auto flex max-w-[1520px] flex-col gap-3 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-10">
              <p className="flex items-center gap-2 text-sm font-semibold text-[#e8c084]">
                <Gauge size={15} className="text-[#d9a35c]" /> Dry-run mode — the engine logs every decision it would make, but no valve or pump moves.
              </p>
              <Link href="/rules" className="interface text-[.6rem] font-extrabold uppercase tracking-[.1em] text-[#f0d5a4] underline decoration-dotted">
                Open rules & schedules →
              </Link>
            </div>
          </div>
        )}

        <div className="mx-auto max-w-[1520px] px-4 pb-24 pt-8 sm:px-6 lg:px-10">{children}</div>
      </main>
    </div>
  );
}

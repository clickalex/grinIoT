// Grinrex IoT — demo Growth & pest camera. Interval photography, a growth index the captures
// feed, and advisory signatures that stay advisory until a person confirms or dismisses them.
import { Camera, Check, CircleDot, Eye, Image as ImageIcon, Leaf, ShieldQuestion, Timer, X } from "lucide-react";
import { Area, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Link } from "wouter";
import { DemoLayout } from "./DemoLayout";
import { useGarden } from "./GardenContext";
import { demoLink } from "./sections";
import { formatSimClock } from "./simulation";

const zoneImages: Record<string, string> = {
  z1: "/images/balcony-garden.jpg",
  z2: "/images/drip-irrigation.jpg",
  z3: "/images/vertical-garden.jpg",
  z4: "/images/hero-rooftop-garden.jpg",
};

const frameImage = (zoneId: string, index: number) => zoneImages[zoneId] ?? Object.values(zoneImages)[index % 4];

export default function CameraPage() {
  useDemoMeta("/camera");
  const { state, actions } = useGarden();
  const cam = state.camera;
  const device = state.devices.find(d => d.id === "cam-01");
  const pending = cam.snapshots.filter(s => s.pest?.status === "needs-review");
  const confirmed = cam.snapshots.filter(s => s.pest?.status === "confirmed");
  const dismissed = cam.snapshots.filter(s => s.pest?.status === "dismissed");
  const nextCaptureIn = cam.lastCaptureSimMin === null ? 0 : Math.max(0, Math.round(cam.intervalMin - (state.simMin - cam.lastCaptureSimMin)));
  const growthSeries = state.history.map(point => ({ ...point }));

  return (
    <DemoLayout>
      <div className="flex flex-col gap-8">
        <DemoPageHeader
          path="/camera"
          title="Look at the plants,"
          accent="not just the numbers."
          copy="One low-cost camera, shooting on an interval, does two jobs: it builds a growth record the gardener can scrub through, and it offers an advisory signature that a human confirms before anything is sprayed. Nothing here auto-treats."
          aside={
            <>
              <StatTile label="Growth index" value={cam.growthIndex.toFixed(1)} sub="0–100, capture driven" tone="text-[#b8f15a]" icon={<Leaf size={15} className="text-[#b8f15a]" />} />
              <StatTile label="Plant health" value={`${cam.healthScore}`} sub="moisture band compliance" tone={cam.healthScore > 75 ? "text-[#b8f15a]" : "text-[#ffd49c]"} icon={<CircleDot size={15} className="text-[#8fd3b4]" />} />
              <StatTile label="Captures" value={cam.captures} sub={`${cam.intervalMin} min cadence`} icon={<Camera size={15} className="text-[#d9a35c]" />} />
            </>
          }
        />

        {/* camera control + status */}
        <div className="grid gap-4 lg:grid-cols-[.9fr_1.1fr]">
          <div className="demo-panel p-5">
            <DemoSectionTitle title="Capture settings" note={device?.online ? "node online" : "node offline"} />
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-3 rounded-xl border border-white/12 bg-white/[.035] p-3.5">
                <div>
                  <div className="interface text-[.58rem] font-extrabold uppercase tracking-[.12em] text-[#d9a35c]">Interval capture</div>
                  <p className="mt-1 text-xs leading-5 text-[#8fae93]">Off saves the camera's power budget; the growth record stops growing.</p>
                </div>
                <button className="demo-chip shrink-0" data-on={cam.enabled} onClick={() => actions.patchCamera({ enabled: !cam.enabled }, `Interval capture ${cam.enabled ? "paused" : "resumed"}.`)} aria-label="Toggle interval capture">
                  {cam.enabled ? "On" : "Off"}
                </button>
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="interface text-[.58rem] font-extrabold uppercase tracking-[.12em] text-[#8fae93]">Cadence</span>
                  <span className="interface text-sm font-extrabold text-[#b8f15a]">{cam.intervalMin} sim-min</span>
                </div>
                <input
                  type="range"
                  min={15}
                  max={360}
                  step={15}
                  value={cam.intervalMin}
                  onChange={event => actions.patchCamera({ intervalMin: Number(event.target.value) }, `Camera cadence set to every ${event.target.value} sim-min.`)}
                  className="demo-slider"
                  style={
                    {
                      "--fill": `${((cam.intervalMin - 15) / 345) * 100}%`,
                    } as React.CSSProperties
                  }
                  aria-label="Camera capture interval in simulated minutes"
                />
                <p className="mt-2 text-xs leading-5 text-[#8fae93]">
                  <Timer size={11} className="mr-1 inline" />
                  {cam.enabled ? `Next capture in ${nextCaptureIn} sim-min.` : "Cadence idle while capture is off."}
                </p>
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="interface text-[.58rem] font-extrabold uppercase tracking-[.12em] text-[#8fae93]">Storage</span>
                  <span className={`interface text-sm font-extrabold ${cam.storagePct > 92 ? "text-[#ff9c8c]" : "text-[#efffd3]"}`}>{cam.storagePct.toFixed(0)}%</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-white/[.06]">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${cam.storagePct}%`,
                      background: cam.storagePct > 92 ? "#ff6b57" : "#8fd3b4",
                    }}
                  />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button className="demo-chip !border-[#b8f15a]/45 !text-[#b8f15a]" onClick={actions.captureNow} aria-label="Capture a frame now">
                    <Camera size={12} /> Capture now
                  </button>
                  <button className="demo-chip" onClick={() => actions.patchCamera({ storagePct: 8 }, "Snapshot archive exported and purged.")} aria-label="Export and purge snapshot storage">
                    <ImageIcon size={12} /> Export &amp; purge
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* growth record */}
          <div className="demo-panel p-5">
            <DemoSectionTitle title="Growth index vs soil" note="index 0–100 · moisture %" />
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={growthSeries} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="growthFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={chartColors.lime} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={chartColors.lime} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 6" vertical={false} />
                  <XAxis dataKey="t" ticks={clockTicks(growthSeries)} tickFormatter={t => tickClockLabel(t, state.settings.clock24h)} stroke={chartColors.axis} fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 100]} stroke={chartColors.axis} fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={tooltipStyle} labelFormatter={t => formatSimClock(Number(t), state.settings.clock24h)} />
                  <Area type="monotone" dataKey="growthIndex" name="Growth index" stroke={chartColors.lime} strokeWidth={2} fill="url(#growthFill)" isAnimationActive={false} />
                  <Line type="monotone" dataKey="avgMoisture" name="Avg moisture %" stroke={chartColors.aqua} strokeWidth={1.5} strokeDasharray="5 4" dot={false} isAnimationActive={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3 border-t border-white/10 pt-4">
              <div>
                <div className="metric-label">Needs review</div>
                <div className="interface mt-1 text-lg font-extrabold text-[#ffd49c]">{pending.length}</div>
              </div>
              <div>
                <div className="metric-label">Confirmed</div>
                <div className="interface mt-1 text-lg font-extrabold text-[#ff9c8c]">{confirmed.length}</div>
              </div>
              <div>
                <div className="metric-label">Dismissed</div>
                <div className="interface mt-1 text-lg font-extrabold text-[#b8f15a]">{dismissed.length}</div>
              </div>
            </div>
          </div>
        </div>

        {/* review strip */}
        {pending.length > 0 && (
          <div className="rounded-[1.25rem] border border-[#d9a35c]/35 bg-[#2b2515] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <ShieldQuestion size={18} className="text-[#e8c084]" />
                <span className="text-sm font-bold text-[#f0d5a4]">
                  {pending.length} advisory signature
                  {pending.length > 1 ? "s" : ""} waiting on a person
                </span>
              </div>
              <p className="text-xs leading-5 text-[#cbb894]">The model proposes, the gardener disposes. Confirming writes a treatment task; dismissing keeps the frame as evidence.</p>
            </div>
          </div>
        )}

        {/* frame wall */}
        <div className="demo-panel p-5">
          <DemoSectionTitle
            title="Capture wall"
            action={
              <Link href={demoLink("/tasks")} className="interface text-[.62rem] font-extrabold uppercase tracking-[.1em] text-[#b8f15a] hover:text-[#d0ff88]">
                Confirmed findings become tasks →
              </Link>
            }
          />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {cam.snapshots.slice(0, 8).map((snapshot, index) => {
              const brightness = 0.4 + (snapshot.light / 100) * 0.85;
              const saturation = 0.55 + (snapshot.moisture / 100) * 0.9;
              return (
                <article key={snapshot.id} className="overflow-hidden rounded-[1.15rem] border border-white/12 bg-white/[.03]">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={frameImage(snapshot.zoneId, index)}
                      alt={`Frame ${snapshot.id} of ${snapshot.zoneName}`}
                      className="h-full w-full object-cover"
                      style={{
                        filter: `brightness(${brightness.toFixed(2)}) saturate(${saturation.toFixed(2)}) contrast(1.06)`,
                      }}
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#08150f]/85 via-transparent to-transparent" />
                    <span className="interface absolute left-2.5 top-2.5 rounded-full bg-[#08150f]/70 px-2 py-1 text-[.52rem] font-extrabold uppercase tracking-[.12em] text-[#d7e9cc]">
                      {formatSimClock(snapshot.simMin, state.settings.clock24h)} · frame {String(snapshot.id).padStart(3, "0")}
                    </span>
                    {snapshot.pest && (
                      <span
                        className={`valve-badge absolute right-2.5 top-2.5 ${snapshot.pest.status === "needs-review" ? "valve-open !bg-[#d9a35c]/25 !text-[#ffd49c] !border-[#d9a35c]/50" : snapshot.pest.status === "confirmed" ? "valve-open !bg-[#ff6b57]/25 !text-[#ffb3a4] !border-[#ff6b57]/50" : "valve-closed"}`}
                      >
                        {snapshot.pest.status === "needs-review" ? <Eye size={10} /> : snapshot.pest.status === "confirmed" ? <ShieldQuestion size={10} /> : <Check size={10} />} {snapshot.pest.name}
                      </span>
                    )}
                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 p-3">
                      <span className="truncate text-[.7rem] font-bold text-[#efffd3]">{snapshot.zoneName}</span>
                      <span className="interface shrink-0 text-[.56rem] font-extrabold uppercase tracking-[.1em] text-[#b8f15a]">idx {snapshot.growthIndex.toFixed(0)}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2 border-t border-white/10 px-3 py-2.5">
                    <span className="interface text-[.56rem] font-extrabold uppercase tracking-[.1em] text-[#8fae93]">
                      soil {snapshot.moisture.toFixed(0)}% · light {snapshot.light.toFixed(0)}%
                    </span>
                    {snapshot.pest?.status === "needs-review" ? (
                      <span className="flex gap-1.5">
                        <button className="demo-chip !border-[#ff8d7a]/50 !text-[#ffb3a4]" onClick={() => actions.reviewSnapshot(snapshot.id, "confirmed")} aria-label={`Confirm ${snapshot.pest.name} on ${snapshot.zoneName}`}>
                          <Check size={11} /> Confirm
                        </button>
                        <button className="demo-chip" onClick={() => actions.reviewSnapshot(snapshot.id, "dismissed")} aria-label={`Dismiss ${snapshot.pest.name} on ${snapshot.zoneName}`}>
                          <X size={11} />
                        </button>
                      </span>
                    ) : snapshot.pest ? (
                      <span className="interface text-[.54rem] font-extrabold uppercase tracking-[.12em] text-[#8fae93]">
                        {snapshot.pest.status} · {(snapshot.pest.confidence * 100).toFixed(0)}%
                      </span>
                    ) : (
                      <span className="interface text-[.54rem] font-extrabold uppercase tracking-[.12em] text-[#7e9a80]">no signature</span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
          <p className="mt-4 text-xs leading-5 text-[#8fae93]">
            Frames are the site's own garden photography, tinted by each capture's light and moisture reading — a stand-in for the ESP32-CAM rig. The confidence scores are simulated: production advisory analysis is explicitly
            human-in-the-loop and never auto-acts.
          </p>
        </div>
      </div>
    </DemoLayout>
  );
}
import { DemoPageHeader, DemoSectionTitle, StatTile, chartColors, clockTicks, tickClockLabel, tooltipStyle, useDemoMeta } from "./ui";

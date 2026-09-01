// Grinrex IoT — demo Devices & telemetry. The node fleet behind the loop: radio, power,
// firmware, faults, and what the garden does when a node drops out.
import { ArrowDownToLine, BatteryMedium, CheckCircle2, Cpu, OctagonX, RotateCcw, ShieldAlert, Signal, Sprout, Wifi } from "lucide-react";
import { DemoLayout } from "./DemoLayout";
import { useGarden } from "./GardenContext";
import { demoLink } from "./sections";
import { formatSimClock, soilDeviceId, valveDeviceId, type DeviceState } from "./simulation";
import { Link } from "wouter";

const kindLabel: Record<DeviceState["kind"], string> = {
  controller: "Controller",
  pump: "Pump & manifold",
  camera: "Camera",
  sensor: "Sensor node",
  valve: "Actuator",
};

function signalPct(rssi: number) {
  // -95 dBm is unusable, -45 dBm is pegged
  return Math.round(Math.max(4, Math.min(100, ((rssi + 95) / 50) * 100)));
}

export default function DevicesPage() {
  useDemoMeta("/devices");
  const { state, actions } = useGarden();
  const devices = state.devices;
  const online = devices.filter(d => d.online).length;
  const faults = devices.filter(d => d.fault);
  const lowPower = devices.filter(d => d.battery !== null && d.battery < 25);
  const updatable = devices.filter(d => d.pendingFirmware);
  const controller = devices.find(d => d.id === "edge-01");

  return (
    <DemoLayout>
      <div className="flex flex-col gap-8">
        <DemoPageHeader
          path="/devices"
          title="The fleet"
          accent="behind the readings."
          copy="Every number on the other demo pages arrives through one of these nodes. Battery, radio, firmware, and fault state are modelled live — drop a node out and watch the garden keep itself safe without it."
          aside={
            <>
              <StatTile label="Nodes online" value={`${online}/${devices.length}`} sub="reporting to the edge" tone={online === devices.length ? "text-[#b8f15a]" : "text-[#ffd49c]"} icon={<Cpu size={15} className="text-[#b8f15a]" />} />
              <StatTile label="Open faults" value={faults.length} sub="needs a person" tone={faults.length ? "text-[#ff9c8c]" : "text-[#efffd3]"} icon={<ShieldAlert size={15} className="text-[#ff9c8c]" />} />
              <StatTile label="Low power" value={lowPower.length} sub="under 25% battery" tone={lowPower.length ? "text-[#ffd49c]" : "text-[#efffd3]"} icon={<BatteryMedium size={15} className="text-[#d9a35c]" />} />
            </>
          }
        />

        {/* control chain */}
        <div className="demo-panel p-5">
          <DemoSectionTitle title="Control chain per zone" note="sensor → edge rules → actuator" />
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {state.zones.map(zone => {
              const sensor = devices.find(d => d.id === soilDeviceId(zone.id));
              const valve = devices.find(d => d.id === valveDeviceId(zone.id));
              const healthy = sensor?.online && valve?.online && controller?.online;
              return (
                <div key={zone.id} className="rounded-xl border border-white/12 bg-white/[.035] p-4">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm font-bold text-[#effadf]">
                      <Sprout size={14} className="text-[#b8f15a]" /> {zone.name}
                    </span>
                    <span className={`valve-badge ${healthy ? "valve-open" : "valve-closed"}`}>{healthy ? "Loop intact" : "Degraded"}</span>
                  </div>
                  <ul className="mt-3.5 space-y-2">
                    {[
                      {
                        label: "Soil node",
                        device: sensor,
                        note: `${zone.moisture.toFixed(0)}% · ${zone.temp.toFixed(1)}°C`,
                      },
                      {
                        label: "Edge rules",
                        device: controller,
                        note: zone.valveOpen ? "cycle open" : zone.holdReason ? `held · ${zone.holdReason}` : "armed",
                      },
                      {
                        label: "Valve",
                        device: valve,
                        note: zone.valveOpen ? "energised" : "normally closed",
                      },
                    ].map(row => (
                      <li key={row.label} className="flex items-center gap-2.5">
                        <span className="status-light" data-state={!row.device?.online ? "critical" : row.device.fault ? "warn" : "ok"} />
                        <span className="interface text-[.58rem] font-extrabold uppercase tracking-[.1em] text-[#c9dcbf]">{row.label}</span>
                        <span className="ml-auto truncate text-[.66rem] text-[#8fae93]">{row.note}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3.5 flex gap-1.5 border-t border-white/10 pt-3">
                    <button className="demo-chip" data-on={!sensor?.online} onClick={() => actions.toggleDevice(soilDeviceId(zone.id))} aria-label={`Toggle soil node for ${zone.name}`}>
                      {sensor?.online ? "Drop sensor" : "Restore sensor"}
                    </button>
                    <button className="demo-chip" onClick={() => actions.rebootDevice(valveDeviceId(zone.id))} aria-label={`Reboot valve node for ${zone.name}`}>
                      <RotateCcw size={12} /> Reboot valve
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-xs leading-5 text-[#8fae93]">
            Dropping a soil node holds that zone instead of guessing with stale data — the {state.settings.offlineFallback === "local" ? "edge keeps the last validated thresholds for the rest" : "safe-stop fallback halts every valve"}.{" "}
            <Link href={demoLink("/settings")} className="text-[#b8f15a] underline decoration-dotted">
              Offline fallback setting
            </Link>
          </p>
        </div>

        {/* fleet table */}
        <div className="demo-panel overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
            <h2 className="interface text-[.68rem] font-extrabold uppercase tracking-[.16em] text-[#d9a35c]">Node fleet</h2>
            <div className="flex flex-wrap gap-2">
              <StatusLight state={online === devices.length ? "ok" : "warn"} label={`${online} of ${devices.length} reporting`} />
              <StatusLight state={updatable.length ? "warn" : "idle"} label={updatable.length ? `${updatable.length} update queued` : "firmware current"} />
            </div>
          </div>

          <div className="divide-y divide-white/[.07]">
            {devices.map(device => {
              const pct = signalPct(device.rssi);
              return (
                <div key={device.id} className="grid gap-4 px-5 py-4 lg:grid-cols-[1.5fr_1fr_.8fr_.9fr_auto] lg:items-center">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="status-light" data-state={!device.online ? "critical" : device.fault ? "warn" : "ok"} />
                      <span className="truncate text-sm font-bold text-[#effadf]">{device.name}</span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#8fae93]">
                      <span className="interface text-[.54rem] font-extrabold uppercase tracking-[.12em] text-[#7e9a80]">{kindLabel[device.kind]}</span>
                      <span>· {device.model}</span>
                    </div>
                    {device.fault && (
                      <p className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-[#ffb3a4]">
                        <OctagonX size={12} /> {device.fault}
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="interface flex items-center justify-between text-[.54rem] font-extrabold uppercase tracking-[.12em] text-[#8fae93]">
                      <span className="flex items-center gap-1">
                        <Wifi size={11} /> Radio
                      </span>
                      <span className={pct > 60 ? "text-[#b8f15a]" : pct > 30 ? "text-[#ffd49c]" : "text-[#ff9c8c]"}>{device.rssi.toFixed(0)} dBm</span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/[.07]">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${pct}%`,
                          background: pct > 60 ? "#b8f15a" : pct > 30 ? "#d9a35c" : "#ff6b57",
                        }}
                      />
                    </div>
                    <div className="interface mt-2 text-[.54rem] font-extrabold uppercase tracking-[.12em] text-[#7e9a80]">last seen {formatSimClock(device.lastSeenSimMin, state.settings.clock24h)}</div>
                  </div>

                  <div>
                    <div className="interface flex items-center justify-between text-[.54rem] font-extrabold uppercase tracking-[.12em] text-[#8fae93]">
                      <span className="flex items-center gap-1">
                        <BatteryMedium size={11} /> {device.powered}
                      </span>
                      <span>{device.battery === null ? "mains" : `${device.battery.toFixed(0)}%`}</span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/[.07]">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${device.battery ?? 100}%`,
                          background: (device.battery ?? 100) < 25 ? "#ff6b57" : (device.battery ?? 100) < 55 ? "#d9a35c" : "#8fd3b4",
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="interface text-[.54rem] font-extrabold uppercase tracking-[.12em] text-[#8fae93]">Firmware</div>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="interface font-mono text-[.72rem] text-[#d7e9cc]">v{device.firmware}</span>
                      {device.pendingFirmware && (
                        <span className="valve-badge valve-open !text-[#ffd49c] !border-[#d9a35c]/45 !bg-[#d9a35c]/12">
                          <Signal size={10} /> v{device.pendingFirmware}
                        </span>
                      )}
                      {device.offlineUntilSimMin !== null && !device.online && <span className="valve-badge valve-closed">installing</span>}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 lg:justify-end">
                    {device.pendingFirmware && device.online && (
                      <button className="demo-chip !border-[#d9a35c]/45 !text-[#ffd49c]" onClick={() => actions.updateFirmware(device.id)} aria-label={`Update firmware for ${device.name}`}>
                        <ArrowDownToLine size={12} /> Update
                      </button>
                    )}
                    {device.fault && (
                      <button className="demo-chip !border-[#b8f15a]/45 !text-[#b8f15a]" onClick={() => actions.clearDeviceFault(device.id)} aria-label={`Clear fault on ${device.name}`}>
                        <CheckCircle2 size={12} /> Clear fault
                      </button>
                    )}
                    {device.battery !== null && (
                      <button className="demo-chip" onClick={() => actions.drainDevice(device.id)} aria-label={`Advance the power budget of ${device.name} by a day`}>
                        <BatteryMedium size={12} /> +1 day power
                      </button>
                    )}
                    <button className="demo-chip" onClick={() => actions.rebootDevice(device.id)} aria-label={`Reboot ${device.name}`}>
                      <RotateCcw size={12} /> Reboot
                    </button>
                    <button className="demo-chip" data-on={!device.online} onClick={() => actions.toggleDevice(device.id)} aria-label={`Set ${device.name} ${device.online ? "offline" : "online"}`}>
                      {device.online ? "Take offline" : "Bring online"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-white/[.02] px-5 py-3">
            <span className="interface text-[.56rem] font-extrabold uppercase tracking-[.12em] text-[#8fae93]">Reboots hold the node for 20 sim-min · OTA installs in 45 · both are simulated, no hardware required</span>
            <Link href={demoLink("/alerts")} className="interface text-[.6rem] font-extrabold uppercase tracking-[.1em] text-[#b8f15a] hover:text-[#d0ff88]">
              Device alerts queue →
            </Link>
          </div>
        </div>

        <TelemetryFeed state={state} />
      </div>
    </DemoLayout>
  );
}
import { DemoPageHeader, DemoSectionTitle, StatTile, StatusLight, TelemetryFeed, useDemoMeta } from "./ui";

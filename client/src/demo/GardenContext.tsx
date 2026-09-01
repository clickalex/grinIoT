// Grinrex IoT — GardenProvider. One shared, live simulation for every /demo page.
// The tick loop runs in a single interval; pages subscribe via useGarden() and dispatch actions.
// Every demo page reads the same state, so a rule change on one page shows up on all of them.
import { createContext, useCallback, useContext, useEffect, useReducer, type ReactNode } from "react";
import {
  acknowledgeAlert,
  acknowledgeAllAlerts,
  addGardenNote,
  addGardenTask,
  addZone,
  captureNow,
  clearDeviceFault,
  clearEmergencyStop,
  completeTask,
  drainDeviceBattery,
  doseChannelNow,
  emergencyStop,
  initialSimState,
  patchCamera,
  patchFertChannel,
  patchFertilizer,
  patchHarvest,
  patchRules,
  patchSettings,
  pauseSim,
  rebootDevice,
  refillTank,
  removeZone,
  resetSim,
  resumeSim,
  reviewSnapshot,
  setScheduleWindowTime,
  setSimSpeed,
  setZoneAuto,
  setZoneTarget,
  simTick,
  snoozeTask,
  startZoneWatering,
  stopZoneWatering,
  toggleAutoGlobal,
  toggleDeviceOnline,
  toggleDryRun,
  toggleEco,
  toggleScheduleWindow,
  updateFirmware,
  type DeviceState,
  type FertChannel,
  type FertilizerState,
  type RulesState,
  type SimState,
  type SiteSettings,
  type TaskKind,
} from "./simulation";

type RulesPatch = Partial<Omit<RulesState, "windows">>;
type FertGlobalPatch = Partial<Pick<FertilizerState, "enabled" | "lockout">>;
type FertChannelPatch = Partial<Pick<FertChannel, "enabled" | "doseMl" | "reservoirMl">>;
type CameraPatch = Partial<{
  enabled: boolean;
  intervalMin: number;
  storagePct: number;
}>;
type HarvestPatch = Partial<{
  catchmentM2: number;
  efficiency: number;
  routedToTank: boolean;
}>;

type Action =
  | { type: "TICK" }
  | { type: "START_ZONE"; zoneId: string }
  | { type: "STOP_ZONE"; zoneId: string }
  | { type: "ADD_ZONE" }
  | { type: "REMOVE_ZONE"; zoneId: string }
  | { type: "EMERGENCY_STOP" }
  | { type: "CLEAR_STOP" }
  | { type: "REFILL"; liters: number; source: "rain" | "municipal" }
  | { type: "TOGGLE_ECO" }
  | { type: "TOGGLE_AUTO" }
  | { type: "SET_ZONE_AUTO"; zoneId: string; auto: boolean }
  | { type: "SET_ZONE_TARGET"; zoneId: string; target: number }
  | { type: "SET_SPEED"; speed: number }
  | { type: "PATCH_RULES"; patch: RulesPatch; logMessage?: string }
  | { type: "TOGGLE_WINDOW"; windowId: string }
  | {
      type: "SET_WINDOW_TIME";
      windowId: string;
      key: "startMin" | "endMin";
      minutes: number;
    }
  | { type: "TOGGLE_DRY_RUN" }
  | { type: "TOGGLE_DEVICE"; deviceId: string }
  | { type: "REBOOT_DEVICE"; deviceId: string }
  | { type: "UPDATE_FIRMWARE"; deviceId: string }
  | { type: "CLEAR_DEVICE_FAULT"; deviceId: string }
  | { type: "DRAIN_DEVICE"; deviceId: string }
  | { type: "ACK_ALERT"; alertId: number }
  | { type: "ACK_ALL_ALERTS" }
  | { type: "PATCH_FERT"; patch: FertGlobalPatch; logMessage: string }
  | {
      type: "PATCH_FERT_CHANNEL";
      channelId: string;
      patch: FertChannelPatch;
      logMessage?: string;
    }
  | { type: "DOSE_CHANNEL"; channelId: string }
  | { type: "PATCH_CAMERA"; patch: CameraPatch; logMessage: string }
  | { type: "CAPTURE_NOW" }
  | {
      type: "REVIEW_SNAPSHOT";
      snapshotId: number;
      verdict: "confirmed" | "dismissed";
    }
  | { type: "COMPLETE_TASK"; taskId: string }
  | { type: "SNOOZE_TASK"; taskId: string; minutes: number }
  | { type: "ADD_TASK"; title: string; kind: TaskKind }
  | { type: "ADD_NOTE"; text: string }
  | { type: "PATCH_HARVEST"; patch: HarvestPatch; logMessage: string }
  | { type: "PATCH_SETTINGS"; patch: Partial<SiteSettings> }
  | { type: "PAUSE" }
  | { type: "RESUME" }
  | { type: "RESET" };

function reducer(state: SimState, action: Action): SimState {
  switch (action.type) {
    case "TICK":
      return simTick(state);
    case "START_ZONE":
      return startZoneWatering(state, action.zoneId);
    case "STOP_ZONE":
      return stopZoneWatering(state, action.zoneId);
    case "ADD_ZONE":
      return addZone(state);
    case "REMOVE_ZONE":
      return removeZone(state, action.zoneId);
    case "EMERGENCY_STOP":
      return emergencyStop(state);
    case "CLEAR_STOP":
      return clearEmergencyStop(state);
    case "REFILL":
      return refillTank(state, action.liters, action.source);
    case "TOGGLE_ECO":
      return toggleEco(state);
    case "TOGGLE_AUTO":
      return toggleAutoGlobal(state);
    case "SET_ZONE_AUTO":
      return setZoneAuto(state, action.zoneId, action.auto);
    case "SET_ZONE_TARGET":
      return setZoneTarget(state, action.zoneId, action.target);
    case "SET_SPEED":
      return setSimSpeed(state, action.speed);
    case "PATCH_RULES":
      return patchRules(state, action.patch, action.logMessage);
    case "TOGGLE_WINDOW":
      return toggleScheduleWindow(state, action.windowId);
    case "SET_WINDOW_TIME":
      return setScheduleWindowTime(state, action.windowId, action.key, action.minutes);
    case "TOGGLE_DRY_RUN":
      return toggleDryRun(state);
    case "TOGGLE_DEVICE":
      return toggleDeviceOnline(state, action.deviceId);
    case "REBOOT_DEVICE":
      return rebootDevice(state, action.deviceId);
    case "UPDATE_FIRMWARE":
      return updateFirmware(state, action.deviceId);
    case "CLEAR_DEVICE_FAULT":
      return clearDeviceFault(state, action.deviceId);
    case "DRAIN_DEVICE":
      return drainDeviceBattery(state, action.deviceId);
    case "ACK_ALERT":
      return acknowledgeAlert(state, action.alertId);
    case "ACK_ALL_ALERTS":
      return acknowledgeAllAlerts(state);
    case "PATCH_FERT":
      return patchFertilizer(state, action.patch, action.logMessage);
    case "PATCH_FERT_CHANNEL":
      return patchFertChannel(state, action.channelId, action.patch, action.logMessage);
    case "DOSE_CHANNEL":
      return doseChannelNow(state, action.channelId);
    case "PATCH_CAMERA":
      return patchCamera(state, action.patch, action.logMessage);
    case "CAPTURE_NOW":
      return captureNow(state);
    case "REVIEW_SNAPSHOT":
      return reviewSnapshot(state, action.snapshotId, action.verdict);
    case "COMPLETE_TASK":
      return completeTask(state, action.taskId);
    case "SNOOZE_TASK":
      return snoozeTask(state, action.taskId, action.minutes);
    case "ADD_TASK":
      return addGardenTask(state, action.title, action.kind);
    case "ADD_NOTE":
      return addGardenNote(state, action.text);
    case "PATCH_HARVEST":
      return patchHarvest(state, action.patch, action.logMessage);
    case "PATCH_SETTINGS":
      return patchSettings(state, action.patch);
    case "PAUSE":
      return pauseSim(state);
    case "RESUME":
      return resumeSim(state);
    case "RESET":
      return resetSim();
    default:
      return state;
  }
}

interface GardenContextValue {
  state: SimState;
  devices: DeviceState[];
  actions: {
    startZone: (zoneId: string) => void;
    stopZone: (zoneId: string) => void;
    addZone: () => void;
    removeZone: (zoneId: string) => void;
    emergencyStop: () => void;
    clearStop: () => void;
    refill: (liters: number, source: "rain" | "municipal") => void;
    toggleEco: () => void;
    toggleAuto: () => void;
    setZoneAuto: (zoneId: string, auto: boolean) => void;
    setZoneTarget: (zoneId: string, target: number) => void;
    setSpeed: (speed: number) => void;
    patchRules: (patch: RulesPatch, logMessage?: string) => void;
    toggleWindow: (windowId: string) => void;
    setWindowTime: (windowId: string, key: "startMin" | "endMin", minutes: number) => void;
    toggleDryRun: () => void;
    toggleDevice: (deviceId: string) => void;
    rebootDevice: (deviceId: string) => void;
    updateFirmware: (deviceId: string) => void;
    clearDeviceFault: (deviceId: string) => void;
    drainDevice: (deviceId: string) => void;
    ackAlert: (alertId: number) => void;
    ackAllAlerts: () => void;
    patchFertilizer: (patch: FertGlobalPatch, logMessage: string) => void;
    patchFertChannel: (channelId: string, patch: FertChannelPatch, logMessage?: string) => void;
    doseChannel: (channelId: string) => void;
    patchCamera: (patch: CameraPatch, logMessage: string) => void;
    captureNow: () => void;
    reviewSnapshot: (snapshotId: number, verdict: "confirmed" | "dismissed") => void;
    completeTask: (taskId: string) => void;
    snoozeTask: (taskId: string, minutes: number) => void;
    addTask: (title: string, kind?: TaskKind) => void;
    addNote: (text: string) => void;
    patchHarvest: (patch: HarvestPatch, logMessage: string) => void;
    patchSettings: (patch: Partial<SiteSettings>) => void;
    pause: () => void;
    resume: () => void;
    reset: () => void;
  };
}

const GardenContext = createContext<GardenContextValue | null>(null);

export function GardenProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialSimState);

  // One interval for the whole demo; tick rate scales with sim speed.
  useEffect(() => {
    const timer = window.setInterval(() => dispatch({ type: "TICK" }), 1400);
    return () => window.clearInterval(timer);
  }, []);

  const actions: GardenContextValue["actions"] = {
    startZone: useCallback(zoneId => dispatch({ type: "START_ZONE", zoneId }), []),
    stopZone: useCallback(zoneId => dispatch({ type: "STOP_ZONE", zoneId }), []),
    addZone: useCallback(() => dispatch({ type: "ADD_ZONE" }), []),
    removeZone: useCallback(zoneId => dispatch({ type: "REMOVE_ZONE", zoneId }), []),
    emergencyStop: useCallback(() => dispatch({ type: "EMERGENCY_STOP" }), []),
    clearStop: useCallback(() => dispatch({ type: "CLEAR_STOP" }), []),
    refill: useCallback((liters, source) => dispatch({ type: "REFILL", liters, source }), []),
    toggleEco: useCallback(() => dispatch({ type: "TOGGLE_ECO" }), []),
    toggleAuto: useCallback(() => dispatch({ type: "TOGGLE_AUTO" }), []),
    setZoneAuto: useCallback((zoneId, auto) => dispatch({ type: "SET_ZONE_AUTO", zoneId, auto }), []),
    setZoneTarget: useCallback((zoneId, target) => dispatch({ type: "SET_ZONE_TARGET", zoneId, target }), []),
    setSpeed: useCallback(speed => dispatch({ type: "SET_SPEED", speed }), []),
    patchRules: useCallback((patch, logMessage) => dispatch({ type: "PATCH_RULES", patch, logMessage }), []),
    toggleWindow: useCallback(windowId => dispatch({ type: "TOGGLE_WINDOW", windowId }), []),
    setWindowTime: useCallback((windowId, key, minutes) => dispatch({ type: "SET_WINDOW_TIME", windowId, key, minutes }), []),
    toggleDryRun: useCallback(() => dispatch({ type: "TOGGLE_DRY_RUN" }), []),
    toggleDevice: useCallback(deviceId => dispatch({ type: "TOGGLE_DEVICE", deviceId }), []),
    rebootDevice: useCallback(deviceId => dispatch({ type: "REBOOT_DEVICE", deviceId }), []),
    updateFirmware: useCallback(deviceId => dispatch({ type: "UPDATE_FIRMWARE", deviceId }), []),
    clearDeviceFault: useCallback(deviceId => dispatch({ type: "CLEAR_DEVICE_FAULT", deviceId }), []),
    drainDevice: useCallback(deviceId => dispatch({ type: "DRAIN_DEVICE", deviceId }), []),
    ackAlert: useCallback(alertId => dispatch({ type: "ACK_ALERT", alertId }), []),
    ackAllAlerts: useCallback(() => dispatch({ type: "ACK_ALL_ALERTS" }), []),
    patchFertilizer: useCallback((patch, logMessage) => dispatch({ type: "PATCH_FERT", patch, logMessage }), []),
    patchFertChannel: useCallback((channelId, patch, logMessage) => dispatch({ type: "PATCH_FERT_CHANNEL", channelId, patch, logMessage }), []),
    doseChannel: useCallback(channelId => dispatch({ type: "DOSE_CHANNEL", channelId }), []),
    patchCamera: useCallback((patch, logMessage) => dispatch({ type: "PATCH_CAMERA", patch, logMessage }), []),
    captureNow: useCallback(() => dispatch({ type: "CAPTURE_NOW" }), []),
    reviewSnapshot: useCallback((snapshotId, verdict) => dispatch({ type: "REVIEW_SNAPSHOT", snapshotId, verdict }), []),
    completeTask: useCallback(taskId => dispatch({ type: "COMPLETE_TASK", taskId }), []),
    snoozeTask: useCallback((taskId, minutes) => dispatch({ type: "SNOOZE_TASK", taskId, minutes }), []),
    addTask: useCallback((title, kind = "note") => dispatch({ type: "ADD_TASK", title, kind }), []),
    addNote: useCallback(text => dispatch({ type: "ADD_NOTE", text }), []),
    patchHarvest: useCallback((patch, logMessage) => dispatch({ type: "PATCH_HARVEST", patch, logMessage }), []),
    patchSettings: useCallback(patch => dispatch({ type: "PATCH_SETTINGS", patch }), []),
    pause: useCallback(() => dispatch({ type: "PAUSE" }), []),
    resume: useCallback(() => dispatch({ type: "RESUME" }), []),
    reset: useCallback(() => dispatch({ type: "RESET" }), []),
  };

  const value: GardenContextValue = { state, devices: state.devices, actions };

  return <GardenContext.Provider value={value}>{children}</GardenContext.Provider>;
}

export function useGarden(): GardenContextValue {
  const context = useContext(GardenContext);
  if (!context) {
    throw new Error("useGarden must be used within GardenProvider");
  }
  return context;
}

export type { SimState, DeviceState };

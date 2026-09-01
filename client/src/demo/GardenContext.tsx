// Grinrex IoT — GardenProvider. One shared, live simulation for every /demo page.
// The tick loop runs in a single interval; pages subscribe via useGarden() and dispatch actions.
import { createContext, useCallback, useContext, useEffect, useReducer, type ReactNode } from "react";
import {
  addZone,
  clearEmergencyStop,
  emergencyStop,
  initialSimState,
  pauseSim,
  refillTank,
  removeZone,
  resetSim,
  resumeSim,
  setSimSpeed,
  setZoneAuto,
  setZoneTarget,
  simTick,
  startZoneWatering,
  stopZoneWatering,
  toggleAutoGlobal,
  toggleEco,
  type SimState,
} from "./simulation";

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
    startZone: useCallback((zoneId) => dispatch({ type: "START_ZONE", zoneId }), []),
    stopZone: useCallback((zoneId) => dispatch({ type: "STOP_ZONE", zoneId }), []),
    addZone: useCallback(() => dispatch({ type: "ADD_ZONE" }), []),
    removeZone: useCallback((zoneId) => dispatch({ type: "REMOVE_ZONE", zoneId }), []),
    emergencyStop: useCallback(() => dispatch({ type: "EMERGENCY_STOP" }), []),
    clearStop: useCallback(() => dispatch({ type: "CLEAR_STOP" }), []),
    refill: useCallback((liters, source) => dispatch({ type: "REFILL", liters, source }), []),
    toggleEco: useCallback(() => dispatch({ type: "TOGGLE_ECO" }), []),
    toggleAuto: useCallback(() => dispatch({ type: "TOGGLE_AUTO" }), []),
    setZoneAuto: useCallback((zoneId, auto) => dispatch({ type: "SET_ZONE_AUTO", zoneId, auto }), []),
    setZoneTarget: useCallback((zoneId, target) => dispatch({ type: "SET_ZONE_TARGET", zoneId, target }), []),
    setSpeed: useCallback((speed) => dispatch({ type: "SET_SPEED", speed }), []),
    pause: useCallback(() => dispatch({ type: "PAUSE" }), []),
    resume: useCallback(() => dispatch({ type: "RESUME" }), []),
    reset: useCallback(() => dispatch({ type: "RESET" }), []),
  };

  return <GardenContext.Provider value={{ state, actions }}>{children}</GardenContext.Provider>;
}

export function useGarden(): GardenContextValue {
  const context = useContext(GardenContext);
  if (!context) {
    throw new Error("useGarden must be used within GardenProvider");
  }
  return context;
}

export type { SimState };

// Grinrex IoT — live demo simulation engine.
// A deterministic, tick-driven model of a real garden loop: weather drives evaporation,
// soil moisture decays, the rule engine opens valves, and the tank drains — with safety
// cutoffs, eco mode, rain events, and a full event/alert log. Purely in-browser; no backend.
// Every page under /demo reads from the same live GardenProvider, so changes made on one
// page are visible on all others.

export type SimWeather = {
  temp: number; // °C
  humidity: number; // %
  light: number; // 0-100 (daylight strength)
  wind: number; // km/h
  raining: boolean;
  rainIntensity: number; // 0-1
};

export type ZoneState = {
  id: string;
  name: string;
  plant: string;
  moisture: number; // %
  target: number; // % — desired soil moisture
  temp: number; // °C at zone
  light: number; // 0-100
  valveOpen: boolean;
  auto: boolean;
  pausedByRain: boolean;
  lastWateredSimMin: number | null;
  consumedToday: number; // liters
  consumedTotal: number; // liters
};

export type TankState = {
  level: number; // liters
  capacity: number; // liters
  rainShare: number; // liters currently from rainwater
  muniShare: number; // liters from municipal
  lowThreshold: number; // liters
  criticalThreshold: number; // liters
};

export type AlertKind = "info" | "warn" | "critical" | "ok";

export type LogEntry = {
  id: number;
  simMin: number;
  realTime: number;
  kind: AlertKind;
  source: string;
  message: string;
};

export type SimState = {
  running: boolean;
  simMin: number; // simulated minutes since demo start
  speed: number; // sim minutes per real second
  eco: boolean;
  autoGlobal: boolean;
  emergencyStop: boolean;
  weather: SimWeather;
  zones: ZoneState[];
  tank: TankState;
  log: LogEntry[];
  alerts: { id: number; kind: AlertKind; title: string; detail: string; simMin: number }[];
  waterToday: number; // liters
  waterYesterday: number; // liters
  rainwaterToday: number; // liters
  estimatedSavingsL: number; // liters saved by rain-first logic
  history: SimHistoryPoint[];
  logSeq: number;
  alertSeq: number;
};

export type SimHistoryPoint = {
  t: number; // simMin
  temp: number;
  humidity: number;
  light: number;
  avgMoisture: number;
  tankLevel: number;
  flowRate: number; // l/min
};

// ---- deterministic PRNG (mulberry32) -------------------------------------
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20260831);
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const round1 = (v: number) => Math.round(v * 10) / 10;

const DAY_MIN = 24 * 60;
const TICK_MIN = 4; // sim minutes per tick

export const zoneDefaults = [
  { id: "z1", name: "Balcony greens", plant: "Herbs & salad greens", moisture: 46, target: 42 },
  { id: "z2", name: "Tomato bed", plant: "Tomatoes", moisture: 34, target: 38 },
  { id: "z3", name: "Vertical wall A", plant: "Leafy greens", moisture: 29, target: 36 },
  { id: "z4", name: "Vertical wall B", plant: "Strawberries", moisture: 40, target: 34 },
];

export function initialSimState(): SimState {
  return {
    running: true,
    simMin: 6 * 60, // start at 06:00 simulated time
    speed: 6, // sim minutes per real second
    eco: true,
    autoGlobal: true,
    emergencyStop: false,
    weather: { temp: 21.4, humidity: 74, light: 8, wind: 6.2, raining: false, rainIntensity: 0 },
    zones: zoneDefaults.map((z) => ({
      ...z,
      temp: 21.5,
      light: 8,
      valveOpen: false,
      auto: true,
      pausedByRain: false,
      lastWateredSimMin: null,
      consumedToday: 0,
      consumedTotal: rand() * 60 + 30,
    })),
    tank: { level: 168, capacity: 220, rainShare: 96, muniShare: 72, lowThreshold: 55, criticalThreshold: 30 },
    log: [],
    alerts: [],
    waterToday: 0,
    waterYesterday: 41.6,
    rainwaterToday: 0,
    estimatedSavingsL: 183,
    history: [],
    logSeq: 1,
    alertSeq: 1,
  };
}

function dayFactor(simMin: number) {
  // daylight 0..1: sunrise 05:40, peak 13:00, sunset 19:40
  const t = simMin % DAY_MIN;
  if (t < 340 || t > 1180) return 0;
  const x = (t - 340) / 840; // 0..1
  return Math.pow(Math.sin(Math.PI * x), 1.3);
}

function pushLog(state: SimState, kind: AlertKind, source: string, message: string): SimState {
  const entry: LogEntry = { id: state.logSeq, simMin: state.simMin, realTime: Date.now(), kind, source, message };
  const log = [entry, ...state.log].slice(0, 120);
  return { ...state, log, logSeq: state.logSeq + 1 };
}

function pushAlert(state: SimState, kind: AlertKind, title: string, detail: string): SimState {
  if (state.alerts.some((a) => a.title === title && state.simMin - a.simMin < 60)) return state; // dedupe within 1h sim
  const alert = { id: state.alertSeq, kind, title, detail, simMin: state.simMin };
  const alerts = [alert, ...state.alerts].slice(0, 24);
  return { ...state, alerts, alertSeq: state.alertSeq + 1 };
}

const fmtClock = (simMin: number) => {
  const t = simMin % DAY_MIN;
  const h = Math.floor(t / 60).toString().padStart(2, "0");
  const m = Math.floor(t % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
};

export function simTick(prev: SimState): SimState {
  if (!prev.running) return prev;
  let state = { ...prev, simMin: prev.simMin + TICK_MIN, weather: { ...prev.weather }, tank: { ...prev.tank }, zones: prev.zones.map((z) => ({ ...z })) };

  // --- weather ---
  const day = dayFactor(state.simMin);
  const t = state.simMin % DAY_MIN;
  const heatBase = 16 + 11 * day;
  const noise = (rand() - 0.5) * 1.6;
  const temp = round1(clamp(heatBase + noise, 12, 40));
  const humidity = round1(clamp(92 - 26 * day - (temp - 16) * 1.4 + (rand() - 0.5) * 5, 22, 98));
  const light = round1(clamp(day * 100 + (rand() - 0.5) * 6, 0, 100));
  const wind = round1(clamp(3 + 9 * day + (rand() - 0.5) * 4, 0, 28));

  // rain events: higher chance in simulated late afternoon, with 2.5% base
  let raining = state.weather.raining;
  let rainIntensity = state.weather.rainIntensity;
  if (state.weather.raining) {
    rainIntensity = clamp(rainIntensity - rand() * 0.14, 0, 1);
    if (rainIntensity <= 0.02) raining = false;
  } else if (rand() < 0.016 + (t > 900 && t < 1140 ? 0.02 : 0)) {
    raining = true;
    rainIntensity = 0.35 + rand() * 0.6;
  }

  state = {
    ...state,
    weather: { temp, humidity, light, wind, raining, rainIntensity: round1(rainIntensity) },
  };

  const wasRaining = prev.weather.raining;

  // --- zones ---
  const tank = state.tank;
  let flow = 0;
  let rainwaterUsed = 0;
  let muniUsed = 0;

  const zones = state.zones.map((z) => {
    const next = { ...z, temp: round1(clamp(temp + (rand() - 0.5) * 1.2, 10, 45)), light };
    const evap = (0.055 + 0.011 * day + (temp - 16) * 0.0035) * TICK_MIN; // % moisture lost per tick
    next.moisture = round1(clamp(next.moisture - evap, 6, 100));

    // rain wets the zone
    if (state.weather.raining) {
      next.moisture = round1(clamp(next.moisture + state.weather.rainIntensity * 0.42 * TICK_MIN, 6, 100));
    }

    const tankCritical = tank.level <= tank.criticalThreshold;
    const tooDry = next.moisture <= next.target - 3;
    const tooWet = next.moisture >= next.target + 6;

    // decision engine: open valve when auto, dry, safe tank, no emergency stop, not raining
    let shouldWater = false;
    if (next.valveOpen) {
      shouldWater = next.moisture < next.target + (state.eco ? 1.5 : 3);
    } else if (
      next.auto &&
      state.autoGlobal &&
      !state.emergencyStop &&
      !state.weather.raining &&
      tooDry &&
      !tankCritical
    ) {
      shouldWater = true;
    }

    next.pausedByRain = Boolean(next.auto && state.weather.raining && tooDry);

    if (shouldWater && !state.emergencyStop && tank.level > 1) {
      next.valveOpen = true;
      const rate = 1.35; // l per sim minute
      const draw = Math.min(rate * TICK_MIN, tank.level);
      next.moisture = round1(clamp(next.moisture + draw * 3.1, 6, 100));
      next.consumedToday = round1(next.consumedToday + draw);
      next.consumedTotal = round1(next.consumedTotal + draw);
      next.lastWateredSimMin = state.simMin;
      flow += rate;

      // rainwater-first logic
      const fromRain = Math.min(tank.rainShare, draw);
      tank.rainShare = round1(Math.max(0, tank.rainShare - fromRain));
      tank.muniShare = round1(Math.max(0, tank.muniShare - (draw - fromRain)));
      tank.level = round1(clamp(tank.level - draw, 0, tank.capacity));
      rainwaterUsed += fromRain;
      muniUsed += draw - fromRain;
    } else if (next.valveOpen && (next.moisture >= next.target + (state.eco ? 1.5 : 3) || state.emergencyStop || tank.level <= tank.criticalThreshold)) {
      next.valveOpen = false;
      if (state.emergencyStop) {
        // handled by global stop below
      }
    }

    return next;
  });

  state = { ...state, zones, tank, waterToday: round1(state.waterToday + flow * TICK_MIN), rainwaterToday: round1(state.rainwaterToday + rainwaterUsed), estimatedSavingsL: round1(state.estimatedSavingsL + rainwaterUsed) };

  // --- alerts & log ---
  if (!wasRaining && state.weather.raining) {
    state = pushLog(state, "info", "Weather", `Rain started (${Math.round(state.weather.rainIntensity * 100)}% intensity) — automatic watering paused.`);
    state = pushAlert(state, "info", "Rain detected", "Automatic irrigation is paused while rain is falling. Rainwater collection is active.");
  }
  if (wasRaining && !state.weather.raining) {
    state = pushLog(state, "ok", "Weather", "Rain ended — automatic watering rules restored.");
  }

  const minMoisture = Math.min(...state.zones.map((z) => z.moisture));
  const maxMoisture = Math.max(...state.zones.map((z) => z.moisture));
  const dryZone = state.zones.find((z) => z.moisture <= z.target - 8 && !z.valveOpen && !state.weather.raining && !state.emergencyStop);
  if (dryZone) {
    state = pushAlert(state, "warn", `Zone dry: ${dryZone.name}`, `Soil moisture ${dryZone.moisture.toFixed(0)}% is well below its ${dryZone.target.toFixed(0)}% target.`);
  }
  if (maxMoisture >= 88) {
    state = pushAlert(state, "warn", "High soil moisture", `A zone reached ${maxMoisture.toFixed(0)}% — verify drainage and valve state.`);
  }
  if (state.tank.level <= state.tank.criticalThreshold) {
    state = pushLog(state, "critical", "Tank", `Critical tank level: ${state.tank.level.toFixed(0)} L. Irrigation cut off.`);
    state = pushAlert(state, "critical", "Tank critical", `${state.tank.level.toFixed(0)} L remaining — all valves are cut off below ${state.tank.criticalThreshold} L.`);
  } else if (state.tank.level <= state.tank.lowThreshold && prev.tank.level > state.tank.lowThreshold) {
    state = pushLog(state, "warn", "Tank", `Low tank level: ${state.tank.level.toFixed(0)} L.`);
    state = pushAlert(state, "warn", "Tank running low", `${state.tank.level.toFixed(0)} L remaining. Consider topping up or checking the municipal inlet.`);
  }
  if (temp >= 34) {
    state = pushAlert(state, "critical", "Heat alert", `Ambient temperature reached ${temp.toFixed(1)}°C. Shade and evening watering recommended.`);
  }
  if (minMoisture < 18 && !state.emergencyStop) {
    state = pushAlert(state, "critical", "Plant stress risk", "A zone is critically dry. Enable watering or run a manual cycle.");
  }

  // --- history ---
  const avgMoisture = round1(state.zones.reduce((sum, z) => sum + z.moisture, 0) / state.zones.length);
  const point: SimHistoryPoint = {
    t: state.simMin,
    temp,
    humidity,
    light,
    avgMoisture,
    tankLevel: state.tank.level,
    flowRate: round1(flow),
  };
  const history = [...state.history, point].slice(-240);

  return { ...state, history };
}

// ---- user actions ---------------------------------------------------------
export function startZoneWatering(state: SimState, zoneId: string): SimState {
  const zones = state.zones.map((z) => (z.id === zoneId ? { ...z, valveOpen: true, auto: false, lastWateredSimMin: state.simMin } : z));
  let next: SimState = { ...state, zones, emergencyStop: false };
  next = pushLog(next, "info", "Irrigation", `${zones.find((z) => z.id === zoneId)?.name ?? zoneId}: manual watering started.`);
  return next;
}

export function stopZoneWatering(state: SimState, zoneId: string): SimState {
  const zones = state.zones.map((z) => (z.id === zoneId ? { ...z, valveOpen: false } : z));
  let next: SimState = { ...state, zones };
  next = pushLog(next, "ok", "Irrigation", `${zones.find((z) => z.id === zoneId)?.name ?? zoneId}: watering stopped.`);
  return next;
}

export function emergencyStop(state: SimState): SimState {
  const zones = state.zones.map((z) => ({ ...z, valveOpen: false }));
  let next: SimState = { ...state, zones, emergencyStop: true };
  next = pushLog(next, "critical", "Safety", "EMERGENCY STOP — all pumps and valves halted. Local override engaged.");
  next = pushAlert(next, "critical", "Emergency stop engaged", "All actuators are off. Clear the stop to resume any automatic or manual irrigation.");
  return next;
}

export function clearEmergencyStop(state: SimState): SimState {
  let next: SimState = { ...state, emergencyStop: false };
  next = pushLog(next, "ok", "Safety", "Emergency stop cleared — normal control restored.");
  return next;
}

export function refillTank(state: SimState, liters: number, source: "rain" | "municipal"): SimState {
  const tank = state.tank;
  const amount = Math.min(liters, tank.capacity - tank.level);
  let next: SimState = {
    ...state,
    tank: {
      ...tank,
      level: round1(tank.level + amount),
      rainShare: round1(tank.rainShare + (source === "rain" ? amount : 0)),
      muniShare: round1(tank.muniShare + (source === "municipal" ? amount : 0)),
    },
  };
  next = pushLog(next, "info", "Tank", `Tank refilled +${amount.toFixed(1)} L from ${source === "rain" ? "rainwater storage" : "municipal inlet"}.`);
  return next;
}

export function toggleEco(state: SimState): SimState {
  const eco = !state.eco;
  let next: SimState = { ...state, eco };
  next = pushLog(next, "info", "Rules", `Eco mode ${eco ? "enabled — rainwater-first, lean cycles" : "disabled — standard cycles"}.`);
  return next;
}

export function toggleAutoGlobal(state: SimState): SimState {
  const autoGlobal = !state.autoGlobal;
  let next: SimState = { ...state, autoGlobal, zones: state.zones.map((z) => ({ ...z, valveOpen: autoGlobal ? z.valveOpen : false })) };
  next = pushLog(next, "info", "Rules", `Automatic irrigation ${autoGlobal ? "enabled" : "disabled"}.`);
  return next;
}

export function setZoneAuto(state: SimState, zoneId: string, auto: boolean): SimState {
  const zones = state.zones.map((z) => (z.id === zoneId ? { ...z, auto, valveOpen: auto ? z.valveOpen : false } : z));
  let next: SimState = { ...state, zones };
  next = pushLog(next, "info", "Irrigation", `${zones.find((z) => z.id === zoneId)?.name ?? zoneId}: automatic mode ${auto ? "enabled" : "switched to manual"}.`);
  return next;
}

export function setZoneTarget(state: SimState, zoneId: string, target: number): SimState {
  const zones = state.zones.map((z) => (z.id === zoneId ? { ...z, target: round1(clamp(target, 20, 70)) } : z));
  let next: SimState = { ...state, zones };
  next = pushLog(next, "info", "Rules", `${zones.find((z) => z.id === zoneId)?.name ?? zoneId}: moisture target set to ${target}%.`);
  return next;
}

export function setSimSpeed(state: SimState, speed: number): SimState {
  return { ...state, speed };
}

const extraZonePlants = ["Mint & basil", "Chillies", "Spinach", "Lettuce mix", "Coriander", "Microgreens", "Rosemary"];
const extraZoneNames = ["New raised bed", "Window box", "Vertical wall C", "Herb rail", "Corner planter", "Greenhouse shelf"];
let zoneSeq = zoneDefaults.length + 1;

export function addZone(state: SimState): SimState {
  const id = `z${zoneSeq++}`;
  const name = extraZoneNames[(zoneSeq - 5) % extraZoneNames.length];
  const plant = extraZonePlants[Math.floor(rand() * extraZonePlants.length)];
  const zone: ZoneState = {
    id,
    name,
    plant,
    moisture: round1(28 + rand() * 20),
    target: round1(32 + rand() * 12),
    temp: state.weather.temp,
    light: state.weather.light,
    valveOpen: false,
    auto: true,
    pausedByRain: false,
    lastWateredSimMin: null,
    consumedToday: 0,
    consumedTotal: round1(rand() * 20),
  };
  let next: SimState = { ...state, zones: [...state.zones, zone] };
  next = pushLog(next, "info", "Zones", `Zone added: ${name} (${plant}).`);
  return next;
}

export function removeZone(state: SimState, zoneId: string): SimState {
  if (state.zones.length <= 1) return state;
  const zone = state.zones.find((z) => z.id === zoneId);
  const zones = state.zones.filter((z) => z.id !== zoneId);
  let next: SimState = { ...state, zones };
  next = pushLog(next, "warn", "Zones", `${zone?.name ?? "Zone"} removed from the loop.`);
  return next;
}

export function pauseSim(state: SimState): SimState {
  let next: SimState = { ...state, running: false };
  next = pushLog(next, "info", "Demo", "Simulation paused.");
  return next;
}

export function resumeSim(state: SimState): SimState {
  let next: SimState = { ...state, running: true };
  next = pushLog(next, "info", "Demo", "Simulation resumed.");
  return next;
}

export function resetSim(): SimState {
  let state = initialSimState();
  state = pushLog(state, "info", "Demo", "Demo reset to a fresh garden state.");
  return state;
}

export const simClock = (simMin: number) => fmtClock(simMin);
export const simDay = (simMin: number) => Math.floor(simMin / DAY_MIN) + 1;
export { fmtClock as formatSimClock };

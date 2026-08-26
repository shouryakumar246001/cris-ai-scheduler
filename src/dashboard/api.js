/**
 * ============================================================
 * CRIS AI Dynamic ETA Prediction — Mock API Service Layer
 * SIH 26028 | ISRO RTIS Integration | ML-Powered ETA Engine
 * ============================================================
 */

"use strict";

// ─── Live Train Registry (State for all 10 trains) ───────────
const LIVE_TRAIN_REGISTRY = [
  {
    train_no: "12301", train_name: "Rajdhani Express",
    source: "Howrah (HWH)", destination: "New Delhi (NDLS)",
    category: "RAJDHANI", distance_km: 1450,
    scheduled_arrival: "10:00", scheduled_departure: "16:55",
    current_station: "Kanpur Central (CNB)", next_station: "New Delhi (NDLS)",
    current_speed_kmph: 128.5,
    gps: { lat: 26.4499, lon: 80.3319, heading: 312 },
    signal_aspect: "CLEAR",
    base_delay_min: 20,
    weather_penalty_min: 15, congestion_penalty_min: 8, tsr_penalty_min: 0, cascade_penalty_min: 0,
    ml_confidence_pct: 94,
    route_sections: ["HWH-DDU-067", "DDU-CNB-072", "CNB-NDLS-084"],
    corridor: "NDLS-HWH", weather: "FOG", visibility_km: 0.3,
  },
  {
    train_no: "12002", train_name: "Shatabdi Express",
    source: "New Delhi (NDLS)", destination: "Rani Kamlapati (RKMP)",
    category: "SHATABDI", distance_km: 707,
    scheduled_arrival: "14:00", scheduled_departure: "06:15",
    current_station: "Agra Cantt (AGC)", next_station: "Gwalior (GWL)",
    current_speed_kmph: 135.0,
    gps: { lat: 27.1767, lon: 78.0081, heading: 175 },
    signal_aspect: "CAUTION",
    base_delay_min: 0,
    weather_penalty_min: 5, congestion_penalty_min: 10, tsr_penalty_min: 12, cascade_penalty_min: 0,
    ml_confidence_pct: 91,
    route_sections: ["NDLS-AGC-031", "AGC-GWL-044", "GWL-BPL-058", "BPL-RKMP-002"],
    corridor: "NDLS-RKMP", weather: "CLEAR", visibility_km: 12.0,
  },
  {
    train_no: "12377", train_name: "Garib Rath Express",
    source: "Kolkata (KOAA)", destination: "New Delhi (NDLS)",
    category: "GARIB_RATH", distance_km: 1318,
    scheduled_arrival: "08:00", scheduled_departure: "22:55",
    current_station: "Mughal Sarai (DDU)", next_station: "Allahabad (ALD)",
    current_speed_kmph: 98.2,
    gps: { lat: 25.2765, lon: 83.1101, heading: 295 },
    signal_aspect: "PROCEED",
    base_delay_min: 35,
    weather_penalty_min: 20, congestion_penalty_min: 15, tsr_penalty_min: 0, cascade_penalty_min: 10,
    ml_confidence_pct: 88,
    route_sections: ["KOAA-HWH-018", "HWH-DDU-067", "DDU-CNB-072", "CNB-NDLS-084"],
    corridor: "NDLS-HWH", weather: "FOG", visibility_km: 0.6,
  },
  {
    train_no: "22832", train_name: "Prasanthi Express",
    source: "Hazrat Nizamuddin (NZM)", destination: "Puttaparthi (PPTN)",
    category: "SUPERFAST", distance_km: 1794,
    scheduled_arrival: "14:30", scheduled_departure: "11:25",
    current_station: "Nagpur (NGP)", next_station: "Balharshah (BPQ)",
    current_speed_kmph: 110.0,
    gps: { lat: 21.1458, lon: 79.0882, heading: 185 },
    signal_aspect: "PROCEED",
    base_delay_min: 12,
    weather_penalty_min: 0, congestion_penalty_min: 5, tsr_penalty_min: 18, cascade_penalty_min: 0,
    ml_confidence_pct: 92,
    route_sections: ["NZM-GWL-088", "GWL-BPL-044", "BPL-NGP-062", "NGP-PPTN-105"],
    corridor: "NDLS-MAS", weather: "RAIN", visibility_km: 2.5,
  },
  {
    train_no: "12238", train_name: "Begampura Express",
    source: "Jammu Tawi (JAT)", destination: "Mumbai CSMT (CSTM)",
    category: "SUPERFAST", distance_km: 1956,
    scheduled_arrival: "11:50", scheduled_departure: "20:35",
    current_station: "New Delhi (NDLS)", next_station: "Mathura Jn (MTJ)",
    current_speed_kmph: 90.0,
    gps: { lat: 28.6139, lon: 77.2090, heading: 195 },
    signal_aspect: "CAUTION",
    base_delay_min: 5,
    weather_penalty_min: 8, congestion_penalty_min: 22, tsr_penalty_min: 0, cascade_penalty_min: 15,
    ml_confidence_pct: 87,
    route_sections: ["JAT-NDLS-042", "NDLS-MTJ-014", "MTJ-AGC-038"],
    corridor: "NDLS-MUM", weather: "HAZE", visibility_km: 3.0,
  },
  {
    train_no: "12229", train_name: "Lucknow Mail",
    source: "Lucknow (LKO)", destination: "New Delhi (NDLS)",
    category: "MAIL", distance_km: 497,
    scheduled_arrival: "06:10", scheduled_departure: "22:00",
    current_station: "Kannauj (KNJ)", next_station: "Kanpur Central (CNB)",
    current_speed_kmph: 115.5,
    gps: { lat: 27.0575, lon: 79.9139, heading: 310 },
    signal_aspect: "PROCEED",
    base_delay_min: 2,
    weather_penalty_min: 10, congestion_penalty_min: 0, tsr_penalty_min: 0, cascade_penalty_min: 0,
    ml_confidence_pct: 96,
    route_sections: ["LKO-CNB-072", "CNB-NDLS-084"],
    corridor: "NDLS-LKO", weather: "FOG", visibility_km: 0.8,
  },
  {
    train_no: "12269", train_name: "Duronto Express",
    source: "Hazrat Nizamuddin (NZM)", destination: "Pune (PUNE)",
    category: "DURONTO", distance_km: 1414,
    scheduled_arrival: "09:45", scheduled_departure: "17:50",
    current_station: "Surat (ST)", next_station: "Vadodara (BRC)",
    current_speed_kmph: 122.0,
    gps: { lat: 21.1702, lon: 72.8311, heading: 145 },
    signal_aspect: "CLEAR",
    base_delay_min: 23,
    weather_penalty_min: 0, congestion_penalty_min: 12, tsr_penalty_min: 0, cascade_penalty_min: 0,
    ml_confidence_pct: 90,
    route_sections: ["NZM-ADI-088", "ADI-ST-042", "ST-PUNE-062"],
    corridor: "NDLS-MUM", weather: "CLEAR", visibility_km: 15.0,
  },
  {
    train_no: "15029", train_name: "Gorakhpur-Pune Exp",
    source: "Gorakhpur (GKP)", destination: "Pune (PUNE)",
    category: "EXPRESS", distance_km: 1834,
    scheduled_arrival: "13:00", scheduled_departure: "07:45",
    current_station: "Allahabad (ALD)", next_station: "Satna (STA)",
    current_speed_kmph: 88.0,
    gps: { lat: 25.4358, lon: 81.8463, heading: 200 },
    signal_aspect: "PROCEED",
    base_delay_min: 45,
    weather_penalty_min: 5, congestion_penalty_min: 8, tsr_penalty_min: 0, cascade_penalty_min: 25,
    ml_confidence_pct: 82,
    route_sections: ["GKP-ALD-058", "ALD-JBP-042", "JBP-NGP-065", "NGP-PUNE-088"],
    corridor: "GKP-PUNE", weather: "CLEAR", visibility_km: 10.0,
  },
  {
    train_no: "12604", train_name: "Chennai-Hyd Express",
    source: "Chennai (MAS)", destination: "Hyderabad (SC)",
    category: "EXPRESS", distance_km: 618,
    scheduled_arrival: "06:40", scheduled_departure: "22:15",
    current_station: "Renigunta (RU)", next_station: "Kurnool (KRNT)",
    current_speed_kmph: 102.0,
    gps: { lat: 13.6489, lon: 79.5191, heading: 358 },
    signal_aspect: "PROCEED",
    base_delay_min: 18,
    weather_penalty_min: 8, congestion_penalty_min: 0, tsr_penalty_min: 10, cascade_penalty_min: 0,
    ml_confidence_pct: 89,
    route_sections: ["MAS-GTL-072", "GTL-SC-042"],
    corridor: "MAS-HYD", weather: "RAIN", visibility_km: 4.0,
  },
  {
    train_no: "15906", train_name: "Vivek Express",
    source: "Dibrugarh (DBRG)", destination: "Kanyakumari (CAPE)",
    category: "EXPRESS", distance_km: 4273,
    scheduled_arrival: "19:30", scheduled_departure: "20:00",
    current_station: "Bhubaneswar (BBS)", next_station: "Visakhapatnam (VSKP)",
    current_speed_kmph: 95.0,
    gps: { lat: 20.2961, lon: 85.8245, heading: 215 },
    signal_aspect: "CAUTION",
    base_delay_min: 62,
    weather_penalty_min: 25, congestion_penalty_min: 10, tsr_penalty_min: 0, cascade_penalty_min: 0,
    ml_confidence_pct: 76,
    route_sections: ["DBRG-GHY-082", "GHY-KGP-044", "KGP-BBS-066", "BBS-CAPE-120"],
    corridor: "DBRG-CAPE", weather: "RAIN", visibility_km: 1.5,
  },
];

// ─── Active Temporary Speed Restrictions ─────────────────────
const ACTIVE_TSRS = [
  {
    tsr_id: "TSR-NDLS-CNB-001",
    section: "New Delhi – Kanpur (CNB-084)",
    from_km: 412.2, to_km: 438.6,
    normal_speed_kmph: 130, restricted_speed_kmph: 30,
    reason: "Ballast Tamping (Deep CSM-09/3X) — P-Way maintenance",
    duration_min: 240, active_since: "01:30 IST", expires_at: "05:30 IST",
    affected_trains: ["12301", "12377", "12229"], eta_penalty_min: 18,
  },
  {
    tsr_id: "TSR-NGP-BPQ-002",
    section: "Nagpur – Balharshah (BPQ-042)",
    from_km: 882.4, to_km: 898.7,
    normal_speed_kmph: 110, restricted_speed_kmph: 20,
    reason: "Rail Renewal — Continuous Welded Rail stress elimination",
    duration_min: 180, active_since: "02:00 IST", expires_at: "05:00 IST",
    affected_trains: ["22832", "12604"], eta_penalty_min: 22,
  },
  {
    tsr_id: "TSR-GWL-MTJ-003",
    section: "Gwalior – Mathura (MTJ-038)",
    from_km: 108.5, to_km: 118.2,
    normal_speed_kmph: 110, restricted_speed_kmph: 50,
    reason: "Bridge Inspection — Post-monsoon girder examination",
    duration_min: 120, active_since: "03:00 IST", expires_at: "05:00 IST",
    affected_trains: ["12002", "12238"], eta_penalty_min: 12,
  },
  {
    tsr_id: "TSR-MAS-GTL-004",
    section: "Chennai – Guntakal (GTL-072)",
    from_km: 222.0, to_km: 231.5,
    normal_speed_kmph: 100, restricted_speed_kmph: 40,
    reason: "Track Circuit Replacement — S&T signaling upgrade",
    duration_min: 150, active_since: "00:30 IST", expires_at: "03:00 IST",
    affected_trains: ["12604", "15906"], eta_penalty_min: 10,
  },
];

// ─── Cascading Delay Chains ──────────────────────────────────
const CASCADE_CHAINS = [
  {
    chain_id: "CAS-001",
    root_train_no: "12301", root_train_name: "Rajdhani Express",
    root_delay_min: 43,
    reason: "Dense Fog (Visibility 300m) on NDLS-CNB corridor",
    chain: [
      {
        train_no: "12377", train_name: "Garib Rath Express",
        forced_action: "Held at Kanpur Loop Line (Platform 3)",
        wait_min: 22, eta_push_min: 22, category: "GARIB_RATH",
      },
      {
        train_no: "12229", train_name: "Lucknow Mail",
        forced_action: "Speed restricted to 60 km/h on CNB-NDLS section",
        wait_min: 0, eta_push_min: 12, category: "MAIL",
      },
    ],
  },
  {
    chain_id: "CAS-002",
    root_train_no: "22832", root_train_name: "Prasanthi Express",
    root_delay_min: 30,
    reason: "TSR on NGP-BPQ section (Rail Renewal — speed limited to 20 km/h)",
    chain: [
      {
        train_no: "15029", train_name: "Gorakhpur-Pune Exp",
        forced_action: "Held at Wardha crossing loop",
        wait_min: 28, eta_push_min: 28, category: "EXPRESS",
      },
    ],
  },
];

// ─── Weather & Corridor Lookup Tables ───────────────────────
const WEATHER_DELAY_TABLE = {
  FOG:   { avg_delay_min: 38, label: "Dense Fog (<1km vis)", delay_factor: 2.1 },
  RAIN:  { avg_delay_min: 22, label: "Heavy Rainfall", delay_factor: 1.4 },
  HAZE:  { avg_delay_min: 14, label: "Haze / Low Visibility", delay_factor: 1.2 },
  CLEAR: { avg_delay_min: 8,  label: "Clear Conditions", delay_factor: 1.0 },
};

const CORRIDOR_DELAY_TABLE = [
  { corridor: "NDLS-HWH",  label: "Delhi–Howrah (Grand Chord)",       avg_delay_min: 42 },
  { corridor: "NDLS-MUM",  label: "Delhi–Mumbai (West Central)",       avg_delay_min: 28 },
  { corridor: "NDLS-MAS",  label: "Delhi–Chennai (South Central)",     avg_delay_min: 35 },
  { corridor: "NDLS-LKO",  label: "Delhi–Lucknow (NR)",               avg_delay_min: 15 },
  { corridor: "NDLS-RKMP", label: "Delhi–Bhopal (Central)",           avg_delay_min: 19 },
  { corridor: "MAS-HYD",   label: "Chennai–Hyderabad (SCR)",          avg_delay_min: 24 },
  { corridor: "DBRG-CAPE", label: "Dibrugarh–Kanyakumari (NF/SR)",   avg_delay_min: 68 },
  { corridor: "GKP-PUNE",  label: "Gorakhpur–Pune (NR/CR)",           avg_delay_min: 55 },
];

// ─── Async Mock API Functions ─────────────────────────────────

async function fetchLiveTelemetry(trainNo) {
  await new Promise(r => setTimeout(r, 200));
  const train = LIVE_TRAIN_REGISTRY.find(t => t.train_no === trainNo);
  if (!train) return null;
  const latDrift = (Math.random() - 0.5) * 0.002;
  const lonDrift = (Math.random() - 0.5) * 0.002;
  const speedJitter = (Math.random() - 0.5) * 4;
  return {
    ...train,
    gps: {
      lat: parseFloat((train.gps.lat + latDrift).toFixed(6)),
      lon: parseFloat((train.gps.lon + lonDrift).toFixed(6)),
      heading: train.gps.heading,
    },
    current_speed_kmph: Math.max(20, Math.round((train.current_speed_kmph + speedJitter) * 10) / 10),
    fetched_at: new Date().toISOString(),
    source: "ISRO-RTIS-v2",
  };
}

async function predictDynamicETA(trainNo) {
  await new Promise(r => setTimeout(r, 350));
  const train = LIVE_TRAIN_REGISTRY.find(t => t.train_no === trainNo);
  if (!train) return null;
  const total_delay = train.base_delay_min + train.weather_penalty_min
    + train.congestion_penalty_min + train.tsr_penalty_min + train.cascade_penalty_min;
  const [sh, sm] = train.scheduled_arrival.split(":").map(Number);
  const etaMinutes = (sh * 60 + sm) + total_delay;
  const etaH = Math.floor(etaMinutes / 60) % 24;
  const etaM = etaMinutes % 60;
  const dynamic_eta = `${String(etaH).padStart(2,"0")}:${String(etaM).padStart(2,"0")}`;
  return {
    train_no: train.train_no, train_name: train.train_name,
    scheduled_arrival: train.scheduled_arrival, dynamic_eta,
    delta_min: total_delay, confidence_pct: train.ml_confidence_pct,
    breakdown: {
      base_delay_min: train.base_delay_min,
      weather_penalty_min: train.weather_penalty_min,
      congestion_penalty_min: train.congestion_penalty_min,
      tsr_penalty_min: train.tsr_penalty_min,
      cascade_penalty_min: train.cascade_penalty_min,
      total_delay_min: total_delay,
    },
    weather: train.weather, visibility_km: train.visibility_km,
    current_station: train.current_station,
    model: "GBM-ETA-v3.2 | ISRO-RTIS | NWSF-Weather",
  };
}

async function fetchActiveTSRs() {
  await new Promise(r => setTimeout(r, 150));
  return ACTIVE_TSRS;
}

async function fetchCascadeNetwork() {
  await new Promise(r => setTimeout(r, 200));
  return CASCADE_CHAINS;
}

async function fetchAllETAs() {
  await new Promise(r => setTimeout(r, 300));
  return LIVE_TRAIN_REGISTRY.map(train => {
    const total_delay = train.base_delay_min + train.weather_penalty_min
      + train.congestion_penalty_min + train.tsr_penalty_min + train.cascade_penalty_min;
    const [sh, sm] = train.scheduled_arrival.split(":").map(Number);
    const etaMinutes = (sh * 60 + sm) + total_delay;
    const etaH = Math.floor(etaMinutes / 60) % 24;
    const etaM = etaMinutes % 60;
    return { ...train, total_delay_min: total_delay, dynamic_eta: `${String(etaH).padStart(2,"0")}:${String(etaM).padStart(2,"0")}` };
  });
}

const LIVE_TRAIN_MAP = new Map(LIVE_TRAIN_REGISTRY.map(t => [t.train_no, t]));

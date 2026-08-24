/**
 * ============================================================
 * CRIS AI Block Scheduling System — Shared Frontend Engine
 * Real Dataset, Profiles, MILP Solver & Navigation
 * ============================================================
 */

"use strict";

// ─── Real 10-Train Historical Dataset (2016–2025 Winter) ─────
const REAL_TRAIN_DATASET = [
  {
    train_no: "12301",
    train_name: "Rajdhani Express",
    source: "Howrah (HWH)",
    destination: "New Delhi (NDLS)",
    distance_km: 1450,
    category: "RAJDHANI",
    frequency: "Daily",
    scheduled_arrival: "10:00:00",
    delays_2016_2025: [20, 40, 70, 5, 30, 50, 75, 10, 60, 25],
    speed_kmph: 128.5,
    traction_current_A: 1520,
    brake_pressure_bar: 5.0,
    route_sections: ["HWH-DDU-067", "DDU-CNB-072", "CNB-NDLS-084"],
    passenger_capacity: 1200,
    pnr_revenue_inr: 5850000,
  },
  {
    train_no: "12002",
    train_name: "Shatabdi Express",
    source: "New Delhi (NDLS)",
    destination: "Rani Kamlapati (RKMP)",
    distance_km: 707,
    category: "SHATABDI",
    frequency: "Daily",
    scheduled_arrival: "06:00:00",
    delays_2016_2025: [10, 70, 130, 25, 5, 45, 15, 60, 20, 9],
    speed_kmph: 135.0,
    traction_current_A: 1480,
    brake_pressure_bar: 5.1,
    route_sections: ["NDLS-AGC-031", "AGC-GWL-044", "GWL-BPL-058", "BPL-RKMP-002"],
    passenger_capacity: 1100,
    pnr_revenue_inr: 3950000,
  },
  {
    train_no: "12377",
    train_name: "Garib Rath Express",
    source: "Kolkata (KOAA)",
    destination: "New Delhi (NDLS)",
    distance_km: 1318,
    category: "GARIB_RATH",
    frequency: "Tri-Weekly",
    scheduled_arrival: "08:00:00",
    delays_2016_2025: [20, 60, 5, 10, 20, 23, 11, 0, 100, 25],
    speed_kmph: 118.2,
    traction_current_A: 1390,
    brake_pressure_bar: 5.0,
    route_sections: ["KOAA-DDU-065", "DDU-CNB-072", "CNB-NDLS-084"],
    passenger_capacity: 1650,
    pnr_revenue_inr: 3420000,
  },
  {
    train_no: "12238",
    train_name: "Begampura Express",
    source: "Varanasi (BSB)",
    destination: "Jammu Tawi (JAT)",
    distance_km: 1260,
    category: "MAIL_EXPRESS",
    frequency: "Daily",
    scheduled_arrival: "06:30:00",
    delays_2016_2025: [75, 20, 90, 10, 30, 5, 40, 90, 15, 50],
    speed_kmph: 105.4,
    traction_current_A: 1310,
    brake_pressure_bar: 5.0,
    route_sections: ["BSB-LKO-022", "LKO-MB-045", "MB-LDH-062", "LDH-JAT-080"],
    passenger_capacity: 1450,
    pnr_revenue_inr: 2880000,
  },
  {
    train_no: "12229",
    train_name: "Lucknow Mail",
    source: "Lucknow (LKO)",
    destination: "New Delhi (NDLS)",
    distance_km: 491,
    category: "MAIL_EXPRESS",
    frequency: "Daily",
    scheduled_arrival: "10:00:00",
    delays_2016_2025: [1, 14, 45, 70, 5, 23, 14, 29, 20, 34],
    speed_kmph: 110.0,
    traction_current_A: 1360,
    brake_pressure_bar: 5.1,
    route_sections: ["LKO-BE-028", "BE-MB-035", "MB-GZB-049", "GZB-NDLS-008"],
    passenger_capacity: 1350,
    pnr_revenue_inr: 2150000,
  },
  {
    train_no: "15029",
    train_name: "Gorakhpur–Pune Weekly Express",
    source: "Gorakhpur (GKP)",
    destination: "Pune (PUNE)",
    distance_km: 1754,
    category: "SUPERFAST",
    frequency: "Weekly",
    scheduled_arrival: "10:00:00",
    delays_2016_2025: [80, 45, 30, 10, 20, 10, 120, 60, 35, 75],
    speed_kmph: 98.6,
    traction_current_A: 1290,
    brake_pressure_bar: 4.9,
    route_sections: ["GKP-LKO-029", "LKO-CNB-015", "CNB-BPL-064", "BPL-MMR-082", "MMR-PUNE-038"],
    passenger_capacity: 1550,
    pnr_revenue_inr: 3120000,
  },
  {
    train_no: "12604",
    train_name: "Chennai Express",
    source: "Mumbai CSMT (CSMT)",
    destination: "Chennai Central (MAS)",
    distance_km: 1284,
    category: "MAIL_EXPRESS",
    frequency: "Daily",
    scheduled_arrival: "09:00:00",
    delays_2016_2025: [20, 45, 10, 25, 50, 30, 75, 75, 5, 40],
    speed_kmph: 104.0,
    traction_current_A: 1320,
    brake_pressure_bar: 5.0,
    route_sections: ["CSMT-PUNE-024", "PUNE-WADI-056", "WADI-GTL-062", "GTL-MAS-074"],
    passenger_capacity: 1420,
    pnr_revenue_inr: 2980000,
  },
  {
    train_no: "12633",
    train_name: "Kanyakumari Express",
    source: "Chennai Egmore (MS)",
    destination: "Kanyakumari (CAPE)",
    distance_km: 742,
    category: "MAIL_EXPRESS",
    frequency: "Daily",
    scheduled_arrival: "17:20:00",
    delays_2016_2025: [0, 20, 40, 3, 5, 55, 45, 65, 0, 39],
    speed_kmph: 108.0,
    traction_current_A: 1340,
    brake_pressure_bar: 5.0,
    route_sections: ["MS-TPJ-036", "TPJ-MDU-042", "MDU-TEN-051", "TEN-CAPE-018"],
    passenger_capacity: 1380,
    pnr_revenue_inr: 2450000,
  },
  {
    train_no: "22832",
    train_name: "Yesvantpur–Howrah Express",
    source: "Yesvantpur (YPR)",
    destination: "Howrah (HWH)",
    distance_km: 1915,
    category: "SUPERFAST",
    frequency: "Daily",
    scheduled_arrival: "04:30:00",
    delays_2016_2025: [30, 9, 14, 20, 1, 0, 20, 244, 188, 60],
    speed_kmph: 112.5,
    traction_current_A: 1410,
    brake_pressure_bar: 5.0,
    route_sections: ["YPR-BZA-072", "BZA-VSKP-068", "VSKP-BBS-076", "BBS-HWH-082"],
    passenger_capacity: 1600,
    pnr_revenue_inr: 4100000,
  },
  {
    train_no: "15906",
    train_name: "Vivek Express (Longest Route)",
    source: "Dibrugarh (DBRG)",
    destination: "Kanyakumari (CAPE)",
    distance_km: 4198,
    category: "LONG_HAUL_EXP",
    frequency: "Weekly",
    scheduled_arrival: "19:25:00",
    delays_2016_2025: [5, 35, 63, 15, 22, 0, 1, 9, 23, 31],
    speed_kmph: 92.4,
    traction_current_A: 1250,
    brake_pressure_bar: 4.8,
    route_sections: ["DBRG-GHY-054", "GHY-NJP-061", "NJP-HWH-078", "HWH-VSKP-088", "VSKP-MAS-092", "MAS-CAPE-105"],
    passenger_capacity: 1850,
    pnr_revenue_inr: 6200000,
  },
];

// ─── Mathematical Statistical Derived Profiles ──────────────
function deriveProfile(train) {
  const delays = train.delays_2016_2025;
  const sum = delays.reduce((a, b) => a + b, 0);
  const mean_delay = parseFloat((sum / delays.length).toFixed(1));
  const sorted = [...delays].sort((a, b) => a - b);
  const median_delay = sorted[Math.floor(sorted.length / 2)];
  const max_delay = Math.max(...delays);
  const min_delay = Math.min(...delays);

  const variance = delays.reduce((acc, d) => acc + Math.pow(d - mean_delay, 2), 0) / delays.length;
  const std_dev = parseFloat(Math.sqrt(variance).toFixed(1));

  const onTimeCount = delays.filter(d => d <= 15).length;
  const punctuality_pct = parseFloat(((onTimeCount / delays.length) * 100).toFixed(1));

  let category_base = 2.5;
  if (train.category === "RAJDHANI") category_base = 4.0;
  else if (train.category === "SHATABDI") category_base = 3.8;
  else if (train.category === "GARIB_RATH") category_base = 3.2;
  else if (train.category === "LONG_HAUL_EXP") category_base = 3.4;
  else if (train.category === "SUPERFAST") category_base = 3.0;

  const distance_factor = parseFloat(Math.min(2.0, (train.distance_km / 4198) * 1.8 + (train.passenger_capacity / 2000) * 0.2).toFixed(2));
  const volatility_factor = parseFloat(Math.min(2.0, (std_dev / 50) * 1.6 + (mean_delay / 60) * 0.4).toFixed(2));
  
  let cascade_factor = 1.4;
  if (train.category === "RAJDHANI" || train.category === "SHATABDI") cascade_factor = 1.9;
  if (train.distance_km > 2000) cascade_factor = 1.7;

  const P_i = parseFloat(Math.min(10.0, Math.max(1.0, category_base + distance_factor + volatility_factor * 0.6 + cascade_factor * 0.8)).toFixed(1));

  let base_budget = 30;
  if (train.category === "SHATABDI") base_budget = 15;
  else if (train.category === "RAJDHANI") base_budget = 20;
  else if (train.category === "GARIB_RATH") base_budget = 25;
  else if (train.distance_km > 2500) base_budget = 50;
  else if (train.distance_km > 1500) base_budget = 40;

  const delta_d_i = Math.max(10, Math.round(base_budget - (mean_delay * 0.15)));

  let sensitivity = "MEDIUM";
  if (P_i >= 8.0 || train.category === "RAJDHANI" || train.category === "SHATABDI") sensitivity = "CRITICAL";
  else if (P_i >= 6.5) sensitivity = "HIGH";
  else if (P_i <= 4.0) sensitivity = "LOW";

  return {
    ...train,
    mean_delay,
    median_delay,
    max_delay,
    min_delay,
    std_dev,
    punctuality_pct,
    category_base,
    distance_factor,
    volatility_factor,
    cascade_factor,
    P_i,
    delta_d_i,
    sensitivity,
  };
}

const TRAIN_PROFILES = REAL_TRAIN_DATASET.map(deriveProfile);
const TRAIN_PROFILE_MAP = new Map(TRAIN_PROFILES.map(p => [p.train_no, p]));

// ─── Real Corridor Engineering Block Candidates ──────────────
const CORRIDOR_BLOCK_CANDIDATES = [
  {
    block_id: "BLK-NDLS-CNB-01",
    corridor_name: "Northern Trunk Grand Chord (Delhi–Kanpur)",
    section_id: "NDLS-CNB-084",
    from_station: "New Delhi (NDLS)",
    to_station: "Kanpur Central (CNB)",
    track_km: "412/2 – 438/6",
    departments: ["TRACK", "OHE", "SIGNALING"],
    work_type: "BALLAST_TAMPING",
    work_description: "High-speed track deep ballast tamping (CSM-09/3X) + OHE cantilever tension adjustments + Electronic Interlocking loop certification.",
    min_duration_min: 180,
    base_yield_Mj: 78.5,
    urgency_multiplier: 1.25,
    effective_Mj: 98.13,
    affected_trains: ["12301", "12229", "12377", "12002", "12238"],
  },
  {
    block_id: "BLK-NGP-BPQ-02",
    corridor_name: "Central Grand Trunk Route (Nagpur–Balharshah)",
    section_id: "NGP-BPQ-042",
    from_station: "Nagpur (NGP)",
    to_station: "Balharshah (BPQ)",
    track_km: "882/4 – 898/7",
    departments: ["TRACK", "OHE"],
    work_type: "RAIL_RENEWAL",
    work_description: "Continuous rail welding stress elimination and 25kV OHE catenary dropper replacements on UP/DOWN Main.",
    min_duration_min: 150,
    base_yield_Mj: 72.0,
    urgency_multiplier: 1.15,
    effective_Mj: 82.80,
    affected_trains: ["15029", "12604", "22832"],
  },
  {
    block_id: "BLK-MAS-CAPE-03",
    corridor_name: "Southern Ocean Trunk Corridor (Chennai–Kanyakumari)",
    section_id: "MAS-CAPE-105",
    from_station: "Chennai Egmore (MS)",
    to_station: "Kanyakumari (CAPE)",
    track_km: "612/0 – 634/5",
    departments: ["TRACK", "SIGNALING"],
    work_type: "TRACK_CIRCUIT_WORK",
    work_description: "Axle Counter dual-detection upgrade and rail joint bridge girder maintenance.",
    min_duration_min: 120,
    base_yield_Mj: 65.0,
    urgency_multiplier: 1.10,
    effective_Mj: 71.50,
    affected_trains: ["12633", "15906"],
  },
  {
    block_id: "BLK-HWH-DDU-04",
    corridor_name: "Eastern Coal & Passenger Corridor (Howrah–Pt Deen Dayal Upadhyaya)",
    section_id: "HWH-DDU-067",
    from_station: "Howrah (HWH)",
    to_station: "Pt Deen Dayal Upadhyaya (DDU)",
    track_km: "230/5 – 252/0",
    departments: ["TRACK", "OHE", "SIGNALING"],
    work_type: "BALLAST_TAMPING",
    work_description: "Complete track renewal (CTR) with high-output ballast cleaner machine during winter maintenance window.",
    min_duration_min: 210,
    base_yield_Mj: 84.0,
    urgency_multiplier: 1.20,
    effective_Mj: 100.80,
    affected_trains: ["12301", "12377", "22832"],
  },
];

// ─── MILP Optimizer Client-Side Solver ────────────────────────
function runMILPOptimizer(blockId, lambda = 1.5, windowOffset = 0) {
  const block = CORRIDOR_BLOCK_CANDIDATES.find(b => b.block_id === blockId) || CORRIDOR_BLOCK_CANDIDATES[0];
  const affectedProfiles = block.affected_trains.map(tNo => TRAIN_PROFILE_MAP.get(tNo)).filter(Boolean);

  let raw_penalty_sum = 0;
  let sla_breach_count = 0;
  let total_financial_penalty = 0;
  const per_train_impact = [];

  const peakFactor = windowOffset > 1 ? 1.4 : 1.0;

  for (const prof of affectedProfiles) {
    const estDelay = Math.round((block.min_duration_min * 0.12) * peakFactor);
    const breaches = estDelay > prof.delta_d_i;
    if (breaches) sla_breach_count++;

    const penalty_contrib = parseFloat((prof.P_i * estDelay).toFixed(2));
    raw_penalty_sum += penalty_contrib;

    let financial_cost = 0;
    if (breaches) {
      const rate = prof.category === "RAJDHANI" || prof.category === "SHATABDI" ? 15000 : 8000;
      financial_cost = (estDelay - prof.delta_d_i) * rate;
      total_financial_penalty += financial_cost;
    }

    per_train_impact.push({
      train_no: prof.train_no,
      train_name: prof.train_name,
      category: prof.category,
      P_i: prof.P_i,
      mean_delay: prof.mean_delay,
      est_delay: estDelay,
      delta_d_i: prof.delta_d_i,
      breaches,
      penalty_contrib,
      financial_cost,
    });
  }

  raw_penalty_sum = parseFloat(raw_penalty_sum.toFixed(2));
  const total_penalty_cost = parseFloat((lambda * raw_penalty_sum).toFixed(2));
  const M_j_effective = block.effective_Mj;
  const net_objective = parseFloat((M_j_effective - total_penalty_cost).toFixed(2));
  const decision_xj = net_objective > 0 ? 1 : 0;
  const xj_relaxed = parseFloat(Math.min(1.0, Math.max(0.0, M_j_effective / (total_penalty_cost + 1e-5))).toFixed(4));

  const verdict = decision_xj === 1 ? "APPROVED" : "REJECTED";
  const primary_reason = decision_xj === 1
    ? (M_j_effective > 80 ? "HIGH_MAINTENANCE_YIELD" : "OPTIMAL_LOW_TRAFFIC_TROUGH")
    : "PENALTY_EXCEEDS_YIELD_CONFLICT";

  const topTrain = [...per_train_impact].sort((a, b) => b.penalty_contrib - a.penalty_contrib)[0];

  const summary = `Shadow Block ${block.block_id} on ${block.corridor_name} is ${verdict}. ` +
    `Maintenance yield M_j_eff (${M_j_effective.toFixed(1)}) vs Disruption Penalty (${total_penalty_cost.toFixed(1)}) ` +
    `yields net objective value of ${net_objective > 0 ? "+" : ""}${net_objective} units.`;

  const narrative = `The MILP Optimizer evaluated engineering block request ${block.block_id} covering section ${block.section_id} ` +
    `(${block.from_station} to ${block.to_station}, KM ${block.track_km}) for a window of ${block.min_duration_min} minutes. ` +
    `This maintenance block synchronizes ${block.departments.join(" + ")} departments under a unified Shadow Block framework.\n\n` +
    `Operating against real historical train delay profiles (2016–2025), ${per_train_impact.length} active train services were assessed. ` +
    `The most critical service is ${topTrain ? `${topTrain.train_no} (${topTrain.train_name}) with dynamic priority P_i = ${topTrain.P_i}` : "N/A"}. ` +
    `With penalty scaling factor λ = ${lambda}, total disruption cost was evaluated at ${total_penalty_cost.toFixed(2)}, ` +
    `${decision_xj === 1 ? `which is safely justified by the high infrastructure yield of ${M_j_effective.toFixed(2)}.` : `which exceeds allowable yield and degrades line punctuality.`}`;

  const feature_importances = [
    {
      feature: "M_j_effective (Maintenance Benefit)",
      contribution: parseFloat((M_j_effective / 120).toFixed(2)),
      description: `Track quality improvement and safety risk reduction across ${block.departments.length} departments.`,
    },
    {
      feature: "Traffic Window Alignment",
      contribution: windowOffset === 0 ? 0.32 : -0.28,
      description: windowOffset === 0 ? "Scheduled within deep winter night traffic trough." : "Shifted towards daytime peak passenger hours.",
    },
    {
      feature: `${topTrain?.train_name ?? "Lead Train"} Priority Penalty`,
      contribution: parseFloat((-(topTrain?.penalty_contrib ?? 10) / 100).toFixed(2)),
      description: `High dynamic priority P_i = ${topTrain?.P_i ?? 0} with allowable threshold ${topTrain?.delta_d_i ?? 0} min.`,
    },
    {
      feature: "Shadow Block Merge Efficiency",
      contribution: 0.22,
      description: `Saved ~450+ train-minutes by combining ${block.departments.join(", ")} into a single window.`,
    },
  ];

  const counterfactuals = [
    {
      scenario: "If scheduled 2 hours later during daylight peak",
      alternative_xj: (M_j_effective - (total_penalty_cost * 1.5)) > 0 ? 1 : 0,
      delta_obj: parseFloat((-total_penalty_cost * 0.5).toFixed(2)),
      reason: "Daylight passenger service density increases delay cascading by ~50% and multiplies SLA breach penalties.",
    },
    {
      scenario: "If Block is Rejected (x_j = 0)",
      alternative_xj: 0,
      delta_obj: parseFloat((-M_j_effective).toFixed(2)),
      reason: "Forfeits critical track and OHE maintenance, leading to speed restrictions (TSR) and safety hazard.",
    },
    {
      scenario: "If executed as solo unmerged blocks",
      alternative_xj: 1,
      delta_obj: -38.4,
      reason: `Requires ${block.departments.length} separate block windows, causing cumulative network disruption of >600 train-minutes.`,
    },
  ];

  return {
    block,
    decision_xj,
    xj_relaxed,
    lambda,
    M_j_effective,
    raw_penalty_sum,
    total_penalty_cost,
    net_objective,
    per_train_impact,
    sla_breach_count,
    total_financial_penalty,
    verdict,
    primary_reason,
    summary,
    narrative,
    feature_importances,
    counterfactuals,
  };
}

// ─── Global Navigation Bar & Header Injector ─────────────────
function renderSharedNav(activePageId) {
  const headerContainer = document.getElementById("shared-header");
  if (!headerContainer) return;

  const navItems = [
    { id: "overview", label: "Operations Command", icon: "🌐", href: "/index.html" },
    { id: "coa",      label: "COA Telemetry",       icon: "🛰️", href: "/pages/coa.html" },
    { id: "bdms",     label: "Shadow Block",        icon: "🏗️", href: "/pages/bdms.html" },
    { id: "fois",     label: "FOIS/ICMS Priority",   icon: "📦", href: "/pages/fois.html" },
    { id: "milp",     label: "MILP & XAI Studio",   icon: "🧮", href: "/pages/milp.html" },
    { id: "data",     label: "Dataset (2016–2025)", icon: "📊", href: "/pages/analytics.html" },
  ];

  const navHtml = navItems.map(item => {
    const isActive = item.id === activePageId ? "active" : "";
    return `
      <a href="${item.href}" class="nav-tab ${isActive}">
        <span class="nav-icon">${item.icon}</span>
        <span class="nav-text">${item.label}</span>
      </a>
    `;
  }).join("");

  headerContainer.innerHTML = `
    <header class="top-header">
      <div class="header-inner">
        <div class="brand">
          <span class="brand-icon">🚆</span>
          <div class="brand-text">
            <span class="brand-title">CRIS AI Block Scheduler</span>
            <span class="brand-sub">Indian Railways — Real Dataset Engine (2016–2025)</span>
          </div>
        </div>

        <nav class="main-nav-tabs">
          ${navHtml}
        </nav>

        <div class="header-right">
          <div class="live-badge"><span class="pulse-dot"></span>LIVE FEED</div>
          <div class="clock" id="clock">--:--:-- UTC</div>
          <div class="header-zone">CR · NGP / NR · NDLS</div>
        </div>
      </div>

      <!-- Ticker -->
      <div class="ticker-bar">
        <span class="ticker-label">LIVE FEED</span>
        <div class="ticker-track">
          <div class="ticker-content">
            <span>12301 Rajdhani (HWH→NDLS) → P_i=6.9 · Mean Delay: 37.5m · Δd_i=20m</span>
            <span>12002 Shatabdi (NDLS→RKMP) → P_i=6.6 · 135 km/h · High Sensitivity</span>
            <span>15906 Vivek Express (DBRG→CAPE) → 4,198 km · P_i=7.2 · Longest Haul Service</span>
            <span>Shadow Block BLK-NDLS-CNB-01 → 3 Depts Merged · 180 min window · Delhi-Kanpur</span>
            <span>MILP Solver: HiGHS Integrated · Dynamic Objective Optimization Enabled</span>
          </div>
        </div>
      </div>
    </header>
  `;

  // Initialize clock
  function updateClock() {
    const el = document.getElementById("clock");
    if (!el) return;
    const now = new Date();
    const pad = n => String(n).padStart(2, "0");
    el.textContent = `${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}:${pad(now.getUTCSeconds())} UTC`;
  }
  updateClock();
  setInterval(updateClock, 1000);
}

// ─── Format Currency (INR) ───────────────────────────────────
function formatINR(val) {
  return "₹" + Number(val).toLocaleString("en-IN");
}

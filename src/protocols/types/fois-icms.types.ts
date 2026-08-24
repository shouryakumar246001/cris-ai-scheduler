/**
 * ============================================================
 * FOIS & ICMS Priority Metadata Protocol
 * ============================================================
 * Provides train classification, dynamic priority weighting,
 * and cascading delay tolerance thresholds derived from FOIS
 * (Freight Operations Information System) and ICMS (Integrated
 * Coaching Management System) data feeds.
 *
 * These values are consumed by the MILP optimizer to assign
 * penalty costs during block scheduling decisions.
 * ============================================================
 */

// ─────────────────────────────────────────────────────────────
// Enumerations
// ─────────────────────────────────────────────────────────────

/**
 * Broad train category for priority classification.
 * Derived from Ministry of Railways classification rules.
 */
export enum TrainCategory {
  // ── Passenger Coaching (ICMS) ──────────────────────────────
  RAJDHANI         = "RAJDHANI",          // Premium intercity; top priority
  SHATABDI         = "SHATABDI",          // Day express; premium
  VANDE_BHARAT     = "VANDE_BHARAT",      // Semi-high speed; top priority
  DURONTO          = "DURONTO",           // Non-stop express; high priority
  GATIMAAN         = "GATIMAAN",          // Semi-high speed intercity
  TEJAS            = "TEJAS",             // Premium; operated by IRCTC
  SUPERFAST        = "SUPERFAST",         // Average speed >55 km/h
  MAIL_EXPRESS     = "MAIL_EXPRESS",      // Standard long-distance express
  PASSENGER        = "PASSENGER",         // Local/slow stopping service
  EMU_MEMU         = "EMU_MEMU",          // Electric/Mainline EMU suburban
  SPECIAL_TRAIN    = "SPECIAL_TRAIN",     // Festival/extra specials
  // ── Freight (FOIS) ─────────────────────────────────────────
  BOXN_COAL        = "BOXN_COAL",         // Coal rake (BOXN wagons)
  BCN_CEMENT       = "BCN_CEMENT",        // Cement rake (BCN wagons)
  BTPN_POL         = "BTPN_POL",          // Petroleum/Oil rake (BTPN)
  CONTAINER        = "CONTAINER",         // Container train (Flexi-deck)
  PARCEL_VAN       = "PARCEL_VAN",        // High-speed parcel van train
  TIME_TABLED_FREIGHT = "TIME_TABLED_FREIGHT", // Scheduled freight (TT)
  GOODS_SPECIAL    = "GOODS_SPECIAL",     // Special freight movement order
  LIGHT_ENGINE     = "LIGHT_ENGINE",      // Loco movement without consist
}

/**
 * Service sensitivity classification for cascading delay impact.
 * Determines how strongly a delay compounds across the network.
 */
export enum DelaySensitivity {
  /**
   * Delay has very high cascading impact (e.g., Rajdhani, Vande Bharat).
   * Any delay triggers passenger SLA compensation and media visibility.
   */
  CRITICAL   = "CRITICAL",

  /**
   * Delay cascades moderately (e.g., Mail/Express connecting passengers).
   */
  HIGH       = "HIGH",

  /**
   * Delay has limited cascade (e.g., local passenger, freight).
   */
  MEDIUM     = "MEDIUM",

  /**
   * Delay is acceptable within operational norms (e.g., goods specials).
   */
  LOW        = "LOW",

  /**
   * Delay is operationally inconsequential for planning purposes.
   */
  NEGLIGIBLE = "NEGLIGIBLE",
}

/**
 * Commodity type for freight trains (FOIS RFTMS classification).
 * Used to assess economic priority weight.
 */
export enum FreightCommodityType {
  COAL              = "COAL",
  STEEL             = "STEEL",
  CEMENT            = "CEMENT",
  PETROLEUM_OIL     = "PETROLEUM_OIL",
  FERTILIZER        = "FERTILIZER",
  FOODGRAIN         = "FOODGRAIN",
  CONTAINER_GENERAL = "CONTAINER_GENERAL",
  CONTAINER_REEFER  = "CONTAINER_REEFER",    // Temperature-controlled
  PARCEL            = "PARCEL",
  AUTOMOBILE        = "AUTOMOBILE",
  DEFENSE_MATERIAL  = "DEFENSE_MATERIAL",    // Strategic; very high priority
  NOT_APPLICABLE    = "NOT_APPLICABLE",      // Passenger trains
}

/**
 * Regulatory flags that mandate elevated priority irrespective of schedule.
 */
export enum RegulatoryMandateFlag {
  MOD_MOVEMENT       = "MOD_MOVEMENT",    // Ministry of Defence special movement
  PRESIDENTIAL_TRAIN = "PRESIDENTIAL_TRAIN",
  DISASTER_RELIEF    = "DISASTER_RELIEF", // NDRF / flood/cyclone relief
  HOSPITAL_TRAIN     = "HOSPITAL_TRAIN",
  ELECTION_SPECIAL   = "ELECTION_SPECIAL",
  NONE               = "NONE",
}

// ─────────────────────────────────────────────────────────────
// Sub-interfaces
// ─────────────────────────────────────────────────────────────

/**
 * Passenger load and revenue metrics from ICMS PNR data.
 * Relevant for computing human-impact penalty weight.
 */
export interface ICMSPassengerMetrics {
  /** Total passenger count on board (all classes) */
  total_passengers: number;

  /** Confirmed reservation count */
  confirmed_reservations: number;

  /** Wait-listed passengers who may be impacted */
  waitlisted_passengers: number;

  /** Senior citizen / differently-abled passengers (special impact weight) */
  priority_passengers: number;

  /** Ticket revenue of this service in Indian Rupees (₹) */
  ticket_revenue_inr: number;

  /** Number of connecting train dependencies (for cascade simulation) */
  connecting_train_dependencies: number;

  /**
   * Whether any passengers have time-sensitive onward connections
   * (e.g., catching a flight — detected via co-booking analytics).
   */
  has_flight_connections: boolean;
}

/**
 * Freight load and economic metrics from FOIS.
 * Used for economic penalty calculation in the MILP model.
 */
export interface FOISFreightMetrics {
  /** Type of commodity being transported */
  commodity_type: FreightCommodityType;

  /** Gross tonnage of the rake */
  gross_tonnage: number;

  /** Number of wagons in the consist */
  wagon_count: number;

  /** Freight revenue of this service in Indian Rupees (₹) */
  freight_revenue_inr: number;

  /**
   * Whether this freight has a committed delivery time (CDT).
   * CDT breach attracts penalty from shipper SLA.
   */
  has_committed_delivery_time: boolean;

  /** CDT deadline (ISO-8601 UTC). Null if not applicable. */
  committed_delivery_time: string | null;

  /**
   * Demurrage cost per hour of delay (₹/hour).
   * Applicable when goods are time-sensitive (petroleum, perishables).
   */
  demurrage_cost_per_hour_inr: number;

  /**
   * Downstream industrial impact: plants/facilities that will be
   * starved if this freight is delayed beyond threshold.
   * Examples: "NTPC Vindhyachal", "JSW Steel Dolvi"
   */
  downstream_industrial_impact: string[];
}

/**
 * Dynamic priority weight P_i for train i.
 *
 * The weight P_i ∈ (0, 10] is computed by the AI priority engine
 * as a composite of train category, load, revenue, mandate flags,
 * and cascading network impact. Higher P_i = higher penalty cost
 * when the train is delayed.
 *
 * Formula (simplified):
 *   P_i = α·CategoryBase + β·LoadFactor + γ·CascadeFactor + δ·MandateFactor
 *   where α+β+γ+δ = 1 (normalized weights)
 */
export interface DynamicPriorityWeight {
  /**
   * Final computed P_i value (0.0 – 10.0).
   * This is the value directly consumed by the MILP cost function.
   */
  P_i: number;

  /** Base priority score from train category classification (0.0 – 4.0) */
  category_base_score: number;

  /** Load/revenue factor contribution (0.0 – 2.0) */
  load_factor_score: number;

  /** Cascade network impact factor (0.0 – 2.0) */
  cascade_factor_score: number;

  /** Regulatory mandate factor (0.0 – 2.0); 2.0 if MOD/Presidential */
  mandate_factor_score: number;

  /** Weight coefficients used in this computation (must sum to 1.0) */
  coefficients: {
    alpha: number;  // Category weight
    beta:  number;  // Load/revenue weight
    gamma: number;  // Cascade weight
    delta: number;  // Mandate weight
  };

  /** ISO-8601 UTC timestamp when P_i was last recomputed */
  computed_at: string;

  /** Whether P_i was manually overridden by a DRM/Control Office */
  is_manual_override: boolean;

  /** Reason for manual override, if applicable */
  override_reason: string | null;
}

/**
 * Maximum permissible cascading delay threshold Δd_i (minutes).
 *
 * Δd_i is the total delay budget that train i can absorb before
 * the delay penalty term becomes significant in the MILP objective.
 * The AI derives this from schedule buffers, connectivity slack,
 * and service class SLA definitions.
 */
export interface CascadingDelayThreshold {
  /**
   * Maximum permissible total delay in minutes (Δd_i).
   * If a block causes delay > Δd_i, the penalty cost spikes.
   */
  delta_d_i_minutes: number;

  /** Schedule buffer already built into the timetable (minutes) */
  timetable_buffer_min: number;

  /**
   * Additional slack from previous early running or recovery margins
   * (positive = train is running ahead of time).
   */
  current_running_margin_min: number;

  /**
   * Delay already accumulated in this trip (minutes).
   * Effective budget = delta_d_i_minutes - already_delayed_min.
   */
  already_delayed_min: number;

  /**
   * Effective remaining delay budget (delta_d_i_minutes - already_delayed_min).
   * This is the ACTIVE threshold used by the MILP optimizer.
   */
  effective_remaining_budget_min: number;

  /** Sensitivity classification based on the threshold value */
  sensitivity: DelaySensitivity;

  /**
   * Whether a delay beyond Δd_i triggers an automatic escalation
   * to the Divisional Control Room.
   */
  escalation_on_breach: boolean;

  /**
   * SLA penalty payable by Railways per minute of delay beyond Δd_i (₹/min).
   * Used as the financial component of MILP penalty function.
   */
  sla_penalty_per_min_inr: number;
}

// ─────────────────────────────────────────────────────────────
// Root Protocol Interface
// ─────────────────────────────────────────────────────────────

/**
 * FOIS & ICMS Priority Metadata Protocol — Root Payload
 *
 * Published to topic: `cris.fois-icms.priority-metadata.v2`
 * Consumed by: MILP Optimizer, Block Scheduler AI, DRM Dashboard
 *
 * This protocol enriches each train with priority and delay-threshold
 * metadata required by the MILP objective function:
 *
 *   minimize: Σ_j (M_j · x_j) - λ · Σ_i (P_i · Δd_i)
 */
export interface FOISICMSPriorityPayload {
  /** Protocol version */
  protocol_version: "FOIS-ICMS-2.0";

  /** UUID v4 of this event */
  event_id: string;

  /** ISO-8601 UTC creation timestamp */
  created_at: string;

  /** Source system that generated this payload */
  source_system: "FOIS" | "ICMS" | "HYBRID";

  // ── Train Identity ──────────────────────────────────────────

  /** 5-digit IR train number */
  train_number: string;

  /** Train name */
  train_name: string;

  /** Running date (YYYY-MM-DD) */
  running_date: string;

  // ── Classification ──────────────────────────────────────────

  /** Primary train category tag */
  train_category: TrainCategory;

  /**
   * Whether this is a passenger coaching service (ICMS domain).
   * If false, freight fields are populated (FOIS domain).
   */
  is_coaching_service: boolean;

  /** Any active regulatory mandate flag that mandates elevated priority */
  regulatory_mandate: RegulatoryMandateFlag;

  // ── Domain-specific Metrics ──────────────────────────────────

  /**
   * Passenger metrics from ICMS.
   * Null for freight trains.
   */
  passenger_metrics: ICMSPassengerMetrics | null;

  /**
   * Freight metrics from FOIS.
   * Null for coaching/passenger trains.
   */
  freight_metrics: FOISFreightMetrics | null;

  // ── MILP Inputs ──────────────────────────────────────────────

  /**
   * Dynamic priority weight P_i for this train.
   * Used in the MILP penalty term: λ · P_i · Δd_i
   */
  priority_weight: DynamicPriorityWeight;

  /**
   * Cascading delay threshold Δd_i for this train.
   * Represents the maximum tolerable delay before significant penalty.
   */
  delay_threshold: CascadingDelayThreshold;

  /**
   * The section IDs this train is expected to traverse within
   * the block planning horizon (next 4 hours).
   * Used to identify which trains are AFFECTED by a given block.
   */
  upcoming_sections: string[];

  /**
   * Estimated entry time into the affected block section (ISO-8601 UTC).
   * Null if the train is not expected to enter any blocked section.
   */
  section_entry_estimate: string | null;

  // ── Metadata ─────────────────────────────────────────────────

  /**
   * TTL for this payload in seconds.
   * Priority data becomes stale and must be recomputed.
   */
  ttl_seconds: number;
}

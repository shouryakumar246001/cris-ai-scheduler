/**
 * ============================================================
 * MILP Optimizer & XAI Output Protocol
 * ============================================================
 * Defines the schema for the AI optimization engine's response
 * after solving the Mixed-Integer Linear Program (MILP) for
 * block scheduling. Includes binary decision variables, yield
 * calculations, penalty costs, and XAI audit logs.
 *
 * Mathematical Model:
 *   Objective:
 *     maximize:  Σ_j [ M_j · x_j ] - λ · Σ_i [ P_i · Δd_i · z_i ]
 *
 *   Subject to:
 *     x_j ∈ {0, 1}          ∀j (binary decision per block candidate j)
 *     z_i ∈ {0, 1}          ∀i (1 if train i is delayed by chosen blocks)
 *     Capacity constraints  (no overlapping blocks on same section)
 *     Time-window constraints
 *     Dependency constraints (OHE + Track sync requirements)
 *
 * Integrated with: BDMS, FOIS-ICMS Priority Layer, CRIS TMS
 * ============================================================
 */

// ─────────────────────────────────────────────────────────────
// Enumerations
// ─────────────────────────────────────────────────────────────

/**
 * Final decision outcome for a block candidate.
 */
export enum BlockDecision {
  APPROVED           = "APPROVED",           // Block granted (x_j = 1)
  REJECTED           = "REJECTED",           // Block denied (x_j = 0)
  CONDITIONALLY_APPROVED = "CONDITIONALLY_APPROVED", // Approved with constraints
  DEFERRED           = "DEFERRED",           // Pushed to next planning cycle
}

/**
 * Reason category for the block decision (used by XAI).
 */
export enum DecisionReasonCode {
  // Approval reasons
  LOW_TRAFFIC_WINDOW     = "LOW_TRAFFIC_WINDOW",      // Trough traffic period
  HIGH_MAINTENANCE_YIELD = "HIGH_MAINTENANCE_YIELD",  // M_j justified cost
  SHADOW_BLOCK_EFFICIENT = "SHADOW_BLOCK_EFFICIENT",  // Multi-dept merge gain
  SAFETY_CRITICAL_WORK   = "SAFETY_CRITICAL_WORK",    // Safety priority override
  MEETS_ALL_CONSTRAINTS  = "MEETS_ALL_CONSTRAINTS",   // Standard approval
  // Rejection reasons
  HIGH_PRIORITY_CONFLICT = "HIGH_PRIORITY_CONFLICT",  // Rajdhani/VB conflict
  PENALTY_EXCEEDS_YIELD  = "PENALTY_EXCEEDS_YIELD",   // λ·ΣP_i·Δd_i > M_j
  CAPACITY_CONSTRAINT    = "CAPACITY_CONSTRAINT",      // Section cannot support
  ADJACENT_BLOCK_CONFLICT = "ADJACENT_BLOCK_CONFLICT",// Overlaps adjacent block
  TIME_WINDOW_INFEASIBLE = "TIME_WINDOW_INFEASIBLE",  // No feasible window
  APPROVAL_CHAIN_INCOMPLETE = "APPROVAL_CHAIN_INCOMPLETE", // Missing DRM/CE sign
  // Conditional / Deferred reasons
  PARTIAL_WINDOW_GRANTED = "PARTIAL_WINDOW_GRANTED",  // Shorter than requested
  RESCHEDULED_NEXT_CYCLE = "RESCHEDULED_NEXT_CYCLE",  // Better slot tomorrow
  MANDATE_OVERRIDE       = "MANDATE_OVERRIDE",         // MOD/Presidential overrides
}

/**
 * Solver engine used to compute the MILP solution.
 */
export enum SolverEngine {
  GLPK    = "GLPK",    // GNU Linear Programming Kit (open-source)
  CPLEX   = "CPLEX",   // IBM ILOG CPLEX (enterprise)
  GUROBI  = "GUROBI",  // Gurobi Optimizer (enterprise)
  SCIP    = "SCIP",    // SCIP Optimization Suite
  HIGHS   = "HIGHS",   // HiGHS Solver (open-source)
  CUSTOM  = "CUSTOM",  // In-house Railways AI solver
}

/**
 * XAI explanation depth level.
 */
export enum XAIExplanationDepth {
  BRIEF     = "BRIEF",    // 1-2 sentence human summary
  STANDARD  = "STANDARD", // Full factor breakdown
  TECHNICAL = "TECHNICAL",// Full MILP variable dump + solver trace
}

// ─────────────────────────────────────────────────────────────
// Sub-interfaces
// ─────────────────────────────────────────────────────────────

/**
 * Binary decision variable record for a single block candidate j.
 *
 * x_j ∈ {0, 1}:
 *   x_j = 1 → Block candidate j is APPROVED and scheduled
 *   x_j = 0 → Block candidate j is REJECTED / not scheduled
 */
export interface BinaryDecisionVariable {
  /**
   * Block candidate identifier (references BDMS request_id or
   * Shadow Block shadow_block_id).
   */
  block_candidate_id: string;

  /**
   * x_j — the binary decision variable value.
   * 1 = approved, 0 = rejected.
   */
  x_j: 0 | 1;

  /**
   * LP relaxation value before integrality was enforced (0.0 – 1.0).
   * Values close to 0.5 indicate difficult tradeoff (high sensitivity).
   */
  x_j_relaxed: number;

  /**
   * Sensitivity range: how much M_j would need to change to flip x_j.
   * Expressed as delta in maintenance yield units.
   */
  sensitivity_range: number;

  /** Final decision classification */
  decision: BlockDecision;

  /**
   * If CONDITIONALLY_APPROVED, the constraints that were modified.
   * e.g., ["Reduced window from 4h to 2.5h", "Power block waived"]
   */
  conditions_applied: string[];
}

/**
 * Maintenance yield value M_j for block candidate j.
 *
 * M_j quantifies the operational benefit of granting block j.
 * It is a composite score reflecting:
 *   - Infrastructure condition improvement (track quality index)
 *   - Safety incident risk reduction
 *   - Asset life extension value
 *   - Compliance with maintenance schedule adherence index (MSAI)
 */
export interface MaintenanceYieldValue {
  /**
   * M_j — total maintenance yield score (dimensionless, normalized).
   * Range: 0.0 – 100.0. Higher = greater benefit to infrastructure.
   */
  M_j: number;

  /** Track quality index improvement component (0.0 – 40.0) */
  track_quality_index_gain: number;

  /** Safety risk reduction score (0.0 – 30.0) */
  safety_risk_reduction: number;

  /** Asset life extension value in equivalent rupee-years (0.0 – 20.0) */
  asset_life_extension_value: number;

  /** MSAI (Maintenance Schedule Adherence Index) compliance score (0.0 – 10.0) */
  msai_compliance_score: number;

  /**
   * Urgency multiplier (1.0 – 2.0) applied when work is overdue
   * or safety-critical. M_j_effective = M_j * urgency_multiplier.
   */
  urgency_multiplier: number;

  /**
   * M_j_effective = M_j * urgency_multiplier.
   * This is the value used in the MILP objective function.
   */
  M_j_effective: number;

  /**
   * Estimated remaining life of the asset if block is NOT granted
   * (as a depreciation indicator in months).
   */
  asset_remaining_life_if_skipped_months: number;
}

/**
 * Per-train penalty record contributed to the total penalty sum.
 *
 * For each train i affected by a block:
 *   penalty_i = P_i · delay_i (minutes of actual estimated delay)
 */
export interface TrainPenaltyRecord {
  /** Train number */
  train_number: string;

  /** Train name */
  train_name: string;

  /** Dynamic priority weight P_i for this train */
  P_i: number;

  /**
   * Estimated delay caused by this block (minutes).
   * May be less than Δd_i if the block is in a low-traffic window.
   */
  estimated_delay_min: number;

  /**
   * Whether this train's delay exceeds its threshold Δd_i.
   * True → SLA breach → higher effective penalty.
   */
  exceeds_threshold: boolean;

  /**
   * Δd_i threshold for this train (minutes).
   */
  delta_d_i_minutes: number;

  /**
   * Penalty contribution of this train: P_i · estimated_delay_min.
   */
  penalty_contribution: number;

  /**
   * Financial penalty for SLA breach (₹).
   * Zero if estimated_delay_min ≤ Δd_i.
   */
  financial_penalty_inr: number;
}

/**
 * Total penalty cost object for the MILP objective function.
 *
 * The penalty term in the objective is:
 *   λ · Σ_i (P_i · Δd_i)
 *
 * where λ is the global penalty weight parameter (set by policy).
 */
export interface TotalPenaltyCost {
  /**
   * λ — the global penalty scaling factor.
   * Policy-tunable; higher λ = more conservative (trains protected).
   * Typical range: 0.1 – 5.0.
   */
  lambda: number;

  /**
   * Raw sum Σ_i (P_i · estimated_delay_i) across all affected trains.
   */
  raw_penalty_sum: number;

  /**
   * Total penalty cost = λ · raw_penalty_sum.
   * This is the value subtracted from the MILP objective.
   */
  total_penalty_cost: number;

  /**
   * Total financial SLA penalty in ₹ (summed across all trains
   * that exceed their Δd_i thresholds).
   */
  total_financial_penalty_inr: number;

  /** Number of trains affected (z_i = 1) */
  trains_affected_count: number;

  /** Per-train breakdown of penalty contributions */
  per_train_breakdown: TrainPenaltyRecord[];

  /** Number of trains with SLA breach (delay > Δd_i) */
  sla_breach_count: number;

  /**
   * Whether this penalty exceeds the maintenance yield M_j.
   * If true, the optimizer would reject the block (x_j = 0).
   */
  penalty_exceeds_yield: boolean;
}

/**
 * Counterfactual analysis entry for XAI.
 * Explains what would have happened under an alternative decision.
 */
export interface CounterfactualScenario {
  /** Scenario label */
  scenario_label: string;       // e.g., "If block shifted by 2 hours"

  /** Alternative x_j value being considered */
  alternative_x_j: 0 | 1;

  /** Objective value change under this scenario */
  objective_delta: number;      // Positive = improvement, negative = worse

  /** Net trains delayed under this alternative */
  trains_delayed_alternative: number;

  /** Whether this alternative would breach safety constraints */
  breaches_safety: boolean;

  /** One-line explanation of why this alternative was not chosen */
  reason_not_chosen: string;
}

/**
 * Feature importance scores from the XAI model (SHAP-style).
 * Shows how much each factor contributed to the final decision.
 */
export interface XAIFeatureImportance {
  /** Feature name */
  feature: string;

  /**
   * SHAP-style contribution to the decision (positive = towards approval,
   * negative = towards rejection).
   */
  contribution: number;

  /** Human-readable explanation of this feature's role */
  explanation: string;
}

/**
 * Full Explainable AI (XAI) audit log for a block decision.
 *
 * Designed to satisfy Indian Railways' transparency requirements
 * and provide DRM / Control Office with a clear rationale for
 * every AI-driven scheduling decision.
 */
export interface XAIAuditLog {
  /**
   * One-line decision summary suitable for operator dashboards.
   * Example: "Block APPROVED — high M_j (87.3) in off-peak window;
   * penalty cost (2.14) well below yield threshold."
   */
  decision_summary: string;

  /**
   * Primary reason code for this decision.
   */
  primary_reason: DecisionReasonCode;

  /**
   * Secondary reason codes (supporting factors).
   */
  secondary_reasons: DecisionReasonCode[];

  /**
   * Depth of explanation provided.
   */
  explanation_depth: XAIExplanationDepth;

  /**
   * Full narrative explanation in structured plain English.
   * Multi-paragraph; suitable for DRM review and audit trails.
   */
  narrative: string;

  /**
   * Feature importance scores showing key decision drivers.
   * Ordered by absolute contribution (descending).
   */
  feature_importances: XAIFeatureImportance[];

  /**
   * Counterfactual scenarios evaluated by the optimizer.
   * Helps operators understand "what-if" alternatives.
   */
  counterfactuals: CounterfactualScenario[];

  /**
   * Specific trains that were the deciding factor (if any).
   * e.g., "12269 Duronto (P_i=9.2) would breach Δd_i=15min"
   */
  key_trains_cited: string[];

  /**
   * Whether a human DRM override is recommended based on
   * edge-case indicators (confidence < 0.7 or mandate flags).
   */
  human_review_recommended: boolean;

  /** Reason for human review recommendation, if applicable */
  human_review_reason: string | null;

  /**
   * Regulatory and safety compliance statement.
   * Confirms the decision aligns with IR Block Rules 2022
   * and CRIS operational guidelines.
   */
  compliance_statement: string;

  /** ISO-8601 UTC timestamp when this audit log was generated */
  generated_at: string;

  /** Version of the XAI model that produced this explanation */
  xai_model_version: string;
}

/**
 * Solver performance and convergence metadata.
 */
export interface SolverMetadata {
  /** Solver engine used */
  solver_engine: SolverEngine;

  /** Solver version string */
  solver_version: string;

  /** Wall-clock time for solver to find optimal solution (milliseconds) */
  solve_time_ms: number;

  /** Number of binary variables in the MILP formulation */
  num_binary_variables: number;

  /** Number of constraints in the formulation */
  num_constraints: number;

  /** Optimal objective value achieved */
  objective_value: number;

  /** Optimality gap (for MIP; 0.0 = proven optimal) */
  optimality_gap_pct: number;

  /** Whether the solver proved global optimality */
  is_globally_optimal: boolean;

  /** Number of branch-and-bound nodes explored */
  bb_nodes_explored: number;

  /**
   * Warm-start used (solution seeded from previous planning cycle).
   * Typically improves solve speed by 40–60%.
   */
  warm_start_used: boolean;
}

// ─────────────────────────────────────────────────────────────
// Root Protocol Interface
// ─────────────────────────────────────────────────────────────

/**
 * MILP Optimizer & XAI Output Protocol — Root Payload
 *
 * Published to topic: `cris.milp.optimizer-output.v1`
 * Consumed by: BDMS (to update block status), DRM Dashboard,
 *              TMS (to update train paths), XAI Audit Store
 *
 * This is the final authoritative output of one MILP solve cycle,
 * covering all block candidates in the current planning horizon.
 */
export interface MILPOptimizerOutputPayload {
  /** Protocol version */
  protocol_version: "MILP-XAI-1.0";

  /** UUID v4 of this optimizer run output */
  event_id: string;

  /** Reference to the Shadow Block or BDMS request being decided */
  block_candidate_id: string;

  /** ISO-8601 UTC timestamp of this optimizer output */
  generated_at: string;

  /** Planning horizon this run covers (ISO-8601 interval) */
  planning_horizon: {
    start: string;
    end:   string;
  };

  // ── Decision Variable ─────────────────────────────────────────

  /**
   * x_j — the primary binary decision variable for this block.
   * The definitive output: 1 = approved, 0 = rejected.
   */
  decision_variable: BinaryDecisionVariable;

  // ── Maintenance Yield ─────────────────────────────────────────

  /**
   * M_j — the maintenance yield value for this block candidate.
   * Represents the benefit side of the MILP tradeoff.
   */
  maintenance_yield: MaintenanceYieldValue;

  // ── Penalty Cost ──────────────────────────────────────────────

  /**
   * Total penalty cost: λ · Σ_i (P_i · Δd_i)
   * Represents the disruption cost side of the MILP tradeoff.
   */
  penalty_cost: TotalPenaltyCost;

  // ── Objective Value Summary ───────────────────────────────────

  /**
   * Net MILP objective contribution of this decision:
   *   net_objective = M_j_effective · x_j - total_penalty_cost
   *
   * Positive value → decision contributes net benefit to the system.
   */
  net_objective_value: number;

  // ── XAI Audit Log ─────────────────────────────────────────────

  /**
   * Full XAI explanation of why this decision was made.
   * This is the human-readable audit trail for governance.
   */
  xai_audit_log: XAIAuditLog;

  // ── Solver Metadata ───────────────────────────────────────────

  /** Technical metadata about the MILP solver run */
  solver_metadata: SolverMetadata;

  // ── Downstream Actions ────────────────────────────────────────

  /**
   * Automated actions triggered by this decision.
   * The scheduler publishes these to downstream systems.
   */
  downstream_actions: {
    /** Whether a caution order SMS was dispatched to loco pilots */
    caution_order_dispatched: boolean;

    /** Whether BDMS was updated with the decision */
    bdms_updated: boolean;

    /** Whether TMS received updated train path advisories */
    tms_path_advisory_sent: boolean;

    /** Whether the XAI audit log was written to the compliance store */
    audit_log_persisted: boolean;

    /** ISO-8601 UTC timestamps of each action */
    action_timestamps: Record<string, string>;
  };
}

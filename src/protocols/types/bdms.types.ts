/**
 * ============================================================
 * BDMS & Shadow Block Synchronization Protocol
 * ============================================================
 * Manages engineering block requests from multiple departments
 * (Track, OHE, Signaling) and coordinates AI-driven "Shadow Block"
 * merging to minimize line blockage windows.
 *
 * Integrated with: CRIS BDMS (Block & Disruption Management System),
 * TDMS (Train Describer & Management System).
 * ============================================================
 */

// ─────────────────────────────────────────────────────────────
// Enumerations
// ─────────────────────────────────────────────────────────────

/**
 * Railway engineering department tags.
 * Used to classify which department is requesting the block.
 */
export enum EngineeringDepartment {
  TRACK         = "TRACK",        // P-Way / Civil Engineering
  OHE           = "OHE",          // Overhead Equipment / Electrical
  SIGNALING     = "SIGNALING",    // Signal & Telecommunication (S&T)
  TRACTION      = "TRACTION",     // Traction Power / Electric Loco Shed
  TELECOM       = "TELECOM",      // Telecom / RAILTEL
  BRIDGE        = "BRIDGE",       // Bridge maintenance (sub-unit of Civil)
  CONSTRUCTION  = "CONSTRUCTION", // New line / doubling projects
}

/**
 * Priority level for engineering block requests.
 */
export enum BlockRequestPriority {
  EMERGENCY     = 1,  // Immediate safety-critical work; overrides all
  URGENT        = 2,  // Safety-adjacent; expedited scheduling
  ROUTINE       = 3,  // Planned Preventive Maintenance (PPM)
  DEFERRED      = 4,  // Low-priority improvement works
}

/**
 * Lifecycle status of a block request through the BDMS workflow.
 */
export enum BlockRequestStatus {
  SUBMITTED       = "SUBMITTED",        // Request raised by department
  PENDING_REVIEW  = "PENDING_REVIEW",   // Awaiting CRS/DRM approval
  AI_PROCESSING   = "AI_PROCESSING",    // Under Shadow Block optimizer
  APPROVED        = "APPROVED",         // Granted by block scheduler
  MERGED          = "MERGED",           // Merged into a Shadow Block
  PARTIALLY_APPROVED = "PARTIALLY_APPROVED", // Subset of window granted
  REJECTED        = "REJECTED",         // Denied by optimizer or authority
  CANCELLED       = "CANCELLED",        // Withdrawn by the department
  ACTIVE          = "ACTIVE",           // Block currently in progress
  COMPLETED       = "COMPLETED",        // Work finished, line restored
}

/**
 * Multi-track configuration on the requested section.
 */
export enum TrackConfiguration {
  SINGLE_LINE = "SINGLE_LINE",      // Only one track; both directions
  DOUBLE_LINE = "DOUBLE_LINE",      // Two tracks; separation by direction
  MULTI_LINE  = "MULTI_LINE",       // 3+ tracks (major metro corridors)
  LOOP_ONLY   = "LOOP_ONLY",        // Only loop line affected
}

/**
 * Type of engineering work requiring the block.
 */
export enum WorkType {
  // Track works
  RAIL_RENEWAL          = "RAIL_RENEWAL",
  SLEEPER_REPLACEMENT   = "SLEEPER_REPLACEMENT",
  BALLAST_TAMPING       = "BALLAST_TAMPING",
  WELD_JOINT_REPAIR     = "WELD_JOINT_REPAIR",
  LEVEL_CROSSING_WORK   = "LEVEL_CROSSING_WORK",
  // OHE works
  OHE_SECTION_UPGRADE   = "OHE_SECTION_UPGRADE",
  CATENARY_TENSION_ADJ  = "CATENARY_TENSION_ADJ",
  MAST_REPLACEMENT      = "MAST_REPLACEMENT",
  // Signaling works
  SIGNAL_INTERLOCKING   = "SIGNAL_INTERLOCKING",
  TRACK_CIRCUIT_WORK    = "TRACK_CIRCUIT_WORK",
  AXLE_COUNTER_INSTALL  = "AXLE_COUNTER_INSTALL",
  POINT_MACHINE_REPLACE = "POINT_MACHINE_REPLACE",
  // Common
  EMERGENCY_REPAIR      = "EMERGENCY_REPAIR",
  INSPECTION_BLOCK      = "INSPECTION_BLOCK",
  NEW_INFRA_WORK        = "NEW_INFRA_WORK",
}

// ─────────────────────────────────────────────────────────────
// Sub-interfaces
// ─────────────────────────────────────────────────────────────

/**
 * A single time window within which the block may be conducted.
 * The AI optimizer selects the best window from a ranked list.
 */
export interface RequestedTimeWindow {
  /** Window identifier (local ordering within this request) */
  window_id: string;

  /**
   * Requested start time (ISO-8601 UTC).
   * Should fall within a low-traffic trough per FOIS analysis.
   */
  start_time: string;

  /**
   * Requested end time (ISO-8601 UTC).
   * Defines the maximum block duration.
   */
  end_time: string;

  /** Duration in minutes (derived; must equal end_time - start_time) */
  duration_min: number;

  /**
   * Department's preference rank for this window
   * (1 = most preferred, higher = less preferred).
   */
  preference_rank: number;

  /**
   * Number of trains expected to be affected during this window
   * (pre-computed by FOIS; aids optimizer penalty calculation).
   */
  trains_affected_estimate: number;

  /**
   * Whether this window overlaps with an already-approved
   * block on an adjacent section (risk indicator).
   */
  overlaps_adjacent_block: boolean;
}

/**
 * Detailed description of the engineering work to be performed.
 */
export interface WorkDetails {
  /** Type of maintenance or construction work */
  work_type: WorkType;

  /** Free-text description of the work scope */
  work_description: string;

  /** Number of engineering staff required on the track */
  staff_count: number;

  /** List of machinery/equipment required (e.g., "Tamping Machine", "OHE Tower Wagon") */
  equipment_required: string[];

  /**
   * Minimum block duration needed to safely complete work (minutes).
   * The optimizer will not grant windows shorter than this.
   */
  min_block_duration_min: number;

  /**
   * Whether the work can be split across multiple non-contiguous
   * windows (e.g., night traffic blocks).
   */
  is_splittable: boolean;

  /**
   * If splittable, the minimum duration for each sub-block (minutes).
   */
  min_split_duration_min: number | null;

  /** Safety permit reference number from the controlling authority */
  safety_permit_ref: string;

  /**
   * Completion deadline (ISO-8601 UTC).
   * Work must be finished before this date (e.g., before monsoon season).
   */
  completion_deadline: string;
}

/**
 * Authority chain that must approve the block request.
 */
export interface ApprovalChain {
  /** Divisional Engineer (DE) who raised the request */
  raised_by_designation: string;      // e.g., "DE/Track/NGP"

  /** Employee ID of the requester */
  raised_by_emp_id: string;

  /** Divisional Railway Manager approval status */
  drm_approved: boolean;

  /** Chief Engineer approval (required for major works > 6h) */
  ce_approved: boolean | null;

  /** Commissioner of Railway Safety (CRS) concurrence if required */
  crs_concurrence: boolean | null;

  /** Timestamp of final approval (ISO-8601 UTC) */
  final_approval_timestamp: string | null;
}

// ─────────────────────────────────────────────────────────────
// Shadow Block — AI Merged Output
// ─────────────────────────────────────────────────────────────

/**
 * Synchronization flag set produced by the AI Shadow Block optimizer.
 * Indicates which departments have been co-aligned in the merged block.
 */
export interface ShadowBlockSyncFlags {
  /** Track department is included in this merged block */
  track_synced: boolean;

  /** OHE department is included in this merged block */
  ohe_synced: boolean;

  /** Signaling department is included in this merged block */
  signaling_synced: boolean;

  /** Traction department is included in this merged block */
  traction_synced: boolean;

  /** Telecom department is included in this merged block */
  telecom_synced: boolean;

  /**
   * Departments flagged as CONFLICTING and excluded from merge.
   * The AI provides reasoning in the XAI audit log.
   */
  conflicted_departments: EngineeringDepartment[];

  /**
   * Whether Power Block (OHE off) is required by at least one department.
   * Critical constraint: when true, no electric traction is possible.
   */
  power_block_required: boolean;

  /**
   * Whether a Caution Order needs to be issued on adjacent sections
   * during this block.
   */
  caution_order_on_adjacent: boolean;
}

/**
 * The AI-generated "Shadow Block" — a synthesized mega-block
 * created by merging multiple department requests that can
 * be safely conducted in a single window, minimizing line disruption.
 */
export interface ShadowBlock {
  /**
   * Unique Shadow Block identifier generated by the AI optimizer.
   * Format: SB-{ZONE}-{DATE}-{SEQ}
   * Example: "SB-CR-20240815-007"
   */
  shadow_block_id: string;

  /** IDs of all BDMS block requests merged into this Shadow Block */
  merged_request_ids: string[];

  /**
   * Number of individual department requests merged.
   */
  merged_count: number;

  /** The actual optimized start time chosen by the AI (ISO-8601 UTC) */
  optimized_start_time: string;

  /** The actual optimized end time chosen by the AI (ISO-8601 UTC) */
  optimized_end_time: string;

  /** Optimized duration in minutes (may be shorter than sum of requests) */
  optimized_duration_min: number;

  /**
   * Synchronization flags showing which departments are aligned.
   */
  sync_flags: ShadowBlockSyncFlags;

  /**
   * Estimated train-minutes saved versus individual separate blocks.
   * Positive value = efficiency gain from merging.
   */
  efficiency_gain_train_minutes: number;

  /**
   * Confidence score of the AI optimizer (0.0 – 1.0).
   * Reflects certainty in the chosen merge strategy.
   */
  optimizer_confidence: number;

  /** ISO-8601 UTC timestamp when the Shadow Block was generated */
  generated_at: string;
}

// ─────────────────────────────────────────────────────────────
// Root Protocol Interface
// ─────────────────────────────────────────────────────────────

/**
 * BDMS Shadow Block Synchronization Protocol — Root Payload
 *
 * Published to topic: `cris.bdms.block-request.v3`
 * Consumed by: AI Block Scheduler, DRM Dashboard, TDMS
 */
export interface BDMSShadowBlockPayload {
  /** Protocol version */
  protocol_version: "BDMS-3.0";

  /** UUID v4 of this protocol event */
  event_id: string;

  /** ISO-8601 UTC timestamp this message was created */
  created_at: string;

  // ── Block Request Identity ───────────────────────────────────

  /**
   * Unique BDMS block request ID (from CRIS BDMS database).
   * Format: BR-{DIVISION}-{YYYYMMDD}-{SEQ}
   * Example: "BR-NGP-20240815-042"
   */
  request_id: string;

  /** Current lifecycle status of this request */
  status: BlockRequestStatus;

  /** Priority level of this block request */
  priority: BlockRequestPriority;

  // ── Location ─────────────────────────────────────────────────

  /** Block section identifier from CRIS TDMS */
  section_id: string;             // e.g. "NGP-WR-042"

  /** From-station code */
  from_station: string;

  /** To-station code */
  to_station: string;

  /** Track configuration on this section */
  track_config: TrackConfiguration;

  /** Kilometer from/to markers defining the exact work zone */
  km_from: number;

  /** Kilometer to marker */
  km_to: number;

  // ── Departments Involved ─────────────────────────────────────

  /**
   * Primary department that owns this block request.
   */
  primary_department: EngineeringDepartment;

  /**
   * Additional departments co-requesting access to this window.
   * The AI optimizer attempts to merge these into one Shadow Block.
   */
  co_departments: EngineeringDepartment[];

  // ── Work Details ─────────────────────────────────────────────

  /** Detailed description of work to be performed */
  work_details: WorkDetails;

  // ── Time Windows ─────────────────────────────────────────────

  /**
   * Ordered list of preferred time windows for this block.
   * The AI optimizer evaluates all windows against FOIS traffic data.
   */
  requested_time_windows: RequestedTimeWindow[];

  // ── Approval Chain ───────────────────────────────────────────

  /** Approval hierarchy and status */
  approval_chain: ApprovalChain;

  // ── Shadow Block Output (AI-generated) ──────────────────────

  /**
   * The AI-generated Shadow Block result.
   * Null until the optimizer has processed this request.
   */
  shadow_block: ShadowBlock | null;

  // ── Metadata ─────────────────────────────────────────────────

  /** BDMS record version for optimistic concurrency control */
  record_version: number;

  /** Whether this payload represents a re-submission after rejection */
  is_resubmission: boolean;

  /** Reference to the previously rejected request ID, if applicable */
  previous_request_id: string | null;
}

/**
 * ============================================================
 * COA (Control Office Application) — Ingestion Protocol
 * ============================================================
 * Captures real-time telemetry from CRIS COA for live train
 * position tracking, section occupancy, and berth allocation.
 *
 * Integrated with: CRIS Train Management System (TMS),
 * Automatic Train Protection (ATP), and FOIS.
 * ============================================================
 */

// ─────────────────────────────────────────────────────────────
// Enumerations
// ─────────────────────────────────────────────────────────────

/**
 * Train operational status as reported by COA real-time feed.
 */
export enum TrainOperationalStatus {
  ON_TIME       = "ON_TIME",
  DELAYED       = "DELAYED",
  CANCELLED     = "CANCELLED",
  DIVERTED      = "DIVERTED",
  TERMINATED    = "TERMINATED",
  SPECIAL       = "SPECIAL",           // Extra / special service
  RESCHEDULED   = "RESCHEDULED",
}

/**
 * Direction of movement relative to station/section reference.
 */
export enum TrainDirection {
  UP   = "UP",    // Towards divisional headquarters
  DOWN = "DOWN",  // Away from divisional headquarters
}

/**
 * Berth assignment status in a given block section.
 */
export enum BerthStatus {
  FREE      = "FREE",
  OCCUPIED  = "OCCUPIED",
  RESERVED  = "RESERVED",  // Reserved for maintenance or special move
  BLOCKED   = "BLOCKED",   // Engineering block imposed
}

/**
 * Signal aspect at entry/exit of section.
 */
export enum SignalAspect {
  RED            = "RED",           // Stop
  YELLOW         = "YELLOW",        // Caution / prepare to stop
  DOUBLE_YELLOW  = "DOUBLE_YELLOW", // Caution / proceed at reduced speed
  GREEN          = "GREEN",         // Proceed
  FLASHING_RED   = "FLASHING_RED",  // Emergency stop
}

// ─────────────────────────────────────────────────────────────
// Sub-interfaces
// ─────────────────────────────────────────────────────────────

/**
 * GPS / ATP telemetry snapshot for a specific moment in time.
 */
export interface TrainTelemetry {
  /** Epoch timestamp of telemetry reading (milliseconds UTC) */
  timestamp_ms: number;

  /** GPS latitude (WGS-84 decimal degrees) */
  latitude: number;

  /** GPS longitude (WGS-84 decimal degrees) */
  longitude: number;

  /** Current speed in km/h as reported by loco ATP */
  speed_kmph: number;

  /** Heading in degrees (0–360) */
  heading_deg: number;

  /** Elevation above mean sea level in meters */
  elevation_msl: number;

  /** Odometer reading since trip start in km */
  odometer_km: number;

  /** Loco traction motor current (Amperes) — health indicator */
  traction_current_A: number;

  /** Brake pipe pressure (Bar) — safety parameter */
  brake_pressure_bar: number;

  /** Signal aspect observed at current section entry */
  signal_aspect: SignalAspect;

  /** Whether ATP override is active (Vigilance Control Device) */
  atp_override_active: boolean;
}

/**
 * Block section reference identifying a unique track segment.
 */
export interface BlockSectionRef {
  /** Unique Section ID as registered in CRIS TDMS */
  section_id: string;           // e.g. "NGP-WR-042"

  /** From-station code (IR standard 3–5 char) */
  from_station: string;         // e.g. "NGP"

  /** To-station code */
  to_station: string;           // e.g. "SEG"

  /** Route/Line code within the section (for multi-track) */
  line_code: string;            // e.g. "MAIN_UP", "LOOP_DOWN"

  /** Section length in kilometers */
  length_km: number;

  /** Whether this section is under CTC (Centralised Traffic Control) */
  is_ctc_section: boolean;

  /** Divisional Railway Manager zone code */
  drm_zone: string;             // e.g. "CR-NGP", "SCR-SC"
}

/**
 * Timestamp pair for a station event (arrival / departure).
 */
export interface StationTimestamp {
  /** IR station code */
  station_code: string;

  /** Station full name */
  station_name: string;

  /**
   * Scheduled arrival time (ISO-8601 UTC string).
   * Null for originating station.
   */
  scheduled_arrival: string | null;

  /**
   * Actual arrival time (ISO-8601 UTC string).
   * Null if not yet arrived.
   */
  actual_arrival: string | null;

  /**
   * Delay at arrival in minutes (positive = late, negative = early).
   * Null if actual arrival not yet recorded.
   */
  arrival_delay_min: number | null;

  /**
   * Scheduled departure time (ISO-8601 UTC string).
   * Null for terminating station.
   */
  scheduled_departure: string | null;

  /**
   * Actual departure time (ISO-8601 UTC string).
   * Null if not yet departed.
   */
  actual_departure: string | null;

  /**
   * Delay at departure in minutes.
   * Null if not yet departed.
   */
  departure_delay_min: number | null;

  /** Whether a halt was granted for crew change */
  crew_change: boolean;

  /** Whether the station is a scheduled halt or a pass-through */
  is_scheduled_halt: boolean;
}

/**
 * Berth occupancy record for a specific block section line.
 */
export interface BerthTrackingRecord {
  /** Unique berth identifier in the section */
  berth_id: string;             // e.g. "NGP-042-B1"

  /** Physical track number (1 = Main, 2 = Loop, etc.) */
  track_number: number;

  /** Current occupancy status */
  status: BerthStatus;

  /**
   * Train number currently occupying this berth.
   * Null if FREE or BLOCKED.
   */
  occupying_train_number: string | null;

  /** Time berth was last updated (ISO-8601 UTC) */
  last_updated: string;

  /**
   * Expected release time (ISO-8601 UTC).
   * Null for FREE berths.
   */
  expected_release: string | null;
}

// ─────────────────────────────────────────────────────────────
// Root Protocol Interface
// ─────────────────────────────────────────────────────────────

/**
 * COA Ingestion Protocol — Root Payload
 *
 * This is the top-level message published by the COA feed adapter
 * and consumed by the block scheduling AI engine via a Kafka topic
 * or gRPC stream (topic: `cris.coa.train-telemetry.v2`).
 */
export interface COAIngestionPayload {
  /** Protocol version string for schema evolution */
  protocol_version: "COA-2.1";

  /** UUID v4 of this specific ingestion event */
  event_id: string;

  /** Source COA node identifier */
  source_node: string;          // e.g. "COA-NGP-DIV-01"

  /** Ingestion timestamp at the COA adapter layer (ISO-8601 UTC) */
  ingested_at: string;

  // ── Train Identity ──────────────────────────────────────────

  /** Indian Railways 5-digit train number */
  train_number: string;         // e.g. "12269"

  /** Train name (from CRIS master) */
  train_name: string;           // e.g. "Duronto Express"

  /** Running date of this service (YYYY-MM-DD) */
  running_date: string;

  /** Operational status of the train at time of ingestion */
  operational_status: TrainOperationalStatus;

  /** Direction of travel */
  direction: TrainDirection;

  /** Originating station code */
  origin_station: string;

  /** Destination station code */
  destination_station: string;

  // ── Real-time Telemetry ─────────────────────────────────────

  /** Latest telemetry snapshot from loco ATP/GPS unit */
  telemetry: TrainTelemetry;

  /** Current block section the train is occupying */
  current_section: BlockSectionRef;

  // ── Station Event Log ───────────────────────────────────────

  /**
   * Historical and upcoming station timestamps.
   * Ordered chronologically from origin to destination.
   * At minimum includes last 3 stations and next 3 stations.
   */
  station_timestamps: StationTimestamp[];

  /**
   * Index into station_timestamps[] pointing to the
   * "current" (most recently passed or active) station.
   */
  current_station_index: number;

  // ── Berth Tracking ──────────────────────────────────────────

  /**
   * All berths in the CURRENT section with live occupancy data.
   * Used by the block scheduler to compute line clearance.
   */
  berth_tracking: BerthTrackingRecord[];

  // ── QoS / Metadata ──────────────────────────────────────────

  /** Message sequence number within the source node session */
  sequence_number: number;

  /** Round-trip latency from loco to COA adapter in milliseconds */
  latency_ms: number;

  /** Whether this payload was reconstructed after a connectivity gap */
  is_gap_filled: boolean;
}

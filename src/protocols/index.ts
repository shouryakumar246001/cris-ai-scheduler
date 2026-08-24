/**
 * ============================================================
 * Indian Railways AI Block Scheduling System
 * CRIS Protocol Layer — Barrel Export Index
 * ============================================================
 * Re-exports all protocol types, enums, and interfaces for
 * convenient single-import access across the codebase.
 * ============================================================
 */

// Protocol 1: COA Ingestion
export * from "./types/coa.types";

// Protocol 2: BDMS Shadow Block Synchronization
export * from "./types/bdms.types";

// Protocol 3: FOIS & ICMS Priority Metadata
export * from "./types/fois-icms.types";

// Protocol 4: MILP Optimizer & XAI Output
export * from "./types/milp-xai.types";

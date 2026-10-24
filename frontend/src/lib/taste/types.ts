/**
 * Session Taste Memory — Type Definitions
 *
 * Taste Memory is an editable, session-scoped data model that preserves
 * explicit visitor choices while strictly separating:
 * 1. Explicit general cultural interests (typed or selected)
 * 2. Cultural Compass-derived interests (with audit provenance)
 * 3. Pairwise Compass answers
 * 4. Current-outing interests (constrained to 1–5 for Discovery API)
 * 5. Practical requirements (accessibility, comfort, planning)
 * 6. Future-trip interests (saved for another outing)
 *
 * Privacy & Architectural Invariants:
 * - NO automated behavioral tracking or click profiling.
 * - NO psychological archetypes, weights, or confidence percentages.
 * - NO persistent database accounts (strictly session-scoped).
 * - NO automatic conversion of cultural tastes into accessibility requirements.
 */

import type { EvidenceAttribute } from "@/lib/api/types";
import type { PreferenceState } from "@/components/discovery/PreferenceSelector";
import type { CompassAnswers, SignalProvenance } from "@/lib/compass";

export const CURRENT_TASTE_MEMORY_VERSION = 1;

export type InterestSource = "manual" | "compass" | "spark";

/**
 * An itemized cultural interest tracked within the visitor's Taste Memory.
 */
export interface TasteInterestItem {
  /** Normalized lowercase identifier for deduplication (e.g. "textiles") */
  readonly id: string;
  /** Display title preserving original visitor casing (e.g. "Textiles") */
  readonly name: string;
  /** Origin source of this interest */
  readonly source: InterestSource;
  /** Signal provenance if derived from Cultural Compass */
  readonly provenance?: SignalProvenance;
}

export type OutingMode = "usual" | "different" | "custom";

/**
 * Structured Session Taste Memory model.
 */
export interface TasteMemory {
  /** Schema version for forward-compatible evolution and validation */
  readonly schemaVersion: number;

  /**
   * Explicit general cultural interests provided or confirmed by the visitor.
   * Kept separate from current-outing and future-outing assignments.
   */
  readonly explicitInterests: readonly string[];

  /**
   * Deterministic interests derived from Cultural Compass comparisons.
   */
  readonly compassInterests: readonly string[];

  /**
   * Complete provenance records for compass-derived signals.
   */
  readonly compassProvenance: readonly SignalProvenance[];

  /**
   * The visitor's raw pairwise compass comparison answers.
   */
  readonly compassAnswers: CompassAnswers;

  /**
   * The focused interests selected specifically for THIS outing.
   * Constrained between 1 and 5 items to satisfy the Discovery API contract.
   */
  readonly currentOutingInterests: readonly string[];

  /**
   * The active intent mode for the current outing (usual, different, custom).
   */
  readonly outingMode: OutingMode;

  /**
   * Whether the current outing is actively overriding general taste memory.
   */
  readonly isOutingOverridden: boolean;

  /**
   * Explicit practical requirements (e.g. step_free_entrance: 'mandatory').
   * Stored independently from cultural tastes.
   */
  readonly practicalRequirements: Readonly<Record<EvidenceAttribute, PreferenceState>>;

  /**
   * Cultural interests saved for a FUTURE outing, distinct from the active plan.
   */
  readonly futureTripInterests: readonly string[];

  /**
   * Explicitly dismissed or rejected interests from "Not for me" feedback.
   * Stored transparently so the visitor can inspect or reverse them at any time.
   */
  readonly excludedInterests: readonly string[];
}

export type CandidateFeedbackAction =
  | "more_like_this"
  | "not_this_trip"
  | "not_for_me"
  | "save_for_later"
  | "different_direction";


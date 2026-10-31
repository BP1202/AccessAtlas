/**
 * Cultural Compass — Deterministic Taste Signals & Aggregation Engine
 *
 * Implements a pure, deterministic mapping from explicit visitor answers to
 * normalized cultural interest signals.
 *
 * Core Invariants:
 * 1. Deterministic & Inspectable: Identical answers always produce identical signals.
 * 2. Pure aggregation: No LLMs, no random seeds, no percentage personality scores.
 * 3. Separation of Concerns: Signals are cultural interests, NEVER practical access
 *    requirements or geographic constraints.
 * 4. Transparent Provenance: Every emitted interest traces back to the specific
 *    question and choice made by the visitor.
 * 5. Manual Interest Authority: User-entered manual interests always remain authoritative
 *    and are never silently overwritten or discarded.
 * 6. API Limit Accountability: Respects the Discovery API 1-5 interest limit by flagging
 *    overflow for user curation rather than silently truncating results.
 */

import { COMPASS_QUESTIONS, getQuestionById } from "./questions";
import type {
  CompassAnswers,
  CompassChoice,
  CompassAggregationResult,
  SignalProvenance,
  CompassOptionId,
  ManualInterestMergeResult,
} from "./types";

/**
 * Maximum number of cultural interests supported by POST /api/v1/discover.
 * Matches backend Pydantic schema validation: maxItems: 5.
 */
export const MAX_DISCOVERY_INTERESTS = 5;

/**
 * Minimum number of cultural interests required by POST /api/v1/discover.
 */
export const MIN_DISCOVERY_INTERESTS = 1;

/**
 * Normalizes an interest string for case-insensitive deduplication and consistency.
 * Example: "  Textiles  " -> "Textiles"
 */
export function normalizeInterest(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  // Return canonical lowercase for matching or preserve standard casing
  return trimmed;
}

/**
 * Resolves a visitor's answer string for a question to a canonical CompassChoice.
 */
export function resolveChoice(
  questionId: string,
  rawAnswer: string | undefined
): CompassChoice | null {
  if (!rawAnswer) return null;
  const normalized = rawAnswer.trim().toLowerCase();

  if (normalized === "option_a" || normalized === "a") return "option_a";
  if (normalized === "option_b" || normalized === "b") return "option_b";
  if (normalized === "both") return "both";
  if (normalized === "neither" || normalized === "skip" || normalized === "none") return "neither";

  // Check if raw answer matches the option ID directly
  const question = getQuestionById(questionId);
  if (question) {
    if (question.optionA.id.toLowerCase() === normalized) return "option_a";
    if (question.optionB.id.toLowerCase() === normalized) return "option_b";
  }

  return null;
}

/**
 * Aggregates answers across Cultural Compass questions into a deduplicated list
 * of cultural interest signals with complete source provenance.
 *
 * This function is pure and deterministic:
 * - Identical inputs always return identical outputs.
 * - Order is stable based on catalogue sequence.
 * - Duplicates across questions are cleanly deduplicated.
 * - Traceability records which choice on which question triggered each interest.
 * - Handles both, neither, empty, and skipped questions safely.
 */
export function aggregateCompassSignals(
  answers: CompassAnswers = {}
): CompassAggregationResult {
  const provenance: SignalProvenance[] = [];
  const distinctInterests: string[] = [];
  const seenLower = new Set<string>();
  let totalQuestionsAnswered = 0;

  for (const question of COMPASS_QUESTIONS) {
    const rawAnswer = answers[question.id];
    const choice = resolveChoice(question.id, rawAnswer);

    if (!choice || choice === "neither") {
      // Skipped or answered "neither" — produces zero signals
      continue;
    }

    totalQuestionsAnswered += 1;

    // Collect options to emit signals from
    const optionsToEmit: Array<{
      optionId: CompassOptionId | "both";
      signals: readonly string[];
      rationale: string;
    }> = [];

    if (choice === "option_a") {
      optionsToEmit.push({
        optionId: question.optionA.id,
        signals: question.optionA.signals,
        rationale: `Selected "${question.optionA.label}" in comparison "${question.prompt}".`,
      });
    } else if (choice === "option_b") {
      optionsToEmit.push({
        optionId: question.optionB.id,
        signals: question.optionB.signals,
        rationale: `Selected "${question.optionB.label}" in comparison "${question.prompt}".`,
      });
    } else if (choice === "both") {
      optionsToEmit.push({
        optionId: question.optionA.id,
        signals: question.optionA.signals,
        rationale: `Selected "Both" in comparison "${question.prompt}" (including ${question.optionA.label}).`,
      });
      optionsToEmit.push({
        optionId: question.optionB.id,
        signals: question.optionB.signals,
        rationale: `Selected "Both" in comparison "${question.prompt}" (including ${question.optionB.label}).`,
      });
    }

    for (const item of optionsToEmit) {
      for (const signal of item.signals) {
        const canonical = signal.trim();
        const key = canonical.toLowerCase();

        // Record provenance regardless of deduplication to preserve complete auditability
        provenance.push({
          interest: canonical,
          sourceQuestionId: question.id,
          sourceOptionId: item.optionId,
          choice,
          rationale: item.rationale,
        });

        // Add to distinct interests if not already present
        if (!seenLower.has(key)) {
          seenLower.add(key);
          distinctInterests.push(canonical);
        }
      }
    }
  }

  const exceedsDiscoveryLimit = distinctInterests.length > MAX_DISCOVERY_INTERESTS;
  const advisories: string[] = [];

  if (exceedsDiscoveryLimit) {
    advisories.push(
      `Your responses surfaced ${distinctInterests.length} cultural interests. The Discovery API supports 1 to ${MAX_DISCOVERY_INTERESTS} interests; please review and select your top choices before submitting.`
    );
  }

  return {
    interests: distinctInterests,
    provenance,
    totalQuestionsAnswered,
    hasAnswers: totalQuestionsAnswered > 0,
    exceedsDiscoveryLimit,
    discoveryLimit: MAX_DISCOVERY_INTERESTS,
    advisories,
  };
}

/**
 * Merges compass-derived signals with a visitor's manually entered interests.
 *
 * Invariant: Manual interests are always authoritative.
 * - Manual interests appear first.
 * - Any compass signal that duplicates a manual entry is ignored.
 * - Never deletes or overwrites manual interests.
 */
export function mergeWithManualInterests(
  compassInterests: string[],
  manualInterests: string[] = []
): ManualInterestMergeResult {
  const seenLower = new Set<string>();
  const merged: string[] = [];
  const manualRetained: string[] = [];
  const compassAdded: string[] = [];

  // First, add all manual interests (authoritative)
  for (const item of manualInterests) {
    const trimmed = item.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (!seenLower.has(key)) {
      seenLower.add(key);
      merged.push(trimmed);
      manualRetained.push(trimmed);
    }
  }

  // Next, append compass interests if not already present
  for (const item of compassInterests) {
    const trimmed = item.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (!seenLower.has(key)) {
      seenLower.add(key);
      merged.push(trimmed);
      compassAdded.push(trimmed);
    }
  }

  return {
    interests: merged,
    manualInterests: manualRetained,
    compassInterestsAdded: compassAdded,
    exceedsDiscoveryLimit: merged.length > MAX_DISCOVERY_INTERESTS,
  };
}

/**
 * Architectural Boundary Guard:
 * Known practical evidence attributes from the Possibility Engine vocabulary.
 * Cultural Compass taste signals must NEVER match or emit these attributes.
 */
export const PRACTICAL_REQUIREMENT_ATTRIBUTES = [
  "step_free_entrance",
  "internal_elevator",
  "seating_available",
  "rest_areas",
  "quiet_space",
  "audio_description",
  "assistive_listening",
  "sensory_adapted_session",
  "service_animal_policy",
  "companion_entry_policy",
  "reservation_required",
  "step_free_restroom",
  "accessible_parking",
  "contact_for_access_info",
  "wheelchair_access",
] as const;

/**
 * Verification helper to ensure a signal is purely cultural and not an accessibility requirement.
 */
export function isPracticalRequirementAttribute(signal: string): boolean {
  const normalized = signal.trim().toLowerCase().replace(/[\s-]+/g, "_");
  return (PRACTICAL_REQUIREMENT_ATTRIBUTES as readonly string[]).includes(normalized);
}

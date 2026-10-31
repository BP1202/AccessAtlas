/**
 * Session Taste Memory — Pure State Functions & Invariants
 *
 * All state update functions are pure and deterministic:
 * - Return new immutable TasteMemory objects without side effects.
 * - Deduplicate interests using case-insensitive normalization.
 * - Strictly keep cultural interests separate from practical requirements.
 * - Maintain separation between general interests, current outing focus, and future trip ideas.
 */

import type { EvidenceAttribute, DiscoverRequest, ParticipationRequirement } from "@/lib/api/types";
import type { PreferenceState } from "@/components/discovery/PreferenceSelector";
import type { CompassAnswers, CompassAggregationResult } from "@/lib/compass";
import { SUPPORTED_REQUIREMENTS } from "@/lib/constants/requirements";
import { CURRENT_TASTE_MEMORY_VERSION, type TasteMemory, type OutingMode } from "./types";

/**
 * Normalizes an interest string for consistent deduplication and comparison.
 */
export function normalizeInterest(interest: string): string {
  return interest.trim().toLowerCase();
}

/**
 * Creates the initial default practical requirements map where all attributes are 'not_specified'.
 */
export function createDefaultPracticalRequirements(): Record<EvidenceAttribute, PreferenceState> {
  return SUPPORTED_REQUIREMENTS.reduce((acc, req) => {
    acc[req.attribute] = "not_specified";
    return acc;
  }, {} as Record<EvidenceAttribute, PreferenceState>);
}

/**
 * Initializes a clean, empty Taste Memory state conforming to CURRENT_TASTE_MEMORY_VERSION.
 */
export function createInitialTasteMemory(): TasteMemory {
  return {
    schemaVersion: CURRENT_TASTE_MEMORY_VERSION,
    explicitInterests: [],
    compassInterests: [],
    compassProvenance: [],
    compassAnswers: {},
    currentOutingInterests: [],
    outingMode: "usual",
    isOutingOverridden: false,
    practicalRequirements: createDefaultPracticalRequirements(),
    futureTripInterests: [],
    excludedInterests: [],
  };
}

/**
 * Adds an explicit cultural interest.
 * Returns the unmodified state if the interest is empty, too long (>100 chars),
 * or already present in explicitInterests (case-insensitive).
 */
export function addExplicitInterest(
  memory: TasteMemory,
  interest: string
): TasteMemory {
  const trimmed = interest.trim();
  if (!trimmed || trimmed.length > 100) {
    return memory;
  }

  const normalized = normalizeInterest(trimmed);
  const alreadyExists = memory.explicitInterests.some(
    (item) => normalizeInterest(item) === normalized
  );

  if (alreadyExists) {
    return memory;
  }

  return {
    ...memory,
    explicitInterests: [...memory.explicitInterests, trimmed],
  };
}

/**
 * Removes an explicit cultural interest.
 */
export function removeExplicitInterest(
  memory: TasteMemory,
  interest: string
): TasteMemory {
  const normalized = normalizeInterest(interest);
  return {
    ...memory,
    explicitInterests: memory.explicitInterests.filter(
      (item) => normalizeInterest(item) !== normalized
    ),
  };
}

/**
 * Updates an explicit practical requirement (e.g. step_free_entrance -> 'mandatory').
 * Cultural interests are NEVER touched or converted into requirements.
 */
export function updatePracticalRequirement(
  memory: TasteMemory,
  attribute: EvidenceAttribute,
  state: PreferenceState
): TasteMemory {
  return {
    ...memory,
    practicalRequirements: {
      ...memory.practicalRequirements,
      [attribute]: state,
    },
  };
}

/**
 * Integrates or revises Cultural Compass answers and derived signals.
 */
export function setCompassState(
  memory: TasteMemory,
  answers: CompassAnswers,
  aggregation?: CompassAggregationResult
): TasteMemory {
  return {
    ...memory,
    compassAnswers: { ...answers },
    compassInterests: aggregation ? [...aggregation.interests] : memory.compassInterests,
    compassProvenance: aggregation ? [...aggregation.provenance] : memory.compassProvenance,
  };
}

/**
 * Replaces the current-outing interests with a validated, deduplicated list.
 * Constrained between 0 and 5 interests per the Discovery API contract.
 */
export function setCurrentOutingInterests(
  memory: TasteMemory,
  interests: readonly string[]
): TasteMemory {
  const seen = new Set<string>();
  const deduplicated: string[] = [];

  for (const item of interests) {
    const trimmed = item.trim();
    if (!trimmed) continue;
    const normalized = normalizeInterest(trimmed);
    if (!seen.has(normalized)) {
      seen.add(normalized);
      deduplicated.push(trimmed);
    }
  }

  // Constrain to maximum 5
  const constrained = deduplicated.slice(0, 5);

  return {
    ...memory,
    currentOutingInterests: constrained,
  };
}

/**
 * Adds an interest to the current outing if not already present and limit (<5) not reached.
 */
export function addCurrentOutingInterest(
  memory: TasteMemory,
  interest: string
): TasteMemory {
  const trimmed = interest.trim();
  if (!trimmed || memory.currentOutingInterests.length >= 5) {
    return memory;
  }

  const normalized = normalizeInterest(trimmed);
  if (memory.currentOutingInterests.some((i) => normalizeInterest(i) === normalized)) {
    return memory;
  }

  return {
    ...memory,
    currentOutingInterests: [...memory.currentOutingInterests, trimmed],
  };
}

/**
 * Removes an interest from the current outing.
 */
export function removeCurrentOutingInterest(
  memory: TasteMemory,
  interest: string
): TasteMemory {
  const normalized = normalizeInterest(interest);
  return {
    ...memory,
    currentOutingInterests: memory.currentOutingInterests.filter(
      (item) => normalizeInterest(item) !== normalized
    ),
  };
}

/**
 * Adds an interest to the visitor's future-trip list.
 */
export function addFutureTripInterest(
  memory: TasteMemory,
  interest: string
): TasteMemory {
  const trimmed = interest.trim();
  if (!trimmed || trimmed.length > 100) {
    return memory;
  }

  const normalized = normalizeInterest(trimmed);
  if (memory.futureTripInterests.some((i) => normalizeInterest(i) === normalized)) {
    return memory;
  }

  return {
    ...memory,
    futureTripInterests: [...memory.futureTripInterests, trimmed],
  };
}

/**
 * Removes an interest from the future-trip list.
 */
export function removeFutureTripInterest(
  memory: TasteMemory,
  interest: string
): TasteMemory {
  const normalized = normalizeInterest(interest);
  return {
    ...memory,
    futureTripInterests: memory.futureTripInterests.filter(
      (item) => normalizeInterest(item) !== normalized
    ),
  };
}

/**
 * Moves an interest from future-trip interests into the current outing (if outing has capacity).
 */
export function moveInterestToOuting(
  memory: TasteMemory,
  interest: string
): TasteMemory {
  const withoutFuture = removeFutureTripInterest(memory, interest);
  return addCurrentOutingInterest(withoutFuture, interest);
}

/**
 * Moves an interest from the current outing into future-trip interests.
 */
export function moveInterestToFuture(
  memory: TasteMemory,
  interest: string
): TasteMemory {
  const withoutOuting = removeCurrentOutingInterest(memory, interest);
  return addFutureTripInterest(withoutOuting, interest);
}

/**
 * Applies the visitor's established usual interests to the current outing.
 * Clears any active override and marks mode as 'usual'.
 * General Taste Memory remains completely intact.
 */
export function applyUsualInterestsToOuting(memory: TasteMemory): TasteMemory {
  const source =
    memory.explicitInterests.length > 0
      ? memory.explicitInterests
      : memory.compassInterests;
  const constrained = source.slice(0, 5);

  return {
    ...memory,
    currentOutingInterests: [...constrained],
    outingMode: "usual",
    isOutingOverridden: false,
  };
}

/**
 * Sets an explicit 'Explore something different today' selection for the current outing.
 * Overrides the active outing interests while leaving general Taste Memory untouched.
 */
export function setDifferentTodayOuting(
  memory: TasteMemory,
  differentInterests: readonly string[]
): TasteMemory {
  const seen = new Set<string>();
  const deduplicated: string[] = [];

  for (const item of differentInterests) {
    const trimmed = item.trim();
    if (!trimmed) continue;
    const normalized = normalizeInterest(trimmed);
    if (!seen.has(normalized)) {
      seen.add(normalized);
      deduplicated.push(trimmed);
    }
  }

  return {
    ...memory,
    currentOutingInterests: deduplicated.slice(0, 5),
    outingMode: "different",
    isOutingOverridden: true,
  };
}

/**
 * Sets a specific target interest specifically for today's outing.
 * Overrides the active outing without altering the general Taste Memory.
 */
export function setCustomOutingInterest(
  memory: TasteMemory,
  customInterest: string
): TasteMemory {
  const trimmed = customInterest.trim();
  if (!trimmed || trimmed.length > 100) {
    return memory;
  }

  return {
    ...memory,
    currentOutingInterests: [trimmed],
    outingMode: "custom",
    isOutingOverridden: true,
  };
}

/**
 * Clears the current outing override and restores the visitor's established usual interests.
 * Leaves general Taste Memory and practical requirements completely intact.
 */
export function clearOutingOverride(memory: TasteMemory): TasteMemory {
  return applyUsualInterestsToOuting(memory);
}

/**
 * Prioritizes a specific subset of interests when more than 5 are chosen for this outing.
 * Respects the 1–5 Discovery API limit without silent data loss.
 * Leaves general Taste Memory completely intact.
 */
export function prioritizeOutingInterests(
  memory: TasteMemory,
  prioritized: readonly string[]
): TasteMemory {
  const seen = new Set<string>();
  const deduplicated: string[] = [];

  for (const item of prioritized) {
    const trimmed = item.trim();
    if (!trimmed) continue;
    const normalized = normalizeInterest(trimmed);
    if (!seen.has(normalized)) {
      seen.add(normalized);
      deduplicated.push(trimmed);
    }
  }

  return {
    ...memory,
    currentOutingInterests: deduplicated.slice(0, 5),
  };
}

/**
 * Adds an interest to the visitor's excluded interests list.
 * Removes it from explicit interests, current outing, and future trip lists.
 */
export function addExcludedInterest(
  memory: TasteMemory,
  interest: string
): TasteMemory {
  const trimmed = interest.trim();
  if (!trimmed || trimmed.length > 100) return memory;
  const normalized = normalizeInterest(trimmed);
  if (memory.excludedInterests.some((i) => normalizeInterest(i) === normalized)) {
    return memory;
  }

  const withoutExplicit = removeExplicitInterest(memory, trimmed);
  const withoutOuting = removeCurrentOutingInterest(withoutExplicit, trimmed);
  const withoutFuture = removeFutureTripInterest(withoutOuting, trimmed);

  return {
    ...withoutFuture,
    excludedInterests: [...withoutFuture.excludedInterests, trimmed],
  };
}

/**
 * Removes an interest from excluded interests, allowing it to be used or chosen again.
 */
export function removeExcludedInterest(
  memory: TasteMemory,
  interest: string
): TasteMemory {
  const normalized = normalizeInterest(interest);
  return {
    ...memory,
    excludedInterests: memory.excludedInterests.filter(
      (item) => normalizeInterest(item) !== normalized
    ),
  };
}

/**
 * "More like this": Updates only an explicitly confirmed cultural taste signal.
 * Adds confirmed interest to general taste memory and, if capacity permits, to current outing.
 * Practical requirements and existing evidence remain completely intact.
 */
export function applyMoreLikeThis(
  memory: TasteMemory,
  confirmedInterest: string
): TasteMemory {
  const withExplicit = addExplicitInterest(memory, confirmedInterest);
  const unExcluded = removeExcludedInterest(withExplicit, confirmedInterest);
  if (unExcluded.currentOutingInterests.length < 5) {
    return addCurrentOutingInterest(unExcluded, confirmedInterest);
  }
  return unExcluded;
}

/**
 * "Not this trip": Removes or deprioritizes the selected direction for the active outing.
 * Crucially preserves the visitor's general cultural interests in Taste Memory.
 * Does not treat this as a permanent dislike or exclude it globally.
 */
export function applyNotThisTrip(
  memory: TasteMemory,
  confirmedInterest: string
): TasteMemory {
  return removeCurrentOutingInterest(memory, confirmedInterest);
}

/**
 * "Not for me": Explicitly dismisses a specific confirmed cultural topic.
 * Removes the topic from active outing and general interests without downranking
 * unrelated categories or modifying practical requirements.
 */
export function applyNotForMe(
  memory: TasteMemory,
  confirmedInterest: string
): TasteMemory {
  return addExcludedInterest(memory, confirmedInterest);
}

/**
 * "Save for another outing": Adds an explicit cultural direction to future interests.
 * Leaves active outing and practical requirements unchanged.
 * Does not schedule or book any trip.
 */
export function applySaveForLater(
  memory: TasteMemory,
  confirmedInterest: string
): TasteMemory {
  return addFutureTripInterest(memory, confirmedInterest);
}

/**
 * "Show a different direction": Replaces active outing interests with new direction sparks,
 * activating an outing override while strictly preserving all practical requirements.
 */
export function applyDifferentDirection(
  memory: TasteMemory,
  newInterests: readonly string[]
): TasteMemory {
  return setDifferentTodayOuting(memory, newInterests);
}

/**
 * Resets Taste Memory back to a clean initial state.
 */
export function resetTasteMemory(): TasteMemory {
  return createInitialTasteMemory();
}

/**
 * Validates unknown or parsed JSON data against the TasteMemory schema.
 * If data is corrupt or from an unsupported schema version, safely falls back
 * to a clean default state rather than throwing runtime errors.
 */
export function validateAndMigrateTasteMemory(raw: unknown): TasteMemory {
  if (!raw || typeof raw !== "object") {
    return createInitialTasteMemory();
  }

  const candidate = raw as Record<string, unknown>;

  // Check schema version match
  if (candidate.schemaVersion !== CURRENT_TASTE_MEMORY_VERSION) {
    return createInitialTasteMemory();
  }

  const defaultReqs = createDefaultPracticalRequirements();
  const rawReqs = (candidate.practicalRequirements && typeof candidate.practicalRequirements === "object")
    ? (candidate.practicalRequirements as Record<string, unknown>)
    : {};

  const validatedReqs: Record<EvidenceAttribute, PreferenceState> = { ...defaultReqs };
  for (const req of SUPPORTED_REQUIREMENTS) {
    const val = rawReqs[req.attribute];
    if (val === "optional" || val === "mandatory" || val === "not_specified") {
      validatedReqs[req.attribute] = val;
    }
  }

  const sanitizeStringArray = (arr: unknown): string[] => {
    if (!Array.isArray(arr)) return [];
    return arr
      .filter((item): item is string => typeof item === "string" && Boolean(item.trim()))
      .map((s) => s.trim());
  };

  const rawMode = candidate.outingMode;
  const outingMode: OutingMode =
    rawMode === "different" || rawMode === "custom" || rawMode === "usual"
      ? rawMode
      : "usual";

  const isOutingOverridden = typeof candidate.isOutingOverridden === "boolean"
    ? candidate.isOutingOverridden
    : (outingMode === "different" || outingMode === "custom");

  return {
    schemaVersion: CURRENT_TASTE_MEMORY_VERSION,
    explicitInterests: sanitizeStringArray(candidate.explicitInterests),
    compassInterests: sanitizeStringArray(candidate.compassInterests),
    compassProvenance: Array.isArray(candidate.compassProvenance)
      ? candidate.compassProvenance.filter((p) => p && typeof p === "object" && "interest" in p)
      : [],
    compassAnswers: (candidate.compassAnswers && typeof candidate.compassAnswers === "object")
      ? (candidate.compassAnswers as CompassAnswers)
      : {},
    currentOutingInterests: sanitizeStringArray(candidate.currentOutingInterests).slice(0, 5),
    outingMode,
    isOutingOverridden,
    practicalRequirements: validatedReqs,
    futureTripInterests: sanitizeStringArray(candidate.futureTripInterests),
    excludedInterests: sanitizeStringArray(candidate.excludedInterests),
  };
}

/**
 * Converts the active outing preferences from TasteMemory into the existing Discovery API request contract.
 * Preserves strict boundary: Taste Memory is NOT serialized wholesale; only supported fields are emitted.
 */
export function tasteMemoryToDiscoverRequest(
  memory: TasteMemory,
  city: string = "Ahmedabad",
  maxCandidates: number = 5
): DiscoverRequest {
  const activeRequirements: ParticipationRequirement[] = Object.entries(
    memory.practicalRequirements
  )
    .filter(([, state]) => state !== "not_specified")
    .map(([attr, state]) => ({
      requirement_id: `req-${attr}`,
      attribute: attr as EvidenceAttribute,
      priority: state as "optional" | "mandatory",
      expected_value: true,
    }));

  return {
    city,
    cultural_interests: [...memory.currentOutingInterests],
    requirements: activeRequirements,
    max_candidates: maxCandidates,
  };
}

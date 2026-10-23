/**
 * Cultural Compass — Type Definitions
 *
 * Cultural Compass is an optional discovery aid that explores unexpected
 * affinities across artistic disciplines and cultural traditions.
 * It is NOT a personality test, medical assessment, or accessibility questionnaire.
 */

export type CompassQuestionId =
  | "textiles_vs_contemporary_studio"
  | "mountain_craft_village_vs_coastal_heritage_town"
  | "quiet_gallery_vs_lively_festival"
  | "traditional_techniques_vs_experimental_art"
  | "historic_architecture_vs_modern_design";

export type CompassOptionId =
  // Question 1
  | "historic_textile_workshop"
  | "contemporary_design_studio"
  // Question 2
  | "mountain_craft_village"
  | "coastal_heritage_town"
  // Question 3
  | "quiet_gallery"
  | "lively_cultural_festival"
  // Question 4
  | "traditional_making_techniques"
  | "experimental_visual_art"
  // Question 5
  | "historic_architecture"
  | "modern_design";

/**
 * Valid selection choices for each compass comparison.
 * Every question supports Option A, Option B, Both, or Neither/skip.
 */
export type CompassChoice = "option_a" | "option_b" | "both" | "neither";

/**
 * An individual option in a compass comparison.
 */
export interface CompassOption {
  /** Stable identifier for application state and deterministic mapping */
  readonly id: CompassOptionId;
  /** Human-readable display label */
  readonly label: string;
  /** Contextual description explaining the cultural reference */
  readonly description: string;
  /** Deterministic, product-authored cultural interest signals (NOT Qloo entity IDs) */
  readonly signals: readonly string[];
}

/**
 * A cultural comparison question.
 */
export interface CompassQuestion {
  /** Stable identifier */
  readonly id: CompassQuestionId;
  /** Display title/prompt */
  readonly prompt: string;
  /** Narrative context explaining the cultural comparison */
  readonly context: string;
  /** First cultural direction */
  readonly optionA: CompassOption;
  /** Second cultural direction */
  readonly optionB: CompassOption;
}

/**
 * Provenance record tracing a derived interest signal back to its source question and choice.
 */
export interface SignalProvenance {
  /** The normalized cultural interest emitted */
  readonly interest: string;
  /** The question that originated this signal */
  readonly sourceQuestionId: CompassQuestionId;
  /** The option ID or 'both' that generated the signal */
  readonly sourceOptionId: CompassOptionId | "both";
  /** The selection choice made by the visitor */
  readonly choice: CompassChoice;
  /** Human-readable explanation of why this interest was derived */
  readonly rationale: string;
}

/**
 * Map of question ID to the visitor's selection choice or option ID.
 */
export type CompassAnswers = Record<string, CompassChoice | string | undefined>;

/**
 * Result of aggregating compass question answers into cultural interest signals.
 */
export interface CompassAggregationResult {
  /**
   * Deduplicated, ordered list of normalized cultural interest strings.
   * Suitable for inspection, removal, or passing to Discovery API.
   */
  readonly interests: string[];
  /**
   * Complete provenance records for each derived signal, enabling transparent UI display.
   */
  readonly provenance: SignalProvenance[];
  /**
   * Total number of questions answered with a non-skipping selection.
   */
  readonly totalQuestionsAnswered: number;
  /**
   * Whether any non-empty answers were provided.
   */
  readonly hasAnswers: boolean;
  /**
   * Flag set to true if resulting interests exceed the Discovery API limit (5).
   * Ensures interests are not silently discarded; visitors can curate before submission.
   */
  readonly exceedsDiscoveryLimit: boolean;
  /**
   * The maximum interest count supported by the Discovery API (5).
   */
  readonly discoveryLimit: number;
  /**
   * Informative advisories for the visitor (e.g. limit notifications).
   */
  readonly advisories: string[];
}

/**
 * Result of merging compass-derived interests with manually entered interests.
 */
export interface ManualInterestMergeResult {
  /** Merged, deduplicated interest list with manual interests authoritative */
  readonly interests: string[];
  /** Explicit list of manual interests retained */
  readonly manualInterests: string[];
  /** Compass interests that were appended without duplicating manual entries */
  readonly compassInterestsAdded: string[];
  /** Whether the combined list exceeds the Discovery API limit */
  readonly exceedsDiscoveryLimit: boolean;
}

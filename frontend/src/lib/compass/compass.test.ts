import { describe, it, expect } from "vitest";
import {
  COMPASS_QUESTIONS,
  getQuestionById,
  getOptionById,
  OPTION_TO_QUESTION_MAP,
} from "./questions";
import {
  aggregateCompassSignals,
  mergeWithManualInterests,
  isPracticalRequirementAttribute,
  MAX_DISCOVERY_INTERESTS,
  PRACTICAL_REQUIREMENT_ATTRIBUTES,
} from "./signals";
import type { CompassAnswers } from "./types";

describe("Cultural Compass — Catalogue & Stable Identifiers", () => {
  it("contains 5 distinct, culturally meaningful questions", () => {
    expect(COMPASS_QUESTIONS).toHaveLength(5);
    const ids = COMPASS_QUESTIONS.map((q) => q.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(5);
  });

  it("each question has valid stable identifiers, prompts, and options", () => {
    for (const question of COMPASS_QUESTIONS) {
      expect(question.id).toBeTruthy();
      expect(question.prompt).toBeTruthy();
      expect(question.context).toBeTruthy();

      // Option A checks
      expect(question.optionA.id).toBeTruthy();
      expect(question.optionA.label).toBeTruthy();
      expect(question.optionA.description).toBeTruthy();
      expect(question.optionA.signals.length).toBeGreaterThanOrEqual(1);

      // Option B checks
      expect(question.optionB.id).toBeTruthy();
      expect(question.optionB.label).toBeTruthy();
      expect(question.optionB.description).toBeTruthy();
      expect(question.optionB.signals.length).toBeGreaterThanOrEqual(1);

      // IDs must be distinct within the question
      expect(question.optionA.id).not.toBe(question.optionB.id);
    }
  });

  it("getQuestionById resolves questions correctly", () => {
    const q1 = getQuestionById("textiles_vs_contemporary_studio");
    expect(q1).toBeDefined();
    expect(q1?.optionA.id).toBe("historic_textile_workshop");
    expect(q1?.optionB.id).toBe("contemporary_design_studio");

    const nonExistent = getQuestionById("non_existent_question");
    expect(nonExistent).toBeUndefined();
  });

  it("getOptionById resolves options within a question", () => {
    const optA = getOptionById(
      "textiles_vs_contemporary_studio",
      "historic_textile_workshop"
    );
    expect(optA).toBeDefined();
    expect(optA?.signals).toEqual(["textiles", "craft traditions"]);

    const optB = getOptionById(
      "textiles_vs_contemporary_studio",
      "contemporary_design_studio"
    );
    expect(optB).toBeDefined();
    expect(optB?.signals).toEqual(["contemporary art", "design"]);

    const invalidOpt = getOptionById(
      "textiles_vs_contemporary_studio",
      "invalid_id"
    );
    expect(invalidOpt).toBeUndefined();
  });

  it("maps all 10 options to their parent question in OPTION_TO_QUESTION_MAP", () => {
    expect(Object.keys(OPTION_TO_QUESTION_MAP)).toHaveLength(10);
    for (const [optionId, questionId] of Object.entries(OPTION_TO_QUESTION_MAP)) {
      const q = getQuestionById(questionId);
      expect(q).toBeDefined();
      expect([q?.optionA.id, q?.optionB.id]).toContain(optionId);
    }
  });
});

describe("Cultural Compass — Deterministic Signal Aggregation", () => {
  it("evaluates Option A selection", () => {
    const answers: CompassAnswers = {
      textiles_vs_contemporary_studio: "option_a",
    };
    const result = aggregateCompassSignals(answers);

    expect(result.interests).toEqual(["textiles", "craft traditions"]);
    expect(result.totalQuestionsAnswered).toBe(1);
    expect(result.hasAnswers).toBe(true);
    expect(result.provenance).toHaveLength(2);
    expect(result.provenance[0].sourceQuestionId).toBe("textiles_vs_contemporary_studio");
    expect(result.provenance[0].sourceOptionId).toBe("historic_textile_workshop");
    expect(result.provenance[0].choice).toBe("option_a");
  });

  it("evaluates Option B selection", () => {
    const answers: CompassAnswers = {
      textiles_vs_contemporary_studio: "option_b",
    };
    const result = aggregateCompassSignals(answers);

    expect(result.interests).toEqual(["contemporary art", "design"]);
    expect(result.totalQuestionsAnswered).toBe(1);
    expect(result.hasAnswers).toBe(true);
    expect(result.provenance[0].sourceOptionId).toBe("contemporary_design_studio");
  });

  it("accepts option IDs directly as answers", () => {
    const answers: CompassAnswers = {
      textiles_vs_contemporary_studio: "historic_textile_workshop",
      historic_architecture_vs_modern_design: "modern_design",
    };
    const result = aggregateCompassSignals(answers);

    expect(result.interests).toEqual([
      "textiles",
      "craft traditions",
      "modernist architecture",
      "design",
    ]);
    expect(result.totalQuestionsAnswered).toBe(2);
  });

  it("evaluates Both selection and includes signals from Option A and Option B", () => {
    const answers: CompassAnswers = {
      textiles_vs_contemporary_studio: "both",
    };
    const result = aggregateCompassSignals(answers);

    expect(result.interests).toEqual([
      "textiles",
      "craft traditions",
      "contemporary art",
      "design",
    ]);
    expect(result.totalQuestionsAnswered).toBe(1);
    expect(result.provenance).toHaveLength(4);
    expect(result.provenance.every((p) => p.choice === "both")).toBe(true);
  });

  it("evaluates Neither / skip and produces 0 signals", () => {
    const answersNeither: CompassAnswers = {
      textiles_vs_contemporary_studio: "neither",
    };
    const resultNeither = aggregateCompassSignals(answersNeither);
    expect(resultNeither.interests).toEqual([]);
    expect(resultNeither.totalQuestionsAnswered).toBe(0);
    expect(resultNeither.hasAnswers).toBe(false);
    expect(resultNeither.provenance).toHaveLength(0);

    const answersSkip: CompassAnswers = {
      textiles_vs_contemporary_studio: "skip",
    };
    const resultSkip = aggregateCompassSignals(answersSkip);
    expect(resultSkip.interests).toEqual([]);
    expect(resultSkip.totalQuestionsAnswered).toBe(0);
  });

  it("evaluates empty answers dictionary safely", () => {
    const result = aggregateCompassSignals({});
    expect(result.interests).toEqual([]);
    expect(result.provenance).toEqual([]);
    expect(result.totalQuestionsAnswered).toBe(0);
    expect(result.hasAnswers).toBe(false);
    expect(result.exceedsDiscoveryLimit).toBe(false);
    expect(result.advisories).toHaveLength(0);
  });

  it("handles unknown question keys and invalid answer values gracefully", () => {
    const answers = {
      unknown_question_123: "option_a",
      textiles_vs_contemporary_studio: "invalid_choice_xyz",
    } as unknown as CompassAnswers;

    const result = aggregateCompassSignals(answers);
    expect(result.interests).toEqual([]);
    expect(result.totalQuestionsAnswered).toBe(0);
  });

  it("deduplicates signals cleanly across multiple questions while preserving provenance", () => {
    // Question 1 Option A: ["textiles", "craft traditions"]
    // Question 4 Option A: ["craft traditions", "textiles"]
    const answers: CompassAnswers = {
      textiles_vs_contemporary_studio: "option_a",
      traditional_techniques_vs_experimental_art: "option_a",
    };

    const result = aggregateCompassSignals(answers);

    // Only 2 unique interests should be returned in distinct interests
    expect(result.interests).toEqual(["textiles", "craft traditions"]);
    expect(result.totalQuestionsAnswered).toBe(2);

    // Provenance must contain all 4 emitted records for full auditability
    expect(result.provenance).toHaveLength(4);
    expect(result.provenance.filter((p) => p.interest === "textiles")).toHaveLength(2);
    expect(result.provenance.filter((p) => p.interest === "craft traditions")).toHaveLength(2);
  });

  it("produces deterministic, stable output for identical input", () => {
    const answers: CompassAnswers = {
      textiles_vs_contemporary_studio: "option_a",
      quiet_gallery_vs_lively_festival: "option_a",
      historic_architecture_vs_modern_design: "option_b",
    };

    const result1 = aggregateCompassSignals(answers);
    const result2 = aggregateCompassSignals(answers);
    const result3 = aggregateCompassSignals(answers);

    expect(result1).toEqual(result2);
    expect(result2).toEqual(result3);
    expect(result1.interests).toEqual([
      "textiles",
      "craft traditions",
      "visual arts",
      "fine art",
      "modernist architecture",
      "design",
    ]);
  });

  it("flags exceedsDiscoveryLimit when distinct interests exceed the Discovery API limit (5) without silently discarding", () => {
    // Answering multiple questions produces more than 5 distinct interests
    const answers: CompassAnswers = {
      textiles_vs_contemporary_studio: "option_a", // textiles, craft traditions
      quiet_gallery_vs_lively_festival: "option_a", // visual arts, fine art
      historic_architecture_vs_modern_design: "option_b", // modernist architecture, design
    };

    const result = aggregateCompassSignals(answers);

    expect(result.interests).toHaveLength(6);
    expect(result.exceedsDiscoveryLimit).toBe(true);
    expect(result.discoveryLimit).toBe(MAX_DISCOVERY_INTERESTS);
    expect(result.advisories).toHaveLength(1);
    expect(result.advisories[0]).toContain("supports 1 to 5 interests");
    // Ensure interests are NOT silently truncated
    expect(result.interests).toContain("textiles");
    expect(result.interests).toContain("design");
  });
});

describe("Cultural Compass — Separation of Taste and Practical Requirements", () => {
  it("never emits any practical accessibility requirements as taste signals", () => {
    for (const question of COMPASS_QUESTIONS) {
      for (const signal of question.optionA.signals) {
        expect(isPracticalRequirementAttribute(signal)).toBe(false);
        expect(PRACTICAL_REQUIREMENT_ATTRIBUTES as readonly string[]).not.toContain(signal);
      }
      for (const signal of question.optionB.signals) {
        expect(isPracticalRequirementAttribute(signal)).toBe(false);
        expect(PRACTICAL_REQUIREMENT_ATTRIBUTES as readonly string[]).not.toContain(signal);
      }
    }
  });

  it("quiet_gallery comparison produces visual art taste, NOT sensory-access requirement", () => {
    const question = getQuestionById("quiet_gallery_vs_lively_festival");
    expect(question).toBeDefined();

    // Option A is "quiet_gallery"
    expect(question?.optionA.signals).toEqual(["visual arts", "fine art"]);
    // Must NOT contain quiet_space, sensory_adapted_session, or wheelchair_access
    expect(question?.optionA.signals).not.toContain("quiet_space");
    expect(question?.optionA.signals).not.toContain("step_free_entrance");

    const result = aggregateCompassSignals({
      quiet_gallery_vs_lively_festival: "option_a",
    });
    expect(result.interests).toEqual(["visual arts", "fine art"]);
    expect(result.interests.some((s) => isPracticalRequirementAttribute(s))).toBe(false);
  });
});

describe("Cultural Compass — Manual Interest Authority", () => {
  it("preserves manual interests as authoritative and prepends them", () => {
    const manualInterests = ["Woodblock carving", "Stepwells"];
    const compassInterests = ["textiles", "craft traditions"];

    const merged = mergeWithManualInterests(compassInterests, manualInterests);

    expect(merged.interests).toEqual([
      "Woodblock carving",
      "Stepwells",
      "textiles",
      "craft traditions",
    ]);
    expect(merged.manualInterests).toEqual(["Woodblock carving", "Stepwells"]);
    expect(merged.compassInterestsAdded).toEqual(["textiles", "craft traditions"]);
    expect(merged.exceedsDiscoveryLimit).toBe(false);
  });

  it("deduplicates compass signals against manual interests without overwriting manual ones", () => {
    const manualInterests = ["Textiles", "Miniature painting"];
    const compassInterests = ["textiles", "craft traditions"]; // "textiles" is duplicate

    const merged = mergeWithManualInterests(compassInterests, manualInterests);

    expect(merged.interests).toEqual([
      "Textiles",
      "Miniature painting",
      "craft traditions",
    ]);
    expect(merged.manualInterests).toEqual(["Textiles", "Miniature painting"]);
    expect(merged.compassInterestsAdded).toEqual(["craft traditions"]);
  });

  it("detects when merged total exceeds Discovery API limit of 5", () => {
    const manualInterests = ["Craft A", "Craft B", "Craft C", "Craft D"];
    const compassInterests = ["Craft E", "Craft F"];

    const merged = mergeWithManualInterests(compassInterests, manualInterests);

    expect(merged.interests).toHaveLength(6);
    expect(merged.exceedsDiscoveryLimit).toBe(true);
  });

  it("handles empty manual interests safely", () => {
    const compassInterests = ["textiles", "craft traditions"];
    const merged = mergeWithManualInterests(compassInterests, []);

    expect(merged.interests).toEqual(["textiles", "craft traditions"]);
    expect(merged.manualInterests).toEqual([]);
    expect(merged.compassInterestsAdded).toEqual(["textiles", "craft traditions"]);
  });
});

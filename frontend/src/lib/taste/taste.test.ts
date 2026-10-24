import { describe, it, expect, beforeEach } from "vitest";
import {
  CURRENT_TASTE_MEMORY_VERSION,
  createInitialTasteMemory,
  addExplicitInterest,
  removeExplicitInterest,
  updatePracticalRequirement,
  setCompassState,
  setCurrentOutingInterests,
  addCurrentOutingInterest,
  removeCurrentOutingInterest,
  addFutureTripInterest,
  removeFutureTripInterest,
  moveInterestToOuting,
  moveInterestToFuture,
  resetTasteMemory,
  validateAndMigrateTasteMemory,
  tasteMemoryToDiscoverRequest,
  applyUsualInterestsToOuting,
  setDifferentTodayOuting,
  setCustomOutingInterest,
  clearOutingOverride,
  prioritizeOutingInterests,
  applyMoreLikeThis,
  applyNotThisTrip,
  applyNotForMe,
  applySaveForLater,
  applyDifferentDirection,
  addExcludedInterest,
  removeExcludedInterest,
  loadTasteMemoryFromSession,
  saveTasteMemoryToSession,
  clearTasteMemoryFromSession,
  TASTE_MEMORY_STORAGE_KEY,
} from "./index";
import type { CompassAggregationResult } from "@/lib/compass";

describe("Session Taste Memory — Model & Pure Functions", () => {
  it("initial state: initializes with versioned schema and empty separated categories", () => {
    const memory = createInitialTasteMemory();

    expect(memory.schemaVersion).toBe(CURRENT_TASTE_MEMORY_VERSION);
    expect(memory.explicitInterests).toEqual([]);
    expect(memory.compassInterests).toEqual([]);
    expect(memory.compassProvenance).toEqual([]);
    expect(memory.compassAnswers).toEqual({});
    expect(memory.currentOutingInterests).toEqual([]);
    expect(memory.futureTripInterests).toEqual([]);
    expect(memory.practicalRequirements.step_free_entrance).toBe("not_specified");
    expect(memory.practicalRequirements.seating_available).toBe("not_specified");
  });

  it("add/remove interest: adds valid interests and removes matching ones case-insensitively", () => {
    let memory = createInitialTasteMemory();

    memory = addExplicitInterest(memory, "Textiles");
    expect(memory.explicitInterests).toEqual(["Textiles"]);

    memory = addExplicitInterest(memory, "Haveli woodwork");
    expect(memory.explicitInterests).toEqual(["Textiles", "Haveli woodwork"]);

    memory = removeExplicitInterest(memory, "textiles");
    expect(memory.explicitInterests).toEqual(["Haveli woodwork"]);
  });

  it("duplicate handling: rejects normalized duplicates and invalid strings without mutating state", () => {
    let memory = createInitialTasteMemory();
    memory = addExplicitInterest(memory, "Woodblock Printing");

    // Case-insensitive duplicate
    const sameDup = addExplicitInterest(memory, "woodblock printing");
    expect(sameDup).toBe(memory);

    // Trimmed duplicate
    const trimDup = addExplicitInterest(memory, "  Woodblock Printing  ");
    expect(trimDup).toBe(memory);

    // Empty / whitespace
    const empty = addExplicitInterest(memory, "   ");
    expect(empty).toBe(memory);

    // Exceeds 100 characters
    const oversized = addExplicitInterest(memory, "a".repeat(101));
    expect(oversized).toBe(memory);

    expect(memory.explicitInterests).toEqual(["Woodblock Printing"]);
  });

  it("practical requirements: updates requirements immutably without altering cultural interests", () => {
    let memory = createInitialTasteMemory();
    memory = addExplicitInterest(memory, "Stepwells");

    memory = updatePracticalRequirement(memory, "step_free_entrance", "mandatory");
    expect(memory.practicalRequirements.step_free_entrance).toBe("mandatory");
    expect(memory.explicitInterests).toEqual(["Stepwells"]);

    memory = updatePracticalRequirement(memory, "seating_available", "optional");
    expect(memory.practicalRequirements.seating_available).toBe("optional");
    expect(memory.practicalRequirements.step_free_entrance).toBe("mandatory");
  });

  it("quiz-derived provenance: stores answers, derived interests, and provenance records", () => {
    let memory = createInitialTasteMemory();

    const mockAggregation: CompassAggregationResult = {
      interests: ["textiles", "craft traditions"],
      provenance: [
        {
          interest: "textiles",
          sourceQuestionId: "textiles_vs_contemporary_studio",
          sourceOptionId: "historic_textile_workshop",
          choice: "option_a",
          rationale: "Selected Historic textile workshop",
        },
      ],
      totalQuestionsAnswered: 1,
      hasAnswers: true,
      exceedsDiscoveryLimit: false,
      discoveryLimit: 5,
      advisories: [],
    };

    memory = setCompassState(
      memory,
      { textiles_vs_contemporary_studio: "option_a" },
      mockAggregation
    );

    expect(memory.compassAnswers).toEqual({
      textiles_vs_contemporary_studio: "option_a",
    });
    expect(memory.compassInterests).toEqual(["textiles", "craft traditions"]);
    expect(memory.compassProvenance).toHaveLength(1);
    expect(memory.compassProvenance[0].sourceOptionId).toBe("historic_textile_workshop");
  });

  it("current-outing state: enforces 1-5 capacity limit and deduplication", () => {
    let memory = createInitialTasteMemory();

    memory = setCurrentOutingInterests(memory, [
      "Textiles",
      "textiles",
      "Woodblock",
      "Haveli",
      "Architecture",
      "Pottery",
      "Sculpture", // 6th interest
    ]);

    expect(memory.currentOutingInterests).toHaveLength(5);
    expect(memory.currentOutingInterests).toEqual([
      "Textiles",
      "Woodblock",
      "Haveli",
      "Architecture",
      "Pottery",
    ]);

    // Add another item when at capacity (5)
    const blocked = addCurrentOutingInterest(memory, "Extra");
    expect(blocked.currentOutingInterests).toHaveLength(5);

    // Remove an item
    const reduced = removeCurrentOutingInterest(memory, "Haveli");
    expect(reduced.currentOutingInterests).toEqual([
      "Textiles",
      "Woodblock",
      "Architecture",
      "Pottery",
    ]);

    // Now adding works
    const appended = addCurrentOutingInterest(reduced, "Extra");
    expect(appended.currentOutingInterests).toEqual([
      "Textiles",
      "Woodblock",
      "Architecture",
      "Pottery",
      "Extra",
    ]);
  });

  it("future-interest state: stores and transitions interests between outing and future trips", () => {
    let memory = createInitialTasteMemory();

    memory = addFutureTripInterest(memory, "Sarkhej Roza");
    expect(memory.futureTripInterests).toEqual(["Sarkhej Roza"]);

    // Move from future to current outing
    memory = moveInterestToOuting(memory, "Sarkhej Roza");
    expect(memory.futureTripInterests).toEqual([]);
    expect(memory.currentOutingInterests).toEqual(["Sarkhej Roza"]);

    // Move from current outing to future
    memory = moveInterestToFuture(memory, "Sarkhej Roza");
    expect(memory.currentOutingInterests).toEqual([]);
    expect(memory.futureTripInterests).toEqual(["Sarkhej Roza"]);

    // Remove from future
    memory = removeFutureTripInterest(memory, "Sarkhej Roza");
    expect(memory.futureTripInterests).toEqual([]);
  });

  it("reset: cleanly purges all session taste data", () => {
    let memory = createInitialTasteMemory();
    memory = addExplicitInterest(memory, "Textiles");
    memory = addCurrentOutingInterest(memory, "Textiles");
    memory = addFutureTripInterest(memory, "Pottery");
    memory = updatePracticalRequirement(memory, "step_free_entrance", "mandatory");
    expect(memory.explicitInterests).toHaveLength(1);

    const reset = resetTasteMemory();
    expect(reset.explicitInterests).toEqual([]);
    expect(reset.currentOutingInterests).toEqual([]);
    expect(reset.futureTripInterests).toEqual([]);
    expect(reset.practicalRequirements.step_free_entrance).toBe("not_specified");
  });

  it("invalid or stale state handling: safely recovers from corrupted data and mismatched schemas", () => {
    // Null / non-object
    expect(validateAndMigrateTasteMemory(null).schemaVersion).toBe(CURRENT_TASTE_MEMORY_VERSION);
    expect(validateAndMigrateTasteMemory("corrupt string").schemaVersion).toBe(CURRENT_TASTE_MEMORY_VERSION);

    // Outdated or mismatched schemaVersion
    const oldVersion = {
      schemaVersion: 999,
      explicitInterests: ["Stale data"],
    };
    expect(validateAndMigrateTasteMemory(oldVersion).explicitInterests).toEqual([]);

    // Malformed arrays and practical requirements
    const malformed = {
      schemaVersion: CURRENT_TASTE_MEMORY_VERSION,
      explicitInterests: ["Valid topic", null, 123, "  Trimmed topic  "],
      compassInterests: "not an array",
      practicalRequirements: {
        step_free_entrance: "mandatory",
        fake_requirement: "invalid",
      },
      currentOutingInterests: ["1", "2", "3", "4", "5", "6"], // exceeds 5
    };

    const validated = validateAndMigrateTasteMemory(malformed);
    expect(validated.explicitInterests).toEqual(["Valid topic", "Trimmed topic"]);
    expect(validated.compassInterests).toEqual([]);
    expect(validated.practicalRequirements.step_free_entrance).toBe("mandatory");
    expect(validated.currentOutingInterests).toHaveLength(5);
  });

  it("tasteMemoryToDiscoverRequest: converts confirmed outing preferences without leaking internal memory", () => {
    let memory = createInitialTasteMemory();
    memory = addExplicitInterest(memory, "General curiosity not in outing");
    memory = addCurrentOutingInterest(memory, "Textiles");
    memory = addCurrentOutingInterest(memory, "Stepwells");
    memory = addFutureTripInterest(memory, "Future idea");
    memory = updatePracticalRequirement(memory, "step_free_entrance", "mandatory");
    memory = updatePracticalRequirement(memory, "seating_available", "optional");

    const request = tasteMemoryToDiscoverRequest(memory, "Ahmedabad", 5);

    expect(request.city).toBe("Ahmedabad");
    expect(request.cultural_interests).toEqual(["Textiles", "Stepwells"]);
    expect(request.max_candidates).toBe(5);

    // Only non-not_specified requirements are sent
    expect(request.requirements).toEqual([
      {
        requirement_id: "req-step_free_entrance",
        attribute: "step_free_entrance",
        priority: "mandatory",
        expected_value: true,
      },
      {
        requirement_id: "req-seating_available",
        attribute: "seating_available",
        priority: "optional",
        expected_value: true,
      },
    ]);

    // Unrelated memory (future trips, general unselected interests) must NOT be leaked
    expect((request as unknown as Record<string, unknown>).futureTripInterests).toBeUndefined();
    expect((request as unknown as Record<string, unknown>).explicitInterests).toBeUndefined();
  });
});

describe("Session Taste Memory — SessionStorage Lifecycle", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it("loads and saves TasteMemory safely across browser sessions", () => {
    let memory = createInitialTasteMemory();
    memory = addExplicitInterest(memory, "Haveli woodwork");
    memory = addCurrentOutingInterest(memory, "Haveli woodwork");

    saveTasteMemoryToSession(memory);

    const loaded = loadTasteMemoryFromSession();
    expect(loaded.explicitInterests).toEqual(["Haveli woodwork"]);
    expect(loaded.currentOutingInterests).toEqual(["Haveli woodwork"]);

    clearTasteMemoryFromSession();
    const afterClear = loadTasteMemoryFromSession();
    expect(afterClear.explicitInterests).toEqual([]);
  });

  it("handles storage corruption gracefully", () => {
    window.sessionStorage.setItem(TASTE_MEMORY_STORAGE_KEY, "{ invalid json");
    const safe = loadTasteMemoryFromSession();
    expect(safe.schemaVersion).toBe(CURRENT_TASTE_MEMORY_VERSION);
    expect(safe.explicitInterests).toEqual([]);
  });
});

describe("Current-Outing Intent Layer (Issue 08)", () => {
  it("general interests only: applies established usual interests without override flag", () => {
    let memory = createInitialTasteMemory();
    memory = addExplicitInterest(memory, "Textiles");
    memory = addExplicitInterest(memory, "Heritage architecture");

    const applied = applyUsualInterestsToOuting(memory);
    expect(applied.outingMode).toBe("usual");
    expect(applied.isOutingOverridden).toBe(false);
    expect(applied.currentOutingInterests).toEqual(["Textiles", "Heritage architecture"]);
    expect(applied.explicitInterests).toEqual(["Textiles", "Heritage architecture"]);
  });

  it("current-outing override: sets different outing interests while keeping general memory intact", () => {
    let memory = createInitialTasteMemory();
    memory = addExplicitInterest(memory, "Textiles");
    memory = addExplicitInterest(memory, "Heritage architecture");
    memory = applyUsualInterestsToOuting(memory);

    // Visitor chooses 'Contemporary art' for today's outing
    const overridden = setDifferentTodayOuting(memory, ["Contemporary art"]);

    expect(overridden.outingMode).toBe("different");
    expect(overridden.isOutingOverridden).toBe(true);
    expect(overridden.currentOutingInterests).toEqual(["Contemporary art"]);

    // General interests MUST remain unchanged
    expect(overridden.explicitInterests).toEqual(["Textiles", "Heritage architecture"]);
  });

  it("custom outing interest: sets a specific interest for today without polluting general taste memory", () => {
    let memory = createInitialTasteMemory();
    memory = addExplicitInterest(memory, "Stepwells");
    memory = applyUsualInterestsToOuting(memory);

    const customMemory = setCustomOutingInterest(memory, "Puppetry traditions");

    expect(customMemory.outingMode).toBe("custom");
    expect(customMemory.isOutingOverridden).toBe(true);
    expect(customMemory.currentOutingInterests).toEqual(["Puppetry traditions"]);
    expect(customMemory.explicitInterests).toEqual(["Stepwells"]);
  });

  it("switching between modes and clearing an override restores the usual interests", () => {
    let memory = createInitialTasteMemory();
    memory = addExplicitInterest(memory, "Textiles");
    memory = addExplicitInterest(memory, "Heritage architecture");
    memory = applyUsualInterestsToOuting(memory);

    // Override with something different
    const overridden = setDifferentTodayOuting(memory, ["Sound archives"]);
    expect(overridden.isOutingOverridden).toBe(true);
    expect(overridden.currentOutingInterests).toEqual(["Sound archives"]);

    // Clear override and return to usual interests
    const restored = clearOutingOverride(overridden);
    expect(restored.outingMode).toBe("usual");
    expect(restored.isOutingOverridden).toBe(false);
    expect(restored.currentOutingInterests).toEqual(["Textiles", "Heritage architecture"]);
    expect(restored.explicitInterests).toEqual(["Textiles", "Heritage architecture"]);
  });

  it("interest limits: prioritizeOutingInterests constrains outing focus to max 5 without silent drop", () => {
    const memory = createInitialTasteMemory();
    const candidateInterests = [
      "Textiles",
      "Woodblock",
      "Contemporary art",
      "Stepwells",
      "Sound archives",
      "Haveli architecture",
    ];

    const prioritized = prioritizeOutingInterests(
      memory,
      candidateInterests.slice(0, 3)
    );

    expect(prioritized.currentOutingInterests).toEqual([
      "Textiles",
      "Woodblock",
      "Contemporary art",
    ]);
    expect(prioritized.currentOutingInterests.length).toBeLessThanOrEqual(5);
  });

  it("practical requirement preservation: mandatory accessibility needs remain intact across mode switches", () => {
    let memory = createInitialTasteMemory();
    memory = addExplicitInterest(memory, "Textiles");
    memory = updatePracticalRequirement(memory, "step_free_entrance", "mandatory");
    memory = updatePracticalRequirement(memory, "seating_available", "optional");

    // Switch to different today
    const overridden = setDifferentTodayOuting(memory, ["Modern architecture"]);
    expect(overridden.practicalRequirements.step_free_entrance).toBe("mandatory");
    expect(overridden.practicalRequirements.seating_available).toBe("optional");

    // Switch to custom
    const custom = setCustomOutingInterest(overridden, "Sculpture parks");
    expect(custom.practicalRequirements.step_free_entrance).toBe("mandatory");
    expect(custom.practicalRequirements.seating_available).toBe("optional");

    // Clear override
    const restored = clearOutingOverride(custom);
    expect(restored.practicalRequirements.step_free_entrance).toBe("mandatory");
    expect(restored.practicalRequirements.seating_available).toBe("optional");
  });

  it("API payload construction: DiscoverRequest receives confirmed current-outing selection and not general memory", () => {
    let memory = createInitialTasteMemory();
    memory = addExplicitInterest(memory, "Textiles");
    memory = addExplicitInterest(memory, "Heritage architecture");
    memory = updatePracticalRequirement(memory, "step_free_entrance", "mandatory");

    // Override today's outing with Contemporary art
    const overridden = setDifferentTodayOuting(memory, ["Contemporary art"]);

    const request = tasteMemoryToDiscoverRequest(overridden, "Ahmedabad", 5);

    // DiscoverRequest must only contain the confirmed current-outing interest
    expect(request.cultural_interests).toEqual(["Contemporary art"]);
    expect(request.cultural_interests).not.toContain("Textiles");
    expect(request.cultural_interests).not.toContain("Heritage architecture");

    // Practical requirements must remain present
    expect(request.requirements).toEqual([
      {
        requirement_id: "req-step_free_entrance",
        attribute: "step_free_entrance",
        priority: "mandatory",
        expected_value: true,
      },
    ]);
  });
});

describe("Teach My Compass Feedback & Next-Time Discoveries (Issue 09)", () => {
  it("More like this: updates only explicitly confirmed taste signal and preserves practical requirements", () => {
    let memory = createInitialTasteMemory();
    memory = addExplicitInterest(memory, "Textiles");
    memory = updatePracticalRequirement(memory, "step_free_entrance", "mandatory");

    const updated = applyMoreLikeThis(memory, "Woodblock printing");

    expect(updated.explicitInterests).toContain("Woodblock printing");
    expect(updated.currentOutingInterests).toContain("Woodblock printing");
    // Practical requirement remains untouched
    expect(updated.practicalRequirements.step_free_entrance).toBe("mandatory");
  });

  it("Not this trip: removes from active outing while preserving general cultural interests", () => {
    let memory = createInitialTasteMemory();
    memory = addExplicitInterest(memory, "Textiles");
    memory = addExplicitInterest(memory, "Heritage havelis");
    memory = applyUsualInterestsToOuting(memory);

    // Visitor pauses "Textiles" for this trip
    const updated = applyNotThisTrip(memory, "Textiles");

    // Removed from active outing
    expect(updated.currentOutingInterests).not.toContain("Textiles");
    expect(updated.currentOutingInterests).toContain("Heritage havelis");

    // General interests MUST remain 100% intact!
    expect(updated.explicitInterests).toContain("Textiles");
    expect(updated.explicitInterests).toContain("Heritage havelis");
  });

  it("Not for me: explicitly dismisses confirmed topic without broad downranking of other topics", () => {
    let memory = createInitialTasteMemory();
    memory = addExplicitInterest(memory, "Modern design");
    memory = addExplicitInterest(memory, "Heritage architecture");
    memory = applyUsualInterestsToOuting(memory);

    // Visitor dismisses "Modern design"
    const updated = applyNotForMe(memory, "Modern design");

    expect(updated.excludedInterests).toContain("Modern design");
    expect(updated.explicitInterests).not.toContain("Modern design");
    expect(updated.currentOutingInterests).not.toContain("Modern design");

    // Unrelated categories remain completely intact!
    expect(updated.explicitInterests).toContain("Heritage architecture");
    expect(updated.currentOutingInterests).toContain("Heritage architecture");
  });

  it("Save for another outing: updates futureTripInterests without altering active outing or requirements", () => {
    let memory = createInitialTasteMemory();
    memory = addCurrentOutingInterest(memory, "Stepwells");
    memory = updatePracticalRequirement(memory, "quiet_space", "optional");

    const updated = applySaveForLater(memory, "Court textiles");

    expect(updated.futureTripInterests).toContain("Court textiles");
    // Active outing and requirements unchanged
    expect(updated.currentOutingInterests).toEqual(["Stepwells"]);
    expect(updated.practicalRequirements.quiet_space).toBe("optional");
  });

  it("Show a different direction: sets new direction while strictly preserving mandatory practical requirements", () => {
    let memory = createInitialTasteMemory();
    memory = addCurrentOutingInterest(memory, "Textiles");
    memory = updatePracticalRequirement(memory, "step_free_entrance", "mandatory");

    const updated = applyDifferentDirection(memory, ["Modernist brick architecture"]);

    expect(updated.currentOutingInterests).toEqual(["Modernist brick architecture"]);
    expect(updated.isOutingOverridden).toBe(true);
    expect(updated.practicalRequirements.step_free_entrance).toBe("mandatory");
  });

  it("Reversibility: removing excluded interest restores ability to re-add", () => {
    let memory = createInitialTasteMemory();
    memory = addExcludedInterest(memory, "Contemporary art");
    expect(memory.excludedInterests).toContain("Contemporary art");

    const unDismissed = removeExcludedInterest(memory, "Contemporary art");
    expect(unDismissed.excludedInterests).not.toContain("Contemporary art");

    const reAdded = addExplicitInterest(unDismissed, "Contemporary art");
    expect(reAdded.explicitInterests).toContain("Contemporary art");
  });

  it("Moving future interest into current outing leaves other future interests unchanged", () => {
    let memory = createInitialTasteMemory();
    memory = addFutureTripInterest(memory, "Topic A");
    memory = addFutureTripInterest(memory, "Topic B");

    const moved = moveInterestToOuting(memory, "Topic A");

    expect(moved.currentOutingInterests).toContain("Topic A");
    expect(moved.futureTripInterests).not.toContain("Topic A");
    // Other future interests intact
    expect(moved.futureTripInterests).toEqual(["Topic B"]);
  });

  it("Repeated feedback actions: handles multiple feedback actions deterministically without corruption", () => {
    let memory = createInitialTasteMemory();
    memory = applyMoreLikeThis(memory, "Topic 1");
    memory = applyMoreLikeThis(memory, "Topic 2");
    memory = applySaveForLater(memory, "Topic 3");
    memory = applyNotThisTrip(memory, "Topic 1");

    expect(memory.currentOutingInterests).toEqual(["Topic 2"]);
    expect(memory.explicitInterests).toEqual(["Topic 1", "Topic 2"]);
    expect(memory.futureTripInterests).toEqual(["Topic 3"]);
  });
});


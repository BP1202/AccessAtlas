import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  type TasteMemory,
  type OutingMode,
  applyUsualInterestsToOuting,
  setDifferentTodayOuting,
  setCustomOutingInterest,
  clearOutingOverride,
  prioritizeOutingInterests,
} from "@/lib/taste";

export interface CurrentOutingControlsProps {
  memory: TasteMemory;
  onUpdateMemory: (newMemory: TasteMemory) => void;
  className?: string;
}

export const DIFFERENT_SPARKS = [
  { name: "Contemporary art", description: "Dynamic galleries, modern installations & experimental works" },
  { name: "Modern architecture", description: "Mid-century geometric landmarks and exposed brick" },
  { name: "Sound archives", description: "Oral histories, courtyard acoustics & soundscapes" },
  { name: "Street photography", description: "Shadow play, historic bazaars & urban texture" },
  { name: "Live performance", description: "Classical music recitals & intimate folk theatre" },
  { name: "Culinary heritage", description: "Traditional sweet-making, spice mills & historic recipes" },
] as const;

export const CurrentOutingControls: React.FC<CurrentOutingControlsProps> = ({
  memory,
  onUpdateMemory,
  className = "",
}) => {
  const [customInput, setCustomInput] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);

  // General interests available in memory (from explicit entry or compass answers)
  const usualInterests =
    memory.explicitInterests.length > 0
      ? memory.explicitInterests
      : memory.compassInterests;

  // Selected priorities for when more than 5 interests are chosen
  const [pendingPriorities, setPendingPriorities] = useState<string[]>([]);
  const isOverLimit = memory.currentOutingInterests.length > 5;

  const handleSelectMode = (mode: OutingMode) => {
    setInputError(null);
    if (mode === "usual") {
      onUpdateMemory(applyUsualInterestsToOuting(memory));
    } else if (mode === "different") {
      // If we don't have different sparks selected yet, default to first spark or keep existing
      if (memory.outingMode !== "different" || memory.currentOutingInterests.length === 0) {
        onUpdateMemory(setDifferentTodayOuting(memory, [DIFFERENT_SPARKS[0].name]));
      }
    } else if (mode === "custom") {
      // In custom mode, wait for user input
    }
  };

  const handleToggleDifferentSpark = (sparkName: string) => {
    const isAlreadySelected = memory.currentOutingInterests.some(
      (item) => item.toLowerCase() === sparkName.toLowerCase()
    );

    let nextList: string[];
    if (isAlreadySelected) {
      nextList = memory.currentOutingInterests.filter(
        (item) => item.toLowerCase() !== sparkName.toLowerCase()
      );
      if (nextList.length === 0) {
        nextList = [sparkName]; // Keep at least one
      }
    } else {
      if (memory.currentOutingInterests.length >= 5) {
        setInputError("You can select up to 5 interests for today's outing.");
        return;
      }
      nextList = [...memory.currentOutingInterests, sparkName];
    }

    setInputError(null);
    onUpdateMemory(setDifferentTodayOuting(memory, nextList));
  };

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customInput.trim();
    if (!trimmed) {
      setInputError("Please enter a cultural topic for today's outing.");
      return;
    }

    if (trimmed.length > 100) {
      setInputError("Interests must be 100 characters or fewer.");
      return;
    }

    setInputError(null);
    setCustomInput("");
    onUpdateMemory(setCustomOutingInterest(memory, trimmed));
  };

  const handleClearOverride = () => {
    setInputError(null);
    onUpdateMemory(clearOutingOverride(memory));
  };

  const handleTogglePriority = (item: string) => {
    if (pendingPriorities.includes(item)) {
      setPendingPriorities(pendingPriorities.filter((p) => p !== item));
    } else {
      if (pendingPriorities.length >= 5) {
        return;
      }
      setPendingPriorities([...pendingPriorities, item]);
    }
  };

  const handleConfirmPriorities = () => {
    if (pendingPriorities.length === 0) {
      setInputError("Please select at least 1 interest to prioritize.");
      return;
    }
    setInputError(null);
    onUpdateMemory(prioritizeOutingInterests(memory, pendingPriorities));
    setPendingPriorities([]);
  };

  return (
    <section
      aria-label="Current Outing Preferences"
      data-testid="current-outing-controls"
      className={`rounded-2xl border border-[#dfd8c8] bg-[#fbf9f5] p-5 sm:p-7 space-y-6 dark:border-[#323731] dark:bg-[#1a1e1a] ${className}`}
    >
      {/* Editorial Header */}
      <div className="space-y-1.5">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#193a32]/10 px-3 py-0.5 text-xs font-semibold uppercase tracking-wider text-[#193a32] dark:bg-[#a8d5c4]/15 dark:text-[#a8d5c4]">
          <span>Today&apos;s Outing Intent</span>
        </div>
        <h2 className="font-serif text-xl sm:text-2xl font-semibold text-[#252923] dark:text-[#f4f1ea]">
          Your usual interests are still here. What would you like to explore today?
        </h2>
        <p className="text-sm text-[#62685d] dark:text-[#9da398]">
          Choose whether to focus on your saved interests or try a different direction for this outing. Your saved journal is always preserved.
        </p>
      </div>

      {/* Mode Buttons */}
      <div
        role="tablist"
        aria-label="Outing preference mode"
        className="grid grid-cols-1 sm:grid-cols-3 gap-3"
      >
        {/* Mode 1: Usual Interests */}
        <button
          type="button"
          role="tab"
          aria-selected={memory.outingMode === "usual" && !memory.isOutingOverridden}
          data-testid="mode-usual"
          onClick={() => handleSelectMode("usual")}
          className={`flex flex-col items-start p-4 rounded-xl border text-left transition-all cursor-pointer ${
            memory.outingMode === "usual" && !memory.isOutingOverridden
              ? "border-[#193a32] bg-white ring-2 ring-[#193a32]/15 shadow-xs dark:border-[#a8d5c4] dark:bg-[#212520] dark:ring-[#a8d5c4]/20"
              : "border-[#e6e0d4] bg-[#f4f0e8]/50 hover:bg-white hover:border-[#cfc7b6] dark:border-[#323731] dark:bg-[#212520]/40 dark:hover:bg-[#212520]"
          }`}
        >
          <span className="text-lg mb-1" aria-hidden="true">🏛️</span>
          <span className="font-serif text-sm font-semibold text-[#252923] dark:text-[#f4f1ea]">
            Explore my usual interests
          </span>
          <span className="mt-1 text-xs text-[#62685d] dark:text-[#9da398]">
            {usualInterests.length > 0
              ? `Focus on: ${usualInterests.slice(0, 3).join(", ")}${usualInterests.length > 3 ? "…" : ""}`
              : "Uses your saved journal notes"}
          </span>
        </button>

        {/* Mode 2: Something Different Today */}
        <button
          type="button"
          role="tab"
          aria-selected={memory.outingMode === "different"}
          data-testid="mode-different"
          onClick={() => handleSelectMode("different")}
          className={`flex flex-col items-start p-4 rounded-xl border text-left transition-all cursor-pointer ${
            memory.outingMode === "different"
              ? "border-[#193a32] bg-white ring-2 ring-[#193a32]/15 shadow-xs dark:border-[#a8d5c4] dark:bg-[#212520] dark:ring-[#a8d5c4]/20"
              : "border-[#e6e0d4] bg-[#f4f0e8]/50 hover:bg-white hover:border-[#cfc7b6] dark:border-[#323731] dark:bg-[#212520]/40 dark:hover:bg-[#212520]"
          }`}
        >
          <span className="text-lg mb-1" aria-hidden="true">✨</span>
          <span className="font-serif text-sm font-semibold text-[#252923] dark:text-[#f4f1ea]">
            Explore something different today
          </span>
          <span className="mt-1 text-xs text-[#62685d] dark:text-[#9da398]">
            Try a fresh cultural angle just for this visit
          </span>
        </button>

        {/* Mode 3: Specific Interest for This Outing */}
        <button
          type="button"
          role="tab"
          aria-selected={memory.outingMode === "custom"}
          data-testid="mode-custom"
          onClick={() => handleSelectMode("custom")}
          className={`flex flex-col items-start p-4 rounded-xl border text-left transition-all cursor-pointer ${
            memory.outingMode === "custom"
              ? "border-[#193a32] bg-white ring-2 ring-[#193a32]/15 shadow-xs dark:border-[#a8d5c4] dark:bg-[#212520] dark:ring-[#a8d5c4]/20"
              : "border-[#e6e0d4] bg-[#f4f0e8]/50 hover:bg-white hover:border-[#cfc7b6] dark:border-[#323731] dark:bg-[#212520]/40 dark:hover:bg-[#212520]"
          }`}
        >
          <span className="text-lg mb-1" aria-hidden="true">✏️</span>
          <span className="font-serif text-sm font-semibold text-[#252923] dark:text-[#f4f1ea]">
            Enter a specific interest for this outing
          </span>
          <span className="mt-1 text-xs text-[#62685d] dark:text-[#9da398]">
            Search for an exact topic for today only
          </span>
        </button>
      </div>

      {/* Mode-Specific Content Area */}

      {/* Mode 1 Content: Usual Interests */}
      {memory.outingMode === "usual" && !memory.isOutingOverridden && (
        <div className="rounded-xl border border-[#e6e0d4] bg-white p-4 sm:p-5 space-y-3 dark:border-[#323731] dark:bg-[#212520]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#193a32] dark:text-[#a8d5c4]">
              Active For Today: Your Usual Interests ({memory.currentOutingInterests.length}/5)
            </span>
            <span className="text-xs text-[#62685d] dark:text-[#9da398]">
              Drawn from your cultural journal
            </span>
          </div>

          {memory.currentOutingInterests.length === 0 ? (
            <p className="text-sm text-[#62685d] dark:text-[#9da398]">
              You don&apos;t have any saved interests yet. Add topics below or choose &quot;Explore something different today&quot; above.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {memory.currentOutingInterests.map((interest) => (
                <span
                  key={interest}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#ede8dc] px-3 py-1 text-xs font-medium text-[#252923] dark:bg-[#2b312b] dark:text-[#f4f1ea]"
                >
                  <span>🏛️</span>
                  <span>{interest}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Mode 2 Content: Something Different Today */}
      {memory.outingMode === "different" && (
        <div className="rounded-xl border border-[#e6e0d4] bg-white p-4 sm:p-5 space-y-4 dark:border-[#323731] dark:bg-[#212520]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#c56f4d]">
                Different Today Override Active
              </span>
              <p className="text-xs text-[#62685d] dark:text-[#9da398] mt-0.5">
                Pick 1 to 5 contrasting cultural sparks for today&apos;s visit.
              </p>
            </div>
            {memory.isOutingOverridden && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClearOverride}
                data-testid="switch-back-usual-btn"
                className="text-xs"
              >
                ↺ Switch back to usual interests
              </Button>
            )}
          </div>

          {/* Spark Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {DIFFERENT_SPARKS.map((spark) => {
              const isSelected = memory.currentOutingInterests.some(
                (item) => item.toLowerCase() === spark.name.toLowerCase()
              );
              return (
                <button
                  key={spark.name}
                  type="button"
                  onClick={() => handleToggleDifferentSpark(spark.name)}
                  aria-pressed={isSelected}
                  data-testid={`different-spark-${spark.name.toLowerCase().replace(/\s+/g, "-")}`}
                  className={`p-3 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "border-[#193a32] bg-[#193a32]/5 text-[#193a32] font-semibold dark:border-[#a8d5c4] dark:bg-[#a8d5c4]/10 dark:text-[#a8d5c4]"
                      : "border-[#e6e0d4] bg-[#fdfcf9] hover:border-[#193a32]/40 text-[#252923] dark:border-[#323731] dark:bg-[#1a1e1a] dark:text-[#f4f1ea]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">{spark.name}</span>
                    <span className="text-xs">{isSelected ? "✓" : "+"}</span>
                  </div>
                  <span className="text-[11px] font-normal text-[#62685d] dark:text-[#9da398] mt-1">
                    {spark.description}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Reassurance Notice */}
          {memory.isOutingOverridden && usualInterests.length > 0 && (
            <div className="rounded-lg bg-[#f4f0e8]/80 p-3 text-xs text-[#62685d] dark:bg-[#262a25] dark:text-[#9da398] flex items-start gap-2">
              <span className="text-sm select-none" aria-hidden="true">🔒</span>
              <div>
                <strong>Safe in your journal:</strong> Your usual interests (
                <em>{usualInterests.join(", ")}</em>) remain unchanged and can be restored anytime.
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mode 3 Content: Custom Interest for This Outing */}
      {memory.outingMode === "custom" && (
        <div className="rounded-xl border border-[#e6e0d4] bg-white p-4 sm:p-5 space-y-4 dark:border-[#323731] dark:bg-[#212520]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#c56f4d]">
                Specific Outing Topic
              </span>
              <p className="text-xs text-[#62685d] dark:text-[#9da398] mt-0.5">
                Target an exact cultural interest for today without adding it permanently to your journal.
              </p>
            </div>
            {memory.isOutingOverridden && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClearOverride}
                data-testid="switch-back-usual-custom-btn"
                className="text-xs"
              >
                ↺ Switch back to usual interests
              </Button>
            )}
          </div>

          <form onSubmit={handleApplyCustom} className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="e.g. Contemporary art, Puppetry, Sound design…"
              aria-label="Specific interest for today"
              data-testid="custom-outing-input"
              className="flex-1 rounded-xl border border-[#cfc7b6] bg-white px-3.5 py-2.5 text-sm text-[#252923] placeholder:text-[#9da398] focus:border-[#193a32] focus:outline-none focus:ring-2 focus:ring-[#193a32]/10 dark:border-[#384941] dark:bg-[#1a1e1a] dark:text-[#f4f1ea]"
            />
            <Button
              type="submit"
              variant="primary"
              size="sm"
              data-testid="apply-custom-outing-btn"
            >
              Apply to today&apos;s visit
            </Button>
          </form>

          {/* Current Active Custom Topic */}
          {memory.currentOutingInterests.length > 0 && (
            <div className="flex items-center gap-2 pt-1">
              <span className="text-xs text-[#62685d] dark:text-[#9da398]">Active for today:</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#193a32] text-white px-3 py-1 text-xs font-semibold dark:bg-[#2a584d]">
                <span>✏️</span>
                <span>{memory.currentOutingInterests.join(", ")}</span>
              </span>
            </div>
          )}

          {/* Reassurance Notice */}
          {memory.isOutingOverridden && usualInterests.length > 0 && (
            <div className="rounded-lg bg-[#f4f0e8]/80 p-3 text-xs text-[#62685d] dark:bg-[#262a25] dark:text-[#9da398] flex items-start gap-2">
              <span className="text-sm select-none" aria-hidden="true">🔒</span>
              <div>
                <strong>Safe in your journal:</strong> Your usual interests (
                <em>{usualInterests.join(", ")}</em>) remain unchanged and can be restored anytime.
              </div>
            </div>
          )}
        </div>
      )}

      {/* Input Error Display */}
      {inputError && (
        <p role="alert" className="text-xs font-medium text-[#c56f4d]">
          {inputError}
        </p>
      )}

      {/* Prioritization Panel: Shown if more than 5 interests are somehow selected */}
      {isOverLimit && (
        <div
          role="alert"
          aria-live="polite"
          data-testid="outing-prioritization-panel"
          className="rounded-xl border border-[#c56f4d] bg-[#fbf2ed] p-4 sm:p-5 space-y-3 dark:border-[#c56f4d]/60 dark:bg-[#2e1d17]"
        >
          <div className="flex items-center gap-2">
            <span className="text-base select-none" aria-hidden="true">⚠️</span>
            <h4 className="font-serif text-sm font-semibold text-[#8e3c1f] dark:text-[#f4a585]">
              Prioritize your interests for today (1–5 topics)
            </h4>
          </div>
          <p className="text-xs text-[#8e3c1f] dark:text-[#f4a585]">
            You have selected {memory.currentOutingInterests.length} topics. To ensure accurate discovery recommendations, please choose up to 5 interests to focus on for this outing:
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            {memory.currentOutingInterests.map((item) => {
              const isSelected = pendingPriorities.includes(item);
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => handleTogglePriority(item)}
                  aria-pressed={isSelected}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-[#8e3c1f] text-white"
                      : "bg-white text-[#8e3c1f] border border-[#8e3c1f]/30 hover:bg-[#8e3c1f]/10 dark:bg-[#212520] dark:text-[#f4a585]"
                  }`}
                >
                  <span>{isSelected ? "✓" : "○"}</span>
                  <span>{item}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleConfirmPriorities}
              disabled={pendingPriorities.length === 0}
            >
              Confirm {pendingPriorities.length > 0 ? `(${pendingPriorities.length}/5)` : ""} prioritized focus
            </Button>
          </div>
        </div>
      )}

      {/* Invariant Reassurance Footer */}
      <div className="flex items-center gap-2 pt-1 text-[11px] text-[#62685d] dark:text-[#9da398]">
        <span className="select-none" aria-hidden="true">🛡️</span>
        <span>
          Practical requirements (accessibility, visit timing & companion needs) are preserved independently and never altered by your cultural taste choices.
        </span>
      </div>
    </section>
  );
};

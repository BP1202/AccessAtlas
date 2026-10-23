import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  deriveCulturalDirection,
  MAX_DISCOVERY_INTERESTS,
  type CompassAnswers,
  type SignalProvenance,
  type CulturalDirection,
} from "@/lib/compass";

export interface CulturalCompassRevealProps {
  /** The current active interests (can be edited/pruned) */
  initialInterests: string[];
  /** Full signal provenance records */
  provenance: SignalProvenance[];
  /** Visitor's raw compass answers */
  answers?: CompassAnswers;
  /** Manually entered interests from previous steps */
  manualInterests?: string[];
  /** Callback fired when visitor confirms interests and continues to visit preferences */
  onConfirmAndContinue: (confirmedInterests: string[]) => void;
  /** Callback fired when visitor wishes to revise previous compass answers */
  onReviseAnswers: () => void;
  /** Callback fired when visitor wishes to exit completely to manual entry */
  onExitToManual: (interests?: string[]) => void;
  /** Optional container class */
  className?: string;
}

export const CulturalCompassReveal: React.FC<CulturalCompassRevealProps> = ({
  initialInterests,
  provenance,
  manualInterests = [],
  onConfirmAndContinue,
  onReviseAnswers,
  onExitToManual,
  className = "",
}) => {
  const [currentInterests, setCurrentInterests] = useState<string[]>(initialInterests);
  const [customInput, setCustomInput] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);

  // Derive deterministic direction based on current interests
  const direction: CulturalDirection = deriveCulturalDirection(currentInterests);

  const totalCount = currentInterests.length;
  const exceedsLimit = totalCount > MAX_DISCOVERY_INTERESTS;
  const hasNoInterests = totalCount === 0;

  const handleRemoveInterest = (toRemove: string) => {
    setInputError(null);
    setCurrentInterests((prev) =>
      prev.filter((item) => item.toLowerCase() !== toRemove.toLowerCase())
    );
  };

  const handleAddInterest = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) {
      setInputError("Please enter a cultural topic before adding.");
      return;
    }

    if (trimmed.length > 100) {
      setInputError("Topics must be 100 characters or fewer.");
      return;
    }

    const alreadyExists = currentInterests.some(
      (item) => item.toLowerCase() === trimmed.toLowerCase()
    );
    if (alreadyExists) {
      setInputError(`"${trimmed}" is already included.`);
      return;
    }

    setInputError(null);
    setCurrentInterests((prev) => [...prev, trimmed]);
    setCustomInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddInterest(customInput);
    }
  };

  const handleResetAll = () => {
    setCurrentInterests([]);
    setInputError(null);
  };

  return (
    <div
      className={`rounded-3xl border border-[#dfd8c8] bg-[#fbf9f5] p-6 sm:p-10 shadow-sm animate-fadeIn dark:border-[#323731] dark:bg-[#1a1e1a] ${className}`}
      data-testid="cultural-compass-reveal"
    >
      <div data-testid="cultural-compass-summary">
        {/* Editorial Header & Journal Badge */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e6e0d4] pb-5 dark:border-[#323731]">
        <div className="flex items-center gap-2.5">
          <span className="rounded-full bg-[#193a32] px-3 py-1 text-xs font-semibold text-white dark:bg-[#2a584d]">
            🧭 Cultural Compass · Direction Reveal
          </span>
          <span className="text-xs font-mono text-[#c56f4d] uppercase tracking-wider">
            Provisional Direction
          </span>
        </div>

        <button
          type="button"
          onClick={() => onExitToManual(currentInterests)}
          className="text-xs font-semibold text-[#62685d] hover:text-[#193a32] underline underline-offset-4 dark:text-[#9da398] dark:hover:text-[#f4f1ea] cursor-pointer"
        >
          Exit to manual entry ✕
        </button>
      </div>

      {/* Direction Title & Narrative */}
      <div className="mt-7">
        <span className="text-xs font-semibold uppercase tracking-widest text-[#62685d] dark:text-[#9da398]">
          Your Curated Cultural Direction
        </span>
        <h3
          data-testid="cultural-direction-title"
          className="mt-2 font-serif text-3xl sm:text-4xl font-semibold text-[#252923] dark:text-[#f4f1ea]"
        >
          {direction.title}
        </h3>
        <p className="mt-3 text-base sm:text-lg leading-relaxed text-[#4a5046] max-w-3xl dark:text-[#c5cbbd]">
          {direction.description}
        </p>

        {/* Transparent Rationale & Non-Verdict Disclaimer */}
        <div className="mt-4 rounded-2xl bg-white p-4 border border-[#e6e0d4] text-xs leading-relaxed text-[#62685d] dark:bg-[#212520] dark:border-[#323731] dark:text-[#9da398] flex items-start gap-2.5">
          <span className="text-base select-none" aria-hidden="true">
            💡
          </span>
          <div>
            <span className="font-semibold text-[#252923] dark:text-[#f4f1ea]">
              Starting point, not a verdict:{" "}
            </span>
            <span>
              {direction.rationale} This direction is an editable discovery aid based strictly on your explicit responses—not an immutable personality profile or Qloo prediction.
            </span>
          </div>
        </div>
      </div>

      {/* Editable Interests Section */}
      <div className="mt-8 pt-7 border-t border-[#e6e0d4] dark:border-[#323731] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h4 className="font-serif text-xl font-semibold text-[#252923] dark:text-[#f4f1ea]">
              Inspect & Refine Topics ({totalCount}/{MAX_DISCOVERY_INTERESTS})
            </h4>
            <p className="text-xs text-[#62685d] dark:text-[#9da398]">
              Remove topics that don&apos;t interest you or add new ones to shape your discovery.
            </p>
          </div>

          {currentInterests.length > 0 && (
            <button
              type="button"
              onClick={handleResetAll}
              className="text-xs font-medium text-[#c56f4d] hover:underline cursor-pointer self-start sm:self-auto"
            >
              Clear all topics
            </button>
          )}
        </div>

        {/* Capacity Warning (when > 5 interests) */}
        {exceedsLimit && (
          <div
            role="alert"
            className="rounded-2xl border border-[#e6cbb7] bg-[#fdf6f0] p-4 text-xs sm:text-sm text-[#8c3b1e] dark:border-[#523528] dark:bg-[#2e1d16] dark:text-[#e89b7d]"
          >
            <p className="font-semibold">Discovery capacity limit reached</p>
            <p className="mt-1">
              You currently have {totalCount} interests selected. The Discovery API supports between 1 and {MAX_DISCOVERY_INTERESTS} interests at a time. Please remove at least {totalCount - MAX_DISCOVERY_INTERESTS} topic(s) to continue.
            </p>
          </div>
        )}

        {/* Zero Interests Warning */}
        {hasNoInterests && (
          <div
            role="status"
            className="rounded-2xl border border-dashed border-[#dfd8c8] bg-white p-6 text-center text-sm text-[#62685d] dark:border-[#323731] dark:bg-[#212520] dark:text-[#9da398]"
          >
            No cultural topics selected. Type a custom interest below or return to comparisons to surface directions.
          </div>
        )}

        {/* Interactive Chip List with Provenance */}
        {!hasNoInterests && (
          <div
            className="flex flex-wrap gap-2.5"
            role="list"
            aria-label="Editable cultural interests"
          >
            {currentInterests.map((interest) => {
              const isManual = manualInterests.some(
                (m) => m.toLowerCase() === interest.toLowerCase()
              );
              const prov = provenance.find(
                (p) => p.interest.toLowerCase() === interest.toLowerCase()
              );

              return (
                <div
                  key={interest}
                  role="listitem"
                  className="inline-flex items-center gap-2 rounded-2xl border border-[#dfd8c8] bg-white px-3.5 py-2 shadow-2xs dark:border-[#323731] dark:bg-[#212520]"
                >
                  <div className="flex flex-col">
                    <span className="font-serif text-sm font-semibold text-[#193a32] dark:text-[#a8d5c4]">
                      {interest}
                    </span>
                    <span className="text-[10px] text-[#73796e] dark:text-[#888f83]">
                      {isManual
                        ? "Manual entry"
                        : prov
                        ? `From: ${prov.choice === "both" ? "Both" : "Compass choice"}`
                        : "Custom topic"}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveInterest(interest)}
                    aria-label={`Remove interest ${interest}`}
                    className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full text-[#9da398] hover:bg-[#ede8dc] hover:text-[#252923] dark:hover:bg-[#323731] dark:hover:text-[#f4f1ea] transition-colors cursor-pointer"
                  >
                    <span aria-hidden="true" className="text-sm font-bold">
                      ×
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Inline Add Topic Input */}
        <div className="space-y-2 pt-2">
          <label
            htmlFor="reveal-custom-interest-input"
            className="block text-xs font-semibold uppercase tracking-wider text-[#62685d] dark:text-[#9da398]"
          >
            Add an additional topic (e.g. Contemporary art, Stepwells)
          </label>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <input
              id="reveal-custom-interest-input"
              type="text"
              value={customInput}
              onChange={(e) => {
                setCustomInput(e.target.value);
                if (inputError) setInputError(null);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Type any cultural topic..."
              maxLength={100}
              className="flex-1 rounded-xl border border-[#e6e0d4] bg-white px-4 py-2.5 text-sm text-[#252923] placeholder-[#9da398] focus:border-[#193a32] focus:outline-none focus:ring-1 focus:ring-[#193a32] dark:border-[#323731] dark:bg-[#212520] dark:text-[#f4f1ea]"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleAddInterest(customInput)}
              disabled={!customInput.trim()}
              className="sm:px-5 py-2.5 text-xs sm:text-sm font-semibold"
            >
              + Add topic
            </Button>
          </div>
          {inputError && (
            <p className="text-xs font-medium text-[#c56f4d]" role="alert">
              {inputError}
            </p>
          )}
        </div>
      </div>

      {/* Discovery Handoff Actions */}
      <div className="mt-9 pt-6 border-t border-[#e6e0d4] flex flex-wrap items-center justify-between gap-4 dark:border-[#323731]">
        <button
          type="button"
          onClick={onReviseAnswers}
          className="text-xs sm:text-sm font-medium text-[#62685d] hover:text-[#193a32] underline underline-offset-4 dark:text-[#9da398] dark:hover:text-[#f4f1ea] cursor-pointer"
        >
          ↺ Revise compass comparisons
        </button>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onExitToManual(currentInterests)}
            className="text-xs sm:text-sm"
          >
            Manual entry tab
          </Button>

          <Button
            type="button"
            variant="primary"
            onClick={() => onConfirmAndContinue(currentInterests)}
            disabled={hasNoInterests || exceedsLimit}
            className="px-7 py-3 font-semibold text-sm shadow-xs"
          >
            Continue to visit preferences →
          </Button>
        </div>
      </div>
      </div>
    </div>
  );
};

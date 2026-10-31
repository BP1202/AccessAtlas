import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { CulturalCompassReveal } from "./CulturalCompassReveal";
import {
  COMPASS_QUESTIONS,
  aggregateCompassSignals,
  mergeWithManualInterests,
  type CompassAnswers,
  type CompassChoice,
  type CompassQuestion,
  type CompassAggregationResult,
} from "@/lib/compass";

export interface CulturalCompassProps {
  /** Optional initial answers if resuming an existing session */
  initialAnswers?: CompassAnswers;
  /** Existing manual interests already chosen by the visitor */
  existingInterests?: string[];
  /** Callback fired when the visitor completes the compass flow */
  onComplete: (answers: CompassAnswers, derivedInterests: string[]) => void;
  /** Callback fired when the visitor chooses to return to manual entry */
  onExitToManual: (interests?: string[]) => void;
  /** Optional container class name */
  className?: string;
}

export const CulturalCompass: React.FC<CulturalCompassProps> = ({
  initialAnswers = {},
  existingInterests = [],
  onComplete,
  onExitToManual,
  className = "",
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<CompassAnswers>(initialAnswers);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [summaryResult, setSummaryResult] = useState<CompassAggregationResult | null>(null);

  const totalQuestions = COMPASS_QUESTIONS.length;
  const currentQuestion: CompassQuestion = COMPASS_QUESTIONS[currentIndex];
  const currentAnswer: CompassChoice | undefined = answers[currentQuestion.id] as
    | CompassChoice
    | undefined;

  const handleSelectChoice = (choice: CompassChoice) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: choice,
    }));
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Reached end of questions
      finishCompass(answers);
    }
  };

  const handleSkipQuestion = () => {
    const updatedAnswers = {
      ...answers,
      [currentQuestion.id]: "neither" as CompassChoice,
    };
    setAnswers(updatedAnswers);

    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      finishCompass(updatedAnswers);
    }
  };

  const finishCompass = (finalAnswers: CompassAnswers) => {
    const aggregation = aggregateCompassSignals(finalAnswers);
    setSummaryResult(aggregation);
    setIsCompleted(true);
  };


  /* ========================================================================
     COMPLETION SCREEN: Editable Cultural Compass Direction Reveal
  ======================================================================== */
  if (isCompleted && summaryResult) {
    const merged = mergeWithManualInterests(summaryResult.interests, existingInterests);

    return (
      <CulturalCompassReveal
        initialInterests={merged.interests}
        provenance={summaryResult.provenance}
        answers={answers}
        manualInterests={existingInterests}
        onConfirmAndContinue={(confirmedInterests) => {
          onComplete(answers, confirmedInterests);
        }}
        onReviseAnswers={() => {
          setIsCompleted(false);
          // Preserve answers, navigate to the first or last question
          setCurrentIndex(totalQuestions - 1);
        }}
        onExitToManual={onExitToManual}
        className={className}
      />
    );
  }

  /* ========================================================================
     QUESTION SCREEN: Single Question with Option A, Option B, Both, Neither
  ======================================================================== */
  const progressPercent = Math.round(((currentIndex + 1) / totalQuestions) * 100);

  return (
    <div
      className={`rounded-3xl border border-[#dfd8c8] bg-[#fbf9f5] p-6 sm:p-10 shadow-sm animate-fadeIn dark:border-[#323731] dark:bg-[#1a1e1a] ${className}`}
      data-testid="cultural-compass-question"
    >
      {/* Editorial Journal Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#e6e0d4] pb-5 dark:border-[#323731]">
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-[#193a32] px-3 py-1 text-xs font-semibold text-white dark:bg-[#2a584d]">
            🧭 Cultural Compass
          </span>
          <span className="text-xs font-medium text-[#62685d] dark:text-[#9da398]">
            Question {currentIndex + 1} of {totalQuestions}
          </span>
        </div>

        {/* Visible way to leave Cultural Compass */}
        <button
          type="button"
          onClick={() => onExitToManual()}
          className="text-xs font-semibold text-[#62685d] hover:text-[#193a32] underline underline-offset-4 dark:text-[#9da398] dark:hover:text-[#f4f1ea] cursor-pointer self-start sm:self-auto"
        >
          Enter my own interests instead →
        </button>
      </div>

      {/* Accessible Progress Indicator */}
      <div className="mt-4 space-y-1.5">
        <div
          role="progressbar"
          aria-valuenow={currentIndex + 1}
          aria-valuemin={1}
          aria-valuemax={totalQuestions}
          aria-label={`Question ${currentIndex + 1} of ${totalQuestions}: ${currentQuestion.prompt}`}
          className="h-1.5 w-full overflow-hidden rounded-full bg-[#e6e0d4] dark:bg-[#323731]"
        >
          <div
            className="h-full bg-[#193a32] transition-all duration-300 ease-out dark:bg-[#a8d5c4]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] font-mono text-[#73796e] dark:text-[#888f83]">
          <span>Prompt 0{currentIndex + 1}</span>
          <span>0{totalQuestions} Total</span>
        </div>
      </div>

      {/* Question Narrative Heading */}
      <div className="mt-6">
        <span className="text-xs font-semibold uppercase tracking-widest text-[#c56f4d]">
          Let&apos;s find a direction worth exploring
        </span>
        <h3 className="mt-2 font-serif text-2xl sm:text-3xl font-semibold text-[#252923] dark:text-[#f4f1ea]">
          {currentQuestion.prompt}
        </h3>
        <p className="mt-3 text-sm sm:text-base leading-relaxed text-[#62685d] max-w-2xl dark:text-[#9da398]">
          {currentQuestion.context}
        </p>
      </div>

      {/* Options Fieldset */}
      <fieldset className="mt-8 space-y-4">
        <legend className="sr-only">
          Cultural choices for comparison: {currentQuestion.prompt}
        </legend>

        {/* Primary Options A & B Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Option A Card */}
          <button
            type="button"
            onClick={() => handleSelectChoice("option_a")}
            aria-pressed={currentAnswer === "option_a"}
            className={`group rounded-2xl border-2 p-5 text-left transition-all duration-150 cursor-pointer flex flex-col justify-between ${
              currentAnswer === "option_a"
                ? "border-[#193a32] bg-[#193a32] text-white shadow-md dark:border-[#2a584d] dark:bg-[#2a584d]"
                : "border-[#e6e0d4] bg-white text-[#252923] hover:border-[#193a32] hover:bg-[#faf8f5] shadow-2xs dark:border-[#323731] dark:bg-[#212520] dark:text-[#f4f1ea] dark:hover:border-[#a8d5c4]"
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span
                  className={`text-[11px] font-mono uppercase tracking-wider ${
                    currentAnswer === "option_a"
                      ? "text-[#d8e2dc]"
                      : "text-[#c56f4d]"
                  }`}
                >
                  Option A
                </span>
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold transition-all ${
                    currentAnswer === "option_a"
                      ? "bg-white text-[#193a32]"
                      : "border border-[#dfd8c8] bg-transparent text-transparent group-hover:border-[#193a32]"
                  }`}
                  aria-hidden="true"
                >
                  ✓
                </span>
              </div>

              <h4 className="mt-2 font-serif text-xl font-semibold">
                {currentQuestion.optionA.label}
              </h4>

              <p
                className={`mt-2 text-xs sm:text-sm leading-relaxed ${
                  currentAnswer === "option_a"
                    ? "text-[#e4ded0]"
                    : "text-[#62685d] dark:text-[#9da398]"
                }`}
              >
                {currentQuestion.optionA.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-black/10 dark:border-white/10 flex flex-wrap gap-1.5">
              {currentQuestion.optionA.signals.map((sig) => (
                <span
                  key={sig}
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                    currentAnswer === "option_a"
                      ? "bg-white/20 text-white"
                      : "bg-[#ede8dc] text-[#62685d] dark:bg-[#2d322b] dark:text-[#a8d5c4]"
                  }`}
                >
                  {sig}
                </span>
              ))}
            </div>
          </button>

          {/* Option B Card */}
          <button
            type="button"
            onClick={() => handleSelectChoice("option_b")}
            aria-pressed={currentAnswer === "option_b"}
            className={`group rounded-2xl border-2 p-5 text-left transition-all duration-150 cursor-pointer flex flex-col justify-between ${
              currentAnswer === "option_b"
                ? "border-[#193a32] bg-[#193a32] text-white shadow-md dark:border-[#2a584d] dark:bg-[#2a584d]"
                : "border-[#e6e0d4] bg-white text-[#252923] hover:border-[#193a32] hover:bg-[#faf8f5] shadow-2xs dark:border-[#323731] dark:bg-[#212520] dark:text-[#f4f1ea] dark:hover:border-[#a8d5c4]"
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span
                  className={`text-[11px] font-mono uppercase tracking-wider ${
                    currentAnswer === "option_b"
                      ? "text-[#d8e2dc]"
                      : "text-[#c56f4d]"
                  }`}
                >
                  Option B
                </span>
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold transition-all ${
                    currentAnswer === "option_b"
                      ? "bg-white text-[#193a32]"
                      : "border border-[#dfd8c8] bg-transparent text-transparent group-hover:border-[#193a32]"
                  }`}
                  aria-hidden="true"
                >
                  ✓
                </span>
              </div>

              <h4 className="mt-2 font-serif text-xl font-semibold">
                {currentQuestion.optionB.label}
              </h4>

              <p
                className={`mt-2 text-xs sm:text-sm leading-relaxed ${
                  currentAnswer === "option_b"
                    ? "text-[#e4ded0]"
                    : "text-[#62685d] dark:text-[#9da398]"
                }`}
              >
                {currentQuestion.optionB.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-black/10 dark:border-white/10 flex flex-wrap gap-1.5">
              {currentQuestion.optionB.signals.map((sig) => (
                <span
                  key={sig}
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                    currentAnswer === "option_b"
                      ? "bg-white/20 text-white"
                      : "bg-[#ede8dc] text-[#62685d] dark:bg-[#2d322b] dark:text-[#a8d5c4]"
                  }`}
                >
                  {sig}
                </span>
              ))}
            </div>
          </button>
        </div>

        {/* Dual / Neutral Selections: Both vs Neither */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => handleSelectChoice("both")}
            aria-pressed={currentAnswer === "both"}
            className={`flex-1 rounded-xl border p-3.5 text-center text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              currentAnswer === "both"
                ? "border-[#193a32] bg-[#193a32] text-white shadow-xs dark:bg-[#2a584d] dark:border-[#2a584d]"
                : "border-[#dfd8c8] bg-white text-[#4a5046] hover:border-[#193a32] hover:bg-[#faf8f5] dark:border-[#323731] dark:bg-[#212520] dark:text-[#9da398]"
            }`}
          >
            ✨ Both appeal to me
          </button>

          <button
            type="button"
            onClick={() => handleSelectChoice("neither")}
            aria-pressed={currentAnswer === "neither"}
            className={`flex-1 rounded-xl border p-3.5 text-center text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              currentAnswer === "neither"
                ? "border-[#8c3b1e] bg-[#8c3b1e] text-white shadow-xs dark:bg-[#a64e2b] dark:border-[#a64e2b]"
                : "border-[#dfd8c8] bg-white text-[#4a5046] hover:border-[#8c3b1e] hover:bg-[#faf8f5] dark:border-[#323731] dark:bg-[#212520] dark:text-[#9da398]"
            }`}
          >
            ↷ Neither / Skip comparison
          </button>
        </div>
      </fieldset>

      {/* Navigation Controls: Back, Skip, Next */}
      <div className="mt-8 pt-6 border-t border-[#e6e0d4] flex flex-wrap items-center justify-between gap-3 dark:border-[#323731]">
        <div>
          {currentIndex > 0 ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              className="text-xs sm:text-sm"
            >
              ← Previous
            </Button>
          ) : (
            <button
              type="button"
              onClick={() => onExitToManual()}
              className="text-xs font-semibold text-[#62685d] hover:text-[#193a32] underline underline-offset-4 dark:text-[#9da398] cursor-pointer"
            >
              Enter my own interests instead
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {!currentAnswer && (
            <button
              type="button"
              onClick={handleSkipQuestion}
              className="text-xs font-medium text-[#62685d] hover:text-[#193a32] underline underline-offset-4 dark:text-[#9da398] cursor-pointer"
            >
              Skip this question →
            </button>
          )}

          <Button
            type="button"
            variant="primary"
            onClick={handleNext}
            disabled={!currentAnswer}
            className="px-6 py-2.5 font-semibold text-xs sm:text-sm shadow-xs"
          >
            {currentIndex === totalQuestions - 1
              ? "Review directions →"
              : "Next question →"}
          </Button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import type { RequirementAssessment } from "@/lib/api/types";
import {
  ATTRIBUTE_LABELS,
  REQUIREMENT_OUTCOME_LABELS,
  SCOPE_LABELS,
} from "@/lib/constants/labels";

export interface QuestionKitProps {
  venueName: string;
  questions: string[];
  assessments?: RequirementAssessment[];
  hasUnresolvedEvidence?: boolean;
  className?: string;
}

function findMatchingAssessment(
  question: string,
  assessments?: RequirementAssessment[]
): RequirementAssessment | undefined {
  if (!assessments || assessments.length === 0) return undefined;

  // 1. Direct match on confirmation_need
  const directNeed = assessments.find(
    (a) => a.confirmation_need && question.includes(a.confirmation_need)
  );
  if (directNeed) return directNeed;

  // 2. Match on attribute name
  return assessments.find((a) => {
    const attrWords = a.attribute.split("_");
    return attrWords.some(
      (w) => w.length > 3 && question.toLowerCase().includes(w.toLowerCase())
    );
  });
}

export const QuestionKit: React.FC<QuestionKitProps> = ({
  venueName,
  questions,
  assessments = [],
  hasUnresolvedEvidence = false,
  className = "",
}) => {
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!questions || questions.length === 0) {
    return (
      <div
        data-testid="question-kit-empty"
        className={`rounded-2xl border border-[#dfd8c8] bg-[#f6f3eb] p-5 text-xs text-[#62685d] dark:border-[#323731] dark:bg-[#191c19] dark:text-[#9da398] ${className}`}
      >
        <span className="font-semibold text-[#252923] dark:text-[#f4f1ea]">
          {hasUnresolvedEvidence
            ? "No specific confirmation questions generated:"
            : "No additional confirmation questions needed:"}
        </span>{" "}
        {hasUnresolvedEvidence
          ? "Some participation details remain unrecorded in published records. Inquire directly with venue staff before planning your visit."
          : "Available published documentation covers the evaluated details for this space."}
      </div>
    );
  }

  const handleCopyAll = async () => {
    const formattedText = `Questions for ${venueName} before visiting:\n\n${questions
      .map((q, idx) => `${idx + 1}. ${q}`)
      .join("\n")}\n\n(Generated via AccessAtlas)`;

    try {
      await navigator.clipboard.writeText(formattedText);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2500);
    } catch {
      // Clipboard write failed (e.g. security permission in non-HTTPS/iframe)
    }
  };

  const handleCopySingle = async (question: string, index: number) => {
    const singleText = `Question for ${venueName}:\n${question}\n\n(Via AccessAtlas)`;
    try {
      await navigator.clipboard.writeText(singleText);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2500);
    } catch {
      // Clipboard write failed
    }
  };

  return (
    <section
      aria-labelledby="question-kit-heading"
      data-testid="question-kit-section"
      className={`rounded-3xl border border-[#eed49c] bg-[#fcf5e8]/70 p-6 sm:p-8 dark:border-[#544122] dark:bg-[#382b17]/40 ${className}`}
    >
      {/* Top Header with Copy All Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#eed49c]/80 dark:border-[#544122]">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#8c5914] dark:text-[#f0d496]">
            Ask the venue
          </span>
          <h4
            id="question-kit-heading"
            className="font-serif text-xl sm:text-2xl font-semibold text-[#252923] dark:text-[#f4f1ea]"
          >
            Confirmation Question Kit
          </h4>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopyAll}
            className="border-[#8c5914] text-[#8c5914] hover:bg-[#8c5914]/10 dark:border-[#f0d496] dark:text-[#f0d496] self-start sm:self-auto cursor-pointer"
            aria-live="polite"
            aria-label="Copy questions to ask"
          >
            {copiedAll ? "✓ Copied to clipboard" : "Copy questions to ask"}
          </Button>
        </div>
      </div>

      {/* Grounding and Disclaimers */}
      <p className="mt-3 text-xs leading-relaxed text-[#62685d] dark:text-[#9da398]">
        Because some details are not recorded in published records, you can email or call {venueName} with these specific questions.
      </p>
      <p className="mt-1 text-[11px] text-[#8c5914] dark:text-[#f0d496] italic">
        Note: Copying places questions on your clipboard for your own inquiries. AccessAtlas does not contact venues or send automated messages.
      </p>

      {/* Question Cards List */}
      <ul
        className="mt-5 space-y-4 text-xs sm:text-sm text-[#252923] dark:text-[#e4ded0]"
        role="list"
        aria-label="List of confirmation questions"
      >
        {questions.map((q, idx) => {
          const matchedAssessment = findMatchingAssessment(q, assessments);
          const isSingleCopied = copiedIndex === idx;

          return (
            <li
              key={idx}
              data-testid={`question-item-${idx}`}
              className="rounded-2xl border border-[#eed49c] bg-white p-4 sm:p-5 shadow-2xs dark:border-[#544122] dark:bg-[#212520] space-y-3"
            >
              {/* Question Header & Contextual Badges */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#8c5914] dark:text-[#f0d496]">
                    Question {idx + 1}
                  </span>
                  {matchedAssessment && (
                    <>
                      <span className="text-[#dfd8c8] dark:text-[#323731]" aria-hidden="true">
                        ·
                      </span>
                      <span className="font-medium text-[#193a32] dark:text-[#a8d5c4]">
                        Relates to: {ATTRIBUTE_LABELS[matchedAssessment.attribute] || matchedAssessment.attribute}
                      </span>
                      <span className="font-mono text-[11px] uppercase text-[#62685d] dark:text-[#9da398]">
                        ({matchedAssessment.priority})
                      </span>
                      <span className="rounded bg-[#ede8dc] px-2 py-0.5 text-[11px] font-mono text-[#62685d] dark:bg-[#262a25] dark:text-[#9da398]">
                        {SCOPE_LABELS[matchedAssessment.scope]?.badge || matchedAssessment.scope}
                      </span>
                      <span className="rounded bg-[#fcf5e8] px-2 py-0.5 text-[11px] font-medium text-[#8c5914] border border-[#eed49c] dark:bg-[#382b17] dark:text-[#f0d496] dark:border-[#544122]">
                        {REQUIREMENT_OUTCOME_LABELS[matchedAssessment.outcome]?.badge || "Needs Confirmation"}
                      </span>
                    </>
                  )}
                </div>

                {/* Individual Question Copy Button */}
                <button
                  type="button"
                  onClick={() => handleCopySingle(q, idx)}
                  aria-label={`Copy question ${idx + 1}`}
                  aria-live="polite"
                  className="rounded-lg border border-[#eed49c] px-2.5 py-1 text-[11px] font-medium text-[#8c5914] hover:bg-[#fcf5e8] transition-colors cursor-pointer dark:border-[#544122] dark:text-[#f0d496] dark:hover:bg-[#382b17]"
                >
                  {isSingleCopied ? "✓ Copied" : "Copy question"}
                </button>
              </div>

              {/* The Actual Question */}
              <p className="text-sm sm:text-base leading-relaxed text-[#252923] font-medium dark:text-[#f4f1ea]">
                {q}
              </p>

              {/* Underlying Need / Reason */}
              {matchedAssessment?.confirmation_need && (
                <div className="text-[11px] text-[#62685d] dark:text-[#9da398]">
                  <span className="font-semibold">Reason needed: </span>
                  <span>{matchedAssessment.confirmation_need}</span>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
};

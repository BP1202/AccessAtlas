import React from "react";
import { Button } from "@/components/ui/Button";
import {
  SUPPORTED_REQUIREMENTS,
  REQUIREMENT_CATEGORY_LABELS,
  type RequirementDefinition,
} from "@/lib/constants/requirements";
import type { EvidenceAttribute } from "@/lib/api/types";

export type PreferenceState = "not_specified" | "optional" | "mandatory";

export interface PreferenceSelectorProps {
  preferences: Record<EvidenceAttribute, PreferenceState>;
  onChange: (attribute: EvidenceAttribute, state: PreferenceState) => void;
  onBack: () => void;
  onSubmit: () => void;
  isLoading?: boolean;
  className?: string;
}

export const PreferenceSelector: React.FC<PreferenceSelectorProps> = ({
  preferences,
  onChange,
  onBack,
  onSubmit,
  isLoading = false,
  className = "",
}) => {
  const categories: Array<RequirementDefinition["category"]> = [
    "accessibility",
    "comfort",
    "planning",
  ];

  const activeCount = Object.values(preferences).filter(
    (state) => state !== "not_specified"
  ).length;

  return (
    <div className={`space-y-10 ${className}`}>
      {/* Header */}
      <div>
        <span className="text-xs font-semibold uppercase tracking-widest text-[#c56f4d]">
          Stage 02 · Practical Preferences
        </span>
        <h2 className="mt-3 font-serif text-3xl font-semibold text-[#252923] sm:text-4xl lg:text-5xl dark:text-[#f4f1ea]">
          What matters for your visit?
        </h2>
        <p className="mt-4 text-base sm:text-lg text-[#62685d] max-w-3xl leading-relaxed dark:text-[#9da398]">
          Choose only what is relevant for you or your companions. You don&apos;t need to explain why or disclose any personal details. AccessAtlas checks your choices against verified venue documentation.
        </p>
      </div>

      {/* Summary indicator */}
      <div className="flex items-center justify-between rounded-2xl bg-[#ede8dc]/80 px-6 py-4 text-sm text-[#252923] dark:bg-[#212520] dark:text-[#e4ded0] border border-[#dfd8c8] dark:border-[#323731]">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#193a32] dark:bg-[#a8d5c4]" />
          <span>
            {activeCount === 0
              ? "No specific preferences selected (standard cultural discovery)"
              : `${activeCount} requirement${activeCount > 1 ? "s" : ""} selected for deterministic evaluation`}
          </span>
        </div>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={() => {
              SUPPORTED_REQUIREMENTS.forEach((req) => {
                onChange(req.attribute, "not_specified");
              });
            }}
            className="text-[#c56f4d] hover:underline font-medium text-xs cursor-pointer"
          >
            Reset all
          </button>
        )}
      </div>

      {/* Requirements grouped by category */}
      <div className="space-y-10">
        {categories.map((category) => {
          const reqs = SUPPORTED_REQUIREMENTS.filter((r) => r.category === category);
          return (
            <div key={category} className="space-y-4">
              <div className="border-b border-[#e6e0d4] pb-2 dark:border-[#323731]">
                <h3 className="font-serif text-lg font-semibold text-[#193a32] dark:text-[#a8d5c4]">
                  {REQUIREMENT_CATEGORY_LABELS[category]}
                </h3>
              </div>

              <div className="space-y-3">
                {reqs.map((req) => {
                  const currentState = preferences[req.attribute] || "not_specified";
                  return (
                    <div
                      key={req.attribute}
                      className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-[#e6e0d4] bg-white p-5 sm:p-6 transition-all shadow-xs dark:border-[#323731] dark:bg-[#212520]"
                    >
                      <div className="space-y-1 md:max-w-xl">
                        <label
                          id={`label-${req.attribute}`}
                          className="font-serif text-base font-semibold text-[#252923] dark:text-[#f4f1ea]"
                        >
                          {req.label}
                        </label>
                        <p className="text-xs sm:text-sm text-[#62685d] dark:text-[#9da398]">
                          {req.description}
                        </p>
                      </div>

                      {/* Segmented tri-state toggle */}
                      <div
                        role="radiogroup"
                        aria-labelledby={`label-${req.attribute}`}
                        className="inline-flex rounded-xl border border-[#dfd8c8] bg-[#ede8dc] p-1.5 dark:border-[#323731] dark:bg-[#191c19] self-start md:self-auto shrink-0"
                      >
                        <button
                          type="button"
                          role="radio"
                          aria-checked={currentState === "not_specified"}
                          onClick={() => onChange(req.attribute, "not_specified")}
                          className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                            currentState === "not_specified"
                              ? "bg-white text-[#252923] shadow-xs font-semibold dark:bg-[#212520] dark:text-[#f4f1ea]"
                              : "text-[#62685d] hover:text-[#252923] dark:text-[#9da398] dark:hover:text-[#f4f1ea]"
                          }`}
                        >
                          Not specified
                        </button>
                        <button
                          type="button"
                          role="radio"
                          aria-checked={currentState === "optional"}
                          onClick={() => onChange(req.attribute, "optional")}
                          className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                            currentState === "optional"
                              ? "bg-[#c56f4d] text-white shadow-xs font-semibold"
                              : "text-[#62685d] hover:text-[#252923] dark:text-[#9da398] dark:hover:text-[#f4f1ea]"
                          }`}
                        >
                          Nice to have
                        </button>
                        <button
                          type="button"
                          role="radio"
                          aria-checked={currentState === "mandatory"}
                          onClick={() => onChange(req.attribute, "mandatory")}
                          className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                            currentState === "mandatory"
                              ? "bg-[#193a32] text-[#f6f3eb] shadow-xs font-semibold dark:bg-[#2a584d]"
                              : "text-[#62685d] hover:text-[#252923] dark:text-[#9da398] dark:hover:text-[#f4f1ea]"
                          }`}
                        >
                          Essential
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation actions */}
      <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-4 pt-8 border-t border-[#e6e0d4] dark:border-[#323731]">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={onBack}
          disabled={isLoading}
        >
          ← Back to interests
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="lg"
          onClick={onSubmit}
          isLoading={isLoading}
          className="px-8"
        >
          Find cultural experiences
        </Button>
      </div>
    </div>
  );
};

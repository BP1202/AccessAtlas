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
  // Group requirements by category
  const categories: Array<RequirementDefinition["category"]> = [
    "accessibility",
    "comfort",
    "planning",
  ];

  // Count active preferences
  const activeCount = Object.values(preferences).filter(
    (state) => state !== "not_specified"
  ).length;

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header */}
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-400">
          Stage 2 of 2 · Visit Preferences
        </span>
        <h2 className="mt-2 font-serif text-2xl font-semibold text-stone-900 sm:text-3xl dark:text-stone-50">
          What matters for your visit?
        </h2>
        <p className="mt-2 text-sm text-stone-600 sm:text-base dark:text-stone-300">
          Choose only what is relevant for you or your companions. You don&apos;t need to explain why or disclose any personal details. AccessAtlas checks your choices against verified venue documentation.
        </p>
      </div>

      {/* Summary indicator */}
      <div className="flex items-center justify-between rounded-lg bg-stone-100/80 px-4 py-2.5 text-xs text-stone-600 dark:bg-stone-800/60 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
        <span>
          {activeCount === 0
            ? "No specific preferences selected (standard cultural discovery)"
            : `${activeCount} preference${activeCount > 1 ? "s" : ""} selected`}
        </span>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={() => {
              SUPPORTED_REQUIREMENTS.forEach((req) => {
                onChange(req.attribute, "not_specified");
              });
            }}
            className="text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 underline text-xs"
          >
            Reset all
          </button>
        )}
      </div>

      {/* Requirements by category */}
      <div className="space-y-8">
        {categories.map((category) => {
          const reqs = SUPPORTED_REQUIREMENTS.filter((r) => r.category === category);
          return (
            <div key={category} className="space-y-4">
              <div className="border-b border-stone-200 pb-2 dark:border-stone-800">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                  {REQUIREMENT_CATEGORY_LABELS[category]}
                </h3>
              </div>

              <div className="space-y-3">
                {reqs.map((req) => {
                  const currentState = preferences[req.attribute] || "not_specified";
                  return (
                    <div
                      key={req.attribute}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white p-4 transition-colors dark:border-stone-800 dark:bg-stone-900/60"
                    >
                      <div className="space-y-0.5 sm:max-w-md">
                        <label
                          id={`label-${req.attribute}`}
                          className="text-sm font-medium text-stone-900 dark:text-stone-100"
                        >
                          {req.label}
                        </label>
                        <p className="text-xs text-stone-500 dark:text-stone-400">
                          {req.description}
                        </p>
                      </div>

                      {/* Tri-state segmented control */}
                      <div
                        role="radiogroup"
                        aria-labelledby={`label-${req.attribute}`}
                        className="inline-flex rounded-lg border border-stone-200 bg-stone-100 p-1 dark:border-stone-700 dark:bg-stone-800 self-start sm:self-auto"
                      >
                        <button
                          type="button"
                          role="radio"
                          aria-checked={currentState === "not_specified"}
                          onClick={() => onChange(req.attribute, "not_specified")}
                          className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                            currentState === "not_specified"
                              ? "bg-white text-stone-900 shadow-sm dark:bg-stone-700 dark:text-stone-100"
                              : "text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200"
                          }`}
                        >
                          Not specified
                        </button>
                        <button
                          type="button"
                          role="radio"
                          aria-checked={currentState === "optional"}
                          onClick={() => onChange(req.attribute, "optional")}
                          className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                            currentState === "optional"
                              ? "bg-teal-700 text-white shadow-sm dark:bg-teal-600"
                              : "text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200"
                          }`}
                        >
                          Nice to have
                        </button>
                        <button
                          type="button"
                          role="radio"
                          aria-checked={currentState === "mandatory"}
                          onClick={() => onChange(req.attribute, "mandatory")}
                          className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                            currentState === "mandatory"
                              ? "bg-stone-900 text-white shadow-sm dark:bg-stone-100 dark:text-stone-900"
                              : "text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200"
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
      <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-6 border-t border-stone-200 dark:border-stone-800">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isLoading}
        >
          ← Back to interests
        </Button>
        <Button
          type="button"
          variant="primary"
          onClick={onSubmit}
          isLoading={isLoading}
          size="lg"
        >
          Find cultural experiences
        </Button>
      </div>
    </div>
  );
};

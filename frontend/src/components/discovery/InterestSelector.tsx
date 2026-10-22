import React, { useState } from "react";
import { Button } from "@/components/ui/Button";

export const SUGGESTED_INTERESTS = [
  "Textiles",
  "Heritage architecture",
  "Contemporary art",
  "Craft traditions",
  "History",
  "Photography",
] as const;

export interface InterestSelectorProps {
  selectedInterests: string[];
  onChange: (interests: string[]) => void;
  onNext: () => void;
  className?: string;
}

export const InterestSelector: React.FC<InterestSelectorProps> = ({
  selectedInterests,
  onChange,
  onNext,
  className = "",
}) => {
  const [customInput, setCustomInput] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);

  const maxInterests = 5;

  const handleAddInterest = (rawInterest: string) => {
    const trimmed = rawInterest.trim();
    if (!trimmed) {
      return;
    }

    if (trimmed.length > 100) {
      setInputError("Interests must be 100 characters or fewer.");
      return;
    }

    // Check if already selected (case-insensitive check, but preserve casing or capitalize)
    const exists = selectedInterests.some(
      (item) => item.toLowerCase() === trimmed.toLowerCase()
    );

    if (exists) {
      setInputError(`"${trimmed}" is already added.`);
      return;
    }

    if (selectedInterests.length >= maxInterests) {
      setInputError(`You can choose up to ${maxInterests} interests.`);
      return;
    }

    setInputError(null);
    onChange([...selectedInterests, trimmed]);
    setCustomInput("");
  };

  const handleRemoveInterest = (interestToRemove: string) => {
    setInputError(null);
    onChange(
      selectedInterests.filter(
        (item) => item.toLowerCase() !== interestToRemove.toLowerCase()
      )
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddInterest(customInput);
    }
  };

  const toggleSuggestion = (suggestion: string) => {
    const exists = selectedInterests.some(
      (item) => item.toLowerCase() === suggestion.toLowerCase()
    );
    if (exists) {
      handleRemoveInterest(suggestion);
    } else {
      handleAddInterest(suggestion);
    }
  };

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header / Instructions */}
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-400">
          Stage 1 of 2 · Cultural Interests
        </span>
        <h2 className="mt-2 font-serif text-2xl font-semibold text-stone-900 sm:text-3xl dark:text-stone-50">
          What cultural experiences spark your curiosity?
        </h2>
        <p className="mt-2 text-sm text-stone-600 sm:text-base dark:text-stone-300">
          Add cultural topics, art forms, or heritage interests you would love to explore in Ahmedabad. Choose 1 to 5 interests.
        </p>
      </div>

      {/* Selected Interests Chips */}
      <div>
        <div className="flex items-center justify-between pb-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
            Selected Interests ({selectedInterests.length}/{maxInterests})
          </label>
          {selectedInterests.length > 0 && (
            <button
              type="button"
              onClick={() => {
                onChange([]);
                setInputError(null);
              }}
              className="text-xs text-stone-500 hover:text-stone-900 dark:hover:text-stone-200 underline"
            >
              Clear all
            </button>
          )}
        </div>

        {selectedInterests.length === 0 ? (
          <div className="rounded-lg border border-dashed border-stone-300 p-4 text-center text-sm text-stone-500 dark:border-stone-700 dark:text-stone-400">
            No interests added yet. Click suggestions below or type your own.
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 pt-1" role="list" aria-label="Selected cultural interests">
            {selectedInterests.map((interest) => (
              <span
                key={interest}
                role="listitem"
                className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3.5 py-1.5 text-sm font-medium text-teal-900 border border-teal-200 dark:bg-teal-950/70 dark:text-teal-200 dark:border-teal-800"
              >
                <span>{interest}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveInterest(interest)}
                  aria-label={`Remove interest ${interest}`}
                  className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full text-teal-700 hover:bg-teal-200/60 hover:text-teal-950 dark:text-teal-300 dark:hover:bg-teal-800 dark:hover:text-white"
                >
                  <span aria-hidden="true" className="text-xs leading-none">×</span>
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Free-text input */}
      <div className="space-y-2">
        <label
          htmlFor="custom-interest-input"
          className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-300"
        >
          Add your own interest
        </label>
        <div className="flex gap-2">
          <input
            id="custom-interest-input"
            type="text"
            value={customInput}
            onChange={(e) => {
              setCustomInput(e.target.value);
              if (inputError) setInputError(null);
            }}
            onKeyDown={handleKeyDown}
            placeholder="e.g. Woodblock printing, Stepwells, Miniature painting..."
            disabled={selectedInterests.length >= maxInterests}
            maxLength={100}
            className="flex-1 rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-sm text-stone-900 placeholder-stone-400 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 disabled:bg-stone-100 disabled:cursor-not-allowed dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:placeholder-stone-500 dark:disabled:bg-stone-800"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => handleAddInterest(customInput)}
            disabled={!customInput.trim() || selectedInterests.length >= maxInterests}
          >
            Add
          </Button>
        </div>
        {inputError && (
          <p className="text-xs text-rose-600 dark:text-rose-400" role="alert">
            {inputError}
          </p>
        )}
      </div>

      {/* Suggested chips */}
      <div className="space-y-2 pt-2">
        <span className="block text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
          Suggested for Ahmedabad
        </span>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_INTERESTS.map((suggestion) => {
            const isSelected = selectedInterests.some(
              (item) => item.toLowerCase() === suggestion.toLowerCase()
            );
            return (
              <button
                key={suggestion}
                type="button"
                onClick={() => toggleSuggestion(suggestion)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  isSelected
                    ? "bg-teal-700 text-white border border-teal-700 shadow-sm"
                    : "bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:border-stone-700 dark:hover:bg-stone-700"
                }`}
                aria-pressed={isSelected}
              >
                <span>{suggestion}</span>
                <span aria-hidden="true">{isSelected ? "✓" : "+"}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation action */}
      <div className="pt-4 flex justify-end border-t border-stone-200 dark:border-stone-800">
        <Button
          type="button"
          variant="primary"
          onClick={onNext}
          disabled={selectedInterests.length === 0}
          className="w-full sm:w-auto"
        >
          Continue to visit preferences →
        </Button>
      </div>
    </div>
  );
};

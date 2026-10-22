import React, { useState } from "react";
import { Button } from "@/components/ui/Button";

export const SUGGESTED_INTERESTS = [
  { name: "Textiles", description: "Court textiles, Gujarati block printing, weaving" },
  { name: "Heritage architecture", description: "Centuries-old residential havelis, stepwells, stonework" },
  { name: "Contemporary art", description: "Modern Indian art, sculpture parks, dynamic galleries" },
  { name: "Craft traditions", description: "Living artisan traditions, pottery, woodcarving" },
  { name: "History", description: "Walled city archives, freedom movement landmarks" },
  { name: "Photography", description: "Lattice stonework, shadow play, heritage streetscapes" },
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
    if (!trimmed) return;

    if (trimmed.length > 100) {
      setInputError("Interests must be 100 characters or fewer.");
      return;
    }

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

  const toggleSuggestion = (suggestionName: string) => {
    const exists = selectedInterests.some(
      (item) => item.toLowerCase() === suggestionName.toLowerCase()
    );
    if (exists) {
      handleRemoveInterest(suggestionName);
    } else {
      handleAddInterest(suggestionName);
    }
  };

  return (
    <div className={`space-y-10 ${className}`}>
      {/* Header */}
      <div>
        <span className="text-xs font-semibold uppercase tracking-widest text-[#c56f4d]">
          Stage 01 · Cultural Curiosity
        </span>
        <h2 className="mt-3 font-serif text-3xl font-semibold text-[#252923] sm:text-4xl lg:text-5xl dark:text-[#f4f1ea]">
          What cultural experiences spark your curiosity?
        </h2>
        <p className="mt-4 text-base sm:text-lg text-[#62685d] max-w-2xl dark:text-[#9da398]">
          Type an interest or click our curated Ahmedabad topics below. AccessAtlas uses cultural taste mapping to surface connected spaces across the city.
        </p>
      </div>

      {/* Prominent Search / Custom Input */}
      <div className="space-y-3">
        <label
          htmlFor="custom-interest-input"
          className="block text-xs font-semibold uppercase tracking-wider text-[#62685d] dark:text-[#9da398]"
        >
          Add custom cultural interest or topic
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-[#62685d]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
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
              className="w-full rounded-2xl border border-[#e6e0d4] bg-white pl-12 pr-4 py-3.5 text-base text-[#252923] placeholder-[#9da398] shadow-xs focus:border-[#193a32] focus:outline-none focus:ring-2 focus:ring-[#193a32]/20 disabled:bg-[#ede8dc] disabled:cursor-not-allowed dark:border-[#323731] dark:bg-[#212520] dark:text-[#f4f1ea] dark:placeholder-[#62685d]"
            />
          </div>
          <Button
            type="button"
            variant="primary"
            onClick={() => handleAddInterest(customInput)}
            disabled={!customInput.trim() || selectedInterests.length >= maxInterests}
            className="sm:px-7 py-3.5"
          >
            Add topic
          </Button>
        </div>
        {inputError && (
          <p className="text-sm font-medium text-[#c56f4d]" role="alert">
            {inputError}
          </p>
        )}
      </div>

      {/* Selected Interests Chips */}
      <div>
        <div className="flex items-center justify-between pb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#62685d] dark:text-[#9da398]">
            Your Chosen Interests ({selectedInterests.length}/{maxInterests})
          </span>
          {selectedInterests.length > 0 && (
            <button
              type="button"
              onClick={() => {
                onChange([]);
                setInputError(null);
              }}
              className="text-xs font-medium text-[#c56f4d] hover:underline"
            >
              Reset all
            </button>
          )}
        </div>

        {selectedInterests.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#dfd8c8] p-6 text-center text-sm text-[#62685d] bg-[#f6f3eb]/60 dark:border-[#323731] dark:bg-[#212520]/40 dark:text-[#9da398]">
            No interests added yet. Click one or more topics below to begin your discovery.
          </div>
        ) : (
          <div className="flex flex-wrap gap-2.5 pt-1" role="list" aria-label="Selected cultural interests">
            {selectedInterests.map((interest) => (
              <span
                key={interest}
                role="listitem"
                className="inline-flex items-center gap-2 rounded-full bg-[#193a32] px-4 py-2 text-sm font-medium text-[#f6f3eb] shadow-xs dark:bg-[#2a584d]"
              >
                <span>{interest}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveInterest(interest)}
                  aria-label={`Remove interest ${interest}`}
                  className="inline-flex h-4 w-4 items-center justify-center rounded-full text-[#d8e2dc] hover:text-white"
                >
                  <span aria-hidden="true" className="text-sm font-bold">×</span>
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Curated Suggestion Tiles */}
      <div className="space-y-4">
        <span className="block text-xs font-semibold uppercase tracking-wider text-[#62685d] dark:text-[#9da398]">
          Curated Ahmedabad Themes
        </span>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SUGGESTED_INTERESTS.map((item) => {
            const isSelected = selectedInterests.some(
              (sel) => sel.toLowerCase() === item.name.toLowerCase()
            );
            return (
              <button
                key={item.name}
                type="button"
                onClick={() => toggleSuggestion(item.name)}
                className={`p-4 rounded-2xl text-left border transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? "bg-[#193a32] text-white border-[#193a32] shadow-sm dark:bg-[#2a584d] dark:border-[#2a584d]"
                    : "bg-white border-[#e6e0d4] text-[#252923] hover:border-[#193a32] hover:bg-[#faf8f5] shadow-xs dark:bg-[#212520] dark:border-[#323731] dark:text-[#f4f1ea] dark:hover:border-[#c56f4d]"
                }`}
                aria-pressed={isSelected}
              >
                <div className="flex items-center justify-between">
                  <span className="font-serif text-base font-semibold">{item.name}</span>
                  <span className={`text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center ${
                    isSelected ? "bg-white text-[#193a32]" : "bg-[#ede8dc] text-[#62685d]"
                  }`}>
                    {isSelected ? "✓" : "+"}
                  </span>
                </div>
                <p className={`mt-1.5 text-xs line-clamp-2 ${
                  isSelected ? "text-[#d8e2dc]" : "text-[#62685d] dark:text-[#9da398]"
                }`}>
                  {item.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Next Step Action */}
      <div className="pt-6 border-t border-[#e6e0d4] dark:border-[#323731] flex justify-end">
        <Button
          type="button"
          variant="secondary"
          size="lg"
          onClick={onNext}
          disabled={selectedInterests.length === 0}
          className="w-full sm:w-auto px-8"
        >
          Continue to visit preferences →
        </Button>
      </div>
    </div>
  );
};

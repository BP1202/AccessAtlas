import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { CulturalCompass } from "./CulturalCompass";
import type { CompassAnswers } from "@/lib/compass";

export type EntryPath = "manual" | "help" | "surprise";

export const SUGGESTED_INTERESTS = [
  { name: "Textiles", description: "Court textiles, Gujarati block printing, weaving" },
  { name: "Heritage architecture", description: "Centuries-old residential havelis, stepwells, stonework" },
  { name: "Contemporary art", description: "Modern Indian art, sculpture parks, dynamic galleries" },
  { name: "Craft traditions", description: "Living artisan traditions, pottery, woodcarving" },
  { name: "History", description: "Walled city archives, freedom movement landmarks" },
  { name: "Photography", description: "Lattice stonework, shadow play, heritage streetscapes" },
] as const;

export const SURPRISE_DIRECTIONS = [
  {
    title: "Court Textiles & Domestic Havelis",
    query: "Court textiles & haveli architecture",
    description: "Intricate Gujarati embroidery traditions housed inside historic wooden havelis.",
  },
  {
    title: "Modernist Brick Vaults & Geometry",
    query: "Modernist brick architecture",
    description: "Mid-century architectural landmarks, shadow-play, and raw exposed brickwork.",
  },
  {
    title: "Living Craft & Woodblock Traditions",
    query: "Woodblock printing & craft",
    description: "Centuries-old artisan workshops, natural dye vats, and hand-carved blocks.",
  },
  {
    title: "Quiet Courtyards & Acoustic Memory",
    query: "Historic haveli courtyards & sound archives",
    description: "Tranquil stone courtyards, democratic dialogue spaces, and communal sound archives.",
  },
  {
    title: "Miniature Painting & Tree-Shaded Grounds",
    query: "Persian & Indian miniature painting",
    description: "Ancestral estates displaying classical miniature traditions amidst tranquil gardens.",
  },
];

export interface InterestSelectorProps {
  selectedInterests: string[];
  onChange: (interests: string[]) => void;
  onNext: () => void;
  initialPath?: EntryPath;
  className?: string;
}

export const InterestSelector: React.FC<InterestSelectorProps> = ({
  selectedInterests,
  onChange,
  onNext,
  initialPath = "manual",
  className = "",
}) => {
  const [activePath, setActivePath] = useState<EntryPath>(initialPath);
  const [customInput, setCustomInput] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);
  const [surpriseOffset, setSurpriseOffset] = useState(0);
  const [compassAnswers, setCompassAnswers] = useState<CompassAnswers>({});

  const maxInterests = 5;

  const handleAddInterest = (rawInterest: string) => {
    const trimmed = rawInterest.trim();
    if (!trimmed) {
      setInputError("Please enter a cultural topic before adding.");
      return;
    }

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

  const handleApplySurprise = (query: string) => {
    handleAddInterest(query);
  };

  const handleShuffleSurprise = () => {
    setSurpriseOffset((prev) => (prev + 1) % SURPRISE_DIRECTIONS.length);
  };

  // Reorder surprise directions based on shuffle
  const displayedSurprises = [
    ...SURPRISE_DIRECTIONS.slice(surpriseOffset),
    ...SURPRISE_DIRECTIONS.slice(0, surpriseOffset),
  ].slice(0, 3);

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header */}
      <div>
        <span className="text-xs font-semibold uppercase tracking-widest text-[#c56f4d]">
          Stage 01 · Cultural Curiosity
        </span>
        <h2 className="mt-3 font-serif text-3xl font-semibold text-[#252923] sm:text-4xl lg:text-5xl dark:text-[#f4f1ea]">
          What cultural experiences spark your curiosity?
        </h2>
        <p className="mt-4 text-base sm:text-lg text-[#62685d] max-w-2xl dark:text-[#9da398]">
          Choose how you would like to start. You always retain control of your interests and can edit or refine them at any time.
        </p>
      </div>

      {/* Entry Path Selection Tabs */}
      <div
        role="tablist"
        aria-label="Discovery entry paths"
        className="flex flex-wrap items-center gap-2 border-b border-[#e6e0d4] pb-4 dark:border-[#323731]"
      >
        <button
          role="tab"
          type="button"
          aria-selected={activePath === "manual"}
          onClick={() => setActivePath("manual")}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            activePath === "manual"
              ? "bg-[#193a32] text-white shadow-xs dark:bg-[#2a584d]"
              : "bg-white text-[#62685d] border border-[#e6e0d4] hover:text-[#252923] hover:border-[#193a32] dark:bg-[#212520] dark:border-[#323731] dark:text-[#9da398]"
          }`}
        >
          ✍️ I know what I want
        </button>

        <button
          role="tab"
          type="button"
          aria-selected={activePath === "help"}
          onClick={() => setActivePath("help")}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            activePath === "help"
              ? "bg-[#193a32] text-white shadow-xs dark:bg-[#2a584d]"
              : "bg-white text-[#62685d] border border-[#e6e0d4] hover:text-[#252923] hover:border-[#193a32] dark:bg-[#212520] dark:border-[#323731] dark:text-[#9da398]"
          }`}
        >
          🧭 Help me discover
        </button>

        <button
          role="tab"
          type="button"
          aria-selected={activePath === "surprise"}
          onClick={() => setActivePath("surprise")}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            activePath === "surprise"
              ? "bg-[#193a32] text-white shadow-xs dark:bg-[#2a584d]"
              : "bg-white text-[#62685d] border border-[#e6e0d4] hover:text-[#252923] hover:border-[#193a32] dark:bg-[#212520] dark:border-[#323731] dark:text-[#9da398]"
          }`}
        >
          ✨ Surprise me
        </button>
      </div>

      {/* ====================================================================
          ENTRY PATH A: "I KNOW WHAT I WANT" (Manual Entry & Curated Themes)
      ==================================================================== */}
      {activePath === "manual" && (
        <div className="space-y-8 animate-fadeIn" role="tabpanel" aria-label="I know what I want">
          {/* Prominent Search / Custom Input */}
          <div className="space-y-3">
            <label
              htmlFor="custom-interest-input"
              className="block text-xs font-semibold uppercase tracking-wider text-[#62685d] dark:text-[#9da398]"
            >
              Add cultural interest or topic
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

          {/* Curated Suggestion Tiles */}
          <div className="space-y-4">
            <span className="block text-xs font-semibold uppercase tracking-wider text-[#62685d] dark:text-[#9da398]">
              Or choose from curated Ahmedabad themes
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
        </div>
      )}

      {/* ====================================================================
          ENTRY PATH B: "HELP ME DISCOVER" (Cultural Compass Experience)
      ==================================================================== */}
      {activePath === "help" && (
        <div className="space-y-6 animate-fadeIn" role="tabpanel" aria-label="Help me discover">
          <CulturalCompass
            initialAnswers={compassAnswers}
            existingInterests={selectedInterests}
            onComplete={(finalAnswers, derivedInterests) => {
              setCompassAnswers(finalAnswers);
              onChange(derivedInterests);
            }}
            onExitToManual={() => setActivePath("manual")}
          />
        </div>
      )}

      {/* ====================================================================
          ENTRY PATH C: "SURPRISE ME" (Serendipity Starting Directions)
      ==================================================================== */}
      {activePath === "surprise" && (
        <div className="space-y-6 animate-fadeIn" role="tabpanel" aria-label="Surprise me">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#c56f4d]">
                Serendipitous Directions
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[#252923] dark:text-[#f4f1ea]">
                Curated starting sparks from Ahmedabad
              </h3>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleShuffleSurprise}
              className="self-start sm:self-auto text-xs"
            >
              🎲 Shuffle directions
            </Button>
          </div>

          <p className="text-xs sm:text-sm text-[#62685d] dark:text-[#9da398]">
            Click any spark to add it directly to your selected interests. You can customize, edit, or add more before proceeding.
          </p>

          <div className="grid gap-4 sm:grid-cols-3">
            {displayedSurprises.map((item) => {
              const isSelected = selectedInterests.some(
                (sel) => sel.toLowerCase() === item.query.toLowerCase()
              );

              return (
                <div
                  key={item.title}
                  className="rounded-2xl border border-[#e6e0d4] bg-white p-5 shadow-xs flex flex-col justify-between dark:border-[#323731] dark:bg-[#212520]"
                >
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-[#c56f4d]">
                      Curated Spark
                    </span>
                    <h4 className="mt-1 font-serif text-lg font-semibold text-[#252923] dark:text-[#f4f1ea]">
                      {item.title}
                    </h4>
                    <p className="mt-2 text-xs leading-relaxed text-[#62685d] dark:text-[#9da398]">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-[#ede8dc] dark:border-[#323731]">
                    <Button
                      type="button"
                      size="sm"
                      variant={isSelected ? "outline" : "secondary"}
                      disabled={isSelected || selectedInterests.length >= maxInterests}
                      onClick={() => handleApplySurprise(item.query)}
                      className="w-full text-xs"
                    >
                      {isSelected ? "✓ Added" : "+ Add to my interests"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 flex justify-start">
            <button
              type="button"
              onClick={() => setActivePath("manual")}
              className="text-xs font-semibold text-[#193a32] hover:text-[#c56f4d] underline underline-offset-4 dark:text-[#a8d5c4] cursor-pointer"
            >
              ← Customize or type custom interests in manual entry
            </button>
          </div>
        </div>
      )}

      {/* ====================================================================
          SHARED CHIP BAR: Current Chosen Interests (Persisted Across All Tabs)
      ==================================================================== */}
      <div className="pt-6 border-t border-[#e6e0d4] dark:border-[#323731] space-y-3">
        <div className="flex items-center justify-between">
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
              className="text-xs font-medium text-[#c56f4d] hover:underline cursor-pointer"
            >
              Reset all
            </button>
          )}
        </div>

        {selectedInterests.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#dfd8c8] p-5 text-center text-xs sm:text-sm text-[#62685d] bg-[#f6f3eb]/60 dark:border-[#323731] dark:bg-[#212520]/40 dark:text-[#9da398]">
            No interests added yet. Type an interest above or select a curated spark to begin.
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
                  className="inline-flex h-4 w-4 items-center justify-center rounded-full text-[#d8e2dc] hover:text-white cursor-pointer"
                >
                  <span aria-hidden="true" className="text-sm font-bold">×</span>
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Next Step Action */}
      <div className="pt-4 flex justify-end">
        <Button
          type="button"
          variant="secondary"
          size="lg"
          onClick={onNext}
          disabled={selectedInterests.length === 0}
          className="w-full sm:w-auto px-8 font-semibold shadow-sm"
        >
          Continue to visit preferences →
        </Button>
      </div>
    </div>
  );
};

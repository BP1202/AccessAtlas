import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  type TasteMemory,
  addExplicitInterest,
  removeExplicitInterest,
  addCurrentOutingInterest,
  removeCurrentOutingInterest,
  addFutureTripInterest,
  removeFutureTripInterest,
  moveInterestToOuting,
  moveInterestToFuture,
  resetTasteMemory,
  clearOutingOverride,
  removeExcludedInterest,
} from "@/lib/taste";

export interface TasteMemoryPanelProps {
  memory: TasteMemory;
  onUpdateMemory: (newMemory: TasteMemory) => void;
  className?: string;
  defaultExpanded?: boolean;
}

export const TasteMemoryPanel: React.FC<TasteMemoryPanelProps> = ({
  memory,
  onUpdateMemory,
  className = "",
  defaultExpanded = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [customInput, setCustomInput] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);

  const totalInterestsCount =
    memory.explicitInterests.length +
    memory.compassInterests.length +
    memory.futureTripInterests.length;

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customInput.trim();
    if (!trimmed) return;

    if (trimmed.length > 100) {
      setInputError("Interests must be 100 characters or fewer.");
      return;
    }

    const updated = addExplicitInterest(memory, trimmed);
    if (updated === memory) {
      setInputError(`"${trimmed}" is already in your interests.`);
      return;
    }

    setInputError(null);
    setCustomInput("");
    onUpdateMemory(updated);
  };

  const handleReset = () => {
    if (window.confirm("Clear all saved cultural notes and start fresh?")) {
      onUpdateMemory(resetTasteMemory());
    }
  };

  return (
    <aside
      aria-label="Your Cultural Journal"
      data-testid="taste-memory-panel"
      className={`rounded-2xl border border-[#dfd8c8] bg-[#fbf9f5] transition-all duration-200 dark:border-[#323731] dark:bg-[#1a1e1a] ${className}`}
    >
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5">
        <div className="flex items-center gap-2.5">
          <span className="text-base select-none" aria-hidden="true">
            🧭
          </span>
          <div>
            <h3 className="font-serif text-base font-semibold text-[#252923] dark:text-[#f4f1ea] inline-flex items-center gap-2">
              <span>Your Cultural Journal</span>
              <span className="rounded-full bg-[#193a32]/10 px-2.5 py-0.5 text-[11px] font-sans font-medium text-[#193a32] dark:bg-[#a8d5c4]/15 dark:text-[#a8d5c4]">
                {totalInterestsCount} saved
              </span>
            </h3>
            <p className="text-xs text-[#62685d] dark:text-[#9da398]">
              Personal taste notes · Private to you · Always editable
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isExpanded && (
            <button
              type="button"
              onClick={handleReset}
              className="text-xs font-medium text-[#c56f4d] hover:underline cursor-pointer px-2 py-1"
            >
              Reset notes
            </button>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded((prev) => !prev)}
            aria-expanded={isExpanded}
            className="text-xs"
          >
            {isExpanded ? "Hide journal ↑" : "Review your cultural notes ↓"}
          </Button>
        </div>
      </div>

      {/* Expanded Editing Body */}
      {isExpanded && (
        <div className="border-t border-[#e6e0d4] p-4 sm:p-6 space-y-6 animate-fadeIn dark:border-[#323731]">
          {/* Section 1: Interests for THIS Outing */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#193a32] dark:text-[#a8d5c4]">
                  1. Focus for This Outing ({memory.currentOutingInterests.length}/5)
                </span>
                {memory.isOutingOverridden && (
                  <span className="rounded-full bg-[#c56f4d]/15 px-2 py-0.5 text-[10px] font-semibold text-[#c56f4d]">
                    Today&apos;s choice (Override)
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {memory.isOutingOverridden && (
                  <button
                    type="button"
                    onClick={() => onUpdateMemory(clearOutingOverride(memory))}
                    className="text-[11px] font-medium text-[#c56f4d] hover:underline cursor-pointer"
                  >
                    ↺ Switch back to usual interests
                  </button>
                )}
                <span className="text-[11px] text-[#62685d] dark:text-[#9da398]">
                  Used for this visit&apos;s recommendations
                </span>
              </div>
            </div>

            {memory.currentOutingInterests.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#dfd8c8] p-3.5 text-center text-xs text-[#62685d] bg-white dark:border-[#323731] dark:bg-[#212520] dark:text-[#9da398]">
                No interests active for this outing yet. Add topics below or choose them during discovery.
              </div>
            ) : (
              <div className="flex flex-wrap gap-2" role="list" aria-label="Current outing interests">
                {memory.currentOutingInterests.map((interest) => (
                  <div
                    key={interest}
                    role="listitem"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[#bcd6cb] bg-[#eaf2ee] px-3 py-1.5 text-xs text-[#193a32] shadow-2xs dark:border-[#2f5545] dark:bg-[#1d352b] dark:text-[#b8ded0]"
                  >
                    <span className="font-medium">{interest}</span>
                    <button
                      type="button"
                      title="Save for another outing"
                      aria-label={`Save ${interest} for another outing`}
                      onClick={() => onUpdateMemory(moveInterestToFuture(memory, interest))}
                      className="ml-1 text-[11px] text-[#2a584d] hover:text-[#193a32] dark:text-[#a8d5c4] cursor-pointer"
                    >
                      Save for later ↗
                    </button>
                    <button
                      type="button"
                      aria-label={`Remove ${interest} from outing`}
                      onClick={() => onUpdateMemory(removeCurrentOutingInterest(memory, interest))}
                      className="ml-1 font-bold text-[#62685d] hover:text-[#252923] dark:hover:text-[#f4f1ea] cursor-pointer"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: My General Interests */}
          <div className="space-y-3 pt-2 border-t border-[#e6e0d4]/60 dark:border-[#323731]/60">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#62685d] dark:text-[#9da398]">
                2. My Stated Interests ({memory.explicitInterests.length})
              </span>
            </div>

            {memory.explicitInterests.length === 0 ? (
              <p className="text-xs text-[#73796e] italic dark:text-[#888f83]">
                No general interests added yet.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2" role="list" aria-label="Explicit interests">
                {memory.explicitInterests.map((interest) => {
                  const isInOuting = memory.currentOutingInterests.some(
                    (i) => i.toLowerCase() === interest.toLowerCase()
                  );
                  const isFuture = memory.futureTripInterests.some(
                    (i) => i.toLowerCase() === interest.toLowerCase()
                  );

                  return (
                    <div
                      key={interest}
                      role="listitem"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-[#e6e0d4] bg-white px-3 py-1.5 text-xs text-[#252923] shadow-2xs dark:border-[#323731] dark:bg-[#212520] dark:text-[#f4f1ea]"
                    >
                      <span>{interest}</span>

                      {!isInOuting && memory.currentOutingInterests.length < 5 && (
                        <button
                          type="button"
                          onClick={() => onUpdateMemory(addCurrentOutingInterest(memory, interest))}
                          className="text-[11px] font-semibold text-[#193a32] hover:underline dark:text-[#a8d5c4] cursor-pointer ml-1"
                        >
                          + This outing
                        </button>
                      )}

                      {!isFuture && (
                        <button
                          type="button"
                          onClick={() => onUpdateMemory(addFutureTripInterest(memory, interest))}
                          className="text-[11px] text-[#62685d] hover:underline dark:text-[#9da398] cursor-pointer ml-1"
                        >
                          Later
                        </button>
                      )}

                      <button
                        type="button"
                        aria-label={`Remove explicit interest ${interest}`}
                        onClick={() => onUpdateMemory(removeExplicitInterest(memory, interest))}
                        className="ml-1 font-bold text-[#9da398] hover:text-[#252923] dark:hover:text-[#f4f1ea] cursor-pointer"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Quick add topic input */}
            <form onSubmit={handleAddCustom} className="flex gap-2 pt-1">
              <input
                type="text"
                value={customInput}
                onChange={(e) => {
                  setCustomInput(e.target.value);
                  if (inputError) setInputError(null);
                }}
                placeholder="Add another cultural interest..."
                maxLength={100}
                className="flex-1 rounded-xl border border-[#e6e0d4] bg-white px-3 py-1.5 text-xs text-[#252923] placeholder-[#9da398] focus:border-[#193a32] focus:outline-none dark:border-[#323731] dark:bg-[#212520] dark:text-[#f4f1ea]"
              />
              <Button type="submit" size="sm" variant="outline" className="text-xs">
                + Add
              </Button>
            </form>
            {inputError && (
              <p className="text-[11px] font-medium text-[#c56f4d]" role="alert">
                {inputError}
              </p>
            )}
          </div>

          {/* Section 3: Suggested from Cultural Compass */}
          <div className="space-y-3 pt-2 border-t border-[#e6e0d4]/60 dark:border-[#323731]/60">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#62685d] dark:text-[#9da398]">
              3. Suggested from Cultural Compass ({memory.compassInterests.length})
            </span>

            {memory.compassInterests.length === 0 ? (
              <p className="text-xs text-[#73796e] italic dark:text-[#888f83]">
                No compass suggestions yet. Use &ldquo;Help me discover&rdquo; on Explore to surface directions.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2" role="list" aria-label="Compass suggested interests">
                {memory.compassInterests.map((interest) => {
                  const isInOuting = memory.currentOutingInterests.some(
                    (i) => i.toLowerCase() === interest.toLowerCase()
                  );
                  const prov = memory.compassProvenance.find(
                    (p) => p.interest.toLowerCase() === interest.toLowerCase()
                  );

                  return (
                    <div
                      key={interest}
                      role="listitem"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-[#e6e0d4] bg-[#faf8f5] px-3 py-1.5 text-xs text-[#252923] shadow-2xs dark:border-[#323731] dark:bg-[#1a1e1a] dark:text-[#f4f1ea]"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{interest}</span>
                        <span className="text-[9px] text-[#73796e] dark:text-[#888f83]">
                          {prov ? `From: ${prov.choice === "both" ? "Both" : "Compass"}` : "Compass suggestion"}
                        </span>
                      </div>

                      {!isInOuting && memory.currentOutingInterests.length < 5 && (
                        <button
                          type="button"
                          onClick={() => onUpdateMemory(addCurrentOutingInterest(memory, interest))}
                          className="text-[11px] font-semibold text-[#193a32] hover:underline dark:text-[#a8d5c4] cursor-pointer ml-1"
                        >
                          + This outing
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => onUpdateMemory(addFutureTripInterest(memory, interest))}
                        className="text-[11px] text-[#62685d] hover:underline dark:text-[#9da398] cursor-pointer ml-1"
                      >
                        Later
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 4: Saved for Another Outing (Future Trips) */}
          <div className="space-y-3 pt-2 border-t border-[#e6e0d4]/60 dark:border-[#323731]/60">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#62685d] dark:text-[#9da398]">
              4. Saved for Another Outing ({memory.futureTripInterests.length})
            </span>

            {memory.futureTripInterests.length === 0 ? (
              <p className="text-xs text-[#73796e] italic dark:text-[#888f83]">
                Nothing saved for future outings yet. Click &ldquo;Later&rdquo; on any interest to save it here.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2" role="list" aria-label="Future trip interests">
                {memory.futureTripInterests.map((interest) => (
                  <div
                    key={interest}
                    role="listitem"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-[#dfd8c8] bg-white px-3 py-1.5 text-xs text-[#252923] shadow-2xs dark:border-[#323731] dark:bg-[#212520] dark:text-[#f4f1ea]"
                  >
                    <span>{interest}</span>

                    {memory.currentOutingInterests.length < 5 && (
                      <button
                        type="button"
                        title="Move to current outing"
                        onClick={() => onUpdateMemory(moveInterestToOuting(memory, interest))}
                        className="text-[11px] font-semibold text-[#193a32] hover:underline dark:text-[#a8d5c4] cursor-pointer ml-1"
                      >
                        ↑ Move to outing
                      </button>
                    )}

                    <button
                      type="button"
                      aria-label={`Remove future interest ${interest}`}
                      onClick={() => onUpdateMemory(removeFutureTripInterest(memory, interest))}
                      className="ml-1 font-bold text-[#9da398] hover:text-[#252923] dark:hover:text-[#f4f1ea] cursor-pointer"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 5: Dismissed Topics (Not for me) */}
          {memory.excludedInterests.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-[#e6e0d4]/60 dark:border-[#323731]/60">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#8e3c1f] dark:text-[#f4a585]">
                  5. Dismissed Topics ({memory.excludedInterests.length})
                </span>
                <span className="text-[11px] text-[#62685d] dark:text-[#9da398]">
                  Dismissed via &quot;Not for me&quot;
                </span>
              </div>
              <div className="flex flex-wrap gap-2" role="list" aria-label="Dismissed topics">
                {memory.excludedInterests.map((interest) => (
                  <div
                    key={interest}
                    role="listitem"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[#c56f4d]/30 bg-[#fbf2ed] px-3 py-1.5 text-xs text-[#8e3c1f] shadow-2xs dark:border-[#c56f4d]/40 dark:bg-[#2e1d17] dark:text-[#f4a585]"
                  >
                    <span>{interest}</span>
                    <button
                      type="button"
                      aria-label={`Restore ${interest}`}
                      onClick={() => onUpdateMemory(removeExcludedInterest(memory, interest))}
                      className="text-[11px] font-semibold text-[#8e3c1f] hover:underline dark:text-[#f4a585] cursor-pointer ml-1"
                    >
                      Restore ↺
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Privacy & Transparency Footnote */}
          <div className="rounded-xl bg-white p-3 border border-[#e6e0d4] text-[11px] leading-relaxed text-[#62685d] dark:bg-[#212520] dark:border-[#323731] dark:text-[#9da398] flex items-start gap-2">
            <span className="select-none" aria-hidden="true">
              🔒
            </span>
            <span>
              <strong>Your privacy:</strong> Your cultural interests are kept private on your device during your visit and are never sold or used for advertising. Only the topics you actively confirm are used to explore matching cultural experiences.
            </span>
          </div>
        </div>
      )}
    </aside>
  );
};

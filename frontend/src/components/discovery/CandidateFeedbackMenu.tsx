import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import type { CandidateParticipationPlan } from "@/lib/api/types";
import {
  type TasteMemory,
  applyMoreLikeThis,
  applyNotThisTrip,
  applyNotForMe,
  applySaveForLater,
  applyDifferentDirection,
} from "@/lib/taste";

export interface CandidateFeedbackMenuProps {
  plan: CandidateParticipationPlan;
  memory: TasteMemory;
  onApplyFeedback: (newMemory: TasteMemory, explanation: string, triggerRefresh?: boolean) => void;
  className?: string;
}

export const ALTERNATIVE_DIRECTIONS = [
  { title: "Modernist Architecture", query: "Modernist brick architecture" },
  { title: "Living Craft Traditions", query: "Woodblock printing & living craft" },
  { title: "Quiet Courtyard Acoustics", query: "Historic courtyards & sound archives" },
  { title: "Culinary Heritage", query: "Traditional recipes & spice heritage" },
] as const;

export const CandidateFeedbackMenu: React.FC<CandidateFeedbackMenuProps> = ({
  plan,
  memory,
  onApplyFeedback,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activePrompt, setActivePrompt] = useState<
    "none" | "more_like_this" | "not_this_trip" | "not_for_me" | "save_later" | "different_direction"
  >("none");

  const { candidate } = plan;

  // Derive candidate cultural topics from tags and entity info
  const candidateTopics: string[] = [];
  if (candidate.tags && candidate.tags.length > 0) {
    for (const tag of candidate.tags) {
      if (tag.name && !candidateTopics.includes(tag.name)) {
        candidateTopics.push(tag.name);
      }
    }
  }
  if (candidate.subtype && !candidateTopics.includes(candidate.subtype)) {
    candidateTopics.push(candidate.subtype);
  }
  if (candidateTopics.length === 0) {
    candidateTopics.push(candidate.name);
  }

  const handleMoreLikeThis = (topic: string) => {
    const updated = applyMoreLikeThis(memory, topic);
    onApplyFeedback(
      updated,
      `Added "${topic}" to your active outing interests.`
    );
    setIsOpen(false);
    setActivePrompt("none");
  };

  const handleNotThisTrip = (topic: string) => {
    const updated = applyNotThisTrip(memory, topic);
    onApplyFeedback(
      updated,
      `Removed "${topic}" from today's interests. Your general cultural journal is unchanged.`
    );
    setIsOpen(false);
    setActivePrompt("none");
  };

  const handleNotForMe = (topic: string) => {
    const updated = applyNotForMe(memory, topic);
    onApplyFeedback(
      updated,
      `Removed "${topic}" from your interests.`
    );
    setIsOpen(false);
    setActivePrompt("none");
  };

  const handleSaveForLater = (topic: string) => {
    const updated = applySaveForLater(memory, topic);
    onApplyFeedback(
      updated,
      `Saved "${topic}" for another outing.`
    );
    setIsOpen(false);
    setActivePrompt("none");
  };

  const handleDifferentDirection = (direction: string) => {
    const updated = applyDifferentDirection(memory, [direction]);
    onApplyFeedback(
      updated,
      `Switched outing focus to "${direction}". Practical requirements preserved.`,
      true // Trigger discovery refresh with preserved requirements
    );
    setIsOpen(false);
    setActivePrompt("none");
  };

  return (
    <div className={`relative ${className}`} data-testid="candidate-feedback-container">
      {/* Progressive Disclosure Trigger: Compact button */}
      {!isOpen && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setIsOpen(true);
            setActivePrompt("none");
          }}
          data-testid="feedback-trigger-btn"
          className="text-xs text-[#62685d] hover:text-[#193a32] dark:text-[#9da398] dark:hover:text-[#a8d5c4]"
        >
          <span aria-hidden="true" className="mr-1.5">🧭</span>
          <span>Teach my compass</span>
        </Button>
      )}

      {/* Expanded Feedback Panel */}
      {isOpen && (
        <div
          role="region"
          aria-label={`Feedback controls for ${candidate.name}`}
          data-testid="candidate-feedback-menu"
          className="rounded-2xl border border-[#dfd8c8] bg-[#fbf9f5] p-4 sm:p-5 space-y-4 animate-fadeIn dark:border-[#323731] dark:bg-[#1a1e1a]"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#e6e0d4] pb-2.5 dark:border-[#323731]">
            <div className="flex items-center gap-1.5">
              <span className="text-sm select-none" aria-hidden="true">🧭</span>
              <span className="font-serif text-xs font-semibold text-[#252923] dark:text-[#f4f1ea]">
                Refine Recommendations With This Experience
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setActivePrompt("none");
              }}
              data-testid="feedback-close-btn"
              className="text-xs text-[#62685d] hover:text-[#252923] dark:text-[#9da398] dark:hover:text-[#f4f1ea] cursor-pointer"
            >
              Cancel ×
            </button>
          </div>

          {/* Main Action Selection: 5 concise options */}
          {activePrompt === "none" && (
            <div className="space-y-2">
              <p className="text-xs text-[#62685d] dark:text-[#9da398]">
                How does <em>{candidate.name}</em> compare with what you are looking for?
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    if (candidateTopics.length === 1) {
                      handleMoreLikeThis(candidateTopics[0]);
                    } else {
                      setActivePrompt("more_like_this");
                    }
                  }}
                  data-testid="feedback-more-like-this"
                  className="p-2.5 rounded-xl border border-[#e6e0d4] bg-white text-left text-xs font-medium text-[#252923] hover:border-[#193a32] hover:bg-[#faf8f5] transition-all cursor-pointer dark:border-[#323731] dark:bg-[#212520] dark:text-[#f4f1ea]"
                >
                  <span className="font-semibold text-[#193a32] dark:text-[#a8d5c4] block">
                    ✨ More like this
                  </span>
                  <span className="text-[11px] text-[#62685d] dark:text-[#9da398]">
                    Explore more experiences in this cultural direction
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (candidateTopics.length === 1) {
                      handleNotThisTrip(candidateTopics[0]);
                    } else {
                      setActivePrompt("not_this_trip");
                    }
                  }}
                  data-testid="feedback-not-this-trip"
                  className="p-2.5 rounded-xl border border-[#e6e0d4] bg-white text-left text-xs font-medium text-[#252923] hover:border-[#193a32] hover:bg-[#faf8f5] transition-all cursor-pointer dark:border-[#323731] dark:bg-[#212520] dark:text-[#f4f1ea]"
                >
                  <span className="font-semibold text-[#c56f4d] block">
                    ⏸ Not this trip
                  </span>
                  <span className="text-[11px] text-[#62685d] dark:text-[#9da398]">
                    Pause for today without altering your saved journal
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (candidateTopics.length === 1) {
                      handleNotForMe(candidateTopics[0]);
                    } else {
                      setActivePrompt("not_for_me");
                    }
                  }}
                  data-testid="feedback-not-for-me"
                  className="p-2.5 rounded-xl border border-[#e6e0d4] bg-white text-left text-xs font-medium text-[#252923] hover:border-[#193a32] hover:bg-[#faf8f5] transition-all cursor-pointer dark:border-[#323731] dark:bg-[#212520] dark:text-[#f4f1ea]"
                >
                  <span className="font-semibold text-[#8e3c1f] block">
                    ✕ Not for me
                  </span>
                  <span className="text-[11px] text-[#62685d] dark:text-[#9da398]">
                    Dismiss a specific topic without broad downranking
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (candidateTopics.length === 1) {
                      handleSaveForLater(candidateTopics[0]);
                    } else {
                      setActivePrompt("save_later");
                    }
                  }}
                  data-testid="feedback-save-later"
                  className="p-2.5 rounded-xl border border-[#e6e0d4] bg-white text-left text-xs font-medium text-[#252923] hover:border-[#193a32] hover:bg-[#faf8f5] transition-all cursor-pointer dark:border-[#323731] dark:bg-[#212520] dark:text-[#f4f1ea]"
                >
                  <span className="font-semibold text-[#252923] dark:text-[#f4f1ea] block">
                    📌 Save for another outing
                  </span>
                  <span className="text-[11px] text-[#62685d] dark:text-[#9da398]">
                    Keep this direction in mind for a future visit
                  </span>
                </button>
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setActivePrompt("different_direction")}
                  data-testid="feedback-different-direction"
                  className="w-full p-2.5 rounded-xl border border-dashed border-[#cfc7b6] text-left text-xs font-medium text-[#62685d] hover:border-[#193a32] hover:text-[#193a32] hover:bg-white transition-all cursor-pointer dark:border-[#384941] dark:text-[#9da398] dark:hover:text-[#a8d5c4] dark:hover:bg-[#212520]"
                >
                  <span className="font-semibold block">🔀 Show a different direction</span>
                  <span className="text-[11px]">
                    Try a different cultural starting point while keeping your mandatory visit requirements
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Sub-prompt: More Like This (Disambiguate which topic) */}
          {activePrompt === "more_like_this" && (
            <div className="space-y-2.5 animate-fadeIn">
              <span className="text-xs font-semibold text-[#193a32] dark:text-[#a8d5c4]">
                Which cultural interest would you like to explore more of?
              </span>
              <div className="flex flex-wrap gap-2">
                {candidateTopics.map((topic) => (
                  <Button
                    key={topic}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleMoreLikeThis(topic)}
                    data-testid={`confirm-more-like-${topic.toLowerCase().replace(/\s+/g, "-")}`}
                    className="text-xs"
                  >
                    + {topic}
                  </Button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setActivePrompt("none")}
                className="text-[11px] text-[#62685d] hover:underline cursor-pointer pt-1"
              >
                ← Back to feedback choices
              </button>
            </div>
          )}

          {/* Sub-prompt: Not This Trip (Which topic to pause today) */}
          {activePrompt === "not_this_trip" && (
            <div className="space-y-2.5 animate-fadeIn">
              <span className="text-xs font-semibold text-[#c56f4d]">
                Which topic would you like to pause for today&apos;s outing?
              </span>
              <p className="text-[11px] text-[#62685d] dark:text-[#9da398]">
                This will only remove it from today&apos;s immediate focus; your general journal notes remain safe.
              </p>
              <div className="flex flex-wrap gap-2">
                {candidateTopics.map((topic) => (
                  <Button
                    key={topic}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleNotThisTrip(topic)}
                    data-testid={`confirm-not-this-trip-${topic.toLowerCase().replace(/\s+/g, "-")}`}
                    className="text-xs border-[#c56f4d]/40 text-[#c56f4d] hover:bg-[#c56f4d]/10"
                  >
                    Pause {topic}
                  </Button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setActivePrompt("none")}
                className="text-[11px] text-[#62685d] hover:underline cursor-pointer pt-1"
              >
                ← Back to feedback choices
              </button>
            </div>
          )}

          {/* Sub-prompt: Not For Me (What specifically doesn't interest you) */}
          {activePrompt === "not_for_me" && (
            <div className="space-y-2.5 animate-fadeIn">
              <span className="text-xs font-semibold text-[#8e3c1f] dark:text-[#f4a585]">
                What specifically does not interest you?
              </span>
              <p className="text-[11px] text-[#62685d] dark:text-[#9da398]">
                We will only remove this exact confirmed topic. Unrelated categories and your practical accessibility requirements remain completely unaffected.
              </p>
              <div className="flex flex-wrap gap-2">
                {candidateTopics.map((topic) => (
                  <Button
                    key={topic}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleNotForMe(topic)}
                    data-testid={`confirm-not-for-me-${topic.toLowerCase().replace(/\s+/g, "-")}`}
                    className="text-xs border-[#8e3c1f]/40 text-[#8e3c1f] hover:bg-[#8e3c1f]/10 dark:text-[#f4a585]"
                  >
                    Dismiss {topic}
                  </Button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setActivePrompt("none")}
                className="text-[11px] text-[#62685d] hover:underline cursor-pointer pt-1"
              >
                ← Back to feedback choices
              </button>
            </div>
          )}

          {/* Sub-prompt: Save for another outing */}
          {activePrompt === "save_later" && (
            <div className="space-y-2.5 animate-fadeIn">
              <span className="text-xs font-semibold text-[#252923] dark:text-[#f4f1ea]">
                Which cultural direction would you like to save for a future outing?
              </span>
              <div className="flex flex-wrap gap-2">
                {candidateTopics.map((topic) => (
                  <Button
                    key={topic}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleSaveForLater(topic)}
                    data-testid={`confirm-save-later-${topic.toLowerCase().replace(/\s+/g, "-")}`}
                    className="text-xs"
                  >
                    Save {topic}
                  </Button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setActivePrompt("none")}
                className="text-[11px] text-[#62685d] hover:underline cursor-pointer pt-1"
              >
                ← Back to feedback choices
              </button>
            </div>
          )}

          {/* Sub-prompt: Show a different direction */}
          {activePrompt === "different_direction" && (
            <div className="space-y-2.5 animate-fadeIn">
              <span className="text-xs font-semibold text-[#193a32] dark:text-[#a8d5c4]">
                Choose an alternative cultural direction for this visit:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ALTERNATIVE_DIRECTIONS.map((dir) => (
                  <button
                    key={dir.title}
                    type="button"
                    onClick={() => handleDifferentDirection(dir.query)}
                    data-testid={`confirm-direction-${dir.title.toLowerCase().replace(/\s+/g, "-")}`}
                    className="p-2.5 rounded-xl border border-[#e6e0d4] bg-white text-left text-xs hover:border-[#193a32] hover:bg-[#faf8f5] transition-all cursor-pointer dark:border-[#323731] dark:bg-[#212520]"
                  >
                    <span className="font-semibold text-[#252923] dark:text-[#f4f1ea] block">
                      {dir.title}
                    </span>
                    <span className="text-[11px] text-[#62685d] dark:text-[#9da398]">
                      {dir.query}
                    </span>
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setActivePrompt("none")}
                className="text-[11px] text-[#62685d] hover:underline cursor-pointer pt-1"
              >
                ← Back to feedback choices
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

import React from "react";
import { Button } from "@/components/ui/Button";
import {
  type TasteMemory,
  moveInterestToOuting,
  removeFutureTripInterest,
} from "@/lib/taste";

export interface NextTimeDiscoveriesProps {
  memory: TasteMemory;
  onUpdateMemory: (newMemory: TasteMemory, explanation?: string) => void;
  className?: string;
}

export const NextTimeDiscoveries: React.FC<NextTimeDiscoveriesProps> = ({
  memory,
  onUpdateMemory,
  className = "",
}) => {
  const { futureTripInterests } = memory;

  const handleMoveToOuting = (interest: string) => {
    const updated = moveInterestToOuting(memory, interest);
    onUpdateMemory(
      updated,
      `Moved "${interest}" into today's outing.`
    );
  };

  const handleRemoveFuture = (interest: string) => {
    const updated = removeFutureTripInterest(memory, interest);
    onUpdateMemory(
      updated,
      `Removed "${interest}" from saved future directions.`
    );
  };

  return (
    <section
      aria-label="Another day, another direction"
      data-testid="next-time-discoveries"
      className={`rounded-3xl border border-[#dfd8c8] bg-[#fbf9f5] p-6 sm:p-8 space-y-6 dark:border-[#323731] dark:bg-[#1a1e1a] ${className}`}
    >
      {/* Header */}
      <div className="space-y-1.5">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#193a32]/10 px-3 py-0.5 text-xs font-semibold uppercase tracking-wider text-[#193a32] dark:bg-[#a8d5c4]/15 dark:text-[#a8d5c4]">
          <span>Next-Time Discoveries</span>
        </div>
        <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#252923] dark:text-[#f4f1ea]">
          Another day, another direction.
        </h2>
        <p className="text-sm text-[#62685d] dark:text-[#9da398]">
          Cultural directions and sparks you&apos;ve saved for future explorations. Move any topic into today&apos;s visit whenever you&apos;re ready.
        </p>
      </div>

      {/* Body: Saved Future Topics or Empty State */}
      {futureTripInterests.length === 0 ? (
        <div
          data-testid="next-time-empty-state"
          className="rounded-2xl border border-dashed border-[#dfd8c8] p-6 text-center text-xs text-[#62685d] bg-white/60 dark:border-[#323731] dark:bg-[#212520]/60 dark:text-[#9da398]"
        >
          <span className="text-xl block mb-2" aria-hidden="true">📌</span>
          <p className="font-medium text-sm text-[#252923] dark:text-[#f4f1ea]">
            No future directions saved yet
          </p>
          <p className="mt-1">
            When reviewing cultural experiences, choose &quot;Save for another outing&quot; to keep intriguing topics ready for your next excursion.
          </p>
        </div>
      ) : (
        <div
          role="list"
          aria-label="Saved future interests"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
        >
          {futureTripInterests.map((interest) => (
            <div
              key={interest}
              role="listitem"
              data-testid={`next-time-item-${interest.toLowerCase().replace(/\s+/g, "-")}`}
              className="flex flex-col justify-between p-4 rounded-2xl border border-[#e6e0d4] bg-white shadow-2xs dark:border-[#323731] dark:bg-[#212520]"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-serif text-sm font-semibold text-[#252923] dark:text-[#f4f1ea] inline-flex items-center gap-1.5">
                  <span aria-hidden="true">📌</span>
                  <span>{interest}</span>
                </span>
                <button
                  type="button"
                  aria-label={`Remove ${interest} from future directions`}
                  onClick={() => handleRemoveFuture(interest)}
                  data-testid={`remove-future-${interest.toLowerCase().replace(/\s+/g, "-")}`}
                  className="text-xs font-bold text-[#62685d] hover:text-[#252923] dark:text-[#9da398] dark:hover:text-[#f4f1ea] p-1 cursor-pointer"
                >
                  ×
                </button>
              </div>

              <div className="mt-4 pt-3 border-t border-[#f4f0e8] flex items-center justify-between dark:border-[#2b302a]">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleMoveToOuting(interest)}
                  data-testid={`move-to-outing-${interest.toLowerCase().replace(/\s+/g, "-")}`}
                  className="w-full text-xs font-medium"
                >
                  + Move to today&apos;s outing
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Transparent Integrity Footer */}
      <div className="text-[11px] text-[#62685d] dark:text-[#9da398] flex items-center gap-1.5 pt-1">
        <span aria-hidden="true">🔒</span>
        <span>
          Future ideas are stored exclusively in your session notes. No commercial bookings or external trip calendars are attached.
        </span>
      </div>
    </section>
  );
};

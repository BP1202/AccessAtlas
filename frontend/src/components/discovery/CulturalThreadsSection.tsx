import React, { useState } from "react";
import type {
  CandidateParticipationPlan,
  CulturalThread,
  ThreadConnectionType,
  ThreadSourceType,
} from "@/lib/api/types";
import { Button } from "@/components/ui/Button";

export interface CulturalThreadsSectionProps {
  threads: CulturalThread[];
  plans?: CandidateParticipationPlan[];
  onSelectCandidate?: (candidateEntityId: string) => void;
  className?: string;
}

function getConnectionBadge(connectionType: ThreadConnectionType) {
  switch (connectionType) {
    case "shared_tag":
      return {
        label: "Cultural Tag Overlap",
        color:
          "bg-[#eaf2ee] text-[#193a32] border-[#bcd6cb] dark:bg-[#1d352b] dark:text-[#b8ded0] dark:border-[#2f5545]",
      };
    case "shared_subtype":
      return {
        label: "Shared Space Subtype",
        color:
          "bg-[#f6f3eb] text-[#8c5914] border-[#eed49c] dark:bg-[#382b17] dark:text-[#f0d496] dark:border-[#544122]",
      };
    case "explicit_interest_match":
      return {
        label: "Direct Keyword Match",
        color:
          "bg-[#ede8dc] text-[#252923] border-[#dfd8c8] dark:bg-[#262a25] dark:text-[#f4f1ea] dark:border-[#384941]",
      };
    case "discovered_candidate":
    default:
      return {
        label: "Qloo Cultural Affinity",
        color:
          "bg-[#fdf0ec] text-[#c56f4d] border-[#f3c2b2] dark:bg-[#3a1d17] dark:text-[#f6b4a1] dark:border-[#582a20]",
      };
  }
}

function getSourceTypeLabel(sourceType: ThreadSourceType): string {
  switch (sourceType) {
    case "explicit_visitor_selection":
      return "You selected this starting interest";
    case "deterministic_application_mapping":
      return "AccessAtlas deterministic matching";
    case "actual_qloo_response":
      return "Qloo cultural intelligence response";
    default:
      return "Verified discovery signal";
  }
}

export const CulturalThreadsSection: React.FC<CulturalThreadsSectionProps> = ({
  threads,
  plans = [],
  onSelectCandidate,
  className = "",
}) => {
  const [selectedInterestFilter, setSelectedInterestFilter] = useState<string>("all");

  // Collect unique starting interests for quick filtering
  const startingInterests = Array.from(
    new Set(threads.map((t) => t.starting_interest))
  );

  const filteredThreads =
    selectedInterestFilter === "all"
      ? threads
      : threads.filter((t) => t.starting_interest === selectedInterestFilter);

  // Map plans by candidate entity_id for quick inspection
  const plansByEntityId = new Map<string, CandidateParticipationPlan>();
  for (const p of plans) {
    plansByEntityId.set(p.candidate.entity_id, p);
  }

  if (threads.length === 0) {
    return (
      <section
        aria-label="Cultural discovery threads"
        data-testid="cultural-threads-empty"
        className={`rounded-3xl border border-[#e6e0d4] bg-[#fbf9f5] p-8 text-center dark:border-[#323731] dark:bg-[#191c19] ${className}`}
      >
        <span className="text-2xl select-none" aria-hidden="true">
          🧵
        </span>
        <h3 className="mt-2 font-serif text-xl font-semibold text-[#252923] dark:text-[#f4f1ea]">
          No explicit cultural threads linked
        </h3>
        <p className="mt-2 text-sm text-[#62685d] max-w-xl mx-auto dark:text-[#9da398]">
          Candidates were returned for your overall search, but no specific overlapping tags
          or subcategories were deterministically established. All candidates are listed
          below.
        </p>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="cultural-threads-heading"
      data-testid="cultural-threads-section"
      className={`rounded-3xl border border-[#e6e0d4] bg-white p-6 sm:p-10 shadow-xs dark:border-[#323731] dark:bg-[#212520] ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#ede8dc] dark:border-[#323731]">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#ede8dc] px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-[#193a32] border border-[#dfd8c8] dark:bg-[#252f2a] dark:text-[#a8d5c4] dark:border-[#384941]">
            <span className="select-none" aria-hidden="true">
              🧵
            </span>
            <span>Cultural Threads</span>
          </div>
          <h2
            id="cultural-threads-heading"
            className="mt-3 font-serif text-2xl sm:text-3xl font-semibold text-[#252923] dark:text-[#f4f1ea]"
          >
            How your interests connect to these spaces
          </h2>
          <p className="mt-2 text-sm sm:text-base text-[#62685d] leading-relaxed dark:text-[#9da398]">
            Transparent cultural pathways showing where each discovery came from. AccessAtlas
            distinguishes explicit visitor choices, Qloo affinity signals, and independently
            verified Ahmedabad venue records.
          </p>
        </div>

        {/* Filter Chips by Starting Interest */}
        {startingInterests.length > 1 && (
          <div
            className="flex flex-wrap items-center gap-2"
            role="group"
            aria-label="Filter threads by interest"
          >
            <span className="text-xs font-mono text-[#62685d] dark:text-[#9da398]">
              Filter:
            </span>
            <button
              type="button"
              onClick={() => setSelectedInterestFilter("all")}
              aria-pressed={selectedInterestFilter === "all"}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
                selectedInterestFilter === "all"
                  ? "bg-[#193a32] text-white dark:bg-[#2a584d]"
                  : "bg-[#ede8dc] text-[#62685d] hover:text-[#252923] dark:bg-[#262a25] dark:text-[#9da398]"
              }`}
            >
              All interests ({threads.length})
            </button>
            {startingInterests.map((interest) => {
              const count = threads.filter((t) => t.starting_interest === interest).length;
              const isSelected = selectedInterestFilter === interest;
              return (
                <button
                  key={interest}
                  type="button"
                  onClick={() => setSelectedInterestFilter(interest)}
                  aria-pressed={isSelected}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-[#193a32] text-white dark:bg-[#2a584d]"
                      : "bg-[#ede8dc] text-[#62685d] hover:text-[#252923] dark:bg-[#262a25] dark:text-[#9da398]"
                  }`}
                >
                  {interest} ({count})
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Threads Flow List */}
      <div
        className="mt-8 space-y-6"
        role="feed"
        aria-label="Connected cultural threads"
      >
        {filteredThreads.map((thread) => {
          const { anchor, candidate, connection } = thread;
          const badge = getConnectionBadge(connection.connection_type);
          const isResolved = candidate.mapping_status === "resolved";
          const associatedPlan = plansByEntityId.get(candidate.entity_id);

          return (
            <article
              key={thread.thread_id}
              data-testid={`cultural-thread-card-${candidate.entity_id}`}
              className="rounded-2xl border border-[#ede8dc] bg-[#faf8f5] p-5 sm:p-7 transition-all hover:border-[#dfd8c8] hover:shadow-2xs dark:border-[#323731] dark:bg-[#191c19] dark:hover:border-[#3e453d]"
            >
              {/* Path Flow: Visual 3-Node Connected Pathway */}
              <div className="grid gap-4 lg:grid-cols-12 lg:items-center">
                {/* Node 1: Starting Interest */}
                <div className="lg:col-span-3 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#62685d] dark:text-[#9da398]">
                    <span className="h-2 w-2 rounded-full bg-[#193a32] dark:bg-[#a8d5c4]" />
                    <span>You selected</span>
                  </div>
                  <div className="font-serif text-lg font-semibold text-[#252923] dark:text-[#f4f1ea]">
                    &ldquo;{thread.starting_interest}&rdquo;
                  </div>
                  <span className="inline-block text-[11px] text-[#62685d] dark:text-[#9da398]">
                    {getSourceTypeLabel(anchor.source_type)}
                  </span>
                </div>

                {/* Node 2: Connection Pathway */}
                <div className="lg:col-span-4 rounded-xl border border-[#e6e0d4] bg-white p-3.5 space-y-2 dark:border-[#323731] dark:bg-[#212520]">
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${badge.color}`}
                    >
                      {badge.label}
                    </span>
                    <span className="text-[10px] font-mono text-[#62685d] dark:text-[#9da398]">
                      {getSourceTypeLabel(connection.source_type)}
                    </span>
                  </div>

                  <p className="text-xs leading-relaxed text-[#252923] font-medium dark:text-[#e4ded0]">
                    {connection.rationale}
                  </p>

                  {connection.shared_descriptors.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {connection.shared_descriptors.map((desc) => (
                        <span
                          key={desc}
                          className="rounded bg-[#ede8dc] px-2 py-0.5 text-[11px] font-medium text-[#252923] dark:bg-[#2e332c] dark:text-[#e4ded0]"
                        >
                          {desc}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Node 3: Discovered Candidate & Verification Status */}
                <div className="lg:col-span-5 flex flex-col justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs uppercase tracking-wider text-[#c56f4d]">
                        {candidate.entity_type}
                        {candidate.subtype ? ` · ${candidate.subtype}` : ""}
                      </span>
                      <span className="text-[#dfd8c8] dark:text-[#323731]">|</span>
                      <span
                        className={`text-[11px] font-medium rounded-full px-2.5 py-0.5 border ${
                          isResolved && candidate.has_reviewed_evidence
                            ? "bg-[#eaf2ee] text-[#193a32] border-[#bcd6cb] dark:bg-[#1d352b] dark:text-[#b8ded0] dark:border-[#2f5545]"
                            : "bg-[#f6f3eb] text-[#8c5914] border-[#eed49c] dark:bg-[#382b17] dark:text-[#f0d496] dark:border-[#544122]"
                        }`}
                      >
                        {isResolved && candidate.has_reviewed_evidence
                          ? "Reviewed Pilot Venue"
                          : "Awaiting Participation Evidence"}
                      </span>
                    </div>

                    <h3 className="mt-1 font-serif text-xl font-semibold text-[#252923] dark:text-[#f4f1ea]">
                      {candidate.name}
                    </h3>

                    {candidate.popularity !== null && candidate.popularity !== undefined && (
                      <p className="mt-1 text-[11px] text-[#62685d] dark:text-[#9da398]">
                        Global Qloo salience: {(candidate.popularity * 100).toFixed(0)}%
                        <span className="italic ml-1">(cultural knowledge base popularity)</span>
                      </p>
                    )}
                  </div>

                  {/* Visit Plan Action Button */}
                  {onSelectCandidate && (
                    <div>
                      <Button
                        type="button"
                        variant={isResolved ? "primary" : "outline"}
                        size="sm"
                        onClick={() => onSelectCandidate(candidate.entity_id)}
                        className="cursor-pointer"
                        aria-label={
                          isResolved
                            ? `View verified visit plan for ${candidate.name}`
                            : `View discovery details for ${candidate.name}`
                        }
                      >
                        {isResolved
                          ? associatedPlan
                            ? "View visit plan ↓"
                            : "View candidate details ↓"
                          : "View unreviewed details ↓"}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

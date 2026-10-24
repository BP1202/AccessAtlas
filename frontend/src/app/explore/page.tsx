"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorDisplay } from "@/components/feedback/ErrorDisplay";
import { defaultApiClient, ApiClientError } from "@/lib/api/client";
import type {
  DiscoverResponse,
  EvidenceAttribute,
} from "@/lib/api/types";
import { DISCLAIMER_NOTE } from "@/lib/constants/labels";
import { InterestSelector } from "@/components/discovery/InterestSelector";
import {
  PreferenceSelector,
  type PreferenceState,
} from "@/components/discovery/PreferenceSelector";
import { CandidateCard } from "@/components/discovery/CandidateCard";
import { DiscoveryLoading } from "@/components/discovery/DiscoveryLoading";
import {
  type TasteMemory,
  createInitialTasteMemory,
  createDefaultPracticalRequirements,
  loadTasteMemoryFromSession,
  saveTasteMemoryToSession,
  clearTasteMemoryFromSession,
  addExplicitInterest,
  addCurrentOutingInterest,
  setCurrentOutingInterests,
  updatePracticalRequirement,
  setCompassState,
  tasteMemoryToDiscoverRequest,
} from "@/lib/taste";
import { aggregateCompassSignals, type CompassAnswers } from "@/lib/compass";
import { TasteMemoryPanel } from "@/components/discovery/TasteMemoryPanel";
import { CurrentOutingControls } from "@/components/discovery/CurrentOutingControls";

export type DiscoveryStep = "interests" | "preferences" | "results";

function ExploreContent() {
  const searchParams = useSearchParams();
  const pathParam = searchParams?.get("path");
  const initialPath =
    pathParam === "help" ? "help" : pathParam === "surprise" ? "surprise" : "manual";

  // Session Taste Memory: initialized from sessionStorage with URL query parameter support
  const [tasteMemory, setTasteMemory] = useState<TasteMemory>(() => {
    const fromSession = loadTasteMemoryFromSession();
    const interestParam = searchParams?.get("interest");
    if (interestParam && interestParam.trim()) {
      const trimmed = interestParam.trim();
      const withExplicit = addExplicitInterest(fromSession, trimmed);
      return addCurrentOutingInterest(withExplicit, trimmed);
    }
    return fromSession;
  });

  const [step, setStep] = useState<DiscoveryStep>("interests");
  const [interests, setInterests] = useState<string[]>(() => {
    return [...tasteMemory.currentOutingInterests];
  });
  const [preferences, setPreferences] = useState<Record<EvidenceAttribute, PreferenceState>>(() => {
    return { ...tasteMemory.practicalRequirements };
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusCode, setStatusCode] = useState<number | undefined>(undefined);
  const [result, setResult] = useState<DiscoverResponse | null>(null);

  // Synchronize Taste Memory to session storage
  useEffect(() => {
    saveTasteMemoryToSession(tasteMemory);
  }, [tasteMemory]);

  const handleInterestsChange = (newInterests: string[]) => {
    setInterests(newInterests);
    setTasteMemory((prev) => {
      let updated = setCurrentOutingInterests(prev, newInterests);
      if (!prev.isOutingOverridden) {
        for (const item of newInterests) {
          updated = addExplicitInterest(updated, item);
        }
      }
      return updated;
    });
  };

  const handlePreferenceChange = (
    attribute: EvidenceAttribute,
    state: PreferenceState
  ) => {
    setPreferences((prev) => ({
      ...prev,
      [attribute]: state,
    }));
    setTasteMemory((prev) => updatePracticalRequirement(prev, attribute, state));
  };

  const handleCompassComplete = (answers: CompassAnswers, derivedInterests: string[]) => {
    setInterests(derivedInterests);
    const agg = aggregateCompassSignals(answers);
    setTasteMemory((prev) => {
      const withCompass = setCompassState(prev, answers, agg);
      let updated = setCurrentOutingInterests(withCompass, derivedInterests);
      for (const item of derivedInterests) {
        updated = addExplicitInterest(updated, item);
      }
      return updated;
    });
  };

  const handleTasteMemoryUpdate = (newMemory: TasteMemory) => {
    setTasteMemory(newMemory);
    setInterests([...newMemory.currentOutingInterests]);
    setPreferences({ ...newMemory.practicalRequirements });
  };

  const handleSearch = async () => {
    if (interests.length === 0) {
      setError("Please select or add at least one cultural interest.");
      setStep("interests");
      return;
    }

    setIsLoading(true);
    setError(null);
    setStatusCode(undefined);
    setStep("results");

    const request = tasteMemoryToDiscoverRequest(tasteMemory, "Ahmedabad", 5);

    try {
      const response = await defaultApiClient.discover(request);
      setResult(response);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.detail);
        setStatusCode(err.statusCode || undefined);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred while communicating with the discovery service.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartFresh = () => {
    clearTasteMemoryFromSession();
    const fresh = createInitialTasteMemory();
    setTasteMemory(fresh);
    setInterests([]);
    setPreferences(createDefaultPracticalRequirements());
    setResult(null);
    setError(null);
    setStatusCode(undefined);
    setStep("interests");
  };

  return (
    <div className="py-10 md:py-16 lg:py-20">
      <Container size="xl">
        {/* Navigation Breadcrumb & Stage Controls */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/"
            className="text-xs font-semibold uppercase tracking-wider text-[#62685d] hover:text-[#252923] dark:text-[#9da398] dark:hover:text-[#f4f1ea]"
          >
            ← Back to Overview
          </Link>

          {step === "results" && (
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setStep("interests")}
              >
                Adjust outing
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setStep("preferences")}
              >
                Refine preferences
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleStartFresh}
              >
                Start fresh
              </Button>
            </div>
          )}
        </div>

        {/* Page Main Header */}
        <div className="mb-12 max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#ede8dc] px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-[#193a32] border border-[#dfd8c8] dark:bg-[#252f2a] dark:text-[#a8d5c4] dark:border-[#384941]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#c56f4d]" />
            <span>Ahmedabad Cultural Discovery</span>
          </div>
          <h1 className="mt-4 font-serif text-3xl font-semibold tracking-tight text-[#252923] sm:text-4xl md:text-5xl lg:text-6xl dark:text-[#f4f1ea]">
            Discover cultural experiences that fit your interests—and your visit
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-[#62685d] sm:text-xl font-light dark:text-[#9da398]">
            AccessAtlas connects what you love with what you need to know before you go.
          </p>
        </div>

        {/* Step Indicator Navigation */}
        <div className="mb-12 flex items-center gap-4 text-xs font-semibold uppercase tracking-wider text-[#62685d] dark:text-[#9da398]">
          <button
            type="button"
            onClick={() => setStep("interests")}
            className={`flex items-center gap-2 transition-colors cursor-pointer ${
              step === "interests"
                ? "text-[#193a32] dark:text-[#a8d5c4]"
                : "hover:text-[#252923] dark:hover:text-[#f4f1ea]"
            }`}
          >
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                step === "interests"
                  ? "bg-[#193a32] text-white dark:bg-[#2a584d]"
                  : "bg-[#ede8dc] text-[#62685d] dark:bg-[#262a25] dark:text-[#9da398]"
              }`}
            >
              1
            </span>
            <span>Cultural Interests</span>
          </button>
          <span>→</span>
          <button
            type="button"
            onClick={() => {
              if (interests.length > 0) setStep("preferences");
            }}
            disabled={interests.length === 0}
            className={`flex items-center gap-2 transition-colors ${
              step === "preferences"
                ? "text-[#193a32] dark:text-[#a8d5c4]"
                : interests.length > 0
                ? "hover:text-[#252923] cursor-pointer dark:hover:text-[#f4f1ea]"
                : "opacity-40 cursor-not-allowed"
            }`}
          >
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                step === "preferences"
                  ? "bg-[#193a32] text-white dark:bg-[#2a584d]"
                  : "bg-[#ede8dc] text-[#62685d] dark:bg-[#262a25] dark:text-[#9da398]"
              }`}
            >
              2
            </span>
            <span>Visit Preferences</span>
          </button>
          <span>→</span>
          <span
            className={`flex items-center gap-2 ${
              step === "results"
                ? "text-[#193a32] font-semibold dark:text-[#a8d5c4]"
                : "opacity-40"
            }`}
          >
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                step === "results"
                  ? "bg-[#193a32] text-white dark:bg-[#2a584d]"
                  : "bg-[#ede8dc] text-[#62685d] dark:bg-[#262a25] dark:text-[#9da398]"
              }`}
            >
              3
            </span>
            <span>Discoveries & Visit Plan</span>
          </span>
        </div>

        {/* Session Taste Memory Compact Panel */}
        <div className="mb-10 max-w-5xl">
          <TasteMemoryPanel
            memory={tasteMemory}
            onUpdateMemory={handleTasteMemoryUpdate}
          />
        </div>

        {/* View Switcher: Spacious Containers */}
        {step === "interests" && (
          <div className="space-y-8 max-w-5xl">
            <CurrentOutingControls
              memory={tasteMemory}
              onUpdateMemory={handleTasteMemoryUpdate}
            />

            <div className="rounded-3xl border border-[#e6e0d4] bg-white p-8 sm:p-12 lg:p-14 shadow-xs dark:border-[#323731] dark:bg-[#212520]">
              <InterestSelector
                selectedInterests={interests}
                onChange={handleInterestsChange}
                onNext={() => setStep("preferences")}
                onCompassComplete={handleCompassComplete}
                initialPath={initialPath}
              />
            </div>
          </div>
        )}

        {step === "preferences" && (
          <div className="rounded-3xl border border-[#e6e0d4] bg-white p-8 sm:p-12 lg:p-14 shadow-xs dark:border-[#323731] dark:bg-[#212520] max-w-5xl">
            <PreferenceSelector
              preferences={preferences}
              onChange={handlePreferenceChange}
              onBack={() => setStep("interests")}
              onSubmit={handleSearch}
              isLoading={isLoading}
            />
          </div>
        )}

        {step === "results" && (
          <div className="space-y-10 max-w-5xl">
            {isLoading && <DiscoveryLoading city="Ahmedabad" />}

            {!isLoading && error && (
              <div className="max-w-3xl space-y-4">
                <ErrorDisplay
                  title="Discovery Notice"
                  message={error}
                  statusCode={statusCode}
                  onRetry={handleSearch}
                />
                <div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setStep("interests")}
                  >
                    ← Edit interests or retry
                  </Button>
                </div>
              </div>
            )}

            {!isLoading && !error && result && (
              <div className="space-y-8">
                {/* Search Summary Banner */}
                <div className="rounded-3xl border border-[#e6e0d4] bg-[#f6f3eb] p-8 dark:border-[#323731] dark:bg-[#191c19]">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-widest text-[#c56f4d]">
                        Cultural Discovery Summary
                      </span>
                      <h2 className="mt-1 font-serif text-2xl sm:text-3xl font-semibold text-[#252923] dark:text-[#f4f1ea]">
                        {result.plans.length} cultural candidate{result.plans.length === 1 ? "" : "s"} found for &ldquo;{interests.join(", ")}&rdquo;
                      </h2>
                      <p className="mt-2 text-sm text-[#62685d] dark:text-[#9da398]">
                        {result.candidates_evaluated} candidates evaluated against verified Ahmedabad records.
                      </p>
                    </div>
                    <div className="flex gap-3 shrink-0">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setStep("preferences")}
                      >
                        Adjust preferences
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Candidate List */}
                {result.plans.length === 0 ? (
                  <EmptyState
                    title="No cultural matches found"
                    description={`No cultural candidates were found matching "${interests.join(", ")}" in Ahmedabad. Try adjusting your interest keywords.`}
                    actionLabel="Try different interests"
                    onAction={() => setStep("interests")}
                  />
                ) : (
                  <div className="space-y-8" role="feed" aria-label="Cultural discovery candidates">
                    {result.plans.map((plan, index) => (
                      <CandidateCard
                        key={plan.candidate.entity_id || index}
                        plan={plan}
                      />
                    ))}
                  </div>
                )}

                {/* Grounding & Integrity Disclaimer */}
                <div className="rounded-2xl border border-[#dfd8c8] bg-[#ede8dc]/50 p-6 text-xs text-[#62685d] dark:border-[#323731] dark:bg-[#212520]/40 dark:text-[#9da398]">
                  <p>
                    <strong>Integrity Note:</strong> {DISCLAIMER_NOTE}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </Container>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center text-sm text-[#62685d]">
          Loading discovery experience…
        </div>
      }
    >
      <ExploreContent />
    </Suspense>
  );
}

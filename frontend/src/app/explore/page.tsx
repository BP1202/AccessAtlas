"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorDisplay } from "@/components/feedback/ErrorDisplay";
import { defaultApiClient, ApiClientError } from "@/lib/api/client";
import type {
  DiscoverResponse,
  EvidenceAttribute,
  ParticipationRequirement,
} from "@/lib/api/types";
import { SUPPORTED_REQUIREMENTS } from "@/lib/constants/requirements";
import { DISCLAIMER_NOTE } from "@/lib/constants/labels";
import { InterestSelector } from "@/components/discovery/InterestSelector";
import {
  PreferenceSelector,
  type PreferenceState,
} from "@/components/discovery/PreferenceSelector";
import { CandidateCard } from "@/components/discovery/CandidateCard";
import { DiscoveryLoading } from "@/components/discovery/DiscoveryLoading";

export type DiscoveryStep = "interests" | "preferences" | "results";

const initialPreferences: Record<EvidenceAttribute, PreferenceState> =
  SUPPORTED_REQUIREMENTS.reduce(
    (acc, req) => {
      acc[req.attribute] = "not_specified";
      return acc;
    },
    {} as Record<EvidenceAttribute, PreferenceState>
  );

export default function ExplorePage() {
  const [step, setStep] = useState<DiscoveryStep>("interests");
  const [interests, setInterests] = useState<string[]>([]);
  const [preferences, setPreferences] =
    useState<Record<EvidenceAttribute, PreferenceState>>(initialPreferences);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusCode, setStatusCode] = useState<number | undefined>(undefined);
  const [result, setResult] = useState<DiscoverResponse | null>(null);

  const handlePreferenceChange = (
    attribute: EvidenceAttribute,
    state: PreferenceState
  ) => {
    setPreferences((prev) => ({
      ...prev,
      [attribute]: state,
    }));
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

    // Convert active preferences to ParticipationRequirement[]
    const activeRequirements: ParticipationRequirement[] = Object.entries(
      preferences
    )
      .filter(([, state]) => state !== "not_specified")
      .map(([attr, state]) => ({
        requirement_id: `req-${attr}`,
        attribute: attr as EvidenceAttribute,
        priority: state as "optional" | "mandatory",
        expected_value: true,
      }));

    try {
      const response = await defaultApiClient.discover({
        city: "Ahmedabad",
        cultural_interests: interests,
        requirements: activeRequirements,
        max_candidates: 5,
      });
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
    setInterests([]);
    setPreferences(initialPreferences);
    setResult(null);
    setError(null);
    setStatusCode(undefined);
    setStep("interests");
  };

  return (
    <div className="py-10 md:py-16">
      <Container size="lg">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="text-xs font-semibold uppercase tracking-wider text-stone-500 hover:text-stone-900 dark:hover:text-stone-200"
          >
            ← Back to Overview
          </Link>

          {step === "results" && (
            <div className="flex items-center gap-2">
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
        <div className="mb-10 max-w-3xl">
          <span className="text-xs font-semibold uppercase tracking-widest text-teal-700 dark:text-teal-400">
            Ahmedabad Cultural Discovery
          </span>
          <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl dark:text-stone-50">
            Discover cultural experiences that fit your interests—and your visit
          </h1>
          <p className="mt-3 text-base leading-relaxed text-stone-600 sm:text-lg dark:text-stone-300">
            AccessAtlas connects what you love with what you need to know before you go.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="mb-8 flex items-center gap-3 text-xs font-medium text-stone-500 dark:text-stone-400">
          <button
            type="button"
            onClick={() => setStep("interests")}
            className={`flex items-center gap-1.5 transition-colors ${
              step === "interests"
                ? "font-semibold text-teal-800 dark:text-teal-300"
                : "hover:text-stone-900 dark:hover:text-stone-200"
            }`}
          >
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${
                step === "interests"
                  ? "bg-teal-700 text-white"
                  : "bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-300"
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
            className={`flex items-center gap-1.5 transition-colors ${
              step === "preferences"
                ? "font-semibold text-teal-800 dark:text-teal-300"
                : interests.length > 0
                ? "hover:text-stone-900 dark:hover:text-stone-200"
                : "opacity-50 cursor-not-allowed"
            }`}
          >
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${
                step === "preferences"
                  ? "bg-teal-700 text-white"
                  : "bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-300"
              }`}
            >
              2
            </span>
            <span>Visit Preferences</span>
          </button>
          <span>→</span>
          <span
            className={`flex items-center gap-1.5 ${
              step === "results"
                ? "font-semibold text-teal-800 dark:text-teal-300"
                : "opacity-60"
            }`}
          >
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${
                step === "results"
                  ? "bg-teal-700 text-white"
                  : "bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-300"
              }`}
            >
              3
            </span>
            <span>Discoveries & Visit Plan</span>
          </span>
        </div>

        {/* View Switcher */}
        {step === "interests" && (
          <div className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 shadow-sm dark:border-stone-800 dark:bg-stone-900/60 max-w-3xl">
            <InterestSelector
              selectedInterests={interests}
              onChange={setInterests}
              onNext={() => setStep("preferences")}
            />
          </div>
        )}

        {step === "preferences" && (
          <div className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 shadow-sm dark:border-stone-800 dark:bg-stone-900/60 max-w-3xl">
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
          <div className="space-y-8">
            {isLoading && <DiscoveryLoading city="Ahmedabad" />}

            {!isLoading && error && (
              <div className="max-w-2xl">
                <ErrorDisplay
                  title="Discovery Error"
                  message={error}
                  statusCode={statusCode}
                  onRetry={handleSearch}
                />
                <div className="mt-4">
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
              <div className="space-y-6">
                {/* Result header banner */}
                <div className="rounded-2xl border border-stone-200 bg-stone-50/80 p-6 dark:border-stone-800 dark:bg-stone-900/50">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                        Search Summary
                      </span>
                      <h2 className="mt-1 font-serif text-xl font-semibold text-stone-900 dark:text-stone-100">
                        {result.plans.length} cultural candidate{result.plans.length === 1 ? "" : "s"} found for &ldquo;{interests.join(", ")}&rdquo;
                      </h2>
                      <p className="mt-1 text-xs text-stone-600 dark:text-stone-400">
                        {result.candidates_evaluated} candidates evaluated against verified Ahmedabad records.
                      </p>
                    </div>
                    <div className="flex gap-2">
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
                  <div className="space-y-6" role="feed" aria-label="Cultural discovery candidates">
                    {result.plans.map((plan, index) => (
                      <CandidateCard
                        key={plan.candidate.entity_id || index}
                        plan={plan}
                      />
                    ))}
                  </div>
                )}

                {/* Grounding & Integrity Disclaimer */}
                <div className="rounded-xl border border-stone-200/80 bg-stone-100/50 p-4 text-xs text-stone-500 dark:border-stone-800 dark:bg-stone-900/30 dark:text-stone-400">
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

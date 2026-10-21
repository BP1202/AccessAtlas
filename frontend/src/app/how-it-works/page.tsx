import React from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  OUTCOME_LABELS,
  OUTCOME_DESCRIPTIONS,
  DISCLAIMER_NOTE,
} from "@/lib/constants/labels";

export default function HowItWorksPage() {
  return (
    <div className="py-12 md:py-20">
      <Container size="lg">
        {/* Breadcrumb */}
        <div className="mb-4">
          <Link
            href="/"
            className="text-xs font-semibold uppercase tracking-wider text-stone-500 hover:text-stone-900 dark:hover:text-stone-200"
          >
            ← Back to Overview
          </Link>
        </div>

        {/* Header */}
        <div className="max-w-3xl">
          <span className="text-xs font-semibold uppercase tracking-widest text-stone-500 dark:text-stone-400">
            Methodology & Standards
          </span>
          <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl md:text-5xl dark:text-stone-50">
            How AccessAtlas works
          </h1>
          <p className="mt-4 text-base leading-relaxed text-stone-600 sm:text-lg dark:text-stone-300">
            Finding a cultural experience shouldn&apos;t require guessing whether a
            venue accommodates your practical needs. Here is how we connect your
            interests with honest visit information.
          </p>
        </div>

        {/* 1. Cultural Interests */}
        <section aria-labelledby="interests-heading" className="mt-14">
          <div className="border-b border-stone-200 pb-4 dark:border-stone-800">
            <h2
              id="interests-heading"
              className="font-serif text-2xl font-semibold text-stone-900 dark:text-stone-100"
            >
              1. Exploring by interest, not proximity alone
            </h2>
          </div>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-stone-600 dark:text-stone-300">
            Instead of simply listing what is geographically closest, AccessAtlas
            looks for cultural spaces and exhibitions that align with your chosen
            topics—such as textile crafts, modern art, or regional heritage.
          </p>
        </section>

        {/* 2. Three Assessment States */}
        <section aria-labelledby="outcomes-heading" className="mt-14">
          <div className="border-b border-stone-200 pb-4 dark:border-stone-800">
            <h2
              id="outcomes-heading"
              className="font-serif text-2xl font-semibold text-stone-900 dark:text-stone-100"
            >
              2. Understanding visit details
            </h2>
            <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
              We never invent confidence scores or assume unknown details. Every
              evaluation clearly distinguishes three states:
            </p>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <Card className="border-stone-200 bg-white/70 dark:border-stone-800 dark:bg-stone-900/60">
              <CardHeader>
                <div className="mb-2">
                  <Badge variant="VERIFIED_FIT">
                    {OUTCOME_LABELS.VERIFIED_FIT}
                  </Badge>
                </div>
                <CardTitle className="font-serif text-lg">
                  {OUTCOME_LABELS.VERIFIED_FIT}
                </CardTitle>
                <CardDescription>
                  Published records support your stated requirement.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                {OUTCOME_DESCRIPTIONS.VERIFIED_FIT} Official publications confirm
                this detail is present or supported.
              </CardContent>
            </Card>

            <Card className="border-stone-200 bg-white/70 dark:border-stone-800 dark:bg-stone-900/60">
              <CardHeader>
                <div className="mb-2">
                  <Badge variant="NEEDS_CONFIRMATION">
                    {OUTCOME_LABELS.NEEDS_CONFIRMATION}
                  </Badge>
                </div>
                <CardTitle className="font-serif text-lg">
                  {OUTCOME_LABELS.NEEDS_CONFIRMATION}
                </CardTitle>
                <CardDescription>
                  Information is missing, ambiguous, or incomplete.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                {OUTCOME_DESCRIPTIONS.NEEDS_CONFIRMATION} We do not guess. We
                highlight the question so you or our system can check directly.
              </CardContent>
            </Card>

            <Card className="border-stone-200 bg-white/70 dark:border-stone-800 dark:bg-stone-900/60">
              <CardHeader>
                <div className="mb-2">
                  <Badge variant="REQUIREMENT_CONFLICT">
                    {OUTCOME_LABELS.REQUIREMENT_CONFLICT}
                  </Badge>
                </div>
                <CardTitle className="font-serif text-lg">
                  {OUTCOME_LABELS.REQUIREMENT_CONFLICT}
                </CardTitle>
                <CardDescription>
                  Published evidence identifies an explicit barrier.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                {OUTCOME_DESCRIPTIONS.REQUIREMENT_CONFLICT} An official policy or
                architectural factor indicates this requirement cannot currently
                be met.
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 rounded-lg border border-stone-200 bg-stone-50 p-4 text-xs text-stone-600 dark:border-stone-800 dark:bg-stone-900/40 dark:text-stone-400">
            <strong>Important note:</strong> {DISCLAIMER_NOTE}
          </div>
        </section>

        {/* 3. Where Information Comes From */}
        <section aria-labelledby="provenance-heading" className="mt-14">
          <div className="border-b border-stone-200 pb-4 dark:border-stone-800">
            <h2
              id="provenance-heading"
              className="font-serif text-2xl font-semibold text-stone-900 dark:text-stone-100"
            >
              3. Where this information comes from
            </h2>
          </div>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-stone-600 dark:text-stone-300">
            Practical facts are gathered from published official venue guides,
            tour guidelines, organizer notices, and verified communications. Each
            fact links to its source title, verification date, and official
            reference.
          </p>
        </section>

        {/* 4. Privacy & Dignity */}
        <section aria-labelledby="privacy-heading" className="mt-14">
          <div className="border-b border-stone-200 pb-4 dark:border-stone-800">
            <h2
              id="privacy-heading"
              className="font-serif text-2xl font-semibold text-stone-900 dark:text-stone-100"
            >
              4. Respecting your privacy
            </h2>
          </div>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-stone-600 dark:text-stone-300">
            We do not infer personal identities, health conditions, or
            disabilities from your interests. You simply indicate what matters
            for your visit—such as seating availability or advance booking—and we
            evaluate only those practical requirements against verified
            information.
          </p>
        </section>
      </Container>
    </div>
  );
}

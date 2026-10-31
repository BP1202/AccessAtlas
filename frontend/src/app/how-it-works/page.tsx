import React from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  OUTCOME_LABELS,
  OUTCOME_DESCRIPTIONS,
  DISCLAIMER_NOTE,
} from "@/lib/constants/labels";

export default function HowItWorksPage() {
  return (
    <div className="py-12 md:py-20 lg:py-24">
      <Container size="xl">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/"
            className="text-xs font-semibold uppercase tracking-wider text-[#62685d] hover:text-[#252923] dark:text-[#9da398] dark:hover:text-[#f4f1ea]"
          >
            ← Back to Overview
          </Link>
        </div>

        {/* Header */}
        <div className="max-w-4xl">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#c56f4d]">
            Methodology & Standards
          </span>
          <h1 className="mt-3 font-serif text-4xl font-semibold tracking-tight text-[#252923] sm:text-5xl md:text-6xl dark:text-[#f4f1ea]">
            How AccessAtlas works
          </h1>
          <p className="mt-6 text-xl leading-relaxed text-[#62685d] sm:text-2xl font-light dark:text-[#9da398]">
            Finding a cultural experience shouldn&apos;t require guessing whether a venue accommodates your practical needs. Here is how we connect what you love with grounded visit information.
          </p>
        </div>

        {/* 1. Cultural Interests */}
        <section aria-labelledby="interests-heading" className="mt-16 sm:mt-20">
          <div className="border-b border-[#e6e0d4] pb-4 dark:border-[#323731]">
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#c56f4d]">
              Step 01
            </span>
            <h2
              id="interests-heading"
              className="mt-1 font-serif text-2xl font-semibold text-[#252923] sm:text-3xl dark:text-[#f4f1ea]"
            >
              Exploring by cultural affinity, not proximity alone
            </h2>
          </div>
          <div className="mt-6 grid gap-8 lg:grid-cols-2">
            <p className="text-base leading-relaxed text-[#62685d] dark:text-[#9da398]">
              Most search platforms simply list what is geographically nearest to your GPS coordinates. AccessAtlas looks for cultural spaces that connect with your specific curiosities—whether that is block printing traditions, 15th-century stone jalis, or modern miniature painting.
            </p>
            <div className="rounded-2xl bg-[#ede8dc]/50 p-6 border border-[#dfd8c8] text-sm text-[#252923] dark:bg-[#212520] dark:border-[#323731] dark:text-[#e4ded0]">
              <span className="font-semibold text-[#193a32] dark:text-[#a8d5c4]">Cross-domain intelligence:</span> An interest in Gujarati textiles can naturally connect you to the Calico Museum, but also to historic merchant havelis and craft demonstration centres you might not have known to search for by name.
            </div>
          </div>
        </section>

        {/* 2. Three Assessment States */}
        <section aria-labelledby="outcomes-heading" className="mt-16 sm:mt-20">
          <div className="border-b border-[#e6e0d4] pb-4 dark:border-[#323731]">
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#193a32] dark:text-[#a8d5c4]">
              Step 02
            </span>
            <h2
              id="outcomes-heading"
              className="mt-1 font-serif text-2xl font-semibold text-[#252923] sm:text-3xl dark:text-[#f4f1ea]"
            >
              Deterministic evaluation against verified evidence
            </h2>
            <p className="mt-2 text-sm text-[#62685d] dark:text-[#9da398]">
              We strictly separate what is published from what remains unknown. Every detail is evaluated into one of three honest states:
            </p>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <Card className="border-[#bcd6cb] bg-white dark:border-[#2f5545] dark:bg-[#212520]">
              <CardHeader>
                <div className="mb-2">
                  <Badge variant="VERIFIED_FIT">
                    {OUTCOME_LABELS.VERIFIED_FIT}
                  </Badge>
                </div>
                <CardTitle className="font-serif text-xl">
                  {OUTCOME_LABELS.VERIFIED_FIT}
                </CardTitle>
                <CardDescription>
                  Published records support your requirement.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-[#62685d] dark:text-[#9da398] leading-relaxed">
                {OUTCOME_DESCRIPTIONS.VERIFIED_FIT} Official publications confirm this physical feature or operational accommodation.
              </CardContent>
            </Card>

            <Card className="border-[#eed49c] bg-white dark:border-[#544122] dark:bg-[#212520]">
              <CardHeader>
                <div className="mb-2">
                  <Badge variant="NEEDS_CONFIRMATION">
                    {OUTCOME_LABELS.NEEDS_CONFIRMATION}
                  </Badge>
                </div>
                <CardTitle className="font-serif text-xl">
                  {OUTCOME_LABELS.NEEDS_CONFIRMATION}
                </CardTitle>
                <CardDescription>
                  Information is missing, ambiguous, or incomplete.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-[#62685d] dark:text-[#9da398] leading-relaxed">
                {OUTCOME_DESCRIPTIONS.NEEDS_CONFIRMATION} We provide an instant question kit so you can verify directly with the venue before visiting.
              </CardContent>
            </Card>

            <Card className="border-[#f3c2b2] bg-white dark:border-[#582a20] dark:bg-[#212520]">
              <CardHeader>
                <div className="mb-2">
                  <Badge variant="REQUIREMENT_CONFLICT">
                    {OUTCOME_LABELS.REQUIREMENT_CONFLICT}
                  </Badge>
                </div>
                <CardTitle className="font-serif text-xl">
                  {OUTCOME_LABELS.REQUIREMENT_CONFLICT}
                </CardTitle>
                <CardDescription>
                  Published evidence identifies an explicit incompatibility.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-[#62685d] dark:text-[#9da398] leading-relaxed">
                {OUTCOME_DESCRIPTIONS.REQUIREMENT_CONFLICT} Rather than surprising you at the door, we highlight known physical or policy barriers upfront.
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 rounded-2xl border border-[#e6e0d4] bg-[#f6f3eb] p-6 text-xs text-[#62685d] dark:border-[#323731] dark:bg-[#191c19] dark:text-[#9da398]">
            <strong>Important note:</strong> {DISCLAIMER_NOTE}
          </div>
        </section>

        {/* 3. The Question Kit */}
        <section aria-labelledby="question-kit-heading" className="mt-16 sm:mt-20">
          <div className="border-b border-[#e6e0d4] pb-4 dark:border-[#323731]">
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#c56f4d]">
              Step 03
            </span>
            <h2
              id="question-kit-heading"
              className="mt-1 font-serif text-2xl font-semibold text-[#252923] sm:text-3xl dark:text-[#f4f1ea]"
            >
              Actionable participation planning & question kits
            </h2>
          </div>
          <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:items-center">
            <p className="text-base leading-relaxed text-[#62685d] dark:text-[#9da398]">
              When published venue records don&apos;t mention whether an elevator exists or if rest benches are provided in exhibition corridors, AccessAtlas doesn&apos;t guess. We synthesize an exact, copyable question kit derived strictly from real confirmation needs so you can email or call the venue in seconds.
            </p>
            <div className="rounded-2xl border border-[#eed49c] bg-[#fcf5e8] p-6 dark:border-[#544122] dark:bg-[#382b17]">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#8c5914] dark:text-[#f0d496]">Sample Question Kit</span>
              <ul className="mt-3 space-y-2 text-xs text-[#252923] dark:text-[#e4ded0]">
                <li>1. &ldquo;Are elevators available between the first and second floor galleries for the permanent collection?&rdquo;</li>
                <li>2. &ldquo;Is rest seating or bench seating provided in the courtyard and corridor areas?&rdquo;</li>
              </ul>
              <div className="mt-4 flex justify-end">
                <span className="rounded-lg bg-white px-3 py-1 text-xs font-medium border border-[#eed49c] text-[#8c5914] dark:bg-[#212520] dark:text-[#f0d496] dark:border-[#544122]">
                  One-click copy to clipboard
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="mt-20 pt-8 border-t border-[#e6e0d4] dark:border-[#323731] flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            href="/about"
            className="text-sm font-semibold text-[#193a32] hover:underline dark:text-[#a8d5c4]"
          >
            ← Read about our product mission
          </Link>
          <Link href="/explore">
            <Button size="lg" variant="primary">
              Discover cultural experiences →
            </Button>
          </Link>
        </div>
      </Container>
    </div>
  );
}

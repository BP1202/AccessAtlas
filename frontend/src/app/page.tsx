import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import {
  OUTCOME_LABELS,
  OUTCOME_DESCRIPTIONS,
  DISCLAIMER_NOTE,
} from "@/lib/constants/labels";

export default function HomePage() {
  return (
    <div className="py-12 md:py-20">
      <Container size="lg">
        {/* Hero Section */}
        <div className="max-w-3xl">
          <span className="text-xs font-semibold uppercase tracking-widest text-stone-500 dark:text-stone-400">
            Culture, on your terms
          </span>

          <h1 className="mt-3 font-serif text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl md:text-6xl dark:text-stone-50">
            Find your kind of cultural experience.
          </h1>

          <p className="mt-5 text-lg leading-relaxed text-stone-600 sm:text-xl dark:text-stone-300">
            Explore art, history and cultural spaces worth discovering—with the
            practical details that matter to your visit.
          </p>

          <p className="mt-2 text-sm font-medium text-stone-500 dark:text-stone-400">
            Starting with Ahmedabad
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link href="/explore">
              <Button size="lg" variant="primary">
                Explore Ahmedabad
              </Button>
            </Link>
            <Link href="/how-it-works">
              <Button size="lg" variant="outline">
                How it works
              </Button>
            </Link>
          </div>
        </div>

        {/* Value Proposition: Discover with more confidence */}
        <section aria-labelledby="confidence-heading" className="mt-20">
          <div className="border-b border-stone-200 pb-4 dark:border-stone-800">
            <h2
              id="confidence-heading"
              className="font-serif text-2xl font-semibold text-stone-900 dark:text-stone-100"
            >
              Discover with more confidence
            </h2>
          </div>

          <div className="mt-8 grid gap-8 md:grid-cols-3">
            <div>
              <h3 className="font-serif text-lg font-semibold text-stone-900 dark:text-stone-100">
                Follow your curiosity
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
                Discover cultural experiences connected to the interests you
                choose—from historic textile collections and architectural
                landmarks to contemporary art spaces.
              </p>
            </div>

            <div>
              <h3 className="font-serif text-lg font-semibold text-stone-900 dark:text-stone-100">
                Know before you go
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
                See what is documented and what still needs confirmation before
                you head out. We highlight verified entry guidelines, tour
                requirements, and physical layouts.
              </p>
            </div>

            <div>
              <h3 className="font-serif text-lg font-semibold text-stone-900 dark:text-stone-100">
                No personal assumptions
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
                We never assume your identity, health status, or needs from your
                cultural interests. You simply choose the practical details that
                matter to your plans.
              </p>
            </div>
          </div>
        </section>

        {/* 3-State Visit Details */}
        <section aria-labelledby="visit-details-heading" className="mt-20">
          <div className="border-b border-stone-200 pb-4 dark:border-stone-800">
            <h2
              id="visit-details-heading"
              className="font-serif text-2xl font-semibold text-stone-900 dark:text-stone-100"
            >
              Understanding visit details
            </h2>
            <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
              We distinguish what is verified from what remains unconfirmed,
              without fabricated scores or guesses.
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
              <CardContent className="text-sm leading-relaxed text-stone-600 dark:text-stone-300">
                {OUTCOME_DESCRIPTIONS.VERIFIED_FIT}
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
              <CardContent className="text-sm leading-relaxed text-stone-600 dark:text-stone-300">
                {OUTCOME_DESCRIPTIONS.NEEDS_CONFIRMATION}
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
              <CardContent className="text-sm leading-relaxed text-stone-600 dark:text-stone-300">
                {OUTCOME_DESCRIPTIONS.REQUIREMENT_CONFLICT}
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 rounded-lg border border-stone-200 bg-stone-50 p-4 text-xs text-stone-600 dark:border-stone-800 dark:bg-stone-900/40 dark:text-stone-400">
            <strong>Important note:</strong> {DISCLAIMER_NOTE}
          </div>
        </section>

        {/* Reviewed Cultural Spaces in Ahmedabad */}
        <section aria-labelledby="spaces-heading" className="mt-20">
          <div className="border-b border-stone-200 pb-4 dark:border-stone-800">
            <h2
              id="spaces-heading"
              className="font-serif text-2xl font-semibold text-stone-900 dark:text-stone-100"
            >
              Cultural spaces in Ahmedabad
            </h2>
            <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
              Independently reviewed spaces included in our Ahmedabad pilot:
            </p>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <Card className="border-stone-200 bg-white/70 dark:border-stone-800 dark:bg-stone-900/60">
              <CardHeader>
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                  Textiles & Heritage
                </span>
                <CardTitle className="font-serif text-xl">
                  Calico Museum of Textiles
                </CardTitle>
                <CardDescription>The Retreat, Shahibaug</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs leading-relaxed text-stone-600 dark:text-stone-300">
                <p>
                  A globally renowned collection of Indian fabrics, court
                  textiles, and regional weaving traditions housed in historic
                  residential havelis.
                </p>
                <p className="text-stone-500 dark:text-stone-400">
                  <strong>Visit detail:</strong> Advance online registration
                  required (opens 90 days ahead). Historic architecture involves
                  varying floor levels and narrow corridors.
                </p>
              </CardContent>
            </Card>

            <Card className="border-stone-200 bg-white/70 dark:border-stone-800 dark:bg-stone-900/60">
              <CardHeader>
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                  Art & Architecture
                </span>
                <CardTitle className="font-serif text-xl">
                  Kasturbhai Lalbhai Museum
                </CardTitle>
                <CardDescription>Lalbaug, Shahibaug</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs leading-relaxed text-stone-600 dark:text-stone-300">
                <p>
                  A century-old colonial ancestral home set in serene gardens,
                  exhibiting historic miniatures, modern Indian art, and outdoor
                  sculptures.
                </p>
                <p className="text-stone-500 dark:text-stone-400">
                  <strong>Visit detail:</strong> Conducted tours with advance
                  booking. Heritage residential layout; step-free options for
                  upper galleries remain unrecorded.
                </p>
              </CardContent>
            </Card>

            <Card className="border-stone-200 bg-white/70 dark:border-stone-800 dark:bg-stone-900/60">
              <CardHeader>
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                  Dialogue & Expression
                </span>
                <CardTitle className="font-serif text-xl">
                  Conflictorium
                </CardTitle>
                <CardDescription>Gool Lodge, Mirzapur</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs leading-relaxed text-stone-600 dark:text-stone-300">
                <p>
                  A participatory museum housed in a historic bungalow in the
                  walled city, dedicated to social dialogue, memory, and artistic
                  reflection.
                </p>
                <p className="text-stone-500 dark:text-stone-400">
                  <strong>Visit detail:</strong> Walk-in admission for general
                  visits. Multi-story heritage structure without recorded elevator
                  accommodations.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 flex justify-center">
            <Link href="/explore">
              <Button variant="outline">Learn more about our pilot spaces →</Button>
            </Link>
          </div>
        </section>
      </Container>
    </div>
  );
}

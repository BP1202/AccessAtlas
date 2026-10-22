"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  DISCLAIMER_NOTE,
} from "@/lib/constants/labels";

const SUGGESTED_SPARKS = [
  "Textiles",
  "Heritage architecture",
  "Contemporary art",
  "Craft traditions",
  "History",
  "Photography",
];

const SURPRISE_PROMPTS = [
  "Handloom weaving & modernist brick vaults",
  "Tranquil haveli courtyards & sound archives",
  "Woodblock carving & stepwell architecture",
  "Persian miniature painting & outdoor sculpture",
  "Community dialogue & walled city memory",
];

export default function HomePage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [surpriseIndex, setSurpriseIndex] = useState(0);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const target = query.trim();
    if (target) {
      router.push(`/explore?interest=${encodeURIComponent(target)}`);
    } else {
      router.push("/explore");
    }
  };

  const handleSurpriseMe = () => {
    const nextIndex = (surpriseIndex + 1) % SURPRISE_PROMPTS.length;
    setSurpriseIndex(nextIndex);
    const selected = SURPRISE_PROMPTS[surpriseIndex];
    setQuery(selected);
    router.push(`/explore?interest=${encodeURIComponent(selected)}`);
  };

  return (
    <div className="py-12 md:py-20 lg:py-28 overflow-hidden">
      <Container size="xl">
        {/* ====================================================================
            1. HERO SECTION — Visual, Curiosity-First, Approved Headline
        ==================================================================== */}
        <section aria-labelledby="hero-heading" className="mx-auto max-w-4xl text-center">
          {/* Pilot Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-[#ede8dc] px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#193a32] border border-[#dfd8c8] dark:bg-[#252f2a] dark:text-[#a8d5c4] dark:border-[#384941]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#c56f4d]" aria-hidden="true" />
            <span>Currently exploring Ahmedabad · More cities to come</span>
          </div>

          {/* Approved Headline from docs/UX_VISION.md */}
          <h1
            id="hero-heading"
            className="mt-8 font-serif text-4xl font-semibold tracking-tight text-[#252923] sm:text-5xl md:text-6xl lg:text-7xl leading-[1.08] dark:text-[#f4f1ea]"
          >
            What if your next favourite place is somewhere you never thought to look?
          </h1>

          {/* Concise Supporting Sentences */}
          <p className="mt-6 text-lg sm:text-xl md:text-2xl font-serif text-[#193a32] font-medium max-w-3xl mx-auto dark:text-[#a8d5c4]">
            AccessAtlas turns vague cultural curiosity into unexpected discoveries—and practical plans you can trust.
          </p>

          <p className="mt-3 text-base sm:text-lg leading-relaxed text-[#62685d] max-w-2xl mx-auto dark:text-[#9da398]">
            Discover cultural experiences connected to what you love, with practical details that help you decide what works for your visit.
          </p>

          {/* Dominant Cultural Interest Input (Path B: I know what I want) */}
          <div className="mt-10 mx-auto max-w-2xl">
            <form
              onSubmit={handleSearchSubmit}
              className="relative flex flex-col sm:flex-row items-stretch gap-2.5 rounded-2xl bg-white p-2 border-2 border-[#e6e0d4] shadow-md focus-within:border-[#193a32] focus-within:ring-2 focus-within:ring-[#193a32]/20 transition-all dark:bg-[#212520] dark:border-[#323731] dark:focus-within:border-[#c56f4d]"
            >
              <div className="relative flex-1 flex items-center pl-3">
                <span className="text-[#62685d] select-none pr-2" aria-hidden="true">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. Haveli courtyards, handloom weaving, modernist brick vaults..."
                  aria-label="What cultural experiences are you curious about?"
                  className="w-full bg-transparent py-2.5 text-base text-[#252923] placeholder-[#9da398] focus:outline-none dark:text-[#f4f1ea] dark:placeholder-[#62685d]"
                />
              </div>

              <div className="flex items-center gap-2 sm:shrink-0">
                <Button
                  type="submit"
                  size="lg"
                  variant="primary"
                  className="w-full sm:w-auto px-7 py-3 text-base shadow-sm font-semibold"
                >
                  Discover experiences →
                </Button>
              </div>
            </form>

            {/* Secondary Action: Help me discover & Surprise me */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm">
              <Link
                href="/how-it-works"
                className="font-medium text-[#193a32] hover:text-[#c56f4d] underline underline-offset-4 dark:text-[#a8d5c4] dark:hover:text-[#f4f1ea] transition-colors"
              >
                See how it works
              </Link>
              <span className="text-[#dfd8c8] dark:text-[#323731]">·</span>
              <button
                type="button"
                onClick={handleSurpriseMe}
                className="font-medium text-[#c56f4d] hover:underline cursor-pointer transition-colors inline-flex items-center gap-1"
              >
                <span>✨ Surprise me</span>
              </button>
            </div>
          </div>

          {/* Quick curiosity sparks (Path A: Discover my direction) */}
          <div className="mt-12 pt-8 border-t border-[#e6e0d4]/80 dark:border-[#323731]">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#62685d] dark:text-[#9da398]">
              Start with curated cultural sparks
            </span>
            <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2">
              {SUGGESTED_SPARKS.map((spark) => (
                <Link
                  key={spark}
                  href={`/explore?interest=${encodeURIComponent(spark)}`}
                  className="rounded-full bg-white px-4 py-2 text-sm font-medium text-[#252923] border border-[#e6e0d4] hover:border-[#193a32] hover:bg-[#ede8dc]/50 transition-all shadow-xs dark:bg-[#212520] dark:text-[#f4f1ea] dark:border-[#323731] dark:hover:border-[#c56f4d]"
                >
                  {spark} ↗
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ====================================================================
            2. THE 3-STAGE DISCOVERY JOURNEY (Visual, Intuitive, No Jargon)
        ==================================================================== */}
        <section
          id="journey"
          aria-labelledby="how-it-works-heading"
          className="mt-24 sm:mt-32 pt-12 border-t border-[#e6e0d4] dark:border-[#323731]"
        >
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#c56f4d]">
              The AccessAtlas Journey
            </span>
            <h2
              id="how-it-works-heading"
              className="mt-2 font-serif text-3xl font-semibold text-[#252923] sm:text-4xl dark:text-[#f4f1ea]"
            >
              How discovery connects to planning
            </h2>
            <p className="mt-3 text-base text-[#62685d] dark:text-[#9da398]">
              We bridge unconstrained cultural curiosity with verified practical facts so you can explore with complete confidence.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="relative rounded-2xl border border-[#e6e0d4] bg-white p-8 shadow-xs dark:border-[#323731] dark:bg-[#212520] flex flex-col justify-between">
              <div>
                <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#c56f4d]">
                  Stage 01
                </span>
                <h3 className="mt-2 font-serif text-2xl font-semibold text-[#252923] dark:text-[#f4f1ea]">
                  Cultural curiosity
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[#62685d] dark:text-[#9da398]">
                  Share the art forms, heritage topics, or aesthetic traditions you love. AccessAtlas uses cultural taste mapping to surface connected spaces you might never have thought to search for.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#ede8dc] dark:border-[#323731] text-xs font-medium text-[#193a32] dark:text-[#a8d5c4]">
                ✓ Express taste freely without medical or clinical intake
              </div>
            </div>

            <div className="relative rounded-2xl border border-[#e6e0d4] bg-white p-8 shadow-xs dark:border-[#323731] dark:bg-[#212520] flex flex-col justify-between">
              <div>
                <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#193a32] dark:text-[#a8d5c4]">
                  Stage 02
                </span>
                <h3 className="mt-2 font-serif text-2xl font-semibold text-[#252923] dark:text-[#f4f1ea]">
                  Your visit preferences
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[#62685d] dark:text-[#9da398]">
                  Set what matters for your outing—such as step-free access, rest seating, or tour booking guidelines—as nice-to-have or essential, without justifying why you need them.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#ede8dc] dark:border-[#323731] text-xs font-medium text-[#193a32] dark:text-[#a8d5c4]">
                ✓ Evaluated deterministically against factual documentation
              </div>
            </div>

            <div className="relative rounded-2xl border border-[#e6e0d4] bg-white p-8 shadow-xs dark:border-[#323731] dark:bg-[#212520] flex flex-col justify-between">
              <div>
                <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#c56f4d]">
                  Stage 03
                </span>
                <h3 className="mt-2 font-serif text-2xl font-semibold text-[#252923] dark:text-[#f4f1ea]">
                  Your Visit Plan
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[#62685d] dark:text-[#9da398]">
                  Receive an actionable plan distinguishing verified facts from missing details, complete with official publication sources and pre-written confirmation questions for the venue.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#ede8dc] dark:border-[#323731] text-xs font-medium text-[#c56f4d]">
                ✓ Ready-to-use plan with one-click questions to ask
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================================
            3. VALUE PROPOSITION: "INTERESTING DOES NOT MEAN WORKABLE"
        ==================================================================== */}
        <section
          aria-labelledby="contrast-heading"
          className="mt-24 sm:mt-32 rounded-3xl bg-[#ede8dc]/60 border border-[#dfd8c8] p-8 sm:p-12 lg:p-16 dark:bg-[#212520]/80 dark:border-[#323731]"
        >
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-[#c56f4d]">
                The Reality of Cultural Travel
              </span>
              <h2
                id="contrast-heading"
                className="mt-3 font-serif text-3xl font-semibold text-[#252923] sm:text-4xl dark:text-[#f4f1ea]"
              >
                Interesting does not automatically mean workable
              </h2>
              <p className="mt-4 text-base leading-relaxed text-[#62685d] dark:text-[#9da398]">
                A generic search engine tells you where a venue is located. An ordinary recommendation app stops at &ldquo;You might like this place.&rdquo; But when visiting historic residential havelis, centuries-old stepwells, or private estates, location is only the first question.
              </p>
              <div className="mt-6 space-y-4 text-sm text-[#252923] dark:text-[#e4ded0]">
                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#193a32] text-xs font-bold text-white">✓</span>
                  <span><strong>Independently verified facts:</strong> Sourced directly from official guidelines and documented architectural records, not unverified user star ratings.</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#193a32] text-xs font-bold text-white">✓</span>
                  <span><strong>Transparent unknowns:</strong> When an elevator or seating policy is unrecorded, we say so plainly and give you specific questions to ask.</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#193a32] text-xs font-bold text-white">✓</span>
                  <span><strong>Zero synthetic percentage scores:</strong> We never promise 100% suitability on unverified evidence. Fits are backed by evidence; conflicts are honestly reported.</span>
                </div>
              </div>
            </div>

            {/* Signature Interaction Preview */}
            <div className="rounded-2xl border border-[#e6e0d4] bg-white p-6 sm:p-8 shadow-sm dark:border-[#323731] dark:bg-[#191c19]">
              <div className="flex items-center justify-between pb-4 border-b border-[#ede8dc] dark:border-[#323731]">
                <div>
                  <span className="font-mono text-xs uppercase tracking-wider text-[#62685d]">Signature Interaction</span>
                  <h4 className="font-serif text-lg font-semibold text-[#252923] dark:text-[#f4f1ea]">The Expandable Visit Plan</h4>
                </div>
                <Badge variant="VERIFIED_FIT">
                  {OUTCOME_LABELS.VERIFIED_FIT}
                </Badge>
              </div>

              <div className="mt-4 space-y-3 text-xs leading-relaxed">
                <div className="rounded-xl bg-[#f6f3eb] p-3.5 border border-[#e6e0d4] dark:bg-[#212520] dark:border-[#323731]">
                  <span className="font-semibold text-[#193a32] dark:text-[#a8d5c4]">Step-free entrance:</span> Ground-floor entry to the main pavilion is level from the visitor courtyard. (Verified from official guidelines).
                </div>
                <div className="rounded-xl bg-[#fcf5e8] p-3.5 border border-[#eed49c] dark:bg-[#382b17] dark:border-[#544122]">
                  <span className="font-semibold text-[#8c5914] dark:text-[#f0d496]">Operational Advisory:</span> Advance online booking required 90 days ahead. Upper galleries in historic haveli require stairs.
                </div>
                <div className="rounded-xl bg-[#fdf0ec] p-3.5 border border-[#f3c2b2] dark:bg-[#3a1d17] dark:border-[#582a20]">
                  <span className="font-semibold text-[#a84422] dark:text-[#f6b4a1]">Question Kit:</span> One-click copyable questions to email or call the venue before you travel.
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-[#ede8dc] dark:border-[#323731] flex justify-end">
                <Link href="/explore">
                  <Button size="sm" variant="outline">
                    Try the live discovery flow →
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================================
            4. AHMEDABAD PILOT DESTINATION (Framed Honestly as Initial Proving Ground)
        ==================================================================== */}
        <section aria-labelledby="spaces-heading" className="mt-24 sm:mt-32">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-[#e6e0d4] pb-4 dark:border-[#323731]">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-[#c56f4d]">
                Launch Destination · Ahmedabad Pilot
              </span>
              <h2
                id="spaces-heading"
                className="mt-1 font-serif text-3xl font-semibold text-[#252923] dark:text-[#f4f1ea]"
              >
                Reviewed cultural spaces
              </h2>
              <p className="mt-1 text-sm text-[#62685d] max-w-xl dark:text-[#9da398]">
                Ahmedabad is our first evidence-reviewed pilot destination. Additional cultural capitals will open as independent documentation is verified.
              </p>
            </div>
            <Link
              href="/explore"
              className="text-sm font-semibold text-[#193a32] hover:underline dark:text-[#a8d5c4] sm:shrink-0"
            >
              Explore all spaces in Ahmedabad →
            </Link>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <Card className="border-[#e6e0d4] bg-white dark:border-[#323731] dark:bg-[#212520]">
              <CardHeader>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#c56f4d]">
                  Textiles & Haveli Architecture
                </span>
                <CardTitle className="font-serif text-2xl">
                  Calico Museum of Textiles
                </CardTitle>
                <CardDescription>The Retreat, Shahibaug</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs leading-relaxed text-[#62685d] dark:text-[#9da398]">
                <p>
                  A globally celebrated collection of historic Indian court textiles, regional embroideries, and sacred fabrics housed in tranquil residential havelis.
                </p>
                <p className="rounded-lg bg-[#f6f3eb] p-2.5 border border-[#e6e0d4] text-[#252923] dark:bg-[#191c19] dark:border-[#323731] dark:text-[#e4ded0]">
                  <strong>Key visit detail:</strong> Advance online registration required. Level courtyards with stepped haveli thresholds.
                </p>
              </CardContent>
            </Card>

            <Card className="border-[#e6e0d4] bg-white dark:border-[#323731] dark:bg-[#212520]">
              <CardHeader>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#c56f4d]">
                  Art & Historic Estate
                </span>
                <CardTitle className="font-serif text-2xl">
                  Kasturbhai Lalbhai Museum
                </CardTitle>
                <CardDescription>Lalbaug, Shahibaug</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs leading-relaxed text-[#62685d] dark:text-[#9da398]">
                <p>
                  A restored colonial-era ancestral home set in serene tree-shaded grounds, showcasing Persian and Indian miniatures alongside modern outdoor sculptures.
                </p>
                <p className="rounded-lg bg-[#f6f3eb] p-2.5 border border-[#e6e0d4] text-[#252923] dark:bg-[#191c19] dark:border-[#323731] dark:text-[#e4ded0]">
                  <strong>Key visit detail:</strong> Conducted gallery tours with prior booking. Upper-floor gallery access involves stairs.
                </p>
              </CardContent>
            </Card>

            <Card className="border-[#e6e0d4] bg-white dark:border-[#323731] dark:bg-[#212520]">
              <CardHeader>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#c56f4d]">
                  Dialogue & Memory
                </span>
                <CardTitle className="font-serif text-2xl">
                  Conflictorium
                </CardTitle>
                <CardDescription>Gool Lodge, Mirzapur</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs leading-relaxed text-[#62685d] dark:text-[#9da398]">
                <p>
                  A participatory museum situated in a historic bungalow in the walled city, dedicated to democratic expression, conflict transformation, and communal memory.
                </p>
                <p className="rounded-lg bg-[#f6f3eb] p-2.5 border border-[#e6e0d4] text-[#252923] dark:bg-[#191c19] dark:border-[#323731] dark:text-[#e4ded0]">
                  <strong>Key visit detail:</strong> Walk-in entry welcome. Heritage structure without elevator; ground-floor spaces accessible.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* ====================================================================
            5. CLOSING INVITATION
        ==================================================================== */}
        <div className="mt-24 sm:mt-32 rounded-3xl bg-[#193a32] p-10 sm:p-14 text-center text-[#f6f3eb] dark:bg-[#2a584d]">
          <h2 className="font-serif text-3xl font-semibold sm:text-4xl text-white">
            Ready to explore with confidence?
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#d8e2dc] max-w-xl mx-auto">
            Turn your curiosity into unexpected cultural discoveries and practical participation plans.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/explore">
              <Button size="lg" variant="secondary" className="text-base px-8 py-4 font-semibold">
                Discover experiences →
              </Button>
            </Link>
          </div>
          <p className="mt-6 text-xs text-[#a3b8ad] max-w-md mx-auto">
            {DISCLAIMER_NOTE}
          </p>
        </div>
      </Container>
    </div>
  );
}

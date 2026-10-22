import React from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export default function AboutPage() {
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

        {/* Main Editorial Hero */}
        <div className="max-w-4xl">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#c56f4d]">
            Our Purpose & Methodology
          </span>
          <h1 className="mt-3 font-serif text-4xl font-semibold tracking-tight text-[#252923] sm:text-5xl md:text-6xl dark:text-[#f4f1ea]">
            Culture on your terms.
          </h1>
          <p className="mt-6 text-xl leading-relaxed text-[#62685d] sm:text-2xl font-light dark:text-[#9da398]">
            AccessAtlas helps people discover cultural experiences that match their expressed interests, practical visit needs, and companions—not just places that are technically nearby.
          </p>
        </div>

        {/* Story Grid: Structured, Spacious Sections */}
        <div className="mt-20 grid gap-12 lg:grid-cols-2">
          {/* Section 1: The Problem */}
          <div className="rounded-3xl border border-[#e6e0d4] bg-white p-8 sm:p-10 shadow-xs dark:border-[#323731] dark:bg-[#212520]">
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#c56f4d]">
              01 · The Challenge
            </span>
            <h2 className="mt-3 font-serif text-2xl font-semibold text-[#252923] sm:text-3xl dark:text-[#f4f1ea]">
              Why binary badges fail visitors
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#62685d] dark:text-[#9da398]">
              Most platforms reduce accessibility to a generic green checkmark or an all-or-nothing badge. But cultural spaces are nuanced:
            </p>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-[#252923] dark:text-[#e4ded0]">
              <li className="flex items-start gap-2.5">
                <span className="text-[#c56f4d] font-bold select-none">•</span>
                <span>A historic haveli might have a level, step-free courtyard entrance, but steep staircases between upper exhibition galleries.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[#c56f4d] font-bold select-none">•</span>
                <span>A world-class textile museum might require online tour registration 90 days in advance, making spontaneous walk-in visits impossible.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[#c56f4d] font-bold select-none">•</span>
                <span>A quiet contemporary gallery may offer rest seating throughout, but lacks designated accessible parking on narrow historic lanes.</span>
              </li>
            </ul>
            <p className="mt-4 text-sm text-[#62685d] dark:text-[#9da398]">
              Generic badges conceal these critical details. AccessAtlas preserves the exact, source-backed facts you need to decide what works for you.
            </p>
          </div>

          {/* Section 2: How Discovery Meets Evidence */}
          <div className="rounded-3xl border border-[#e6e0d4] bg-white p-8 sm:p-10 shadow-xs dark:border-[#323731] dark:bg-[#212520]">
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#193a32] dark:text-[#a8d5c4]">
              02 · The Solution
            </span>
            <h2 className="mt-3 font-serif text-2xl font-semibold text-[#252923] sm:text-3xl dark:text-[#f4f1ea]">
              Cultural curiosity + verified facts
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#62685d] dark:text-[#9da398]">
              AccessAtlas connects two systems that have historically lived far apart:
            </p>
            <div className="mt-6 space-y-4">
              <div className="rounded-xl bg-[#f6f3eb] p-4 border border-[#e6e0d4] dark:bg-[#191c19] dark:border-[#323731]">
                <h3 className="font-serif text-base font-semibold text-[#193a32] dark:text-[#a8d5c4]">
                  Cultural Taste Mapping
                </h3>
                <p className="mt-1 text-sm text-[#62685d] dark:text-[#9da398]">
                  Surfaces unexpected cultural connections across disciplines—linking an interest in Gujarati woodblock printing to heritage stepwells, court textiles, and contemporary sculpture.
                </p>
              </div>

              <div className="rounded-xl bg-[#f6f3eb] p-4 border border-[#e6e0d4] dark:bg-[#191c19] dark:border-[#323731]">
                <h3 className="font-serif text-base font-semibold text-[#193a32] dark:text-[#a8d5c4]">
                  Deterministic Verification
                </h3>
                <p className="mt-1 text-sm text-[#62685d] dark:text-[#9da398]">
                  Checks your explicit visit preferences against independently verified venue records. We never invent facts or use AI to guess whether a doorway is wide enough.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Honesty Over Guesswork */}
          <div className="rounded-3xl border border-[#e6e0d4] bg-white p-8 sm:p-10 shadow-xs dark:border-[#323731] dark:bg-[#212520]">
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#c56f4d]">
              03 · Our Ethics
            </span>
            <h2 className="mt-3 font-serif text-2xl font-semibold text-[#252923] sm:text-3xl dark:text-[#f4f1ea]">
              Honesty over false certainty
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#62685d] dark:text-[#9da398]">
              When an accessibility detail is missing from published records, silence is not converted into a guarantee or a fabricated percentage score.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-[#252923] dark:text-[#e4ded0]">
              Instead, AccessAtlas highlights the gap honestly and equips you with a tailored <strong>&ldquo;Ask the venue&rdquo; question kit</strong>. With one click, you can copy specific, grounded questions to email or call the space directly before you travel.
            </p>
            <div className="mt-6 rounded-xl bg-[#fcf5e8] p-4 border border-[#eed49c] dark:bg-[#382b17] dark:border-[#544122]">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#8c5914] dark:text-[#f0d496]">
                Respect for Privacy
              </span>
              <p className="mt-1 text-xs leading-relaxed text-[#62685d] dark:text-[#d4cbb8]">
                We never infer protected characteristics, medical diagnoses, or personal identity from your cultural tastes. You choose only what is relevant to your visit.
              </p>
            </div>
          </div>

          {/* Section 4: Current Scope & Ahmedabad Pilot */}
          <div className="rounded-3xl border border-[#e6e0d4] bg-white p-8 sm:p-10 shadow-xs dark:border-[#323731] dark:bg-[#212520]">
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#193a32] dark:text-[#a8d5c4]">
              04 · Where We Are
            </span>
            <h2 className="mt-3 font-serif text-2xl font-semibold text-[#252923] sm:text-3xl dark:text-[#f4f1ea]">
              Exploring Ahmedabad first
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#62685d] dark:text-[#9da398]">
              Ahmedabad was selected as our pilot city because of its extraordinary cultural density: India&apos;s first UNESCO World Heritage City, home to century-old residential havelis, world-class modern textile collections, and pioneering social dialogue spaces.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-[#252923] dark:text-[#e4ded0]">
              Rather than claiming shallow worldwide coverage, we are establishing trustworthy, deeply verified evidence handling for one city before expanding to more cultural capitals across India and beyond.
            </p>
            <div className="mt-6 pt-4 border-t border-[#ede8dc] dark:border-[#323731] flex flex-wrap items-center justify-between gap-4">
              <span className="text-xs font-medium text-[#62685d] dark:text-[#9da398]">
                Currently live with reviewed Ahmedabad spaces.
              </span>
              <Link href="/explore">
                <Button size="sm" variant="primary">
                  Start exploring →
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Navigation Callout */}
        <div className="mt-20 pt-8 border-t border-[#e6e0d4] dark:border-[#323731] flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            href="/how-it-works"
            className="text-sm font-semibold text-[#193a32] hover:underline dark:text-[#a8d5c4]"
          >
            ← Learn more about our verification methodology
          </Link>
          <Link href="/explore">
            <Button variant="secondary" size="lg">
              Discover cultural experiences →
            </Button>
          </Link>
        </div>
      </Container>
    </div>
  );
}

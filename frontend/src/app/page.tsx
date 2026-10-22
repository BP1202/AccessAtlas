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
  DISCLAIMER_NOTE,
} from "@/lib/constants/labels";

export default function HomePage() {
  const suggestedSparks = [
    "Textiles",
    "Heritage architecture",
    "Contemporary art",
    "Craft traditions",
    "History",
    "Photography",
  ];

  return (
    <div className="py-12 md:py-20 lg:py-24">
      <Container size="xl">
        {/* Hero Section */}
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#ede8dc] px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#193a32] border border-[#dfd8c8] dark:bg-[#252f2a] dark:text-[#a8d5c4] dark:border-[#384941]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#c56f4d]" />
            <span>Currently exploring Ahmedabad · More cities to come</span>
          </div>

          <h1 className="mt-6 font-serif text-4xl font-semibold tracking-tight text-[#252923] sm:text-5xl md:text-6xl lg:text-7xl leading-[1.1] dark:text-[#f4f1ea]">
            Follow your curiosity.<br className="hidden sm:inline" /> Plan with confidence.
          </h1>

          <p className="mt-6 text-lg leading-relaxed text-[#62685d] sm:text-xl md:text-2xl max-w-2xl mx-auto dark:text-[#9da398]">
            Discover cultural experiences connected to what you love, with practical details that help you decide what works for your visit.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/explore">
              <Button size="lg" variant="primary" className="text-base px-8 py-4">
                Discover experiences →
              </Button>
            </Link>
            <Link href="/how-it-works">
              <Button size="lg" variant="outline" className="text-base px-8 py-4">
                See how it works
              </Button>
            </Link>
          </div>

          {/* Quick curiosity sparks */}
          <div className="mt-12 pt-8 border-t border-[#e6e0d4]/80 dark:border-[#323731]">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#62685d] dark:text-[#9da398]">
              Start with what sparks your interest
            </span>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              {suggestedSparks.map((spark) => (
                <Link
                  key={spark}
                  href={`/explore?interest=${encodeURIComponent(spark)}`}
                  className="rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-[#252923] border border-[#e6e0d4] hover:border-[#193a32] hover:bg-white transition-all shadow-xs dark:bg-[#212520] dark:text-[#f4f1ea] dark:border-[#323731] dark:hover:border-[#c56f4d]"
                >
                  {spark} ↗
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* The 3-Stage Discovery Journey (Visual, Concise) */}
        <section aria-labelledby="how-it-works-heading" className="mt-24 sm:mt-32">
          <div className="text-center max-w-2xl mx-auto mb-12">
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
              AccessAtlas bridges cultural affinity with verified venue documentation so you never have to guess before you go.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-2xl border border-[#e6e0d4] bg-white p-8 shadow-xs dark:border-[#323731] dark:bg-[#212520]">
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#c56f4d]">
                Stage 01
              </span>
              <h3 className="mt-2 font-serif text-2xl font-semibold text-[#252923] dark:text-[#f4f1ea]">
                Cultural curiosity
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[#62685d] dark:text-[#9da398]">
                Share the art forms, heritage topics, or historical periods you love. Discover unexpected cultural connections across Ahmedabad’s museums, stepwells, and galleries.
              </p>
            </div>

            <div className="rounded-2xl border border-[#e6e0d4] bg-white p-8 shadow-xs dark:border-[#323731] dark:bg-[#212520]">
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#193a32] dark:text-[#a8d5c4]">
                Stage 02
              </span>
              <h3 className="mt-2 font-serif text-2xl font-semibold text-[#252923] dark:text-[#f4f1ea]">
                Your visit preferences
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[#62685d] dark:text-[#9da398]">
                Choose practical requirements that matter to your day—such as step-free entrance, rest seating, or tour reservations—without disclosing sensitive personal reasons.
              </p>
            </div>

            <div className="rounded-2xl border border-[#e6e0d4] bg-white p-8 shadow-xs dark:border-[#323731] dark:bg-[#212520]">
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#c56f4d]">
                Stage 03
              </span>
              <h3 className="mt-2 font-serif text-2xl font-semibold text-[#252923] dark:text-[#f4f1ea]">
                Your Visit Plan
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[#62685d] dark:text-[#9da398]">
                Receive an actionable visit plan distinguishing verified facts from missing details, complete with official source citations and copyable questions to ask the venue.
              </p>
            </div>
          </div>
        </section>

        {/* The Value Contrast: Why AccessAtlas Stands Apart */}
        <section aria-labelledby="contrast-heading" className="mt-24 sm:mt-32 rounded-3xl bg-[#ede8dc]/60 border border-[#dfd8c8] p-8 sm:p-12 lg:p-16 dark:bg-[#212520]/80 dark:border-[#323731]">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-[#c56f4d]">
                Interesting does not mean workable
              </span>
              <h2
                id="contrast-heading"
                className="mt-3 font-serif text-3xl font-semibold text-[#252923] sm:text-4xl dark:text-[#f4f1ea]"
              >
                Why ordinary recommendation apps fall short
              </h2>
              <p className="mt-4 text-base leading-relaxed text-[#62685d] dark:text-[#9da398]">
                A generic search engine tells you where a venue is located. But for anyone visiting historic residential havelis or centuries-old estates, location is only the first question.
              </p>
              <div className="mt-6 space-y-4 text-sm text-[#252923] dark:text-[#e4ded0]">
                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#193a32] text-xs font-bold text-white">✓</span>
                  <span><strong>Independently verified facts:</strong> Sourced directly from official venue documents, not scraped user guesses or fabricated star ratings.</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#193a32] text-xs font-bold text-white">✓</span>
                  <span><strong>Transparent unknowns:</strong> When an elevator or seating policy is unrecorded, we say so plainly and provide specific questions to ask.</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#193a32] text-xs font-bold text-white">✓</span>
                  <span><strong>Zero personal assumptions:</strong> We never infer your health, disability, or identity from what art you like.</span>
                </div>
              </div>
            </div>

            {/* Simulated Plan Card preview */}
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
                <div className="rounded-lg bg-[#f6f3eb] p-3 border border-[#e6e0d4] dark:bg-[#212520] dark:border-[#323731]">
                  <span className="font-semibold text-[#193a32] dark:text-[#a8d5c4]">Step-free entrance:</span> Ground-floor entry to the main pavilion is level from the visitor courtyard. (Verified from official guidelines).
                </div>
                <div className="rounded-lg bg-[#fcf5e8] p-3 border border-[#eed49c] dark:bg-[#382b17] dark:border-[#544122]">
                  <span className="font-semibold text-[#8c5914] dark:text-[#f0d496]">Operational Advisory:</span> Advance online booking required 90 days ahead. Upper galleries in historic haveli require stairs.
                </div>
                <div className="rounded-lg bg-[#fdf0ec] p-3 border border-[#f3c2b2] dark:bg-[#3a1d17] dark:border-[#582a20]">
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

        {/* Reviewed Cultural Spaces in Ahmedabad */}
        <section aria-labelledby="spaces-heading" className="mt-24 sm:mt-32">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-[#e6e0d4] pb-4 dark:border-[#323731]">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-[#c56f4d]">
                Ahmedabad Pilot Collection
              </span>
              <h2
                id="spaces-heading"
                className="mt-1 font-serif text-3xl font-semibold text-[#252923] dark:text-[#f4f1ea]"
              >
                Reviewed cultural spaces
              </h2>
            </div>
            <Link
              href="/explore"
              className="text-sm font-semibold text-[#193a32] hover:underline dark:text-[#a8d5c4]"
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
                <p className="rounded-md bg-[#f6f3eb] p-2.5 border border-[#e6e0d4] text-[#252923] dark:bg-[#191c19] dark:border-[#323731] dark:text-[#e4ded0]">
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
                <p className="rounded-md bg-[#f6f3eb] p-2.5 border border-[#e6e0d4] text-[#252923] dark:bg-[#191c19] dark:border-[#323731] dark:text-[#e4ded0]">
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
                <p className="rounded-md bg-[#f6f3eb] p-2.5 border border-[#e6e0d4] text-[#252923] dark:bg-[#191c19] dark:border-[#323731] dark:text-[#e4ded0]">
                  <strong>Key visit detail:</strong> Walk-in entry welcome. Heritage structure without elevator; ground-floor spaces accessible.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Closing CTA */}
        <div className="mt-24 sm:mt-32 rounded-3xl bg-[#193a32] p-10 sm:p-14 text-center text-[#f6f3eb] dark:bg-[#2a584d]">
          <h2 className="font-serif text-3xl font-semibold sm:text-4xl text-white">
            Ready to discover Ahmedabad’s cultural landscape?
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#d8e2dc] max-w-xl mx-auto">
            Choose what you want to explore and plan your visit with grounded, transparent information.
          </p>
          <div className="mt-8 flex justify-center">
            <Link href="/explore">
              <Button size="lg" variant="secondary" className="text-base px-8 py-4">
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

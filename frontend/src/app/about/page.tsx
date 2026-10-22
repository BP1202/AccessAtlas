import React from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";

export default function AboutPage() {
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
            About AccessAtlas
          </span>
          <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl md:text-5xl dark:text-stone-50">
            Culture on your terms.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-stone-600 sm:text-lg dark:text-stone-300">
            AccessAtlas helps people discover cultural experiences that match
            their interests, practical needs, and plans—not just venues that
            happen to be nearby.
          </p>
        </div>

        {/* Core Principles */}
        <div className="mt-14 max-w-3xl space-y-10 text-stone-700 dark:text-stone-300">
          <div>
            <h2 className="font-serif text-xl font-semibold text-stone-900 dark:text-stone-100">
              The Problem with Binary Badges
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
              Many platforms reduce accessibility to a generic badge or a binary
              checkmark that often conceals crucial practical details. A historic
              haveli might have step-free courtyards but steep staircases to upper
              galleries. Another venue may require online booking weeks in
              advance. AccessAtlas provides the specific, factual nuances you
              need to plan a comfortable outing.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-xl font-semibold text-stone-900 dark:text-stone-100">
              Starting with Ahmedabad
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
              Our pilot focuses on the historic and contemporary cultural spaces
              of Ahmedabad, Gujarat—home to world-renowned textile collections,
              heritage estates, and vibrant modern arts centers. We are carefully
              reviewing published visit guidelines for spaces like the Calico
              Museum of Textiles, the Kasturbhai Lalbhai Museum, and the
              Conflictorium.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-xl font-semibold text-stone-900 dark:text-stone-100">
              Honest & Grounded
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
              We believe in honesty over false certainty. When a venue has not
              published details about elevators, restrooms, or seating, we leave
              it clearly marked as needing confirmation rather than guessing. We
              never claim a venue is universally accessible, and we always link
              directly to official sources.
            </p>
          </div>
        </div>

        <div className="mt-12 border-t border-stone-200 pt-8 dark:border-stone-800">
          <Link
            href="/explore"
            className="text-sm font-semibold text-stone-900 hover:underline dark:text-stone-100"
          >
            Explore Ahmedabad cultural spaces →
          </Link>
        </div>
      </Container>
    </div>
  );
}

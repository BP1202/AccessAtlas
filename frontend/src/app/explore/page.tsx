import React from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function ExplorePage() {
  return (
    <div className="py-12 md:py-20">
      <Container size="lg">
        {/* Breadcrumb / Category */}
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
            Ahmedabad Pilot
          </span>
          <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl md:text-5xl dark:text-stone-50">
            Explore cultural spaces in Ahmedabad
          </h1>
          <p className="mt-4 text-base leading-relaxed text-stone-600 sm:text-lg dark:text-stone-300">
            Discover historic collections, textile museums, and contemporary
            galleries across Ahmedabad—paired with verified visit details so you
            can plan with confidence.
          </p>
        </div>

        {/* Discovery Journey Stages */}
        <section aria-labelledby="journey-heading" className="mt-14">
          <div className="border-b border-stone-200 pb-4 dark:border-stone-800">
            <h2
              id="journey-heading"
              className="font-serif text-2xl font-semibold text-stone-900 dark:text-stone-100"
            >
              How discovery works in AccessAtlas
            </h2>
            <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
              A 3-stage process designed to put your curiosity and practical plans first.
            </p>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <Card className="border-stone-200 bg-white/70 dark:border-stone-800 dark:bg-stone-900/60">
              <CardHeader>
                <span className="font-mono text-xs font-medium text-stone-400 dark:text-stone-500">
                  STAGE 01
                </span>
                <CardTitle className="font-serif text-xl">Your interests</CardTitle>
                <CardDescription>
                  Start with what sparks your curiosity.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                Choose cultural topics you want to explore—from Gujarati block
                printing and historic architecture to contemporary art and
                sculpture.
              </CardContent>
            </Card>

            <Card className="border-stone-200 bg-white/70 dark:border-stone-800 dark:bg-stone-900/60">
              <CardHeader>
                <span className="font-mono text-xs font-medium text-stone-400 dark:text-stone-500">
                  STAGE 02
                </span>
                <CardTitle className="font-serif text-xl">Your visit preferences</CardTitle>
                <CardDescription>
                  Share what matters for your day out.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                Select practical requirements—such as advance registration,
                step-free access, or seating—without disclosing medical details
                or explaining why you need them.
              </CardContent>
            </Card>

            <Card className="border-stone-200 bg-white/70 dark:border-stone-800 dark:bg-stone-900/60">
              <CardHeader>
                <span className="font-mono text-xs font-medium text-stone-400 dark:text-stone-500">
                  STAGE 03
                </span>
                <CardTitle className="font-serif text-xl">Your discoveries</CardTitle>
                <CardDescription>
                  Clear results with transparent visit details.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                See cultural matches alongside confirmed venue information,
                source links, and transparent notes on details that still need
                direct confirmation.
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Coming Next Notice */}
        <section aria-labelledby="status-heading" className="mt-14">
          <div className="rounded-xl border border-stone-200 bg-stone-100/60 p-8 dark:border-stone-800 dark:bg-stone-900/40">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Interactive Form Opening Soon
            </span>
            <h3
              id="status-heading"
              className="mt-2 font-serif text-xl font-semibold text-stone-900 dark:text-stone-100"
            >
              The full interactive discovery interface is arriving next.
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-600 dark:text-stone-300">
              We are currently establishing the foundational experience and
              verifying published venue evidence for our Ahmedabad spaces. In the
              meantime, learn more about how we verify information or review our
              approach.
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link href="/how-it-works">
                <Button variant="primary">How it works</Button>
              </Link>
              <Link href="/about">
                <Button variant="outline">About AccessAtlas</Button>
              </Link>
            </div>
          </div>
        </section>
      </Container>
    </div>
  );
}

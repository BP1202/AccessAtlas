import React from "react";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Alert } from "@/components/ui/Alert";
import { BACKEND_URL } from "@/config/env";

export default function HomePage() {
  return (
    <div className="py-12 md:py-16">
      <Container size="lg">
        {/* Hero Section */}
        <div className="max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2">
            <Badge variant="info">Ahmedabad Pilot</Badge>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Qloo Agentic Hackathon
            </span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl md:text-5xl dark:text-white">
            Find cultural experiences that match your{" "}
            <span className="text-teal-700 dark:text-teal-400">
              real participation needs
            </span>
          </h1>

          <p className="mt-4 text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            AccessAtlas combines Qloo cultural discovery with independently
            verified venue evidence and a deterministic Possibility Engine —
            moving beyond generic and misleading binary accessibility tags.
          </p>
        </div>

        {/* Status Notice */}
        <div className="mt-8">
          <Alert variant="info" title="Phase 1 Foundation Active">
            <p>
              The Next.js frontend foundation and FastAPI Discovery API (
              <code>POST /api/v1/discover</code>) are operational for the
              Ahmedabad pilot. Full interactive discovery form and real-time
              participation planning components are scheduled for the next issue.
            </p>
          </Alert>
        </div>

        {/* 3-State Deterministic Possibility Engine */}
        <section aria-labelledby="possibility-engine-heading" className="mt-14">
          <div className="mb-6">
            <h2
              id="possibility-engine-heading"
              className="text-xl font-bold tracking-tight text-slate-900 dark:text-white"
            >
              Deterministic Possibility Engine Outcomes
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              AccessAtlas never manufactures speculative suitability percentages.
              Evaluations strictly distinguish three explainable states:
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <div className="mb-2">
                  <Badge variant="VERIFIED_FIT">Verified Fit</Badge>
                </div>
                <CardTitle>Verified Fit</CardTitle>
                <CardDescription>
                  Stated requirements confirmed by source-backed evidence.
                </CardDescription>
              </CardHeader>
              <CardContent>
                Available factual evidence from official venue publications
                verifies that all stated mandatory requirements are met.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-2">
                  <Badge variant="NEEDS_CONFIRMATION">Needs Confirmation</Badge>
                </div>
                <CardTitle>Needs Confirmation</CardTitle>
                <CardDescription>
                  Factual evidence is unrecorded, ambiguous, or incomplete.
                </CardDescription>
              </CardHeader>
              <CardContent>
                Missing accessibility features remain unknown. Direct inquiries
                to venue coordinators are formulated from identified evidence gaps.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-2">
                  <Badge variant="REQUIREMENT_CONFLICT">Requirement Conflict</Badge>
                </div>
                <CardTitle>Requirement Conflict</CardTitle>
                <CardDescription>
                  Verified evidence identifies an explicit physical or policy barrier.
                </CardDescription>
              </CardHeader>
              <CardContent>
                Published evidence confirms an incompatibility with one or more
                mandatory participation requirements.
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Reviewed Pilot Venues */}
        <section aria-labelledby="pilot-venues-heading" className="mt-14">
          <div className="mb-6">
            <h2
              id="pilot-venues-heading"
              className="text-xl font-bold tracking-tight text-slate-900 dark:text-white"
            >
              Reviewed Ahmedabad Pilot Candidates
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Ground truth evidence sourced from official venue publications:
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Calico Museum of Textiles</CardTitle>
                <CardDescription>The Retreat, Shahibaug</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <p>
                  <strong>Reservation:</strong> Mandatory advance online booking
                  (opens 90-day window, capped at 20 visitors per tour).
                </p>
                <p>
                  <strong>Operational Policy:</strong> Foundation is currently unable
                  to offer wheelchair access across historic domestic havelis.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Kasturbhai Lalbhai Museum</CardTitle>
                <CardDescription>Lalbaug, Shahibaug</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <p>
                  <strong>Reservation:</strong> Conducted tours only; advance booking
                  via telephone or email required (~12 visitor batches).
                </p>
                <p>
                  <strong>Accessibility:</strong> Ramp and elevator provisions for the
                  1905 heritage home remain unrecorded on official channels.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Conflictorium</CardTitle>
                <CardDescription>Gool Lodge, Mirzapur</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <p>
                  <strong>Admission:</strong> Free walk-in entry for ordinary museum
                  visits (special workshops may require separate sign-up).
                </p>
                <p>
                  <strong>Physical Layout:</strong> Multi-story residential bungalow;
                  physical ramp and elevator provisions remain unrecorded.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Architecture & Security Invariants */}
        <section aria-labelledby="invariants-heading" className="mt-14">
          <Card className="bg-slate-50 dark:bg-slate-900/50">
            <CardHeader>
              <CardTitle id="invariants-heading">
                Architecture & Privacy Invariants
              </CardTitle>
              <CardDescription>
                Core trust boundaries enforced across frontend and backend
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              <p>
                • <strong>No Sensitive Inferences:</strong> We do not infer
                disability, medical condition, or protected characteristics from
                cultural tastes.
              </p>
              <p>
                • <strong>Backend Isolation:</strong> Qloo API credentials (
                <code>QLOO_API_KEY</code>) remain exclusively on the backend. The
                frontend communicates only with the AccessAtlas service at{" "}
                <code>{BACKEND_URL}</code>.
              </p>
              <p>
                • <strong>Deterministic Suitability:</strong> Possibility Engine
                evaluations are pure and independently testable; language models may
                explain results but never override evidence.
              </p>
            </CardContent>
          </Card>
        </section>
      </Container>
    </div>
  );
}

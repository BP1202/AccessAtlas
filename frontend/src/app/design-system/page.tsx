"use client";

import React, { useState } from "react";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Chip } from "@/components/ui/Chip";
import { Badge, StatusLabel } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { EditorialContainer } from "@/components/ui/EditorialContainer";
import { InfoPanel } from "@/components/ui/InfoPanel";
import { Alert } from "@/components/ui/Alert";
import { ProvenanceLink } from "@/components/ui/ProvenanceLink";
import { EmptyState } from "@/components/feedback/EmptyState";

export default function DesignSystemPage() {
  const [inputValue, setInputValue] = useState("");
  const [selectedChips, setSelectedChips] = useState<string[]>([
    "Textiles",
    "Heritage architecture",
  ]);

  const toggleChip = (topic: string) => {
    setSelectedChips((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  };

  const removeChip = (topic: string) => {
    setSelectedChips((prev) => prev.filter((t) => t !== topic));
  };

  return (
    <div className="py-10 sm:py-16 space-y-16">
      <Container size="lg">
        {/* Header */}
        <Heading
          level={1}
          eyebrow="AccessAtlas Editorial Foundations"
          title="Accessible Editorial Design System"
          description="A cohesive visual identity inspired by cultural atlases, museum publications, and modern cultural discovery platforms. Built on verified WCAG 2.2 AA contrast ratios and accessible interactive primitives."
          showRouteMotif
        />

        {/* 1. Colour Tokens & Contrast Verification Matrix */}
        <section className="mt-14 space-y-6" aria-labelledby="tokens-heading">
          <Heading
            level={2}
            eyebrow="Palette Tokens · WCAG 2.2 AA Validated"
            title="Core Editorial Palette"
            description="Restrained atlas-inspired tokens designed for high textual clarity and grounded evidence presentation."
          />

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="rounded-2xl border border-[#e7e0d3] p-4 bg-white shadow-2xs">
              <div className="h-14 w-full rounded-xl bg-[#193a32] shadow-inner mb-3" />
              <p className="font-serif font-semibold text-sm text-[#252923]">Forest</p>
              <p className="text-xs font-mono text-[#53594e]">#193A32</p>
              <p className="text-[11px] text-[#53594e] mt-1">10.7:1 vs Paper (AAA)</p>
            </div>

            <div className="rounded-2xl border border-[#e7e0d3] p-4 bg-white shadow-2xs">
              <div className="h-14 w-full rounded-xl bg-[#f6f3eb] border border-[#e7e0d3] shadow-inner mb-3" />
              <p className="font-serif font-semibold text-sm text-[#252923]">Warm Paper</p>
              <p className="text-xs font-mono text-[#53594e]">#F6F3EB</p>
              <p className="text-[11px] text-[#53594e] mt-1">Main Background</p>
            </div>

            <div className="rounded-2xl border border-[#e7e0d3] p-4 bg-white shadow-2xs">
              <div className="h-14 w-full rounded-xl bg-[#252923] shadow-inner mb-3" />
              <p className="font-serif font-semibold text-sm text-[#252923]">Ink</p>
              <p className="text-xs font-mono text-[#53594e]">#252923</p>
              <p className="text-[11px] text-[#53594e] mt-1">13.25:1 vs Paper (AAA)</p>
            </div>

            <div className="rounded-2xl border border-[#e7e0d3] p-4 bg-white shadow-2xs">
              <div className="h-14 w-full rounded-xl bg-[#c56f4d] shadow-inner mb-3" />
              <p className="font-serif font-semibold text-sm text-[#252923]">Terracotta</p>
              <p className="text-xs font-mono text-[#53594e]">#C56F4D</p>
              <p className="text-[11px] text-[#53594e] mt-1">Discovery Accent</p>
            </div>

            <div className="rounded-2xl border border-[#e7e0d3] p-4 bg-white shadow-2xs">
              <div className="h-14 w-full rounded-xl bg-[#e7e0d3] shadow-inner mb-3" />
              <p className="font-serif font-semibold text-sm text-[#252923]">Stone</p>
              <p className="text-xs font-mono text-[#53594e]">#E7E0D3</p>
              <p className="text-[11px] text-[#53594e] mt-1">Dividers & Surfaces</p>
            </div>

            <div className="rounded-2xl border border-[#e7e0d3] p-4 bg-white shadow-2xs">
              <div className="h-14 w-full rounded-xl bg-[#e7f0e9] border border-[#bcd6cb] shadow-inner mb-3" />
              <p className="font-serif font-semibold text-sm text-[#252923]">Sage Tint</p>
              <p className="text-xs font-mono text-[#53594e]">#E7F0E9</p>
              <p className="text-[11px] text-[#53594e] mt-1">Verified Background</p>
            </div>
          </div>
        </section>

        {/* 2. Interactive Primitives: Buttons & Inputs */}
        <section className="mt-14 space-y-6" aria-labelledby="primitives-heading">
          <Heading
            level={2}
            eyebrow="Interactive Primitives · 44px Touch Targets"
            title="Buttons & Text Inputs"
            description="Clear interactive affordances with visible keyboard focus rings and accessible labels."
          />

          <div className="grid gap-6 md:grid-cols-2">
            <Card variant="default">
              <CardHeader>
                <CardTitle>Button Hierarchy</CardTitle>
                <CardDescription>
                  Forest primary, Terracotta secondary/accent, Quiet surface, and Outline.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-3 items-center">
                  <Button variant="primary">Primary Action</Button>
                  <Button variant="secondary">Discovery Accent</Button>
                  <Button variant="surface">Surface</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                </div>
                <div className="flex flex-wrap gap-3 items-center pt-2">
                  <Button size="sm" variant="primary">Small (36px min)</Button>
                  <Button size="md" variant="primary">Medium (44px target)</Button>
                  <Button size="lg" variant="primary">Large (48px target)</Button>
                </div>
              </CardContent>
            </Card>

            <Card variant="default">
              <CardHeader>
                <CardTitle>Accessible Input Primitive</CardTitle>
                <CardDescription>
                  Supports labels, helper text, error alerts, icons, and 44px minimum target height.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Cultural Topic or Craft Tradition"
                  placeholder="e.g. Woodblock printing, stepwells..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  helperText="Explicitly specified by the visitor. Never inferred."
                  leftIcon={<span>🔍</span>}
                />
                <Input
                  label="Required Requirement"
                  placeholder="Enter visit constraint"
                  errorMessage="Step-free access is required for this outing."
                  required
                />
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 3. Selectable Interest Chips */}
        <section className="mt-14 space-y-6" aria-labelledby="chips-heading">
          <Heading
            level={2}
            eyebrow="Exploration Primitives · Tactile Affordances"
            title="Selectable Interest Chips"
            description="Stateful chips communicating active selection without relying on color alone."
          />

          <Card variant="paper">
            <CardHeader>
              <CardTitle>Interest Selection & Removal</CardTitle>
              <CardDescription>
                Keyboard accessible (Enter/Space), screen reader friendly with aria-pressed.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#53594e] dark:text-[#a3aba0]">
                  Selectable Sparks (Click or Enter/Space to toggle)
                </span>
                <div className="flex flex-wrap gap-2.5">
                  {[
                    "Textiles",
                    "Heritage architecture",
                    "Contemporary art",
                    "Craft traditions",
                    "Stepwells",
                    "Sound archives",
                  ].map((topic) => {
                    const isSelected = selectedChips.includes(topic);
                    return (
                      <Chip
                        key={topic}
                        label={topic}
                        selected={isSelected}
                        onToggle={() => toggleChip(topic)}
                      />
                    );
                  })}
                </div>
              </div>

              {selectedChips.length > 0 && (
                <div className="space-y-2 pt-3 border-t border-[#e7e0d3] dark:border-[#323731]">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#53594e] dark:text-[#a3aba0]">
                    Active Outing Topics (Removable)
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {selectedChips.map((topic) => (
                      <Chip
                        key={`removable-${topic}`}
                        label={topic}
                        selected
                        onRemove={() => removeChip(topic)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* 4. Evidence Status Indicators & Possibility Engine States */}
        <section className="mt-14 space-y-6" aria-labelledby="status-heading">
          <Heading
            level={2}
            eyebrow="Deterministic Evidence Hierarchy"
            title="Possibility Outcome Badges & Panels"
            description="The Possibility Engine distinguishes verified fit, needs confirmation, and requirement conflicts without fabricated confidence scores."
          />

          <div className="grid gap-4 sm:grid-cols-3">
            <InfoPanel
              variant="verified"
              title="Verified Fit"
              icon="✓"
            >
              Independent documentation supports the stated criteria. No fabricated features.
            </InfoPanel>

            <InfoPanel
              variant="confirmation"
              title="Needs Confirmation"
              icon="?"
            >
              Necessary operational evidence is missing or ambiguous. Confirmation question kit provided.
            </InfoPanel>

            <InfoPanel
              variant="conflict"
              title="Requirement Conflict"
              icon="✕"
            >
              Available evidence documents a direct incompatibility with an essential requirement.
            </InfoPanel>
          </div>

          <div className="flex flex-wrap gap-3 items-center pt-2">
            <StatusLabel variant="VERIFIED_FIT" icon="✓">
              Verified Fit
            </StatusLabel>
            <StatusLabel variant="NEEDS_CONFIRMATION" icon="?">
              Needs Confirmation
            </StatusLabel>
            <StatusLabel variant="REQUIREMENT_CONFLICT" icon="✕">
              Requirement Conflict
            </StatusLabel>
            <StatusLabel variant="default">
              Unreviewed Candidate
            </StatusLabel>
          </div>
        </section>

        {/* 5. Editorial Containers & Grounded Provenance */}
        <section className="mt-14 space-y-6" aria-labelledby="editorial-heading">
          <Heading
            level={2}
            eyebrow="Museum Publication Language"
            title="Editorial Containers & Provenance"
            description="Subtle paper-like surfaces, route borders, and source citations."
          />

          <div className="grid gap-6 md:grid-cols-2">
            <EditorialContainer
              eyebrow="Cultural Thread · Connection Provenance"
              motif="forest-border"
            >
              <h3 className="font-serif text-xl font-semibold text-[#252923] dark:text-[#f4f1ea]">
                Calico Museum of Textiles
              </h3>
              <p className="mt-2 text-sm text-[#53594e] dark:text-[#a3aba0] leading-relaxed">
                Connected from &ldquo;Textiles&rdquo; via shared cultural tag &ldquo;Court textiles & Gujarati block printing&rdquo;.
              </p>
              <div className="mt-4 pt-3 border-t border-[#e7e0d3] dark:border-[#323731]">
                <ProvenanceLink
                  href="https://www.calicomuseum.org"
                  sourceName="Calico Museum Official Archive"
                  lastVerified="October 2026"
                />
              </div>
            </EditorialContainer>

            <EditorialContainer
              eyebrow="Operational Guidance"
              motif="terracotta-border"
            >
              <h3 className="font-serif text-xl font-semibold text-[#252923] dark:text-[#f4f1ea]">
                Advance Booking Protocol
              </h3>
              <p className="mt-2 text-sm text-[#53594e] dark:text-[#a3aba0] leading-relaxed">
                Mandatory advance guided tour reservation required. Visitors must arrive 15 minutes before the scheduled time slot.
              </p>
              <div className="mt-4 pt-3 border-t border-[#e7e0d3] dark:border-[#323731]">
                <ProvenanceLink
                  href="https://ahmedabadcity.gov.in"
                  sourceName="Municipal Heritage Trust Documentation"
                  lastVerified="October 2026"
                />
              </div>
            </EditorialContainer>
          </div>
        </section>

        {/* 6. Empty States & Alerts */}
        <section className="mt-14 space-y-6" aria-labelledby="feedback-heading">
          <Heading
            level={2}
            eyebrow="Feedback & System Boundaries"
            title="Alerts & Empty States"
            description="Graceful handling of empty results, pilot boundaries, and honest limitations."
          />

          <div className="grid gap-6 md:grid-cols-2">
            <Alert variant="warning" title="Pilot Scope Limitation">
              AccessAtlas currently catalogues verified operational evidence for Ahmedabad pilot venues. Cultural discovery signals explore worldwide affinities.
            </Alert>

            <Alert variant="danger" title="Physical Incompatibility">
              The historical upper haveli levels require navigating steep, narrow stone staircases with no lift alternative.
            </Alert>
          </div>

          <div className="pt-4">
            <EmptyState
              title="No Cultural Candidates Found"
              description="No cultural venues matched your query in the current pilot scope. Try exploring adjacent craft traditions or relaxing strict constraints."
              actionLabel="Reset to Curated Ahmedabad Sparks"
              onAction={() => setSelectedChips(["Textiles"])}
            />
          </div>
        </section>
      </Container>
    </div>
  );
}

import React from "react";
import { Container } from "@/components/ui/Container";

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-slate-50 py-10 dark:border-slate-800 dark:bg-slate-950">
      <Container size="lg">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <h4 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              AccessAtlas — Cultural Discovery & Participation Planning
            </h4>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              AccessAtlas helps people find cultural experiences that match their
              expressed interests, practical needs, energy preferences, and
              companions. Built for the Qloo Agentic Hackathon.
            </p>
          </div>

          <div className="flex flex-col gap-2 text-xs text-slate-500 dark:text-slate-500 md:text-right">
            <span>Deterministic Possibility Engine • Independently Sourced Evidence</span>
            <span>Qloo Aggregate Affinity Intelligence</span>
          </div>
        </div>
      </Container>
    </footer>
  );
};

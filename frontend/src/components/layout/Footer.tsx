import React from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-stone-200 bg-stone-100/70 py-12 dark:border-stone-800 dark:bg-stone-950">
      <Container size="lg">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-md">
            <span className="font-serif text-lg font-semibold tracking-tight text-stone-900 dark:text-stone-100">
              AccessAtlas
            </span>
            <p className="mt-2 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
              Find cultural experiences that feel right for your interests—and
              work for your plans. Starting with art, textiles, and history in
              Ahmedabad.
            </p>
            <p className="mt-4 text-xs text-stone-500 dark:text-stone-500">
              Visit details are sourced from official venue publications and
              verified organizer information.
            </p>
          </div>

          <div className="flex flex-wrap gap-8 text-sm">
            <div className="flex flex-col gap-2.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-900 dark:text-stone-200">
                Navigation
              </span>
              <Link
                href="/explore"
                className="text-stone-600 transition-colors hover:text-stone-950 dark:text-stone-400 dark:hover:text-stone-100"
              >
                Explore Ahmedabad
              </Link>
              <Link
                href="/how-it-works"
                className="text-stone-600 transition-colors hover:text-stone-950 dark:text-stone-400 dark:hover:text-stone-100"
              >
                How it works
              </Link>
              <Link
                href="/about"
                className="text-stone-600 transition-colors hover:text-stone-950 dark:text-stone-400 dark:hover:text-stone-100"
              >
                About AccessAtlas
              </Link>
            </div>

            <div className="flex flex-col gap-2.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-900 dark:text-stone-200">
                Participation
              </span>
              <span className="text-xs leading-relaxed text-stone-500 dark:text-stone-400 max-w-xs">
                No sensitive personal details are inferred. Meeting stated
                requirements reflects published facts, not a universal accessibility
                audit.
              </span>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-stone-200/80 pt-6 text-xs text-stone-500 dark:border-stone-800 dark:text-stone-500">
          <p>© 2026 AccessAtlas. Designed for visitor-first cultural discovery.</p>
        </div>
      </Container>
    </footer>
  );
};

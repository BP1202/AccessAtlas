import React from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";

export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 border-b border-stone-200/80 bg-[#faf8f5]/90 backdrop-blur-md dark:border-stone-800 dark:bg-[#141312]/90">
      <Container size="lg">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2.5 text-lg font-semibold tracking-tight text-stone-900 transition-opacity hover:opacity-80 dark:text-stone-100"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-stone-900 text-xs font-semibold tracking-wider text-stone-50 dark:bg-stone-100 dark:text-stone-900">
                AA
              </span>
              <span className="font-serif text-xl tracking-tight">AccessAtlas</span>
            </Link>
          </div>

          <nav
            aria-label="Main Navigation"
            className="flex items-center gap-6 text-sm font-medium text-stone-600 dark:text-stone-300"
          >
            <Link
              href="/explore"
              className="transition-colors hover:text-stone-950 dark:hover:text-stone-100"
            >
              Explore
            </Link>
            <Link
              href="/how-it-works"
              className="transition-colors hover:text-stone-950 dark:hover:text-stone-100"
            >
              How it works
            </Link>
            <Link
              href="/about"
              className="transition-colors hover:text-stone-950 dark:hover:text-stone-100"
            >
              About
            </Link>
          </nav>
        </div>
      </Container>
    </header>
  );
};

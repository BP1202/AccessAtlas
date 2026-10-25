import React from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";

export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 border-b border-[#e7e0d3] bg-[#f6f3eb]/95 backdrop-blur-md dark:border-[#323731] dark:bg-[#191c19]/95">
      <Container size="lg">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2.5 text-lg font-semibold tracking-tight text-[#252923] transition-opacity hover:opacity-85 dark:text-[#f4f1ea]"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#193a32] text-xs font-semibold tracking-wider text-[#f6f3eb] dark:bg-[#2a584d]">
                AA
              </span>
              <span className="font-serif text-xl tracking-tight">AccessAtlas</span>
            </Link>
          </div>

          <nav
            aria-label="Main Navigation"
            className="flex items-center gap-6 text-sm font-medium text-[#53594e] dark:text-[#a3aba0]"
          >
            <Link
              href="/explore"
              className="transition-colors hover:text-[#193a32] dark:hover:text-[#f4f1ea]"
            >
              Explore
            </Link>
            <Link
              href="/how-it-works"
              className="transition-colors hover:text-[#193a32] dark:hover:text-[#f4f1ea]"
            >
              How it works
            </Link>
            <Link
              href="/about"
              className="transition-colors hover:text-[#193a32] dark:hover:text-[#f4f1ea]"
            >
              About
            </Link>
          </nav>
        </div>
      </Container>
    </header>
  );
};

import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Container } from "@/components/ui/Container";

export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/95">
      <Container size="lg">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-slate-900 dark:text-white"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-700 text-sm font-black text-white shadow-sm">
                AA
              </span>
              <span>AccessAtlas</span>
            </Link>
            <Badge variant="info" className="hidden sm:inline-flex">
              Ahmedabad Pilot
            </Badge>
          </div>

          <nav
            aria-label="Main Navigation"
            className="flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300"
          >
            <Link
              href="/"
              className="hover:text-teal-700 dark:hover:text-teal-400 transition-colors"
            >
              Home
            </Link>
            <a
              href="https://github.com/BP1202/AccessAtlas/blob/dev/docs/PRODUCT.md"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-teal-700 dark:hover:text-teal-400 transition-colors"
            >
              Product
            </a>
            <a
              href="https://github.com/BP1202/AccessAtlas/blob/dev/docs/API.md"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-teal-700 dark:hover:text-teal-400 transition-colors"
            >
              API Spec
            </a>
          </nav>
        </div>
      </Container>
    </header>
  );
};

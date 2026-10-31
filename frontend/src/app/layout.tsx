import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "AccessAtlas — Cultural Discovery & Participation Planning",
  description:
    "Find cultural experiences that match your expressed interests, practical needs, energy preferences, and companions in Ahmedabad.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-[#f6f3eb] text-[#252923] dark:bg-[#191c19] dark:text-[#f4f1ea]">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-[#193a32] focus:px-4 focus:py-2 focus:text-[#f6f3eb] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#193a32]"
        >
          Skip to main content
        </a>
        <Header />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}

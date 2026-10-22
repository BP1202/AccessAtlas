import React, { useState } from "react";
import { Button } from "@/components/ui/Button";

export interface QuestionKitProps {
  venueName: string;
  questions: string[];
  className?: string;
}

export const QuestionKit: React.FC<QuestionKitProps> = ({
  venueName,
  questions,
  className = "",
}) => {
  const [copied, setCopied] = useState(false);

  if (!questions || questions.length === 0) {
    return (
      <div
        className={`rounded-xl border border-stone-200 bg-stone-50/70 p-4 text-xs text-stone-600 dark:border-stone-800 dark:bg-stone-900/40 dark:text-stone-300 ${className}`}
      >
        <span className="font-semibold text-stone-900 dark:text-stone-100">
          No additional confirmation questions needed:
        </span>{" "}
        Available published documentation covers the evaluated details for this space.
      </div>
    );
  }

  const handleCopy = async () => {
    const formattedText = `Questions for ${venueName} before visiting:\n\n${questions
      .map((q, idx) => `${idx + 1}. ${q}`)
      .join("\n")}\n\n(Generated via AccessAtlas)`;

    try {
      await navigator.clipboard.writeText(formattedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard write failed (e.g. security permission in non-HTTPS/iframe)
    }
  };

  return (
    <div
      className={`rounded-xl border border-amber-200 bg-amber-50/50 p-5 dark:border-amber-900/50 dark:bg-amber-950/20 ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-amber-200/70 dark:border-amber-900/40">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-400">
            Ask the venue
          </span>
          <h4 className="font-medium text-sm text-stone-900 dark:text-stone-100">
            Confirmation Question Kit
          </h4>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="border-amber-300 text-amber-900 hover:bg-amber-100/60 dark:border-amber-800 dark:text-amber-200 dark:hover:bg-amber-900/40 self-start sm:self-auto"
          aria-live="polite"
        >
          {copied ? "✓ Copied to clipboard" : "Copy questions to ask"}
        </Button>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-stone-600 dark:text-stone-300">
        Because some details are not recorded in published records, you can email or call {venueName} with these specific questions:
      </p>

      <ul className="mt-3 space-y-2 text-xs text-stone-800 dark:text-stone-200" role="list">
        {questions.map((q, idx) => (
          <li key={idx} className="flex items-start gap-2">
            <span className="font-mono text-amber-700 dark:text-amber-400 select-none">
              {idx + 1}.
            </span>
            <span className="leading-relaxed">{q}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

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
        className={`rounded-2xl border border-[#dfd8c8] bg-[#f6f3eb] p-5 text-xs text-[#62685d] dark:border-[#323731] dark:bg-[#191c19] dark:text-[#9da398] ${className}`}
      >
        <span className="font-semibold text-[#252923] dark:text-[#f4f1ea]">
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
      className={`rounded-2xl border border-[#eed49c] bg-[#fcf5e8]/70 p-6 dark:border-[#544122] dark:bg-[#382b17]/40 ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[#eed49c]/80 dark:border-[#544122]">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#8c5914] dark:text-[#f0d496]">
            Ask the venue
          </span>
          <h4 className="font-serif text-lg font-semibold text-[#252923] dark:text-[#f4f1ea]">
            Confirmation Question Kit
          </h4>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="border-[#8c5914] text-[#8c5914] hover:bg-[#8c5914]/10 dark:border-[#f0d496] dark:text-[#f0d496] self-start sm:self-auto cursor-pointer"
          aria-live="polite"
        >
          {copied ? "✓ Copied to clipboard" : "Copy questions to ask"}
        </Button>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-[#62685d] dark:text-[#9da398]">
        Because some details are not recorded in published records, you can email or call {venueName} with these specific questions:
      </p>

      <ul className="mt-3 space-y-2 text-xs sm:text-sm text-[#252923] dark:text-[#e4ded0]" role="list">
        {questions.map((q, idx) => (
          <li key={idx} className="flex items-start gap-2.5">
            <span className="font-mono text-[#8c5914] dark:text-[#f0d496] font-semibold select-none">
              {idx + 1}.
            </span>
            <span className="leading-relaxed">{q}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

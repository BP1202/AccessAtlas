import React from "react";

export type InfoPanelVariant =
  | "verified"
  | "confirmation"
  | "conflict"
  | "discovery"
  | "provenance"
  | "neutral";

export interface InfoPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: InfoPanelVariant;
  title?: string;
  icon?: React.ReactNode;
}

export const InfoPanel: React.FC<InfoPanelProps> = ({
  children,
  variant = "neutral",
  title,
  icon,
  className = "",
  ...props
}) => {
  const variantStyles: Record<
    InfoPanelVariant,
    { container: string; icon: string; title: string; defaultIcon: string }
  > = {
    verified: {
      container:
        "border-[#bcd6cb] bg-[#e7f0e9] text-[#134e3f] dark:border-[#2a4c3f] dark:bg-[#1c2e27] dark:text-[#b8ded0]",
      icon: "text-[#134e3f] dark:text-[#b8ded0]",
      title: "text-[#134e3f] dark:text-[#b8ded0]",
      defaultIcon: "✓",
    },
    confirmation: {
      container:
        "border-[#eed49c] bg-[#fcf5e8] text-[#784408] dark:border-[#544122] dark:bg-[#382b17] dark:text-[#f0d496]",
      icon: "text-[#784408] dark:text-[#f0d496]",
      title: "text-[#784408] dark:text-[#f0d496]",
      defaultIcon: "?",
    },
    conflict: {
      container:
        "border-[#f3c2b2] bg-[#fdf0ec] text-[#8b2612] dark:border-[#582a20] dark:bg-[#3a1d17] dark:text-[#f6b4a1]",
      icon: "text-[#8b2612] dark:text-[#f6b4a1]",
      title: "text-[#8b2612] dark:text-[#f6b4a1]",
      defaultIcon: "✕",
    },
    discovery: {
      container:
        "border-[#e7e0d3] bg-[#faf8f5] text-[#252923] border-l-4 border-l-[#c56f4d] dark:border-[#323731] dark:bg-[#191c19] dark:border-l-[#d88261] dark:text-[#f4f1ea]",
      icon: "text-[#a85333] dark:text-[#e59779]",
      title: "text-[#252923] dark:text-[#f4f1ea]",
      defaultIcon: "🧵",
    },
    provenance: {
      container:
        "border-[#e7e0d3] bg-[#fdfbf7] text-[#53594e] dark:border-[#323731] dark:bg-[#212520] dark:text-[#a3aba0]",
      icon: "text-[#193a32] dark:text-[#a8d5c4]",
      title: "text-[#252923] dark:text-[#f4f1ea]",
      defaultIcon: "📍",
    },
    neutral: {
      container:
        "border-[#e7e0d3] bg-[#f6f3eb] text-[#252923] dark:border-[#323731] dark:bg-[#262a25] dark:text-[#f4f1ea]",
      icon: "text-[#53594e] dark:text-[#a3aba0]",
      title: "text-[#252923] dark:text-[#f4f1ea]",
      defaultIcon: "•",
    },
  };

  const style = variantStyles[variant];

  return (
    <div
      role="region"
      aria-label={title || `${variant} information panel`}
      className={`rounded-2xl border p-4 sm:p-5 text-sm shadow-2xs ${style.container} ${className}`}
      {...props}
    >
      <div className="flex items-start gap-3">
        <span
          className={`shrink-0 font-bold select-none text-base leading-tight ${style.icon}`}
          aria-hidden="true"
        >
          {icon !== undefined ? icon : style.defaultIcon}
        </span>
        <div className="flex-1 space-y-1">
          {title && (
            <h4 className={`font-serif text-base font-semibold ${style.title}`}>
              {title}
            </h4>
          )}
          <div className="leading-relaxed text-inherit">{children}</div>
        </div>
      </div>
    </div>
  );
};

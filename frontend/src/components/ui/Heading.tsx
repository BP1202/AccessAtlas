import React from "react";

export interface HeadingProps extends React.HTMLAttributes<HTMLDivElement> {
  level?: 1 | 2 | 3 | 4;
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  showRouteMotif?: boolean;
}

export const Heading: React.FC<HeadingProps> = ({
  level = 2,
  eyebrow,
  title,
  description,
  align = "left",
  showRouteMotif = false,
  className = "",
  ...props
}) => {
  const HeadingTag = `h${level}` as "h1" | "h2" | "h3" | "h4";

  const sizeClasses = {
    1: "text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight leading-[1.12]",
    2: "text-2xl sm:text-3xl lg:text-4xl tracking-tight leading-snug",
    3: "text-xl sm:text-2xl font-semibold tracking-tight",
    4: "text-lg sm:text-xl font-semibold tracking-normal",
  };

  const alignClasses = align === "center" ? "text-center mx-auto" : "text-left";

  return (
    <div className={`space-y-3 ${alignClasses} ${className}`} {...props}>
      {eyebrow && (
        <span className="block text-xs font-semibold uppercase tracking-widest text-[#a85333] dark:text-[#e59779]">
          {eyebrow}
        </span>
      )}

      <HeadingTag
        className={`font-serif font-semibold text-[#252923] dark:text-[#f4f1ea] ${sizeClasses[level]}`}
      >
        {title}
      </HeadingTag>

      {description && (
        <p
          className={`text-base sm:text-lg leading-relaxed text-[#53594e] dark:text-[#a3aba0] ${
            align === "center" ? "max-w-2xl mx-auto" : "max-w-3xl"
          }`}
        >
          {description}
        </p>
      )}

      {showRouteMotif && (
        <div className="pt-2" aria-hidden="true">
          <div className="atlas-route-divider w-24" />
        </div>
      )}
    </div>
  );
};

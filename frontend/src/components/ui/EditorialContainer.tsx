import React from "react";

export interface EditorialContainerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
  eyebrow?: string;
  motif?: "none" | "route" | "forest-border" | "terracotta-border";
  density?: "comfortable" | "compact" | "generous";
}

export const EditorialContainer: React.FC<EditorialContainerProps> = ({
  children,
  as: Component = "section",
  eyebrow,
  motif = "none",
  density = "comfortable",
  className = "",
  ...props
}) => {
  const densityStyles = {
    compact: "p-4 sm:p-5",
    comfortable: "p-6 sm:p-8",
    generous: "p-8 sm:p-12",
  };

  const motifStyles = {
    none: "",
    route: "atlas-editorial-border",
    "forest-border": "border-l-4 border-l-[#193a32] dark:border-l-[#2a584d]",
    "terracotta-border": "border-l-4 border-l-[#c56f4d] dark:border-l-[#d88261]",
  };

  return (
    <Component
      className={`relative rounded-3xl border border-[#e7e0d3] bg-[#fdfbf7] shadow-xs dark:border-[#323731] dark:bg-[#212520] ${densityStyles[density]} ${motifStyles[motif]} ${className}`}
      {...props}
    >
      {eyebrow && (
        <div className="mb-4 pb-3 border-b border-[#e7e0d3] dark:border-[#323731]">
          <span className="font-mono text-xs uppercase tracking-wider text-[#a85333] dark:text-[#e59779]">
            {eyebrow}
          </span>
        </div>
      )}
      {children}
    </Component>
  );
};

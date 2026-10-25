import React from "react";

export type CardVariant = "default" | "paper" | "editorial" | "accent" | "quiet";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
  variant?: CardVariant;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  as: Component = "div",
  variant = "default",
  ...props
}) => {
  const variantStyles: Record<CardVariant, string> = {
    default:
      "bg-white border-[#e7e0d3] dark:border-[#323731] dark:bg-[#212520]",
    paper:
      "bg-[#f6f3eb] border-[#e7e0d3] dark:border-[#323731] dark:bg-[#191c19]",
    editorial:
      "bg-white border-[#e7e0d3] border-l-4 border-l-[#193a32] dark:border-[#323731] dark:border-l-[#2a584d] dark:bg-[#212520]",
    accent:
      "bg-white border-[#e7e0d3] border-l-4 border-l-[#c56f4d] dark:border-[#323731] dark:border-l-[#d88261] dark:bg-[#212520]",
    quiet:
      "bg-[#ede8dc] border-[#d5cbba] dark:border-[#323731] dark:bg-[#262a25]",
  };

  return (
    <Component
      className={`rounded-2xl border p-6 sm:p-7 shadow-xs transition-colors duration-150 ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = "",
  ...props
}) => {
  return (
    <div className={`mb-4 flex flex-col gap-2 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  className = "",
  ...props
}) => {
  return (
    <h3
      className={`font-serif text-xl font-semibold tracking-tight text-[#252923] dark:text-[#f4f1ea] ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
};

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  children,
  className = "",
  ...props
}) => {
  return (
    <p
      className={`text-sm text-[#62685d] dark:text-[#9da398] ${className}`}
      {...props}
    >
      {children}
    </p>
  );
};

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = "",
  ...props
}) => {
  return (
    <div className={`text-sm text-[#252923] leading-relaxed dark:text-[#e4ded0] ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = "",
  ...props
}) => {
  return (
    <div
      className={`mt-6 flex items-center justify-between border-t border-[#ede8dc] pt-4 dark:border-[#323731] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

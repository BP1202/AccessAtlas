import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  as: Component = "div",
  ...props
}) => {
  return (
    <Component
      className={`rounded-2xl border border-[#e6e0d4] bg-white p-6 sm:p-7 shadow-xs transition-all duration-200 dark:border-[#323731] dark:bg-[#212520] ${className}`}
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

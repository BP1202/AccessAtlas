import React from "react";

export interface LoadingSpinnerProps {
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  label = "Loading cultural experiences...",
  size = "md",
  className = "",
}) => {
  const sizeClasses = {
    sm: "h-5 w-5 border-2",
    md: "h-8 w-8 border-3",
    lg: "h-12 w-12 border-4",
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center gap-3 p-6 text-center ${className}`}
    >
      <div
        className={`animate-spin rounded-full border-teal-700 border-t-transparent dark:border-teal-400 dark:border-t-transparent ${sizeClasses[size]}`}
        aria-hidden="true"
      />
      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
        {label}
      </span>
    </div>
  );
};

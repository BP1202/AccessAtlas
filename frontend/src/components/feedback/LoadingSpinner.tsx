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
        className={`animate-spin rounded-full border-[#193a32] border-t-transparent dark:border-[#a8d5c4] dark:border-t-transparent ${sizeClasses[size]}`}
        aria-hidden="true"
      />
      <span className="text-sm font-medium text-[#53594e] dark:text-[#a3aba0]">
        {label}
      </span>
    </div>
  );
};

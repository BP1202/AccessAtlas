import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "accent" | "surface";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled,
  className = "",
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-xl transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none";

  const variantStyles = {
    primary:
      "bg-[#193a32] text-[#f6f3eb] hover:bg-[#122b25] active:bg-[#0c1d19] focus:ring-[#193a32] shadow-xs hover:shadow-sm dark:bg-[#2a584d] dark:hover:bg-[#366f62] dark:text-[#f4f1ea]",
    secondary:
      "bg-[#a85333] text-white hover:bg-[#934527] active:bg-[#7d3b21] focus:ring-[#a85333] shadow-xs hover:shadow-sm dark:bg-[#d88261] dark:hover:bg-[#e59779]",
    accent:
      "bg-[#c56f4d] text-white hover:bg-[#a85333] focus:ring-[#c56f4d] shadow-xs hover:shadow-sm dark:bg-[#d88261] dark:hover:bg-[#e59779]",
    surface:
      "border border-[#e7e0d3] bg-[#f6f3eb] text-[#252923] hover:bg-[#ede8dc] hover:border-[#193a32] focus:ring-[#193a32] shadow-2xs dark:border-[#323731] dark:bg-[#212520] dark:text-[#f4f1ea]",
    outline:
      "border border-[#193a32] bg-transparent text-[#193a32] hover:bg-[#193a32]/8 focus:ring-[#193a32] dark:border-[#a8d5c4] dark:text-[#a8d5c4] dark:hover:bg-[#a8d5c4]/10",
    ghost:
      "bg-transparent text-[#252923] hover:bg-black/5 focus:ring-[#193a32] dark:text-[#f4f1ea] dark:hover:bg-white/10",
  };

  const sizeStyles = {
    sm: "min-h-[36px] px-3.5 py-1.5 text-xs font-medium",
    md: "min-h-[44px] px-5 py-2.5 text-sm font-medium",
    lg: "min-h-[48px] px-7 py-3.5 text-base font-semibold",
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="inline-flex items-center gap-2">
          <svg
            className="animate-spin h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
          <span>Loading...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
};

import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
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
    "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";

  const variantStyles = {
    primary:
      "bg-[#193a32] text-[#f6f3eb] hover:bg-[#122b25] focus:ring-[#193a32] shadow-sm hover:shadow dark:bg-[#2a584d] dark:hover:bg-[#366f62]",
    secondary:
      "bg-[#c56f4d] text-white hover:bg-[#b05c3c] focus:ring-[#c56f4d] shadow-sm hover:shadow dark:bg-[#d88261] dark:hover:bg-[#e59779]",
    outline:
      "border border-[#193a32] bg-transparent text-[#193a32] hover:bg-[#193a32]/8 focus:ring-[#193a32] dark:border-[#d88261] dark:text-[#d88261] dark:hover:bg-[#d88261]/10",
    ghost:
      "bg-transparent text-[#252923] hover:bg-black/5 focus:ring-[#193a32] dark:text-[#f4f1ea] dark:hover:bg-white/10",
  };

  const sizeStyles = {
    sm: "px-3.5 py-1.5 text-xs font-medium",
    md: "px-5 py-2.5 text-sm font-medium",
    lg: "px-7 py-3.5 text-base font-semibold",
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

import React, { useId } from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  leftIcon?: React.ReactNode;
  rightSlot?: React.ReactNode;
  containerClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      errorMessage,
      leftIcon,
      rightSlot,
      id: customId,
      disabled,
      required,
      className = "",
      containerClassName = "",
      "aria-describedby": ariaDescribedBy,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = customId || `input-${generatedId}`;
    const helperId = `${inputId}-helper`;
    const errorId = `${inputId}-error`;

    const describedByIds = [
      errorMessage ? errorId : null,
      helperText ? helperId : null,
      ariaDescribedBy || null,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={`space-y-1.5 ${containerClassName}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold uppercase tracking-wider text-[#53594e] dark:text-[#a3aba0]"
          >
            {label}
            {required && (
              <span className="ml-1 text-[#a85333]" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <span
              className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#53594e] dark:text-[#a3aba0]"
              aria-hidden="true"
            >
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            required={required}
            aria-invalid={Boolean(errorMessage)}
            aria-describedby={describedByIds || undefined}
            className={`w-full min-h-[44px] rounded-2xl border bg-white py-2.5 text-base text-[#252923] placeholder-[#a3aba0] shadow-2xs transition-colors duration-150 focus:border-[#193a32] focus:outline-none focus:ring-2 focus:ring-[#193a32]/25 disabled:cursor-not-allowed disabled:bg-[#ede8dc] disabled:opacity-60 dark:bg-[#212520] dark:text-[#f4f1ea] dark:placeholder-[#53594e] dark:focus:border-[#a8d5c4] dark:focus:ring-[#a8d5c4]/25 ${
              leftIcon ? "pl-11" : "pl-4"
            } ${rightSlot ? "pr-12" : "pr-4"} ${
              errorMessage
                ? "border-[#a85333] focus:border-[#a85333] focus:ring-[#a85333]/25 dark:border-[#e59779]"
                : "border-[#e7e0d3] hover:border-[#d5cbba] dark:border-[#323731] dark:hover:border-[#3d433c]"
            } ${className}`}
            {...props}
          />

          {rightSlot && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-2">
              {rightSlot}
            </div>
          )}
        </div>

        {errorMessage ? (
          <p
            id={errorId}
            role="alert"
            className="text-xs font-medium text-[#8b2612] dark:text-[#f6b4a1]"
          >
            {errorMessage}
          </p>
        ) : helperText ? (
          <p
            id={helperId}
            className="text-xs text-[#53594e] dark:text-[#a3aba0]"
          >
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";

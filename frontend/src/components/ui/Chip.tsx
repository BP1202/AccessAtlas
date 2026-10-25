import React from "react";

export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  selected?: boolean;
  onToggle?: () => void;
  onRemove?: () => void;
  count?: number;
  icon?: React.ReactNode;
  size?: "sm" | "md";
}

export const Chip: React.FC<ChipProps> = ({
  label,
  selected = false,
  onToggle,
  onRemove,
  count,
  icon,
  size = "md",
  disabled = false,
  className = "",
  ...props
}) => {

  const sizeClasses = {
    sm: "min-h-[32px] px-3 py-1 text-xs gap-1.5",
    md: "min-h-[40px] px-4 py-2 text-sm gap-2",
  };

  const selectedClasses = selected
    ? "bg-[#193a32] text-[#f6f3eb] border-[#193a32] shadow-xs dark:bg-[#2a584d] dark:border-[#2a584d] dark:text-[#f4f1ea]"
    : "bg-white text-[#252923] border-[#e7e0d3] hover:border-[#193a32] hover:bg-[#faf8f5] shadow-2xs dark:bg-[#212520] dark:border-[#323731] dark:text-[#f4f1ea] dark:hover:border-[#a8d5c4]";

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (onToggle) {
      onToggle();
    } else if (props.onClick) {
      props.onClick(e);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (onToggle) onToggle();
    }
  };

  if (onRemove && !onToggle) {
    return (
      <span
        className={`inline-flex items-center justify-between rounded-full border font-medium ${sizeClasses[size]} ${selectedClasses} ${className}`}
      >
        <span className="inline-flex items-center gap-1.5">
          {icon && <span aria-hidden="true">{icon}</span>}
          <span>{label}</span>
        </span>
        {count !== undefined && (
          <span className="ml-1 rounded-full px-1.5 py-0.2 text-[11px] font-mono bg-white/20 text-white">
            {count}
          </span>
        )}
        <button
          type="button"
          aria-label={`Remove ${label}`}
          onClick={onRemove}
          className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full text-[#bcd6cb] hover:text-white cursor-pointer"
        >
          <span aria-hidden="true" className="text-sm font-bold">
            ×
          </span>
        </button>
      </span>
    );
  }

  return (
    <button
      type="button"
      role="button"
      aria-pressed={onToggle ? selected : undefined}
      disabled={disabled}
      {...props}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`inline-flex items-center justify-between rounded-full border font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#193a32] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${sizeClasses[size]} ${selectedClasses} ${className}`}
    >
      <span className="inline-flex items-center gap-1.5">
        {icon && <span aria-hidden="true">{icon}</span>}
        <span>{label}</span>
      </span>

      {count !== undefined && (
        <span
          className={`ml-1 rounded-full px-1.5 py-0.2 text-[11px] font-mono ${
            selected
              ? "bg-white/20 text-white"
              : "bg-[#ede8dc] text-[#53594e] dark:bg-[#323731] dark:text-[#a3aba0]"
          }`}
        >
          {count}
        </span>
      )}

      {onToggle && (
        <span
          aria-hidden="true"
          className={`ml-1 text-xs font-bold ${
            selected ? "text-[#bcd6cb]" : "text-[#53594e] dark:text-[#a3aba0]"
          }`}
        >
          {selected ? "✓" : "+"}
        </span>
      )}
    </button>
  );
};

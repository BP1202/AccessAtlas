import React from "react";

export interface DiscoveryLoadingProps {
  city?: string;
  className?: string;
}

export const DiscoveryLoading: React.FC<DiscoveryLoadingProps> = ({
  city = "Ahmedabad",
  className = "",
}) => {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center rounded-3xl border border-[#e6e0d4] bg-white p-12 sm:p-16 text-center shadow-xs dark:border-[#323731] dark:bg-[#212520] ${className}`}
    >
      {/* Calm pulsing spinner */}
      <div className="relative mb-6 flex h-16 w-16 items-center justify-center">
        <div className="absolute h-16 w-16 animate-ping rounded-full bg-[#eaf2ee] opacity-75 dark:bg-[#1d352b]" />
        <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-[#f6f3eb] border border-[#bcd6cb] dark:bg-[#212520] dark:border-[#2f5545]">
          <svg
            className="h-6 w-6 animate-spin text-[#193a32] dark:text-[#a8d5c4]"
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
        </div>
      </div>

      <h3 className="font-serif text-2xl font-semibold text-[#252923] sm:text-3xl dark:text-[#f4f1ea]">
        Finding cultural experiences and reviewing available visit information…
      </h3>

      <p className="mt-4 max-w-xl text-base leading-relaxed text-[#62685d] dark:text-[#9da398]">
        AccessAtlas is discovering cultural spaces in {city} matching your curiosity, then checking independently verified venue records against your visit preferences.
      </p>

      <div className="mt-8 flex items-center gap-2.5 text-xs font-semibold uppercase tracking-wider text-[#193a32] dark:text-[#a8d5c4]">
        <span className="inline-block h-2 w-2 rounded-full bg-[#c56f4d]" />
        <span>Grounded in published venue documentation</span>
      </div>
    </div>
  );
};

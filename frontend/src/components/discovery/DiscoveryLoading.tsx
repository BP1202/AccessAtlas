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
      className={`flex flex-col items-center justify-center rounded-2xl border border-stone-200 bg-white/80 p-12 text-center shadow-sm dark:border-stone-800 dark:bg-stone-900/60 ${className}`}
    >
      {/* Calm pulsing spinner */}
      <div className="relative mb-6 flex h-16 w-16 items-center justify-center">
        <div className="absolute h-16 w-16 animate-ping rounded-full bg-teal-100 opacity-60 dark:bg-teal-950" />
        <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-teal-50 border border-teal-200 dark:bg-teal-900/40 dark:border-teal-700">
          <svg
            className="h-6 w-6 animate-spin text-teal-700 dark:text-teal-400"
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

      <h3 className="font-serif text-xl font-semibold text-stone-900 sm:text-2xl dark:text-stone-100">
        Finding cultural experiences and reviewing available visit information…
      </h3>

      <p className="mt-3 max-w-lg text-sm leading-relaxed text-stone-600 dark:text-stone-300">
        AccessAtlas is discovering cultural spaces in {city} matching your curiosity, then checking independently verified venue records against your visit preferences.
      </p>

      <div className="mt-6 flex items-center gap-2 text-xs font-medium text-stone-400 dark:text-stone-500">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-teal-600" />
        <span>Grounded in published venue documentation</span>
      </div>
    </div>
  );
};

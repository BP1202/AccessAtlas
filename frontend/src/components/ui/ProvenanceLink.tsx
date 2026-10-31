import React from "react";

export interface ProvenanceLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  sourceName?: string;
  lastVerified?: string;
  isExternal?: boolean;
}

export const ProvenanceLink: React.FC<ProvenanceLinkProps> = ({
  href,
  sourceName,
  lastVerified,
  isExternal = true,
  children,
  className = "",
  ...props
}) => {
  return (
    <a
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className={`inline-flex items-center gap-1.5 text-xs font-medium text-[#193a32] underline underline-offset-3 decoration-[#bcd6cb] hover:text-[#a85333] hover:decoration-[#a85333] transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#193a32] dark:text-[#a8d5c4] dark:decoration-[#2f5545] dark:hover:text-[#e59779] ${className}`}
      {...props}
    >
      <span className="shrink-0" aria-hidden="true">
        ↗
      </span>
      <span>{children || sourceName || "View verified source documentation"}</span>
      {lastVerified && (
        <span className="text-[#53594e] dark:text-[#a3aba0]">
          (verified {lastVerified})
        </span>
      )}
      {isExternal && (
        <span className="sr-only"> (opens in a new tab)</span>
      )}
    </a>
  );
};

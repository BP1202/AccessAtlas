import React from "react";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "info" | "warning" | "danger" | "success";
  title?: string;
  icon?: React.ReactNode;
}

export const Alert: React.FC<AlertProps> = ({
  children,
  variant = "info",
  title,
  icon,
  className = "",
  ...props
}) => {
  const variantStyles = {
    info: "border-[#bcd6cb] bg-[#e7f0e9] text-[#134e3f] dark:border-[#2a4c3f] dark:bg-[#1c2e27] dark:text-[#b8ded0]",
    warning:
      "border-[#eed49c] bg-[#fcf5e8] text-[#784408] dark:border-[#544122] dark:bg-[#382b17] dark:text-[#f0d496]",
    danger:
      "border-[#f3c2b2] bg-[#fdf0ec] text-[#8b2612] dark:border-[#582a20] dark:bg-[#3a1d17] dark:text-[#f6b4a1]",
    success:
      "border-[#bcd6cb] bg-[#e7f0e9] text-[#134e3f] dark:border-[#2a4c3f] dark:bg-[#1c2e27] dark:text-[#b8ded0]",
  };

  const defaultIcons = {
    info: (
      <span className="font-bold select-none text-base leading-none" aria-hidden="true">
        ℹ
      </span>
    ),
    warning: (
      <span className="font-bold select-none text-base leading-none" aria-hidden="true">
        ?
      </span>
    ),
    danger: (
      <span className="font-bold select-none text-base leading-none" aria-hidden="true">
        ✕
      </span>
    ),
    success: (
      <span className="font-bold select-none text-base leading-none" aria-hidden="true">
        ✓
      </span>
    ),
  };

  const role = variant === "danger" ? "alert" : "status";

  return (
    <div
      role={role}
      className={`rounded-2xl border p-4.5 text-sm shadow-xs ${variantStyles[variant]} ${className}`}
      {...props}
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0 mt-0.5">{icon !== undefined ? icon : defaultIcons[variant]}</div>
        <div className="flex-1">
          {title && <h4 className="mb-1 font-serif text-base font-semibold">{title}</h4>}
          <div className="leading-relaxed">{children}</div>
        </div>
      </div>
    </div>
  );
};

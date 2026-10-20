import React from "react";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "info" | "warning" | "danger" | "success";
  title?: string;
}

export const Alert: React.FC<AlertProps> = ({
  children,
  variant = "info",
  title,
  className = "",
  ...props
}) => {
  const variantStyles = {
    info: "border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-200",
    warning:
      "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-200",
    danger:
      "border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-200",
    success:
      "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200",
  };

  const role = variant === "danger" ? "alert" : "status";

  return (
    <div
      role={role}
      className={`rounded-lg border p-4 text-sm ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {title && <h4 className="mb-1 font-semibold">{title}</h4>}
      <div className="leading-relaxed">{children}</div>
    </div>
  );
};

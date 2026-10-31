import React from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";

export interface ErrorDisplayProps {
  title?: string;
  message: string;
  statusCode?: number;
  onRetry?: () => void;
  className?: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  title = "Service Error",
  message,
  statusCode,
  onRetry,
  className = "",
}) => {
  const displayTitle = statusCode ? `${title} (${statusCode})` : title;

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <Alert variant="danger" title={displayTitle}>
        <p>{message}</p>
      </Alert>
      {onRetry && (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={onRetry}>
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
};

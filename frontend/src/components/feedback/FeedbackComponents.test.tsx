import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoadingSpinner } from "./LoadingSpinner";
import { EmptyState } from "./EmptyState";
import { ErrorDisplay } from "./ErrorDisplay";

describe("Feedback Components", () => {
  describe("LoadingSpinner", () => {
    it("renders with default label and accessible role", () => {
      render(<LoadingSpinner />);
      expect(screen.getByRole("status")).toBeInTheDocument();
      expect(
        screen.getByText("Loading cultural experiences...")
      ).toBeInTheDocument();
    });

    it("renders custom label", () => {
      render(<LoadingSpinner label="Evaluating venue evidence..." />);
      expect(
        screen.getByText("Evaluating venue evidence...")
      ).toBeInTheDocument();
    });
  });

  describe("EmptyState", () => {
    it("renders default title and description", () => {
      render(<EmptyState />);
      expect(
        screen.getByRole("region", { name: "Empty state" })
      ).toBeInTheDocument();
      expect(
        screen.getByText("No Cultural Candidates Found")
      ).toBeInTheDocument();
    });

    it("triggers action callback on button click", async () => {
      const handleAction = vi.fn();
      render(
        <EmptyState
          title="Custom Empty"
          actionLabel="Clear Filters"
          onAction={handleAction}
        />
      );

      const button = screen.getByRole("button", { name: "Clear Filters" });
      await userEvent.click(button);
      expect(handleAction).toHaveBeenCalledTimes(1);
    });
  });

  describe("ErrorDisplay", () => {
    it("renders error message and status code", () => {
      render(
        <ErrorDisplay
          title="Upstream Error"
          statusCode={502}
          message="Provider connection timed out."
        />
      );
      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByText("Upstream Error (502)")).toBeInTheDocument();
      expect(
        screen.getByText("Provider connection timed out.")
      ).toBeInTheDocument();
    });

    it("triggers retry callback when retry button clicked", async () => {
      const handleRetry = vi.fn();
      render(
        <ErrorDisplay
          message="Temporary failure"
          onRetry={handleRetry}
        />
      );

      const retryBtn = screen.getByRole("button", { name: "Try Again" });
      await userEvent.click(retryBtn);
      expect(handleRetry).toHaveBeenCalledTimes(1);
    });
  });
});

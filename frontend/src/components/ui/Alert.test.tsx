import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Alert } from "./Alert";
import { ProvenanceLink } from "./ProvenanceLink";

describe("Alert and ProvenanceLink primitives", () => {
  describe("Alert", () => {
    it("renders with alert role for danger and status role for info", () => {
      const { rerender } = render(
        <Alert variant="danger" title="Conflict Identified">
          Step-free access is not supported.
        </Alert>
      );
      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByText("Conflict Identified")).toBeInTheDocument();

      rerender(
        <Alert variant="info" title="Information">
          Pilot covers Ahmedabad venues.
        </Alert>
      );
      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("renders non-color icon indicator for all variants", () => {
      render(
        <Alert variant="warning" title="Needs Confirmation">
          Opening hours unverified.
        </Alert>
      );
      expect(screen.getByText("?")).toBeInTheDocument();
    });
  });

  describe("ProvenanceLink", () => {
    it("renders link with external target, rel noopener, and screen reader text", () => {
      render(
        <ProvenanceLink
          href="https://calicomuseum.org"
          sourceName="Calico Museum Official Archive"
          lastVerified="October 2026"
        />
      );
      const link = screen.getByRole("link", {
        name: /Calico Museum Official Archive/i,
      });
      expect(link).toHaveAttribute("href", "https://calicomuseum.org");
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
      expect(screen.getByText("(verified October 2026)")).toBeInTheDocument();
      expect(screen.getByText("(opens in a new tab)")).toBeInTheDocument();
    });
  });
});

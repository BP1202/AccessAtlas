/**
 * Cultural Compass — Deterministic Cultural Direction Rules
 *
 * Derives a provisional, editorial cultural direction title and description
 * based on the visitor's explicit compass selections.
 *
 * Core Guarantees:
 * 1. Pure & Deterministic: Identical inputs always produce the identical direction.
 * 2. Starting Point, Not Verdict: Explicitly presented as an editable recommendation.
 * 3. No Personality Profiling: No psychometric categorization or clinical scoring.
 * 4. Transparent Rationale: Explains which choices influenced the provisional title.
 * 5. Not a Qloo Prediction: Authored product interpretation, distinct from Qloo AI affinities.
 */

import type { CulturalDirection } from "./types";

/**
 * Derives an editorial cultural direction from the current list of interests and answers.
 */
export function deriveCulturalDirection(
  interests: readonly string[]
): CulturalDirection {
  const normalized = interests.map((i) => i.trim().toLowerCase());

  // Edge case: No interests selected or all skipped
  if (normalized.length === 0) {
    return {
      id: "open_curiosity",
      title: "Open Cultural Curiosity",
      description:
        "A blank canvas ready for your custom cultural topics, spontaneous curiosities, and personal preferences.",
      rationale:
        "No specific comparison choices were selected. You can enter any topic directly in manual entry.",
    };
  }

  // Count domain presence
  const hasCraft = normalized.some((i) => i.includes("craft") || i.includes("folk"));
  const hasTextiles = normalized.some((i) => i.includes("textile"));
  const hasHeritageArch = normalized.some((i) => i.includes("heritage") || i.includes("history"));
  const hasContemporary = normalized.some((i) => i.includes("contemporary") || i.includes("sculpture"));
  const hasModernist = normalized.some((i) => i.includes("modernist") || i.includes("design"));
  const hasPerforming = normalized.some((i) => i.includes("performing") || i.includes("festival"));
  const hasVisualFineArt = normalized.some((i) => i.includes("visual") || i.includes("fine art"));

  // Check compound cross-domain combinations
  if ((hasCraft || hasTextiles) && (hasModernist || hasContemporary)) {
    return {
      id: "craft_and_contemporary_dialogue",
      title: "Textile Heritage & Modern Form",
      description:
        "A thoughtful dialogue connecting generational artisan weaving with modernist architecture and spatial design.",
      rationale:
        "Surfaced from your interest in both handloom craft traditions and modern studio geometry.",
    };
  }

  if (hasVisualFineArt && hasPerforming) {
    return {
      id: "visual_and_performing_dialogue",
      title: "Visual Art & Communal Celebration",
      description:
        "A balanced appetite for serene visual contemplation alongside vibrant communal dialogue and living performance.",
      rationale:
        "Surfaced from your interest in both reflective gallery spaces and lively cultural festivals.",
    };
  }

  // Domain-focused directions
  if (hasCraft && hasTextiles) {
    return {
      id: "living_craft_traditions",
      title: "Living Craft & Artisan Heritage",
      description:
        "A curiosity rooted in living workshop techniques, handloom weaving, block printing vats, and domestic artisan heritage.",
      rationale:
        "Surfaced from your choices favoring historic textile workshops and traditional making communities.",
    };
  }

  if (hasHeritageArch) {
    return {
      id: "historic_architecture_and_memory",
      title: "Historic Architecture & Urban Memory",
      description:
        "An exploration focused on intricate haveli woodwork, monumental stepwells, and layered heritage streetscapes.",
      rationale:
        "Surfaced from your choices favoring historic architecture, ancestral gateways, and mercantile heritage.",
    };
  }

  if (hasContemporary || hasModernist) {
    return {
      id: "contemporary_design_and_form",
      title: "Contemporary Form & Spatial Design",
      description:
        "An appetite for mid-century modern brick vaults, multidisciplinary design studios, and experimental visual installations.",
      rationale:
        "Surfaced from your choices favoring modern design practices and experimental visual art.",
    };
  }

  if (hasPerforming) {
    return {
      id: "communal_performance_and_festivals",
      title: "Communal Performance & Living Festivities",
      description:
        "A focus on participatory public gatherings, oral traditions, and energetic communal celebrations.",
      rationale:
        "Surfaced from your choice favoring dynamic cultural festivals and live performance.",
    };
  }

  if (hasVisualFineArt) {
    return {
      id: "fine_art_and_contemplation",
      title: "Fine Art & Reflective Observation",
      description:
        "A contemplative focus on visual fine arts, painting, drawing, and quiet gallery environments.",
      rationale:
        "Surfaced from your choice favoring quiet contemplative galleries.",
    };
  }

  // General cross-domain fallback
  return {
    id: "cross_disciplinary_discovery",
    title: "Cross-Disciplinary Cultural Discovery",
    description:
      "A multifaceted curiosity spanning diverse heritage craft traditions, historic landmarks, and creative expressions.",
    rationale:
      "Surfaced from your varied choices across distinct cultural comparisons.",
  };
}

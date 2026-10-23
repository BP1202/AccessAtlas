/**
 * Cultural Compass — Question Catalogue
 *
 * A small, transparent catalogue of culturally meaningful comparisons designed
 * to surface visitor interests through explicit choices.
 *
 * Product Guarantees:
 * 1. Not a personality test: no psychometric profiling, competitive scoring, or right/wrong answers.
 * 2. Stable identifiers: identifiers remain constant regardless of UI wording updates.
 * 3. Both and Neither/skip are first-class choices on every question.
 * 4. Separate signal types: cultural interests are strictly distinct from outing formats,
 *    sensory preferences, and practical accessibility requirements.
 * 5. Mappings are product-authored interpretations, not Qloo-derived entity affinities.
 */

import type { CompassQuestion, CompassQuestionId, CompassOption, CompassOptionId } from "./types";

export const COMPASS_QUESTIONS: readonly CompassQuestion[] = [
  {
    id: "textiles_vs_contemporary_studio",
    prompt: "Historic textile workshop versus contemporary design studio",
    context:
      "Comparing centuries-old living fabric craft traditions with modern interdisciplinary studio design.",
    optionA: {
      id: "historic_textile_workshop",
      label: "Historic textile workshop",
      description:
        "Handloom weaving, hand-carved block printing vats, and living artisan fabric traditions.",
      signals: ["textiles", "craft traditions"],
    },
    optionB: {
      id: "contemporary_design_studio",
      label: "Contemporary design studio",
      description:
        "Modern multidisciplinary design, typography, industrial design, and contemporary studio practice.",
      signals: ["contemporary art", "design"],
    },
  },
  {
    id: "mountain_craft_village_vs_coastal_heritage_town",
    prompt: "Mountain craft village versus coastal heritage town",
    context:
      "Comparing focused regional artisan communities with layered historic maritime trade architecture.",
    optionA: {
      id: "mountain_craft_village",
      label: "Mountain craft village",
      description:
        "Generational maker settlements dedicated to pottery, vernacular woodcarving, and folk craft.",
      signals: ["craft traditions", "folk art"],
    },
    optionB: {
      id: "coastal_heritage_town",
      label: "Coastal heritage town",
      description:
        "Layered mercantile history, maritime trade routes, stone fortifications, and heritage streetscapes.",
      signals: ["heritage architecture", "history"],
    },
  },
  {
    id: "quiet_gallery_vs_lively_festival",
    prompt: "Quiet gallery versus lively cultural festival",
    context:
      "Comparing serene visual art contemplation with vibrant communal gatherings and folk performance.",
    optionA: {
      id: "quiet_gallery",
      label: "Quiet contemplative gallery",
      description:
        "Serene exhibition rooms designed for close visual contemplation of fine art, drawing, and painting.",
      // Crucial separation: produces visual art interest, NEVER medical/sensory quiet_space requirements!
      signals: ["visual arts", "fine art"],
    },
    optionB: {
      id: "lively_cultural_festival",
      label: "Lively cultural festival",
      description:
        "Dynamic communal festivities featuring folk performances, oral traditions, and live dialogue.",
      signals: ["performing arts", "cultural festivals"],
    },
  },
  {
    id: "traditional_techniques_vs_experimental_art",
    prompt: "Traditional making techniques versus experimental visual art",
    context:
      "Comparing ancestral, master-artisan craftsmanship with avant-garde conceptual art and new media.",
    optionA: {
      id: "traditional_making_techniques",
      label: "Traditional making techniques",
      description:
        "Mastery of time-tested generational techniques in natural dyes, embroidery, metal casting, and stone.",
      signals: ["craft traditions", "textiles"],
    },
    optionB: {
      id: "experimental_visual_art",
      label: "Experimental visual art",
      description:
        "Site-specific installations, modern conceptual sculpture, and experimental multimedia works.",
      signals: ["contemporary art", "sculpture"],
    },
  },
  {
    id: "historic_architecture_vs_modern_design",
    prompt: "Historic architecture versus modern design",
    context:
      "Comparing intricately carved timber facades and monumental stone stepwells with modernist spatial geometry.",
    optionA: {
      id: "historic_architecture",
      label: "Historic architecture",
      description:
        "Carved wooden residential havelis, monumental stepwells, ornamental arches, and ancestral stone gateways.",
      signals: ["heritage architecture", "history"],
    },
    optionB: {
      id: "modern_design",
      label: "Modern design",
      description:
        "Mid-century modernist brick vaults, brutalist concrete forms, and clean spatial minimalism.",
      signals: ["modernist architecture", "design"],
    },
  },
] as const;

/**
 * Retrieve a question definition by its stable identifier.
 */
export function getQuestionById(id: string): CompassQuestion | undefined {
  return COMPASS_QUESTIONS.find((q) => q.id === id);
}

/**
 * Retrieve an option definition by question ID and option ID.
 */
export function getOptionById(
  questionId: string,
  optionId: string
): CompassOption | undefined {
  const question = getQuestionById(questionId);
  if (!question) return undefined;
  if (question.optionA.id === optionId) return question.optionA;
  if (question.optionB.id === optionId) return question.optionB;
  return undefined;
}

/**
 * Map of all supported option IDs to their associated question.
 */
export const OPTION_TO_QUESTION_MAP: Record<CompassOptionId, CompassQuestionId> = {
  historic_textile_workshop: "textiles_vs_contemporary_studio",
  contemporary_design_studio: "textiles_vs_contemporary_studio",
  mountain_craft_village: "mountain_craft_village_vs_coastal_heritage_town",
  coastal_heritage_town: "mountain_craft_village_vs_coastal_heritage_town",
  quiet_gallery: "quiet_gallery_vs_lively_festival",
  lively_cultural_festival: "quiet_gallery_vs_lively_festival",
  traditional_making_techniques: "traditional_techniques_vs_experimental_art",
  experimental_visual_art: "traditional_techniques_vs_experimental_art",
  historic_architecture: "historic_architecture_vs_modern_design",
  modern_design: "historic_architecture_vs_modern_design",
};

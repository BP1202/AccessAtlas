import type { EvidenceAttribute } from "@/lib/api/types";

export interface RequirementDefinition {
  attribute: EvidenceAttribute;
  label: string;
  description: string;
  category: "accessibility" | "comfort" | "planning";
  defaultExpectedValue: boolean;
}

export const SUPPORTED_REQUIREMENTS: RequirementDefinition[] = [
  {
    attribute: "step_free_entrance",
    label: "Step-free entrance",
    description: "Level or ramped entry without steps or steep thresholds.",
    category: "accessibility",
    defaultExpectedValue: true,
  },
  {
    attribute: "seating_available",
    label: "Seating available",
    description: "Chairs, benches, or rest seating available throughout spaces.",
    category: "comfort",
    defaultExpectedValue: true,
  },
  {
    attribute: "wheelchair_access",
    label: "Wheelchair accommodation policy",
    description: "Published venue policy permitting and supporting wheelchair visits.",
    category: "accessibility",
    defaultExpectedValue: true,
  },
  {
    attribute: "reservation_required",
    label: "Advance reservation required",
    description: "Mandatory advance booking or tour registration (select if preferred).",
    category: "planning",
    defaultExpectedValue: true,
  },
  {
    attribute: "internal_elevator",
    label: "Elevator between floors",
    description: "Step-free vertical access to multi-level galleries or exhibition floors.",
    category: "accessibility",
    defaultExpectedValue: true,
  },
  {
    attribute: "step_free_restroom",
    label: "Step-free restroom",
    description: "Sanitation facilities with level or ramped entry.",
    category: "accessibility",
    defaultExpectedValue: true,
  },
  {
    attribute: "accessible_parking",
    label: "Accessible parking",
    description: "Designated accessible parking spaces on-site or nearby.",
    category: "accessibility",
    defaultExpectedValue: true,
  },
  {
    attribute: "contact_for_access_info",
    label: "Direct access contact",
    description: "Published direct email or phone line for specific visit inquiries.",
    category: "planning",
    defaultExpectedValue: true,
  },
  {
    attribute: "quiet_space",
    label: "Quiet areas",
    description: "Dedicated spaces with reduced sensory stimulus for pausing.",
    category: "comfort",
    defaultExpectedValue: true,
  },
];

export const REQUIREMENT_CATEGORY_LABELS: Record<RequirementDefinition["category"], string> = {
  accessibility: "Physical Accessibility & Mobility",
  comfort: "Rest, Seating & Sensory Space",
  planning: "Planning & Direct Venue Contact",
};

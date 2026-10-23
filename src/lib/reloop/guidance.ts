import type { Category, Condition, IntendedOutcome } from "./types";

/**
 * Local, editable guidance dataset. General advice only — not live recycling data.
 * Edit the entries below to match your local collection rules.
 */
export interface CategoryGuidance {
  reuse: string[];
  repair: string[];
  donate: string[];
  recycle: string[];
  /** Safety notes always shown for this category */
  safety: string[];
  /** When true, damaged items should never get DIY reuse/repair suggestions */
  hazardousWhenDamaged?: boolean;
}

export const GUIDANCE: Record<Category, CategoryGuidance> = {
  cardboard: {
    reuse: [
      "Offer sturdy boxes to neighbours who are moving or storing items.",
      "Use as sheet mulch under garden beds (remove tape and labels).",
    ],
    repair: ["Reinforce weak corners with paper tape and reuse for storage."],
    donate: ["Schools and nurseries often accept clean boxes for craft projects — ask first."],
    recycle: [
      "Flatten and keep dry. Remove plastic tape where possible.",
      "Greasy or food-soiled cardboard (e.g. pizza boxes) is often not accepted — check local rules.",
    ],
    safety: [],
  },
  paper: {
    reuse: ["Use single-sided paper for notes, drafts or children's drawing."],
    repair: [],
    donate: ["Clean scrap paper can help schools, clubs or community centres."],
    recycle: [
      "Recycle clean, dry paper. Shredded paper and glossy or laminated paper may need separate handling — check local rules.",
    ],
    safety: ["Shred documents containing personal information before passing them on."],
  },
  plastic: {
    reuse: [
      "Clean containers can store small parts, seeds or craft supplies.",
      "Plant pots and trays can go to seedling swaps or gardening groups.",
    ],
    repair: [],
    donate: ["Garden groups and allotments often welcome pots and trays."],
    recycle: [
      "Recycling acceptance varies by plastic type and area. Check the symbol and your local collection rules.",
      "Rinse containers; remove food residue.",
    ],
    safety: ["Do not reuse containers that held chemicals, fuel or pesticides for food or play."],
  },
  glass: {
    reuse: ["Jars with lids are useful for refill shops, preserving and storage."],
    repair: [],
    donate: ["Refill stalls, food co-ops or home preservers may accept clean jars."],
    recycle: [
      "Rinse and recycle bottles and jars. Window glass, mirrors, cookware and light bulbs usually go elsewhere — check local rules.",
    ],
    safety: ["Wrap broken glass securely before disposal. Never offer chipped glass for food use."],
  },
  metal: {
    reuse: [
      "Tins can become pen pots or planters (file sharp edges first).",
      "Offer bike parts and tools to repair groups.",
    ],
    repair: ["Tools and furniture with loose parts can often be fixed at a repair event."],
    donate: ["Community repair stands may accept bike parts and hand tools."],
    recycle: [
      "Rinse cans and recycle. Larger scrap metal usually goes to a scrap metal dealer or recycling centre.",
    ],
    safety: [
      "Empty aerosol cans only — never puncture or burn them. Gas canisters need special disposal.",
    ],
  },
  textiles: {
    reuse: [
      "Wearable clothes can be swapped or listed on the Reuse Exchange.",
      "Old towels and t-shirts make good cleaning rags.",
    ],
    repair: ["Small tears, loose buttons and broken zips are often quick fixes at a repair event."],
    donate: [
      "Clean, wearable items can go to charity shops, school uniform swaps or shelters — check what they accept.",
    ],
    recycle: [
      "Unwearable textiles can go to textile recycling banks rather than general waste, where available.",
    ],
    safety: [],
  },
  electronics: {
    reuse: ["Working devices can be listed on the Reuse Exchange or passed to family and friends."],
    repair: [
      "Working-but-faulty items with simple external faults may be fixable at a supervised repair event.",
    ],
    donate: ["Some charities refurbish working devices — wipe personal data first."],
    recycle: [
      "Take electronics to an official e-waste (WEEE) collection point or retailer take-back scheme. Do not put them in household bins.",
    ],
    safety: [
      "Remove batteries where safely possible and recycle them at a battery collection point.",
      "Never open mains-powered devices yourself. Swollen, leaking or hot batteries are a fire risk — isolate and take to a specialist collection point.",
      "Wipe personal data before passing devices on.",
    ],
    hazardousWhenDamaged: true,
  },
  organic: {
    reuse: ["Finished compost is valued by community gardens and allotments."],
    repair: [],
    donate: [
      "Surplus, in-date, sealed food may be accepted by food banks or community fridges — follow their rules.",
    ],
    recycle: ["Use a home compost bin or your local food-waste collection, if available."],
    safety: [
      "Do not share cooked or opened food unless a food-sharing scheme with clear hygiene rules accepts it.",
    ],
  },
  other: {
    reuse: ["Describe the item on the Reuse Exchange — someone nearby may have a use for it."],
    repair: ["Ask at a local repair event whether it can be fixed."],
    donate: ["Charity shops and community groups may accept it if it is clean and working."],
    recycle: [
      "For items you are unsure about, check your local waste collection rules or recycling centre before disposal.",
    ],
    safety: [
      "Batteries, paint, chemicals, medicines, sharps and gas canisters are hazardous — use designated collection points only.",
    ],
  },
};

export interface RecommendationInput {
  category: Category;
  condition: Condition;
  outcome: IntendedOutcome;
  hazardous: boolean;
}

export interface RecommendationGroup {
  kind: "reuse" | "repair" | "donate" | "recycle" | "safety" | "check";
  title: string;
  /** "reuse" groups keep material in use; "recycle" groups recover the material */
  pathway: "reuse" | "recycle" | "safety";
  tips: string[];
}

const ORDER: Record<IntendedOutcome, ("reuse" | "repair" | "donate" | "recycle")[]> = {
  reuse: ["reuse", "donate", "repair", "recycle"],
  donate: ["donate", "reuse", "repair", "recycle"],
  repair: ["repair", "reuse", "donate", "recycle"],
  recycle: ["recycle", "reuse", "donate", "repair"],
  "other-use": ["reuse", "repair", "donate", "recycle"],
};

const TITLES: Record<"reuse" | "repair" | "donate" | "recycle", string> = {
  reuse: "Reuse it",
  repair: "Repair it",
  donate: "Donate or share it",
  recycle: "Recycle it",
};

export function getRecommendations(input: RecommendationInput): RecommendationGroup[] {
  const g = GUIDANCE[input.category];
  const groups: RecommendationGroup[] = [];
  const unsafe = input.hazardous || (g.hazardousWhenDamaged && input.condition === "damaged");

  if (unsafe) {
    groups.push({
      kind: "safety",
      title: "Handle safely first",
      pathway: "safety",
      tips: [
        ...(input.hazardous
          ? [
              "This item may contain batteries, chemicals or other hazardous parts. Do not reuse, repair or share it informally.",
            ]
          : [
              "Damaged electronics may contain unsafe batteries or exposed wiring. Do not attempt DIY reuse or repair.",
            ]),
        ...g.safety,
        "Take it to a designated hazardous-waste, battery or e-waste collection point. Check your local council's guidance.",
      ],
    });
    return groups;
  }

  for (const kind of ORDER[input.outcome]) {
    let tips = g[kind];
    if (kind === "donate" && input.condition === "damaged") {
      tips = [
        "Damaged items are rarely accepted for donation — consider repair or recycling instead.",
      ];
    }
    if (kind === "repair" && input.condition === "like-new") continue;
    if (tips.length === 0) continue;
    groups.push({
      kind,
      title: TITLES[kind],
      pathway: kind === "recycle" ? "recycle" : "reuse",
      tips,
    });
  }
  if (g.safety.length)
    groups.push({ kind: "safety", title: "Safety notes", pathway: "safety", tips: g.safety });
  groups.push({
    kind: "check",
    title: "Check local rules",
    pathway: "safety",
    tips: [
      "Recycling rules differ between areas. This guidance is general and not based on live local data — confirm with your local waste collection service.",
    ],
  });
  return groups;
}

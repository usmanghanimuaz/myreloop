export const CATEGORIES = [
  "cardboard",
  "paper",
  "plastic",
  "glass",
  "metal",
  "textiles",
  "electronics",
  "organic",
  "other",
] as const;
export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_LABEL: Record<Category, string> = {
  cardboard: "Cardboard",
  paper: "Paper",
  plastic: "Plastic",
  glass: "Glass",
  metal: "Metal",
  textiles: "Textiles",
  electronics: "Electronics",
  organic: "Organic waste",
  other: "Other",
};

export const UNITS = ["kg", "items", "litres"] as const;
export type Unit = (typeof UNITS)[number];

export const CONDITIONS = ["like-new", "good", "worn", "damaged"] as const;
export type Condition = (typeof CONDITIONS)[number];
export const CONDITION_LABEL: Record<Condition, string> = {
  "like-new": "Like new",
  good: "Good",
  worn: "Worn but usable",
  damaged: "Damaged / broken",
};

export const OUTCOMES = ["reuse", "donate", "repair", "recycle", "other-use"] as const;
export type IntendedOutcome = (typeof OUTCOMES)[number];
export const OUTCOME_LABEL: Record<IntendedOutcome, string> = {
  reuse: "Reuse",
  donate: "Donate",
  repair: "Repair",
  recycle: "Recycle",
  "other-use": "Find another use",
};

/** How recorded material was diverted. Reuse covers reuse, donation and repair. */
export type DiversionType = "reuse" | "recycle";

export type Origin = "sample" | "user";
export type ListingStatus = "available" | "reserved" | "exchanged";

export interface Listing {
  id: string;
  title: string;
  category: Category;
  quantity: number;
  unit: Unit;
  condition: Condition;
  description: string;
  area: string;
  status: ListingStatus;
  createdAt: string;
  updatedAt: string;
  origin: Origin;
}

export interface InterestRequest {
  id: string;
  listingId: string;
  note: string;
  createdAt: string;
  origin: Origin;
}

export type ActionStatus = "open" | "completed";

export interface CommunityAction {
  id: string;
  title: string;
  goal: string;
  instructions: string[];
  durationMinutes: number;
  category: Category;
  status: ActionStatus;
  completedAt?: string | undefined;
  origin: Origin;
}

export interface ImpactEntry {
  id: string;
  source: "exchange" | "action" | "finder";
  sourceId: string;
  category: Category;
  quantity: number;
  unit: Unit;
  diversion: DiversionType;
  /** true only when a user explicitly recorded that the reuse/recycling happened */
  completed: boolean;
  note: string;
  createdAt: string;
  origin: Origin;
}

export interface ReuseNeed {
  id: string;
  category: Category;
  description: string;
  createdAt: string;
  origin: Origin;
}

export interface ActivityEvent {
  id: string;
  message: string;
  createdAt: string;
  origin: Origin;
}

export interface Evidence {
  problem: string;
  community: string;
  date: string;
  method: string;
  interviewed: string;
  findings: string;
  limitations: string;
  howReloopHelps: string;
}

export interface AppState {
  version: 1;
  listings: Listing[];
  interests: InterestRequest[];
  actions: CommunityAction[];
  impact: ImpactEntry[];
  needs: ReuseNeed[];
  activity: ActivityEvent[];
  evidence: Evidence;
}

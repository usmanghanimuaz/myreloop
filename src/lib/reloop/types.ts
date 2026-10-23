export const CATEGORIES = [
  "cardboard",
  "paper",
  "plastic",
  "flexiblePlastic",
  "glass",
  "metal",
  "textiles",
  "furniture",
  "electronics",
  "batteries",
  "lamps",
  "paint",
  "medicines",
  "construction",
  "organic",
  "tyres",
  "appliances",
  "booksToys",
  "mixedPackaging",
  "hygiene",
  "other",
] as const;
export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_LABEL: Record<Category, string> = {
  cardboard: "Cardboard",
  paper: "Paper",
  plastic: "Rigid plastic",
  flexiblePlastic: "Flexible plastic & packaging",
  glass: "Glass",
  metal: "Metal",
  textiles: "Clothes, shoes & textiles",
  furniture: "Furniture & wood",
  electronics: "Electronics",
  batteries: "Batteries",
  lamps: "Lamps & bulbs",
  paint: "Paint, solvents & chemicals",
  medicines: "Medicines & sharps",
  construction: "Construction materials",
  organic: "Food & organic waste",
  tyres: "Tyres & rubber",
  appliances: "Appliances",
  booksToys: "Books & toys",
  mixedPackaging: "Mixed packaging",
  hygiene: "Hygiene waste",
  other: "Other",
};

/**
 * Categories that must never be offered for casual exchange — they need
 * designated collection points. Enforced in the listing form and server-side.
 */
export const HAZARDOUS_CATEGORIES: readonly Category[] = [
  "batteries",
  "lamps",
  "paint",
  "medicines",
  "hygiene",
];
export const isHazardousCategory = (c: Category) => HAZARDOUS_CATEGORIES.includes(c);

export const UNITS = ["kg", "g", "lb", "items", "litres"] as const;
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
export type ListingStatus = "available" | "reserved" | "exchanged" | "closed";

export interface Listing {
  id: string;
  title: string;
  category: Category;
  quantity: number;
  unit: Unit;
  condition: Condition;
  mode?: "FREE" | "EXCHANGE" | undefined;
  exchangePreference?: string | undefined;
  photos?: string[] | undefined;
  description: string;
  area: string;
  status: ListingStatus;
  createdAt: string;
  updatedAt: string;
  origin: Origin;
  ownerId?: string | undefined;
}

export interface InterestRequest {
  targetKind?: "listings" | "needs" | undefined;
  status?: "pending" | "accepted" | "rejected" | "handover" | "completed" | "cancelled" | undefined;
  ownerId?: string | undefined;
  confirmedBy?: string | undefined;
  quantity?: number | undefined;
  unit?: Unit | undefined;
  id: string;
  listingId: string;
  note: string;
  createdAt: string;
  origin: Origin;
}

export type ActionStatus = "open" | "completed";

export interface CommunityAction {
  ownerId?: string | undefined;
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
  ownerId?: string | undefined;
  verified?: boolean | undefined;
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
  exchangePreference?: string | undefined;
  title?: string | undefined;
  quantity?: number | undefined;
  unit?: Unit | undefined;
  area?: string | undefined;
  mode?: "FREE" | "EXCHANGE" | undefined;
  status?: "open" | "reserved" | "fulfilled" | "closed" | undefined;
  ownerId?: string | undefined;
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

/**
 * Community-submitted field evidence (a photo or an external video link).
 * Private to the submitter until `validated` is set by review — never shown
 * publicly before that.
 */
export interface FieldEvidence {
  id: string;
  kind: "photo" | "video-link";
  title: string;
  description: string;
  /** General area only — never an exact address */
  area: string;
  /** Date of observation, YYYY-MM-DD */
  date: string;
  /** Storage path inside the private evidence bucket (photos only) */
  mediaPath?: string | undefined;
  /** External video URL the submitter has rights to share (video-link only) */
  externalUrl?: string | undefined;
  /** Submitter confirmed they took/own the media and consent to it being shown */
  consent: boolean;
  /** Set only by review; unvalidated evidence stays private */
  validated: boolean;
  createdAt: string;
  origin: Origin;
  ownerId?: string | undefined;
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
  fieldEvidence: FieldEvidence[];
}

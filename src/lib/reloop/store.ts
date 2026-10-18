import { useSyncExternalStore } from "react";
import { AppStateSchema, type ListingInput } from "./schema";
import { createSeedState } from "./seed";
import type {
  AppState,
  Category,
  DiversionType,
  Evidence,
  ImpactEntry,
  Listing,
  ListingStatus,
  Unit,
} from "./types";

const STORAGE_KEY = "reloop:state:v1";

export interface StoreMeta {
  hydrated: boolean;
  storageAvailable: boolean;
  recoveredFromCorruptData: boolean;
}

const SERVER_STATE = createSeedState();
let state: AppState = SERVER_STATE;
let meta: StoreMeta = { hydrated: false, storageAvailable: true, recoveredFromCorruptData: false };
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}
function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}
function persist() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    if (meta.storageAvailable) meta = { ...meta, storageAvailable: false };
  }
}

/** Load persisted state on the client. Recovers from malformed or unavailable storage. */
export function hydrateStore() {
  if (meta.hydrated || typeof window === "undefined") return;
  let storageAvailable = true;
  let recovered = false;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = AppStateSchema.safeParse(JSON.parse(raw));
      if (parsed.success) state = parsed.data;
      else {
        recovered = true;
        state = createSeedState();
      }
    }
  } catch {
    recovered = true;
    state = createSeedState();
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    storageAvailable = false;
  }
  meta = { hydrated: true, storageAvailable, recoveredFromCorruptData: recovered };
  emit();
}

export function useAppState(): AppState {
  return useSyncExternalStore(subscribe, () => state, () => SERVER_STATE);
}
const SERVER_META: StoreMeta = { hydrated: false, storageAvailable: true, recoveredFromCorruptData: false };
export function useStoreMeta(): StoreMeta {
  return useSyncExternalStore(subscribe, () => meta, () => SERVER_META);
}

const now = () => new Date().toISOString();
const uid = (p: string) => `${p}-${crypto.randomUUID()}`;

function update(fn: (s: AppState) => AppState) {
  state = fn(state);
  persist();
  emit();
}
function log(s: AppState, message: string): AppState {
  return { ...s, activity: [{ id: uid("e"), message, createdAt: now(), origin: "user" as const }, ...s.activity].slice(0, 100) };
}
/** Insert or replace the entry for a given source record — prevents double counting. */
function upsertImpact(s: AppState, entry: Omit<ImpactEntry, "id" | "createdAt">): AppState {
  const rest = s.impact.filter((e) => !(e.source === entry.source && e.sourceId === entry.sourceId));
  return { ...s, impact: [{ ...entry, id: uid("m"), createdAt: now() }, ...rest] };
}
function removeImpact(s: AppState, source: ImpactEntry["source"], sourceId: string): AppState {
  return { ...s, impact: s.impact.filter((e) => !(e.source === source && e.sourceId === sourceId)) };
}

export const actions = {
  createListing(input: ListingInput): Listing {
    const t = now();
    const listing: Listing = { ...input, id: uid("l"), status: "available", createdAt: t, updatedAt: t, origin: "user" };
    update((s) => log({ ...s, listings: [listing, ...s.listings] }, `You listed '${listing.title}'`));
    return listing;
  },
  updateListing(id: string, input: ListingInput) {
    update((s) => {
      const l = s.listings.find((x) => x.id === id);
      if (!l || l.origin !== "user") return s;
      let next: AppState = { ...s, listings: s.listings.map((x) => (x.id === id ? { ...x, ...input, updatedAt: now() } : x)) };
      if (l.status === "exchanged")
        next = upsertImpact(next, exchangeImpact({ ...l, ...input }));
      return log(next, `You edited '${input.title}'`);
    });
  },
  deleteListing(id: string) {
    update((s) => {
      const l = s.listings.find((x) => x.id === id);
      if (!l || l.origin !== "user") return s;
      const next = removeImpact(
        { ...s, listings: s.listings.filter((x) => x.id !== id), interests: s.interests.filter((i) => i.listingId !== id) },
        "exchange",
        id,
      );
      return log(next, `You deleted '${l.title}'`);
    });
  },
  setListingStatus(id: string, status: ListingStatus) {
    update((s) => {
      const l = s.listings.find((x) => x.id === id);
      if (!l || l.origin !== "user" || l.status === status) return s;
      let next: AppState = { ...s, listings: s.listings.map((x) => (x.id === id ? { ...x, status, updatedAt: now() } : x)) };
      next = status === "exchanged" ? upsertImpact(next, exchangeImpact(l)) : removeImpact(next, "exchange", id);
      return log(next, `You marked '${l.title}' as ${status}`);
    });
  },
  sendInterest(listingId: string, note: string) {
    update((s) => {
      const l = s.listings.find((x) => x.id === listingId);
      if (!l || l.status === "exchanged") return s;
      return log(
        { ...s, interests: [{ id: uid("i"), listingId, note: note.trim(), createdAt: now(), origin: "user" }, ...s.interests] },
        `You sent a demo interest request for '${l.title}'`,
      );
    });
  },
  completeAction(id: string, record?: { category: Category; quantity: number; unit: Unit; diversion: DiversionType }) {
    update((s) => {
      const a = s.actions.find((x) => x.id === id);
      if (!a || a.status === "completed") return s;
      let next: AppState = {
        ...s,
        actions: s.actions.map((x) => (x.id === id ? { ...x, status: "completed" as const, completedAt: now(), origin: "user" as const } : x)),
      };
      next = removeImpact(next, "action", id);
      if (record && record.quantity > 0)
        next = upsertImpact(next, { source: "action", sourceId: id, ...record, completed: true, note: a.title, origin: "user" });
      return log(next, `You recorded '${a.title}' as completed`);
    });
  },
  reopenAction(id: string) {
    update((s) => {
      const a = s.actions.find((x) => x.id === id);
      if (!a || a.status === "open") return s;
      const next = removeImpact(
        { ...s, actions: s.actions.map((x) => (x.id === id ? { ...x, status: "open" as const, completedAt: undefined } : x)) },
        "action",
        id,
      );
      return log(next, `You reopened '${a.title}'`);
    });
  },
  planFromFinder(entry: { category: Category; quantity: number; unit: Unit; diversion: DiversionType; note: string }) {
    const id = uid("f");
    update((s) => log(upsertImpact(s, { source: "finder", sourceId: id, ...entry, completed: false, origin: "user" }), `You saved a plan: ${entry.note}`));
  },
  markPlanCompleted(entryId: string) {
    update((s) => {
      const e = s.impact.find((x) => x.id === entryId);
      if (!e || e.completed || e.origin !== "user") return s;
      return log({ ...s, impact: s.impact.map((x) => (x.id === entryId ? { ...x, completed: true } : x)) }, `You recorded '${e.note}' as done`);
    });
  },
  deleteImpactEntry(entryId: string) {
    update((s) => {
      const e = s.impact.find((x) => x.id === entryId);
      if (!e || e.origin !== "user" || e.source !== "finder") return s;
      return { ...s, impact: s.impact.filter((x) => x.id !== entryId) };
    });
  },
  addNeed(category: Category, description: string) {
    update((s) =>
      log({ ...s, needs: [{ id: uid("n"), category, description: description.trim(), createdAt: now(), origin: "user" }, ...s.needs] }, `You posted a reuse need: ${description.trim()}`),
    );
  },
  saveEvidence(evidence: Evidence) {
    update((s) => ({ ...s, evidence }));
  },
  resetDemo() {
    state = createSeedState();
    persist();
    emit();
  },
};

function exchangeImpact(l: Listing): Omit<ImpactEntry, "id" | "createdAt"> {
  return {
    source: "exchange",
    sourceId: l.id,
    category: l.category,
    quantity: l.quantity,
    unit: l.unit,
    diversion: "reuse",
    completed: true,
    note: `Exchanged: ${l.title}`,
    origin: "user",
  };
}

/** Test helpers */
export const __test = {
  getState: () => state,
  setState: (s: AppState) => {
    state = s;
  },
};

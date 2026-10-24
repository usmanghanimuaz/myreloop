import {
  CATEGORIES,
  UNITS,
  type AppState,
  type Category,
  type ImpactEntry,
  type Interest,
  type Origin,
  type Unit,
} from "./types";

export type UnitTotals = Record<Unit, number>;
export const emptyTotals = (): UnitTotals =>
  Object.fromEntries(UNITS.map((u) => [u, 0])) as UnitTotals;

export interface ImpactSummary {
  /** Completed (user-recorded) diversion, per unit — never summed across units */
  completed: UnitTotals;
  completedByOrigin: Record<Origin, UnitTotals>;
  verified: UnitTotals;
  verifiedExchanges: number;
  /** Planned / unverified entries, per unit */
  planned: UnitTotals;
  byCategory: { category: Category; unit: Unit; quantity: number }[];
  byDiversion: { reuse: UnitTotals; recycle: UnitTotals };
  completedActions: Record<Origin, number>;
}

/** Keeps one impact entry per source record, so re-recording never double-counts. */
export function dedupeImpact(entries: ImpactEntry[]): ImpactEntry[] {
  const seen = new Map<string, ImpactEntry>();
  for (const e of entries) seen.set(`${e.source}:${e.sourceId}`, e);
  return [...seen.values()];
}

export function summarizeImpact(state: Pick<AppState, "impact" | "actions">): ImpactSummary {
  const s: ImpactSummary = {
    completed: emptyTotals(),
    verified: emptyTotals(),
    verifiedExchanges: 0,
    completedByOrigin: { sample: emptyTotals(), user: emptyTotals() },
    planned: emptyTotals(),
    byCategory: [],
    byDiversion: { reuse: emptyTotals(), recycle: emptyTotals() },
    completedActions: { sample: 0, user: 0 },
  };
  const cat = new Map<string, number>();
  for (const e of dedupeImpact(state.impact)) {
    if (e.origin === "sample") {
      if (e.completed) s.completedByOrigin.sample[e.unit] += e.quantity;
      continue;
    }
    if (!e.completed) {
      s.planned[e.unit] += e.quantity;
      continue;
    }
    s.completed[e.unit] += e.quantity;
    if (e.source === "exchange" && e.verified) {
      s.verified[e.unit] += e.quantity;
      s.verifiedExchanges++;
    }
    s.completedByOrigin[e.origin][e.unit] += e.quantity;
    s.byDiversion[e.diversion][e.unit] += e.quantity;
    const k = `${e.category}|${e.unit}`;
    cat.set(k, (cat.get(k) ?? 0) + e.quantity);
  }
  for (const c of CATEGORIES)
    for (const u of UNITS) {
      const q = cat.get(`${c}|${u}`);
      if (q) s.byCategory.push({ category: c, unit: u, quantity: round(q) });
    }
  for (const a of state.actions) if (a.status === "completed") s.completedActions[a.origin]++;
  for (const t of [
    s.completed,
    s.planned,
    s.byDiversion.reuse,
    s.byDiversion.recycle,
    s.completedByOrigin.sample,
    s.completedByOrigin.user,
  ])
    for (const u of UNITS) t[u] = round(t[u]);
  return s;
}

export function round(n: number) {
  return Math.round(n * 100) / 100;
}

export function formatTotals(t: UnitTotals): string {
  const parts = UNITS.filter((u) => t[u] > 0).map((u) => `${t[u]} ${u}`);
  return parts.length ? parts.join(" · ") : "0";
}

export interface Insights {
  mostListed: { category: Category; count: number }[];
  mostInterest: { category: Category; count: number }[];
  openActions: number;
  unmetNeeds: { category: Category; count: number; examples: string[] }[];
}

export function computeInsights(state: AppState): Insights {
  const listed = new Map<Category, number>();
  for (const l of state.listings) listed.set(l.category, (listed.get(l.category) ?? 0) + 1);
  const catOf = new Map(state.listings.map((l) => [l.id, l.category] as const));
  const interest = new Map<Category, number>();
  for (const i of state.interests) {
    const c = catOf.get(i.listingId);
    if (c) interest.set(c, (interest.get(c) ?? 0) + 1);
  }
  const available = new Set(
    state.listings.filter((l) => l.status === "available").map((l) => l.category),
  );
  const needs = new Map<Category, string[]>();
  for (const n of state.needs)
    if ((n.status ?? "open") === "open" && !available.has(n.category))
      needs.set(n.category, [...(needs.get(n.category) ?? []), n.description]);
  const sort = (m: Map<Category, number>) =>
    [...m.entries()]
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);
  return {
    mostListed: sort(listed),
    mostInterest: sort(interest),
    openActions: state.actions.filter((a) => a.status === "open").length,
    unmetNeeds: [...needs.entries()]
      .map(([category, examples]) => ({ category, count: examples.length, examples }))
      .sort((a, b) => b.count - a.count),
  };
}

/** Public recent handovers must also have an immutable service-created impact entry. */
export function confirmedInterests(interests: Interest[], impact: ImpactEntry[]) {
  const confirmed = new Set(
    impact
      .filter((e) => e.origin === "user" && e.source === "exchange" && e.completed && e.verified)
      .map((e) => e.id),
  );
  return interests.filter(
    (i) => i.origin === "user" && i.status === "completed" && confirmed.has(`handover-${i.id}`),
  );
}

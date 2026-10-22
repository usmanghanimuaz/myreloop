import type { Json } from "@/integrations/supabase/types";
import { z } from "zod";
import { AppStateSchema, ListingInputSchema, NeedInputSchema, looksLikeContactDetails } from "./schema";
import { CATEGORIES, UNITS, type AppState } from "./types";

export const kinds = ["listings", "interests", "actions", "impact", "needs", "activity", "evidence"] as const;
export type RecordKind = typeof kinds[number];
export interface CloudRecord { key: string; kind: string; owner_id: string | null; sample: boolean; data: Json; revision: number }
const safeText = (max: number) => z.string().trim().max(max).refine(t => !looksLikeContactDetails(t), "Don't include emails or phone numbers");
const quantity = z.number().positive().max(10000);
const material = z.object({ category: z.enum(CATEGORIES), quantity, unit: z.enum(UNITS), diversion: z.enum(["reuse", "recycle"]) });
export const CommandSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("createListing"), input: ListingInputSchema }),
  z.object({ type: z.literal("updateListing"), id: z.string(), input: ListingInputSchema }),
  z.object({ type: z.literal("deleteListing"), id: z.string() }),
  z.object({ type: z.literal("setListingStatus"), id: z.string(), status: z.enum(["available", "closed"]) }),
  z.object({ type: z.literal("postNeed"), input: NeedInputSchema }),
  z.object({ type: z.literal("closeNeed"), id: z.string() }),
  z.object({ type: z.literal("sendOffer"), id: z.string(), note: safeText(200), quantity, unit: z.enum(UNITS) }),
  z.object({ type: z.literal("respondRequest"), id: z.string(), decision: z.enum(["accept","reject","confirm","cancel"]) }),
  z.object({ type: z.literal("sendInterest"), id: z.string(), note: safeText(200) }),
  z.object({ type: z.literal("completeAction"), id: z.string(), record: material.optional() }),
  z.object({ type: z.literal("reopenAction"), id: z.string() }),
  z.object({ type: z.literal("planFromFinder"), entry: material.extend({ note: safeText(200) }) }),
  z.object({ type: z.literal("markPlanCompleted"), id: z.string() }),
  z.object({ type: z.literal("deleteImpactEntry"), id: z.string() }),
  z.object({ type: z.literal("addNeed"), category: z.enum(CATEGORIES), description: safeText(120).pipe(z.string().min(3)) }),
  z.object({ type: z.literal("saveEvidence"), evidence: z.object({
    problem: safeText(2000), community: safeText(100), date: z.string().regex(/^(\d{4}-\d{2}-\d{2})?$/),
    method: safeText(2000), interviewed: z.string().regex(/^\d*$/), findings: safeText(2000), limitations: safeText(2000), howReloopHelps: safeText(2000),
  }) }),
  z.object({ type: z.literal("resetDemo") }),
]);
export type Command = z.infer<typeof CommandSchema>;

export function recordsToState(records: CloudRecord[]): AppState {
  const raw: Record<string, unknown> = { version: 1, evidence: { problem: "", community: "", date: "", method: "", interviewed: "", findings: "", limitations: "", howReloopHelps: "" } };
  for (const kind of kinds) {
    const rows = records.filter(r => r.kind === kind);
    if (kind === "evidence") { if (rows[0]) raw["evidence"] = rows[0].data; }
    else {
      const byId = new Map<string, unknown>();
      // A personal completion overrides its fictional action template, not another user's progress.
      for (const r of [...rows].sort((a,b) => Number(b.sample)-Number(a.sample))) {
        const d = r.data as { id: string };
        byId.set(d.id, { ...d, ownerId: r.owner_id ?? undefined });
      }
      raw[kind] = [...byId.values()].sort((a,b) => String((b as {createdAt?:string}).createdAt ?? "").localeCompare(String((a as {createdAt?:string}).createdAt ?? "")));
    }
  }
  return AppStateSchema.parse(raw);
}

export function stateRecords(state: AppState, userId: string) {
  const result = new Map<string, {key:string;kind:RecordKind;data:unknown}>();
  for (const kind of kinds) {
    if (kind === "evidence") { result.set(`evidence:${userId}`, {key:`evidence:${userId}`,kind,data:state.evidence}); continue; }
    for (const row of state[kind]) {
      if (row.origin === "sample") continue;
      const key = kind === "actions" ? `actions:${userId}:${row.id}` : `${kind}:${row.id}`;
      result.set(key, {key,kind,data:row});
    }
  }
  return result;
}
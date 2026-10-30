import { z } from "zod";
import { looksLikeContactDetails } from "./schema";
import { CATEGORIES, isHazardousCategory, type Listing } from "./types";

export const AI_LANGS = ["en", "ur", "hi", "ar", "es", "fr", "zh"] as const;
const query = z.string().trim().min(3).max(400).refine((text) => !looksLikeContactDetails(text), "Do not include personal contact details.");
export const AiAssistInputSchema = z.discriminatedUnion("task", [
  z.object({ task: z.literal("match"), query, lang: z.enum(AI_LANGS), consent: z.literal(true) }).strict(),
  z.object({ task: z.literal("guidance"), query, category: z.enum(CATEGORIES), lang: z.enum(AI_LANGS), consent: z.literal(true) }).strict(),
  z.object({ task: z.literal("translate"), id: z.string().min(1).max(120), lang: z.enum(AI_LANGS), consent: z.literal(true) }).strict(),
  z.object({ task: z.literal("safety"), id: z.string().min(1).max(120), kind: z.enum(["listings", "needs"]), lang: z.enum(AI_LANGS), consent: z.literal(true) }).strict(),
]);
export type AiAssistInput = z.infer<typeof AiAssistInputSchema>;
// Keep wire schema unconstrained; validate and bound output after generation.
export const AiAssistOutputSchema = z.object({ title: z.string(), text: z.string(), ids: z.array(z.string()) }).strict();
export type AiAssistOutput = z.infer<typeof AiAssistOutputSchema>;

export function safeAiText(value: unknown, max = 800): string {
  if (typeof value !== "string" || looksLikeContactDetails(value)) return "";
  return value.trim().slice(0, max);
}

export function eligibleAiListings(listings: Listing[]) {
  return listings.filter((l) => l.origin === "user" && l.status === "available" &&
    (l.mode === "FREE" || l.mode === "EXCHANGE") && !isHazardousCategory(l.category));
}

/** Only public item text is sent, never photos, location, identity, notes or plans. */
export function aiItemProjection(item: { id: string; title?: string; description: string; category: string; mode?: string }) {
  return { id: item.id, title: safeAiText(item.title, 80), description: safeAiText(item.description), category: item.category, mode: item.mode ?? "FREE" };
}

export function normalizeAiAssist(value: unknown, allowedIds: string[]): AiAssistOutput | null {
  const parsed = AiAssistOutputSchema.safeParse(value);
  if (!parsed.success) return null;
  const title = safeAiText(parsed.data.title, 120);
  const text = safeAiText(parsed.data.text, 1800);
  if (!title || !text) return null;
  return { title, text, ids: [...new Set(parsed.data.ids)].filter((id) => allowedIds.includes(id)).slice(0, 5) };
}
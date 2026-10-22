import { z } from "zod";
import { CATEGORIES, CONDITIONS, UNITS } from "./types";

const origin = z.enum(["sample", "user"]);
const category = z.enum(CATEGORIES);
const unit = z.enum(UNITS);
export const TransactionModeSchema = z.enum(["FREE", "EXCHANGE"]);
const mode = TransactionModeSchema.default("FREE");
const photos = z.array(z.string().max(250)).max(4).default([]);

export const ListingSchema = z.object({
  id: z.string(),
  title: z.string(),
  category,
  quantity: z.number().positive(),
  unit,
  condition: z.enum(CONDITIONS),
  description: z.string(),
  area: z.string(),
  status: z.enum(["available", "reserved", "exchanged", "closed"]),
  mode, photos, ownerId: z.string().optional(), exchangePreference: z.string().default(""),
  createdAt: z.string(),
  updatedAt: z.string(),
  origin,
});

export const AppStateSchema = z.object({
  version: z.literal(1),
  listings: z.array(ListingSchema),
  interests: z.array(
    z.object({ id: z.string(), listingId: z.string(), note: z.string(), createdAt: z.string(), origin, ownerId: z.string().optional(), targetKind: z.enum(["listings","needs"]).default("listings"), status: z.enum(["pending","accepted","rejected","handover","completed","cancelled"]).default("pending"), confirmedBy: z.string().optional(), quantity: z.number().positive().optional(), unit: unit.optional() }),
  ),
  actions: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      goal: z.string(),
      instructions: z.array(z.string()),
      durationMinutes: z.number(),
      category,
      status: z.enum(["open", "completed"]),
      completedAt: z.string().optional(),
      origin, ownerId: z.string().optional(),
    }),
  ),
  impact: z.array(
    z.object({
      id: z.string(),
      source: z.enum(["exchange", "action", "finder"]),
      sourceId: z.string(),
      category,
      quantity: z.number().positive(),
      unit,
      diversion: z.enum(["reuse", "recycle"]),
      completed: z.boolean(),
      note: z.string(),
      createdAt: z.string(),
      origin, ownerId: z.string().optional(), verified: z.boolean().default(false),
    }),
  ),
  needs: z.array(
    z.object({ id: z.string(), category, description: z.string(), createdAt: z.string(), origin, title: z.string().optional(), quantity: z.number().positive().default(1), unit: unit.default("items"), area: z.string().default("General area not specified"), mode, exchangePreference: z.string().default(""), status: z.enum(["open","reserved","fulfilled","closed"]).default("open"), ownerId: z.string().optional() }),
  ),
  activity: z.array(
    z.object({ id: z.string(), message: z.string(), createdAt: z.string(), origin }),
  ),
  evidence: z.object({
    problem: z.string(),
    community: z.string(),
    date: z.string(),
    method: z.string(),
    interviewed: z.string(),
    findings: z.string(),
    limitations: z.string(),
    howReloopHelps: z.string(),
  }),
});

/** Rejects text that looks like personal contact details (emails, phone numbers). */
export function looksLikeContactDetails(text: string): boolean {
  return /@/.test(text) || /\d[\d\s\-()]{6,}\d/.test(text);
}

export const ListingInputSchema = z.object({
  mode, photos,
  exchangePreference: z.string().trim().max(200).refine(t => !looksLikeContactDetails(t), "Don't include contact details").default(""),
  title: z.string().trim().min(3, "Title needs at least 3 characters").max(80, "Keep the title under 80 characters").refine(t => !looksLikeContactDetails(t), "Don't include contact details"),
  category,
  quantity: z.coerce
    .number({ invalid_type_error: "Enter a number" })
    .positive("Quantity must be greater than 0")
    .max(10000, "Quantity looks too large"),
  unit,
  condition: z.enum(CONDITIONS),
  description: z
    .string()
    .trim()
    .max(400, "Keep the description under 400 characters")
    .refine((t) => !looksLikeContactDetails(t), "Please don't include emails or phone numbers"),
  area: z
    .string()
    .trim()
    .min(2, "Give a general area, e.g. 'Near the central library'")
    .max(60, "Keep the area short")
    .refine((t) => !looksLikeContactDetails(t), "Use a general area, not an exact address or contact"),
});
export type ListingInput = z.infer<typeof ListingInputSchema>;

export const NeedInputSchema = ListingInputSchema.omit({condition:true,photos:true});

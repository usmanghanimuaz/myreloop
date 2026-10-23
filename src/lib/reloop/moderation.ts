import { z } from "zod";

const CONTACT_PATTERN = /[^\s@]+@[^\s@]+\.[^\s@]+|(?:\+?\d[\s-]?){8,}/;
export const containsContactDetails = (s: string) => CONTACT_PATTERN.test(s);

const noContact = (s: string) => !containsContactDetails(s);

/** Public-safe profile: display name + general area only. */
export const ProfileInputSchema = z.object({
  displayName: z
    .string()
    .trim()
    .max(60, "Keep your display name under 60 characters.")
    .refine(noContact, "Don't include emails or phone numbers."),
  generalArea: z
    .string()
    .trim()
    .max(80, "Keep the area under 80 characters.")
    .refine(noContact, "Don't include emails or phone numbers.")
    .refine((s) => !/\d{1,5}\s+\w+\s+(street|st|road|rd|avenue|ave|lane|ln)\b/i.test(s), {
      message: "Use a general area (neighbourhood or city), not an exact address.",
    }),
});
export type ProfileInput = z.infer<typeof ProfileInputSchema>;

export const REPORT_REASONS = [
  "hazardous",
  "unsafe",
  "personal-info",
  "spam",
  "misleading",
  "other",
] as const;
export const REPORT_REASON_LABEL: Record<(typeof REPORT_REASONS)[number], string> = {
  hazardous: "Hazardous item offered for exchange",
  unsafe: "Unsafe item or handover",
  "personal-info": "Shares personal or contact details",
  spam: "Spam",
  misleading: "Misleading or false",
  other: "Something else",
};

export const ReportInputSchema = z.object({
  targetKind: z.enum(["listings", "needs", "fieldEvidence"]),
  targetId: z.string().min(1).max(100),
  reason: z.enum(REPORT_REASONS),
  details: z.string().trim().max(1000, "Keep details under 1000 characters."),
});
export type ReportInput = z.infer<typeof ReportInputSchema>;

/** A completed exchange requires the two-party confirmed status, never interest alone. */
export const isCompletedExchange = (status: string | undefined) => status === "completed";

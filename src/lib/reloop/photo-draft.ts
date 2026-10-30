import { z } from "zod";
import { CATEGORIES, isHazardousCategory } from "./types";
import { looksLikeContactDetails } from "./schema";

export const PhotoDraftInputSchema = z
  .object({
    path: z.string().min(1).max(250),
    lang: z.enum(["en", "ur", "hi", "ar", "es", "fr", "zh"]),
  })
  .strict();

// Small strict wire schema; enforce local limits after generation.
export const PhotoDraftOutputSchema = z
  .object({
    title: z.string(),
    category: z.enum(CATEGORIES),
    description: z.string(),
    suitable: z.boolean(),
  })
  .strict();
export type PhotoDraft = Pick<
  z.infer<typeof PhotoDraftOutputSchema>,
  "title" | "category" | "description"
>;

export function ownsDraftPhoto(path: string, userId: string) {
  return new RegExp(`^${userId}/[a-f0-9-]+\\.(jpg|png|webp)$`, "i").test(path);
}

export function normalizePhotoDraft(value: unknown): PhotoDraft | null {
  const parsed = PhotoDraftOutputSchema.safeParse(value);
  if (!parsed.success || !parsed.data.suitable || isHazardousCategory(parsed.data.category))
    return null;
  const { category } = parsed.data;
  const title = parsed.data.title.trim().slice(0, 80);
  const description = parsed.data.description.trim().slice(0, 400);
  if (title.length < 3 || looksLikeContactDetails(title + " " + description)) return null;
  return { title, category, description };
}

export function photoBytesMatch(bytes: Uint8Array, mime: string) {
  if (mime === "image/jpeg") return bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  if (mime === "image/png")
    return [137, 80, 78, 71, 13, 10, 26, 10].every((n, i) => bytes[i] === n);
  if (mime === "image/webp")
    return (
      String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
      String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
    );
  return false;
}

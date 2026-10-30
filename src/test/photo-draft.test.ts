import { describe, expect, it } from "vitest";
import { normalizePhotoDraft, ownsDraftPhoto, photoBytesMatch, PhotoDraftInputSchema } from "@/lib/reloop/photo-draft";

const output = { title: "Glass jar", category: "glass", description: "Transparent jar with a lid.", suitable: true };
describe("photo listing drafts", () => {
  it("only returns editable item fields, not quantity, condition, mode, location or impact", () => {
    expect(normalizePhotoDraft(output)).toEqual({ title: "Glass jar", category: "glass", description: "Transparent jar with a lid." });
    expect(normalizePhotoDraft({ ...output, quantity: 4, mode: "PAID", area: "Private address" })).toBeNull();
  });
  it.each(["batteries", "lamps", "paint", "medicines", "hygiene"])("rejects hazardous %s drafts", (category) => {
    expect(normalizePhotoDraft({ ...output, category })).toBeNull();
  });
  it("rejects unsuitable or unclear images", () => expect(normalizePhotoDraft({ ...output, suitable: false })).toBeNull());
  it("rejects contact details rather than copying them into a listing", () => {
    expect(normalizePhotoDraft({ ...output, description: "Call +923001234567" })).toBeNull();
    expect(normalizePhotoDraft({ ...output, title: "user@example.com" })).toBeNull();
  });
  it("clamps existing title and description limits", () => {
    const draft = normalizePhotoDraft({ ...output, title: "a".repeat(100), description: "b".repeat(500) });
    expect(draft?.title.length).toBe(80); expect(draft?.description.length).toBe(400);
  });
  it("only analyses a photo in the signed-in owner's folder", () => {
    const owner = "6a3efd86-997d-4216-90cc-0d8d17a60343";
    expect(ownsDraftPhoto(`${owner}/abcdef-1234.jpg`, owner)).toBe(true);
    expect(ownsDraftPhoto(`another-user/abcdef-1234.jpg`, owner)).toBe(false);
    expect(ownsDraftPhoto(`${owner}/../other.jpg`, owner)).toBe(false);
    expect(ownsDraftPhoto("https://example.com/photo.jpg", owner)).toBe(false);
  });
  it("rejects invalid languages and extra input fields", () => {
    expect(PhotoDraftInputSchema.safeParse({ path: "x", lang: "ur" }).success).toBe(true);
    expect(PhotoDraftInputSchema.safeParse({ path: "x", lang: "de" }).success).toBe(false);
    expect(PhotoDraftInputSchema.safeParse({ path: "x", lang: "en", userId: "other" }).success).toBe(false);
  });
  it("checks actual photo bytes and MIME before analysis", () => {
    expect(photoBytesMatch(new Uint8Array([255, 216, 255]), "image/jpeg")).toBe(true);
    expect(photoBytesMatch(new Uint8Array([255, 216, 255]), "image/png")).toBe(false);
    expect(photoBytesMatch(new Uint8Array([60, 115, 118, 103]), "image/svg+xml")).toBe(false);
  });
});
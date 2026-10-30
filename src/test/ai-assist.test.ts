import { describe, expect, it } from "vitest";
import {
  AiAssistInputSchema,
  aiItemProjection,
  eligibleAiListings,
  normalizeAiAssist,
} from "@/lib/reloop/ai-assist";
import type { Listing } from "@/lib/reloop/types";

const item: Listing = {
  id: "real",
  title: "Moving boxes",
  description: "Clean boxes",
  category: "cardboard",
  mode: "FREE",
  status: "available",
  quantity: 2,
  unit: "items",
  condition: "good",
  area: "Private street",
  ownerId: "private-owner",
  photos: ["private/photo"],
  origin: "user",
  createdAt: "2026-10-30",
  updatedAt: "2026-10-30",
};
describe("optional AI boundaries", () => {
  it("requires explicit consent", () => {
    expect(
      AiAssistInputSchema.safeParse({
        task: "match",
        query: "moving boxes",
        lang: "en",
        consent: false,
      }).success,
    ).toBe(false);
  });
  it("rejects client records and role claims", () => {
    expect(
      AiAssistInputSchema.safeParse({
        task: "safety",
        id: "real",
        kind: "listings",
        lang: "en",
        consent: true,
        admin: true,
      }).success,
    ).toBe(false);
  });
  it("allows only real available Free/Exchange and non-hazardous listings", () => {
    expect(
      eligibleAiListings([
        item,
        { ...item, id: "exchange", mode: "EXCHANGE" },
        { ...item, id: "closed", status: "closed" },
        { ...item, id: "sample", origin: "sample" },
        { ...item, id: "battery", category: "batteries" },
      ]).map((l) => l.id),
    ).toEqual(["real", "exchange"]);
  });
  it("does not send private identity, area, photos, notes or plans", () => {
    expect(aiItemProjection({ ...item, note: "private", plan: "private" } as Listing)).toEqual({
      id: "real",
      title: "Moving boxes",
      description: "Clean boxes",
      category: "cardboard",
      mode: "FREE",
    });
  });
  it("drops invented match and source identifiers", () => {
    expect(
      normalizeAiAssist(
        { title: "Matches", text: "Check item details", ids: ["real", "fake", "real"] },
        ["real"],
      )?.ids,
    ).toEqual(["real"]);
  });
  it("rejects contact-bearing AI responses", () => {
    expect(
      normalizeAiAssist({ title: "Contact", text: "Email test@example.com", ids: [] }, []),
    ).toBeNull();
  });
  it("allows an empty source description in read-only translation without inventing text", () => {
    expect(normalizeAiAssist({ title: "Glass jar", text: "", ids: [] }, [], true)).toEqual({
      title: "Glass jar",
      text: "",
      ids: [],
    });
    expect(
      normalizeAiAssist({ title: "Glass jar", text: "Email test@example.com", ids: [] }, [], true),
    ).toBeNull();
  });
  it("rejects personal contact input", () => {
    expect(
      AiAssistInputSchema.safeParse({
        task: "match",
        query: "Call +923001234567",
        lang: "en",
        consent: true,
      }).success,
    ).toBe(false);
  });
});

import { describe, expect, it } from "vitest";
import {
  ProfileInputSchema,
  ReportInputSchema,
  isCompletedExchange,
} from "@/lib/reloop/moderation";
import { ListingInputSchema } from "@/lib/reloop/schema";

describe("moderation rules", () => {
  it("rejects emails and phones in profiles", () => {
    expect(ProfileInputSchema.safeParse({ displayName: "a@b.com", generalArea: "" }).success).toBe(
      false,
    );
    expect(
      ProfileInputSchema.safeParse({ displayName: "Sam", generalArea: "+92 300 1234567" }).success,
    ).toBe(false);
  });
  it("rejects exact street addresses", () => {
    expect(
      ProfileInputSchema.safeParse({ displayName: "Sam", generalArea: "12 Mall Road" }).success,
    ).toBe(false);
    expect(
      ProfileInputSchema.safeParse({ displayName: "Sam", generalArea: "Gulberg, Lahore" }).success,
    ).toBe(true);
  });
  it("only accepts known report targets and reasons", () => {
    expect(
      ReportInputSchema.safeParse({
        targetKind: "profiles",
        targetId: "x",
        reason: "spam",
        details: "",
      }).success,
    ).toBe(false);
    expect(
      ReportInputSchema.safeParse({
        targetKind: "listings",
        targetId: "x",
        reason: "fake",
        details: "",
      }).success,
    ).toBe(false);
  });
  it("interest alone is not a completed exchange", () => {
    expect(isCompletedExchange("pending")).toBe(false);
    expect(isCompletedExchange("accepted")).toBe(false);
    expect(isCompletedExchange("handover")).toBe(false);
    expect(isCompletedExchange("completed")).toBe(true);
  });
  it("hazardous categories cannot be listed", () => {
    const shape = ListingInputSchema.shape.category;
    expect(shape.safeParse("batteries").success).toBe(false);
    expect(shape.safeParse("cardboard").success).toBe(true);
  });
});

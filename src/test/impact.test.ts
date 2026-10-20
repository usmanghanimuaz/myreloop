import { beforeEach, describe, expect, it } from "vitest";
import { createSeedState } from "@/lib/reloop/seed";
import { summarizeImpact } from "@/lib/reloop/impact";
import { getRecommendations } from "@/lib/reloop/guidance";
import { __test, actions } from "@/lib/reloop/store";

const input = { title: "Jars", category: "glass" as const, quantity: 5, unit: "items" as const, condition: "good" as const, description: "", area: "Town centre" };

describe("impact tracking", () => {
  beforeEach(() => __test.setState(createSeedState()));

  it("seed totals keep kg separate from items", () => {
    const s = summarizeImpact(__test.getState());
    expect(s.completed).toEqual({ kg: 9, items: 0, litres: 0 });
  });

  it("exchanging a listing twice counts it once", () => {
    const l = actions.createListing(input);
    actions.setListingStatus(l.id, "exchanged");
    actions.setListingStatus(l.id, "reserved");
    actions.setListingStatus(l.id, "exchanged");
    expect(summarizeImpact(__test.getState()).completedByOrigin.user.items).toBe(5);
  });

  it("planned entries are not counted as diverted until marked done", () => {
    actions.planFromFinder({ category: "paper", quantity: 2, unit: "kg", diversion: "recycle", note: "x" });
    let s = summarizeImpact(__test.getState());
    expect(s.completed.kg).toBe(9);
    expect(s.planned.kg).toBe(2);
    actions.markPlanCompleted(__test.getState().impact[0]!.id);
    s = summarizeImpact(__test.getState());
    expect(s.completed.kg).toBe(11);
  });

  it("reopening an action removes its recorded quantity", () => {
    actions.completeAction("s-a1", { category: "plastic", quantity: 4, unit: "kg", diversion: "recycle" });
    expect(summarizeImpact(__test.getState()).completed.kg).toBe(13);
    actions.reopenAction("s-a1");
    expect(summarizeImpact(__test.getState()).completed.kg).toBe(9);
  });

  it("sample listings cannot be deleted", () => {
    actions.deleteListing("s-l1");
    expect(__test.getState().listings.some((l) => l.id === "s-l1")).toBe(true);
  });
});

describe("guidance safety", () => {
  it("damaged electronics only get safety advice", () => {
    const r = getRecommendations({ category: "electronics", condition: "damaged", outcome: "repair", hazardous: false });
    expect(r.map((g) => g.kind)).toEqual(["safety"]);
  });
  it("hazardous items only get safety advice", () => {
    const r = getRecommendations({ category: "plastic", condition: "good", outcome: "reuse", hazardous: true });
    expect(r.map((g) => g.kind)).toEqual(["safety"]);
  });
});

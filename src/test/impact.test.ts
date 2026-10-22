import { beforeEach, describe, expect, it } from "vitest";
import { createSeedState } from "@/lib/reloop/seed";
import { summarizeImpact } from "@/lib/reloop/impact";
import { getRecommendations } from "@/lib/reloop/guidance";
import { createEngine } from "@/lib/reloop/engine";
let engine = createEngine(createSeedState());
const __test = { setState: (s: ReturnType<typeof createSeedState>) => { engine = createEngine(s); }, getState: () => engine.getState() };
const actions = new Proxy({} as ReturnType<typeof createEngine>["actions"], { get: (_, key) => engine.actions[key as keyof typeof engine.actions] });

const input = { mode: "FREE" as const, photos: [] as string[], exchangePreference:"", title: "Jars", category: "glass" as const, quantity: 5, unit: "items" as const, condition: "good" as const, description: "", area: "Town centre" };

describe("impact tracking", () => {
  beforeEach(() => __test.setState(createSeedState()));

  it("seed totals keep kg separate from items", () => {
    const s = summarizeImpact(__test.getState());
    expect(s.completed).toEqual({ kg: 0, items: 0, litres: 0 });
  });

  it("manual listing status cannot simulate an exchange", () => {
    const l = actions.createListing(input);
    expect(()=>actions.setListingStatus(l.id, "exchanged")).toThrow("participant handover");
    expect(summarizeImpact(__test.getState()).verified.items).toBe(0);
  });

  it("planned entries are not counted as diverted until marked done", () => {
    actions.planFromFinder({ category: "paper", quantity: 2, unit: "kg", diversion: "recycle", note: "x" });
    let s = summarizeImpact(__test.getState());
    expect(s.completed.kg).toBe(0);
    expect(s.planned.kg).toBe(2);
    const entry = __test.getState().impact[0];
    if (!entry) throw new Error("Missing plan");
    actions.markPlanCompleted(entry.id);
    s = summarizeImpact(__test.getState());
    expect(s.completed.kg).toBe(2);
  });

  it("reopening an action removes its recorded quantity", () => {
    actions.completeAction("s-a1", { category: "plastic", quantity: 4, unit: "kg", diversion: "recycle" });
    expect(summarizeImpact(__test.getState()).completed.kg).toBe(4);
    actions.reopenAction("s-a1");
    expect(summarizeImpact(__test.getState()).completed.kg).toBe(0);
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

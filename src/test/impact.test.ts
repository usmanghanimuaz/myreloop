import { beforeEach, describe, expect, it } from "vitest";
import { createSeedState } from "@/lib/reloop/seed";
import { summarizeImpact } from "@/lib/reloop/impact";
import { getRecommendations } from "@/lib/reloop/guidance";
import { createEngine } from "@/lib/reloop/engine";
import type { CommunityAction } from "@/lib/reloop/types";
let engine = createEngine(createSeedState());
const __test = {
  setState: (s: ReturnType<typeof createSeedState>) => {
    engine = createEngine(s);
  },
  getState: () => engine.getState(),
};
const actions = new Proxy({} as ReturnType<typeof createEngine>["actions"], {
  get: (_, key) => engine.actions[key as keyof typeof engine.actions],
});

const input = {
  mode: "FREE" as const,
  photos: [] as string[],
  exchangePreference: "",
  title: "Jars",
  category: "glass" as const,
  quantity: 5,
  unit: "items" as const,
  condition: "good" as const,
  description: "",
  area: "Town centre",
};

const userAction: CommunityAction = {
  id: "a-test",
  title: "Street cleanup",
  goal: "Clear litter from one street.",
  instructions: ["Bring gloves."],
  durationMinutes: 60,
  category: "plastic",
  status: "open",
  origin: "user",
};

describe("impact tracking", () => {
  beforeEach(() => __test.setState(createSeedState()));

  it("seed state starts empty — no fictional records are counted", () => {
    const state = __test.getState();
    expect(state.listings).toHaveLength(0);
    expect(state.needs).toHaveLength(0);
    expect(state.impact).toHaveLength(0);
    expect(state.activity).toHaveLength(0);
    const s = summarizeImpact(state);
    expect(s.completed).toEqual({ kg: 0, items: 0, litres: 0 });
    expect(s.verifiedExchanges).toBe(0);
  });

  it("manual listing status cannot simulate an exchange", () => {
    const l = actions.createListing(input);
    expect(() => actions.setListingStatus(l.id, "exchanged")).toThrow("participant handover");
    expect(summarizeImpact(__test.getState()).verified.items).toBe(0);
  });

  it("planned entries are not counted as diverted until marked done", () => {
    actions.planFromFinder({
      category: "paper",
      quantity: 2,
      unit: "kg",
      diversion: "recycle",
      note: "x",
    });
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
    __test.setState({ ...createSeedState(), actions: [userAction] });
    actions.completeAction("a-test", {
      category: "plastic",
      quantity: 4,
      unit: "kg",
      diversion: "recycle",
    });
    expect(summarizeImpact(__test.getState()).completed.kg).toBe(4);
    actions.reopenAction("a-test");
    expect(summarizeImpact(__test.getState()).completed.kg).toBe(0);
  });

  it("deleting a listing removes it together with its interest requests", () => {
    const l = actions.createListing(input);
    actions.sendInterest(l.id, "I can collect Saturday");
    expect(__test.getState().interests).toHaveLength(1);
    actions.deleteListing(l.id);
    expect(__test.getState().listings.some((x) => x.id === l.id)).toBe(false);
    expect(__test.getState().interests).toHaveLength(0);
  });
});

describe("guidance safety", () => {
  it("damaged electronics only get safety advice", () => {
    const r = getRecommendations({
      category: "electronics",
      condition: "damaged",
      outcome: "repair",
      hazardous: false,
    });
    expect(r.map((g) => g.kind)).toEqual(["safety"]);
  });
  it("hazardous items only get safety advice", () => {
    const r = getRecommendations({
      category: "plastic",
      condition: "good",
      outcome: "reuse",
      hazardous: true,
    });
    expect(r.map((g) => g.kind)).toEqual(["safety"]);
  });
});

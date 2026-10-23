import type { AppState } from "./types";

/**
 * Empty initial state. ReLoop shows only real community records — no fictional
 * sample listings, needs, actions or impact are seeded anywhere.
 */
export function createSeedState(): AppState {
  return {
    version: 1,
    listings: [],
    interests: [],
    actions: [],
    impact: [],
    needs: [],
    activity: [],
    evidence: {
      problem: "",
      community: "",
      date: "",
      method: "",
      interviewed: "",
      findings: "",
      limitations: "",
      howReloopHelps: "",
    },
  };
}

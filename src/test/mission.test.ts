import { describe, expect, it } from "vitest";
import { hasMissionDismissal, missionStorageKey } from "@/lib/reloop/mission";
describe("mission dismissal rules", () => {
  it("keeps guest dismissal separate from a signed-in account", () => {
    expect(missionStorageKey(null)).toBe("reloop-mission:v1:guest");
    expect(missionStorageKey("account-a")).not.toBe(missionStorageKey(null));
  });
  it("does not transfer dismissal between accounts", () => {
    expect(missionStorageKey("account-a")).not.toBe(missionStorageKey("account-b"));
  });
  it("only honors the explicit persisted preference", () => {
    expect(hasMissionDismissal(undefined)).toBe(false);
    expect(hasMissionDismissal("true")).toBe(false);
    expect(hasMissionDismissal(true)).toBe(true);
    expect(hasMissionDismissal({ role: "admin" })).toBe(false);
  });
});

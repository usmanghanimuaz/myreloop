import { describe, expect, it } from "vitest";
import { adminRecordSummary, isAdminAllowed } from "@/lib/reloop/admin-model";
import type { CloudRecord } from "@/lib/reloop/cloud-model";

describe("admin privacy and verified activity rules", () => {
  it("denies missing role, non-admin and failed role reads", () => {
    expect(isAdminAllowed({ data: false, error: null })).toBe(false);
    expect(isAdminAllowed({ data: null, error: null })).toBe(false);
    expect(isAdminAllowed({ data: true, error: "failure" })).toBe(false);
    expect(isAdminAllowed({ data: true, error: null })).toBe(true);
  });
  const row: CloudRecord = {
    key: "impact:handover:r1",
    kind: "impact",
    owner_id: "owner",
    revision: 1,
    sample: false,
    data: {
      id: "handover-r1",
      source: "exchange",
      sourceId: "listing",
      category: "glass",
      quantity: 5,
      unit: "items",
      diversion: "reuse",
      completed: true,
      note: "",
      createdAt: "2026-10-24",
      origin: "user",
    },
  };
  it("excludes all sample activity from admin counts", () => {
    expect(adminRecordSummary([{ ...row, sample: true }]).verifiedExchanges).toBe(0);
  });
  it("counts genuine service-key handovers once with their recorded units", () => {
    const summary = adminRecordSummary([row, row]);
    expect(summary.verifiedExchanges).toBe(1);
    expect(summary.verified.items).toBe(5);
    expect(summary.verified.kg).toBe(0);
  });
  it("never counts an editable verified flag as a confirmed handover", () => {
    expect(adminRecordSummary([{ ...row, key: "impact:ordinary" }]).verifiedExchanges).toBe(0);
  });
  it("returns only item review fields and handover metadata, never private notes or plans", () => {
    const record = (kind: string, data: CloudRecord["data"]): CloudRecord => ({
      key: `${kind}:test`, kind, data, owner_id: "owner", sample: false, revision: 1,
    });
    const item = {
      id: "item", title: "Reusable jars", description: "Clean jars", category: "glass",
      quantity: 5, unit: "items", mode: "FREE", area: "Town centre", status: "available",
      condition: "good", photos: ["owner/photo.jpg"], exchangePreference: "private preference",
      createdAt: "2026-10-24", updatedAt: "2026-10-24", origin: "user",
    };
    const summary = adminRecordSummary([
      record("listings", item),
      record("needs", { ...item, id: "need", status: "open" }),
      record("interests", {
        id: "request", listingId: "item", note: "PRIVATE PARTICIPANT NOTE",
        status: "accepted", confirmedBy: "owner", targetKind: "listings",
        quantity: 5, unit: "items", createdAt: "2026-10-24", origin: "user",
      }),
      { ...row, data: { ...(row.data as Record<string, string | number | boolean>), note: "PRIVATE IMPACT NOTE" } },
      record("impact", {
        id: "plan", source: "finder", sourceId: "plan", category: "glass", quantity: 2,
        unit: "items", diversion: "reuse", completed: false, note: "PRIVATE PLAN",
        createdAt: "2026-10-24", origin: "user",
      }),
      record("evidence", {
        problem: "PRIVATE OBSERVATION", community: "", date: "", method: "",
        interviewed: "", findings: "", limitations: "", howReloopHelps: "",
      }),
    ]);
    expect(Object.keys(summary.state).sort()).toEqual(["interests", "listings", "needs"]);
    expect(Object.keys(summary.state.listings[0] ?? {}).sort()).toEqual([
      "area", "category", "createdAt", "description", "id", "mode", "ownerId", "quantity", "status", "title", "unit",
    ]);
    expect(Object.keys(summary.state.needs[0] ?? {}).sort()).toEqual(Object.keys(summary.state.listings[0] ?? {}).sort());
    expect(summary.state.interests[0]).toEqual({
      id: "request", listingId: "item", ownerId: "owner", status: "accepted",
      createdAt: "2026-10-24", quantity: 5, unit: "items",
    });
    expect(summary.state.listings[0]).toMatchObject({ id: "item", ownerId: "owner", status: "available", description: "Clean jars" });
    expect(summary.state.needs[0]).toMatchObject({ id: "need", ownerId: "owner", status: "open" });
    for (const secret of ["PRIVATE PARTICIPANT NOTE", "PRIVATE IMPACT NOTE", "PRIVATE PLAN", "PRIVATE OBSERVATION", "owner/photo.jpg", "private preference"])
      expect(JSON.stringify(summary)).not.toContain(secret);
    expect(summary.verifiedExchanges).toBe(1);
    expect(summary.verified.items).toBe(5);
  });
});

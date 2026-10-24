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
  const row: CloudRecord = { key: "impact:handover:r1", kind: "impact", owner_id: "owner", revision: 1, sample: false, data: { id: "handover-r1", source: "exchange", sourceId: "listing", category: "glass", quantity: 5, unit: "items", diversion: "reuse", completed: true, note: "", createdAt: "2026-10-24", origin: "user" } };
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
});
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { kinds, recordsToState, stateRecords, type CloudRecord } from "@/lib/reloop/cloud-model";

describe("field-evidence record kind", () => {
  it("widens the database constraint to all existing kinds plus fieldEvidence only", () => {
    const sql = readFileSync(
      "drizzle/migrations/0012_allow_field_evidence_record_kind.sql",
      "utf8",
    );
    const check = sql.match(/CHECK\s*\(kind IN\s*\(([^)]+)\)\)/);
    const allowed = [...(check?.[1] ?? "").matchAll(/'([^']+)'/g)].map((match) => match[1]);
    expect(allowed).toEqual([
      "listings",
      "interests",
      "actions",
      "impact",
      "needs",
      "activity",
      "evidence",
      "fieldEvidence",
    ]);
    expect(allowed).toEqual([...kinds]);
    expect(allowed).not.toContain("unknown-kind");
  });

  it("round-trips an existing unvalidated field-evidence record without changing its kind", () => {
    const record: CloudRecord = {
      key: "fieldEvidence:evidence-test",
      kind: "fieldEvidence",
      owner_id: "member-test",
      sample: false,
      revision: 1,
      data: {
        id: "evidence-test",
        kind: "video-link",
        title: "Reusable materials",
        description: "Materials documented for review",
        area: "General area",
        date: "2026-10-24",
        externalUrl: "https://example.org/evidence",
        consent: true,
        validated: false,
        createdAt: "2026-10-24T00:00:00Z",
        origin: "user",
      },
    };
    const state = recordsToState([record]);
    expect(state.fieldEvidence).toHaveLength(1);
    expect(state.fieldEvidence[0]?.validated).toBe(false);
    expect(stateRecords(state, "member-test").get(record.key)?.kind).toBe("fieldEvidence");
  });
});

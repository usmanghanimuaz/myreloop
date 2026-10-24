import type { CloudRecord } from "./cloud-model";
import { recordsToState } from "./cloud-model";
import { summarizeImpact } from "./impact";

/** Sample rows and editable verification flags never contribute to admin analytics. */
export function adminRecordSummary(records: CloudRecord[]) {
  const state = recordsToState(records.filter((row) => !row.sample));
  const impact = summarizeImpact(state);
  return { state, verifiedExchanges: impact.verifiedExchanges, verified: impact.verified };
}

export function isAdminAllowed(roleResult: { data: unknown; error: unknown }) {
  return roleResult.error == null && roleResult.data === true;
}
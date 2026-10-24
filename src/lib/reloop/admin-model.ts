import type { CloudRecord } from "./cloud-model";
import { recordsToState } from "./cloud-model";
import { summarizeImpact } from "./impact";
import type { AppState } from "./types";

/** Explicit screen DTOs: public item details and handover metadata, never participant notes. */
export interface AdminRecordDTO {
  listings: Pick<
    AppState["listings"][number],
    | "id"
    | "title"
    | "description"
    | "category"
    | "quantity"
    | "unit"
    | "mode"
    | "area"
    | "status"
    | "createdAt"
    | "ownerId"
  >[];
  needs: Pick<
    AppState["needs"][number],
    | "id"
    | "title"
    | "description"
    | "category"
    | "quantity"
    | "unit"
    | "mode"
    | "area"
    | "status"
    | "createdAt"
    | "ownerId"
  >[];
  interests: Pick<
    AppState["interests"][number],
    "id" | "listingId" | "ownerId" | "status" | "createdAt" | "quantity" | "unit"
  >[];
}

/** Reconstructed records remain local; only allowlisted screen fields and verified totals leave. */
export function adminRecordSummary(records: CloudRecord[]) {
  const state = recordsToState(records.filter((row) => !row.sample));
  const impact = summarizeImpact(state);
  const item = (row: AdminRecordDTO["needs"][number]) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    quantity: row.quantity,
    unit: row.unit,
    mode: row.mode,
    area: row.area,
    status: row.status,
    createdAt: row.createdAt,
    ownerId: row.ownerId,
  });
  const adminState: AdminRecordDTO = {
    listings: state.listings.map((row) => ({ ...item(row), title: row.title, status: row.status })),
    needs: state.needs.map(item),
    interests: state.interests.map((row) => ({
      id: row.id,
      listingId: row.listingId,
      ownerId: row.ownerId,
      status: row.status,
      createdAt: row.createdAt,
      quantity: row.quantity,
      unit: row.unit,
    })),
  };
  return {
    state: adminState,
    verifiedExchanges: impact.verifiedExchanges,
    verified: impact.verified,
  };
}

export function isAdminAllowed(roleResult: { data: unknown; error: unknown }) {
  return roleResult.error == null && roleResult.data === true;
}

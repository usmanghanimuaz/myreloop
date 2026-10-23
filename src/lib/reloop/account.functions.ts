import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { AccountInputSchema, ReportInputSchema, TERMS_VERSION } from "./moderation";

/** Own profile only — RLS limits reads/writes to the signed-in user. */
export const getMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const [{ data, error }, { data: isAdmin }, { data: restriction }] = await Promise.all([
      context.supabase
        .from("profiles")
        .select(
          "display_name, general_area, first_name, last_name, phone, notify_requests, notify_updates, terms_version, terms_accepted_at",
        )
        .eq("id", context.userId)
        .maybeSingle(),
      context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" }),
      context.supabase
        .from("member_restrictions")
        .select("reason")
        .eq("user_id", context.userId)
        .maybeSingle(),
    ]);
    if (error) throw new Error("Could not load your profile.");
    return {
      displayName: data?.display_name ?? "",
      generalArea: data?.general_area ?? "",
      firstName: data?.first_name ?? "",
      lastName: data?.last_name ?? "",
      phone: data?.phone ?? "",
      notifyRequests: data?.notify_requests ?? true,
      notifyUpdates: data?.notify_updates ?? true,
      termsAccepted: !!data?.terms_accepted_at && data.terms_version === TERMS_VERSION,
      termsAcceptedAt: data?.terms_accepted_at ?? null,
      restricted: !!restriction,
      isAdmin: isAdmin === true,
    };
  });

export const saveMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => AccountInputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("profiles").upsert({
      id: context.userId,
      display_name: data.displayName,
      general_area: data.generalArea,
      first_name: data.firstName,
      last_name: data.lastName,
      phone: data.phone,
      notify_requests: data.notifyRequests,
      notify_updates: data.notifyUpdates,
      updated_at: new Date().toISOString(),
    });
    if (error) throw new Error("Could not save your profile.");
    return { ok: true };
  });

/** Records acceptance of the current Terms/Privacy version for the signed-in user. */
export const acceptTerms = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { error } = await context.supabase.from("profiles").upsert({
      id: context.userId,
      terms_version: TERMS_VERSION,
      terms_accepted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    if (error) throw new Error("Could not record your acceptance.");
    return { ok: true };
  });

export const fileReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ReportInputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("reports").insert({
      reporter_id: context.userId,
      target_kind: data.targetKind,
      target_id: data.targetId,
      reason: data.reason,
      details: data.details,
    });
    if (error) throw new Error("Could not send the report.");
    return { ok: true };
  });

/** Admin data: every call is re-checked in the database (has_role inside RPC/RLS). */
export const getModerationQueue = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (isAdmin !== true)
      return { allowed: false as const, evidence: [] as never[], reports: [] as never[] };
    const [ev, rep] = await Promise.all([
      context.supabase.rpc("reloop_admin_pending_evidence"),
      context.supabase
        .from("reports")
        .select("id, target_kind, target_id, reason, details, status, created_at")
        .order("created_at", { ascending: false })
        .limit(200),
    ]);
    if (ev.error || rep.error) throw new Error("Could not load the moderation queue.");
    return {
      allowed: true as const,
      evidence: (ev.data ?? []).map((r) => {
        const d = (r.data ?? {}) as Record<string, unknown>;
        const str = (k: string) => (typeof d[k] === "string" ? (d[k] as string) : "");
        return {
          key: r.key,
          title: str("title"),
          description: str("description"),
          area: str("area"),
          date: str("date"),
          consent: d["consent"] === true,
          rejected: d["rejected"] === true,
        };
      }),
      reports: rep.data ?? [],
    };
  });

export const moderateEvidence = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ key: z.string().min(1).max(200), approve: z.boolean() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.rpc("reloop_admin_validate_evidence", {
      evidence_key: data.key,
      approve: data.approve,
    });
    if (error) throw new Error("Not allowed or failed.");
    return { ok: true };
  });

export const reviewReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        decision: z.enum(["reviewed", "dismissed"]),
        note: z.string().trim().max(500).default(""),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.rpc("reloop_admin_review_report", {
      report_id: data.id,
      decision: data.decision,
      note: data.note,
    });
    if (error) throw new Error("Not allowed or failed.");
    return { ok: true };
  });

export const closeReportedRecord = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        targetKind: z.enum(["listings", "needs"]),
        targetId: z.string().min(1).max(100),
        note: z.string().trim().max(500).default(""),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.rpc("reloop_admin_close_record", {
      target_kind: data.targetKind,
      target_id: data.targetId,
      note: data.note,
    });
    if (error) throw new Error("Not allowed or failed.");
    return { ok: true };
  });

/** Restrict/unrestrict posting for the owner of a reported item. Admin-checked in the database. */
export const setMemberRestriction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        targetKind: z.enum(["listings", "needs", "fieldEvidence"]),
        targetId: z.string().min(1).max(200),
        restrict: z.boolean(),
        reason: z.string().trim().max(300).default(""),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: owner, error: e1 } = await context.supabase.rpc("reloop_admin_target_owner", {
      target_kind: data.targetKind,
      target_id: data.targetId,
    });
    if (e1) throw new Error("Not allowed or failed.");
    if (!owner) throw new Error("The owner of this item could not be found.");
    const { error } = await context.supabase.rpc("reloop_admin_set_restriction", {
      member: owner,
      restrict: data.restrict,
      reason: data.reason,
    });
    if (error)
      throw new Error(
        error.message.includes("yourself")
          ? "You cannot restrict yourself."
          : "Not allowed or failed.",
      );
    return { ok: true };
  });

export const getModerationLog = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("moderation_log")
      .select("id, action, target_kind, target_id, note, created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error("Could not load the log.");
    return data ?? [];
  });

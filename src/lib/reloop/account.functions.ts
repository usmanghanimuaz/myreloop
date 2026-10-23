import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { ProfileInputSchema, ReportInputSchema } from "./moderation";

/** Own profile only — RLS limits reads/writes to the signed-in user. */
export const getMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("profiles")
      .select("display_name, general_area")
      .eq("id", context.userId)
      .maybeSingle();
    if (error) throw new Error("Could not load your profile.");
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    return {
      displayName: data?.display_name ?? "",
      generalArea: data?.general_area ?? "",
      isAdmin: isAdmin === true,
    };
  });

export const saveMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ProfileInputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("profiles").upsert({
      id: context.userId,
      display_name: data.displayName,
      general_area: data.generalArea,
      updated_at: new Date().toISOString(),
    });
    if (error) throw new Error("Could not save your profile.");
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
    if (isAdmin !== true) return { allowed: false as const, evidence: [], reports: [] };
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
      evidence: (ev.data ?? []).map((r) => ({
        key: r.key,
        data: r.data as Record<string, unknown>,
      })),
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
    z.object({ id: z.string().uuid(), decision: z.enum(["reviewed", "dismissed"]) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.rpc("reloop_admin_review_report", {
      report_id: data.id,
      decision: data.decision,
    });
    if (error) throw new Error("Not allowed or failed.");
    return { ok: true };
  });

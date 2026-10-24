import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { adminRecordSummary, isAdminAllowed } from "./admin-model";

/** Role-checked reads; adminRecordSummary allowlists screen fields before serialization. */
export const getAdminConsole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const role = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdminAllowed(role)) return { allowed: false as const };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [members, records, reports, restrictions, log, support] = await Promise.all([
      supabaseAdmin
        .from("profiles")
        .select("id, display_name, general_area, created_at", { count: "exact" })
        .order("created_at", { ascending: false })
        .limit(1000),
      supabaseAdmin
        .from("reloop_records")
        .select("key, kind, owner_id, sample, data, revision", { count: "exact" })
        .eq("sample", false)
        .order("key")
        .limit(2000),
      context.supabase
        .from("reports")
        .select("id, target_kind, target_id, reason, details, status, created_at, reviewed_at", {
          count: "exact",
        })
        .order("created_at", { ascending: false })
        .limit(1000),
      context.supabase.from("member_restrictions").select("user_id"),
      context.supabase
        .from("moderation_log")
        .select("id, actor_id, action, target_kind, target_id, note, created_at")
        .order("created_at", { ascending: false })
        .limit(100),
      supabaseAdmin
        .from("contact_messages")
        .select("id, kind, name, subject, message, created_at", { count: "exact" })
        .order("created_at", { ascending: false })
        .limit(200),
    ]);
    if ([members, records, reports, restrictions, log, support].some((r) => r.error))
      throw new Error("Could not load the admin console.");
    const summary = adminRecordSummary(records.data ?? []);
    return {
      allowed: true as const,
      members: members.data ?? [],
      memberCount: members.count ?? 0,
      ...summary,
      recordCount: records.count ?? 0,
      reports: reports.data ?? [],
      reportCount: reports.count ?? 0,
      restrictions: restrictions.data ?? [],
      log: log.data ?? [],
      support: support.data ?? [],
      supportCount: support.count ?? 0,
      truncated:
        (records.count ?? 0) > 2000 ||
        (members.count ?? 0) > 1000 ||
        (reports.count ?? 0) > 1000 ||
        (support.count ?? 0) > 200,
    };
  });

/** Existing database RPC enforces admin authorization, prevents self-restriction and logs the action. */
export const moderateMember = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        restrict: z.boolean(),
        reason: z.string().trim().min(3).max(300),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase.rpc("reloop_admin_set_restriction", {
      member: data.id,
      restrict: data.restrict,
      reason: data.reason,
    });
    if (error) throw new Error("Not allowed or action failed.");
    return { ok: true };
  });

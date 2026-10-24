import { createServerFn } from "@tanstack/react-start";
import { hasMissionDismissal } from "./mission";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Owner-only RLS preference. No admin client, input identity or role changes. */
export const readMissionDismissal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("reloop_mission_preference", {
      dismiss: false,
    });
    if (error) throw new Error("Could not read preference.");
    return { dismissed: hasMissionDismissal(data) };
  });
export const dismissMission = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("reloop_mission_preference", {
      dismiss: true,
    });
    if (error || data !== true) throw new Error("Could not sync preference.");
    return { dismissed: true };
  });

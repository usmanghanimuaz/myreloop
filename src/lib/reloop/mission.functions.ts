import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { hasMissionDismissal, MISSION_META_KEY } from "./mission";

/** Auth-owned private preference; no schema, public data, privileges or roles changed. */
export const readMissionDismissal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.auth.getUser();
    if (error || data.user?.id !== context.userId) throw new Error("Could not read preference.");
    return { dismissed: hasMissionDismissal(data.user.user_metadata) };
  });

export const dismissMission = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { error } = await context.supabase.auth.updateUser({
      data: { [MISSION_META_KEY]: true },
    });
    if (error) throw new Error("Could not sync preference.");
    return { dismissed: true };
  });

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const TokenSchema = z.object({ token: z.string().min(20).max(4096) });

export const registerPushToken = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => TokenSchema.parse(input))
  .handler(async ({ data, context }) => {
    // A device token belongs to whoever is signed in on it now.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("push_tokens")
      .upsert({ token: data.token, user_id: context.userId, created_at: new Date().toISOString() });
    if (error) throw new Error("Could not turn on notifications.");
    return { ok: true };
  });

export const unregisterPushTokens = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { error } = await context.supabase
      .from("push_tokens")
      .delete()
      .eq("user_id", context.userId);
    if (error) throw new Error("Could not turn off notifications.");
    return { ok: true };
  });

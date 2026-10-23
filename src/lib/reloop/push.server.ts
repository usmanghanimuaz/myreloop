// Server-only: sends a push notification to every registered device of one user.
// Failures never block the user's action; stale tokens are removed.
const GATEWAY_URL = "https://connector-gateway.lovable.dev/firebase_messaging";

export async function notifyUser(userId: string, title: string, body: string, path = "/account") {
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const connKey = process.env["FIREBASE_MESSAGING_API_KEY"];
  if (!lovableKey || !connKey) return;
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: tokens } = await supabaseAdmin
      .from("push_tokens")
      .select("token")
      .eq("user_id", userId);
    for (const { token } of tokens ?? []) {
      const res = await fetch(`${GATEWAY_URL}/v1/projects/_/messages:send`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${lovableKey}`,
          "X-Connection-Api-Key": connKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: {
            token,
            notification: { title, body },
            data: { path },
            webpush: { fcm_options: { link: path } },
          },
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        console.error(`Push send failed [${res.status}]: ${text}`);
        if (res.status === 404 || (res.status === 400 && text.includes("INVALID_ARGUMENT")))
          await supabaseAdmin.from("push_tokens").delete().eq("token", token);
      }
    }
  } catch (e) {
    console.error("Push notify error", e);
  }
}

import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { BellRing } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { registerPushToken, unregisterPushTokens } from "@/lib/reloop/push.functions";

const MESSAGES: Record<string, string> = {
  "open-in-new-tab": "Open ReLoop in its own browser tab (or the published app) to allow notifications.",
  denied: "Notifications are blocked. Allow them for this site in your browser's site settings.",
  "not-configured": "Notifications aren't set up yet.",
  unsupported: "This browser doesn't support web notifications.",
};

export function PushToggle() {
  const register = useServerFn(registerPushToken);
  const unregister = useServerFn(unregisterPushTokens);
  const [busy, setBusy] = useState(false);

  const on = async () => {
    setBusy(true);
    try {
      const { enablePush } = await import("@/lib/reloop/push-client");
      const r = await enablePush();
      if (r.status === "registered") {
        await register({ data: { token: r.token } });
        toast.success("Notifications on for this device.");
      } else toast.error(MESSAGES[r.status]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not turn on notifications.");
    } finally {
      setBusy(false);
    }
  };
  const off = async () => {
    setBusy(true);
    try {
      await unregister();
      toast.success("Notifications turned off on all your devices.");
    } catch {
      toast.error("Could not turn off notifications.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section aria-labelledby="push-h" className="rounded-xl border bg-card p-5">
      <h2 id="push-h" className="flex items-center gap-2 text-lg font-semibold">
        <BellRing className="size-5" aria-hidden /> Notifications
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Get an alert when someone requests your item, offers for your need, or responds to your
        request. Only the event is sent — no contact details.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button onClick={on} disabled={busy}>Turn on for this device</Button>
        <Button variant="outline" onClick={off} disabled={busy}>Turn off</Button>
      </div>
    </section>
  );
}

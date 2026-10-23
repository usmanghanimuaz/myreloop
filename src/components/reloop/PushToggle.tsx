import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { BellRing } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useDashT } from "@/lib/i18n-dash";
import { registerPushToken, unregisterPushTokens } from "@/lib/reloop/push.functions";

export function PushToggle() {
  const register = useServerFn(registerPushToken);
  const unregister = useServerFn(unregisterPushTokens);
  const [busy, setBusy] = useState(false);
  const t = useDashT();

  const on = async () => {
    setBusy(true);
    try {
      const { enablePush } = await import("@/lib/reloop/push-client");
      const r = await enablePush();
      if (r.status === "registered") {
        await register({ data: { token: r.token } });
        toast.success(t("push.onOk"));
      } else toast.error(t(`push.${r.status}`));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("push.onErr"));
    } finally {
      setBusy(false);
    }
  };
  const off = async () => {
    setBusy(true);
    try {
      await unregister();
      toast.success(t("push.offOk"));
    } catch {
      toast.error(t("push.offErr"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section aria-labelledby="push-h" className="rounded-xl border bg-card p-5">
      <h2 id="push-h" className="flex items-center gap-2 text-lg font-semibold">
        <BellRing className="size-5" aria-hidden /> {t("push.title")}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">{t("push.desc")}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button onClick={on} disabled={busy}>
          {t("push.on")}
        </Button>
        <Button variant="outline" onClick={off} disabled={busy}>
          {t("push.off")}
        </Button>
      </div>
    </section>
  );
}

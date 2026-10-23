import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AccountButton } from "@/components/reloop/AccountButton";
import { Card, PageHeader, formatDate } from "@/components/reloop/shared";
import { getModerationQueue, moderateEvidence, reviewReport } from "@/lib/reloop/account.functions";
import { useStoreMeta } from "@/lib/reloop/store";
import { useDashT } from "@/lib/i18n-dash";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Moderation — ReLoop" },
      {
        name: "description",
        content: "ReLoop moderation for evidence review and reports. Admins only.",
      },
      { property: "og:title", content: "Moderation — ReLoop" },
      { property: "og:description", content: "Admins only." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: Admin,
});

function Admin() {
  const { userId, hydrated } = useStoreMeta();
  const t = useDashT();
  if (!hydrated) return <p className="p-8 text-muted-foreground">{t("loading")}</p>;
  if (!userId)
    return (
      <Card className="max-w-md">
        <p className="mb-4 text-sm">{t("mod.signIn")}</p>
        <AccountButton />
      </Card>
    );
  return <Queue />;
}

function Queue() {
  const load = useServerFn(getModerationQueue);
  const validate = useServerFn(moderateEvidence);
  const review = useServerFn(reviewReport);
  const qc = useQueryClient();
  const t = useDashT();
  const q = useQuery({ queryKey: ["reloop-account", "moderation"], queryFn: () => load() });
  const act = async (fn: () => Promise<unknown>, ok: string) => {
    try {
      await fn();
      toast.success(ok);
      await qc.invalidateQueries({ queryKey: ["reloop-account"] });
      await qc.invalidateQueries({ queryKey: ["reloop-public"] });
    } catch {
      toast.error(t("mod.failed"));
    }
  };
  if (q.isLoading) return <p className="p-8 text-muted-foreground">{t("mod.loading")}</p>;
  if (q.isError)
    return (
      <p role="alert" className="p-8 text-destructive">
        {t("mod.loadError")}
      </p>
    );
  if (!q.data?.allowed)
    return (
      <Card className="max-w-lg">
        <p className="flex items-center gap-2 font-semibold">
          <ShieldAlert className="size-5" aria-hidden /> {t("mod.denied")}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("mod.deniedDesc")}
        </p>
      </Card>
    );
  const open = q.data.reports.filter((r) => r.status === "open");
  return (
    <div className="animate-rise space-y-8">
      <PageHeader
        eyebrow={t("mod.eyebrow")}
        title={t("mod.title")}
        description={t("mod.desc")}
      />
      <section>
        <h2 className="mb-3 text-xl font-semibold">
          {t("mod.evidence")} ({q.data.evidence.length})
        </h2>
        {q.data.evidence.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("mod.evidenceEmpty")}</p>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {q.data.evidence.map(({ key, ...data }) => (
              <li key={key} className="rounded-xl border bg-background p-4 text-sm">
                <p className="font-semibold">{data.title}</p>
                <p className="mt-1 text-muted-foreground">{data.description}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {data.area} · {data.date} · {data.consent ? t("mod.consentGiven") : t("mod.consentMissing")}
                  {data.rejected ? ` · ${t("mod.prevRejected")}` : ""}
                </p>
                <div className="mt-3 flex gap-2">
                  <Button
                    size="sm"
                    onClick={() =>
                      void act(() => validate({ data: { key, approve: true } }), t("mod.published"))
                    }
                  >
{t("mod.approve")}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      void act(() => validate({ data: { key, approve: false } }), t("mod.rejected"))
                    }
                  >
                    {t("mod.reject")}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section>
        <h2 className="mb-3 text-xl font-semibold">{t("mod.reports")} ({open.length})</h2>
        {open.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("mod.reportsEmpty")}</p>
        ) : (
          <ul className="grid gap-3">
            {open.map((r) => (
              <li key={r.id} className="rounded-xl border bg-background p-4 text-sm">
                <p className="font-semibold">
                  {t(`r.${r.reason}`)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t(`k.${r.target_kind}`)} · {r.target_id} · {formatDate(r.created_at)}
                </p>
                {r.details && <p className="mt-2">{r.details}</p>}
                <div className="mt-3 flex gap-2">
                  <Button
                    size="sm"
                    onClick={() =>
                      void act(
                        () => review({ data: { id: r.id, decision: "reviewed" } }),
                        t("mod.reviewed"),
                      )
                    }
                  >
{t("mod.markReviewed")}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      void act(
                        () => review({ data: { id: r.id, decision: "dismissed" } }),
                        t("mod.dismissed"),
                      )
                    }
                  >
                    {t("mod.dismiss")}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

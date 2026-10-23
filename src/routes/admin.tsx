import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AccountButton } from "@/components/reloop/AccountButton";
import { Card, PageHeader, formatDate } from "@/components/reloop/shared";
import {
  closeReportedRecord,
  getModerationLog,
  getModerationQueue,
  moderateEvidence,
  reviewReport,
  setMemberRestriction,
} from "@/lib/reloop/account.functions";
import { useState } from "react";
import { Input } from "@/components/ui/input";
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
  const close = useServerFn(closeReportedRecord);
  const restrict = useServerFn(setMemberRestriction);
  const loadLog = useServerFn(getModerationLog);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const qc = useQueryClient();
  const t = useDashT();
  const q = useQuery({ queryKey: ["reloop-account", "moderation"], queryFn: () => load() });
  const log = useQuery({
    queryKey: ["reloop-account", "moderation-log"],
    queryFn: () => loadLog(),
    enabled: q.data?.allowed === true,
  });
  const act = async (fn: () => Promise<unknown>, ok: string) => {
    try {
      await fn();
      toast.success(ok);
      await qc.invalidateQueries({ queryKey: ["reloop-account"] });
      await qc.invalidateQueries({ queryKey: ["reloop-public"] });
    } catch (e) {
      toast.error(e instanceof Error && e.message ? e.message : t("mod.failed"));
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
        <p className="mt-2 text-sm text-muted-foreground">{t("mod.deniedDesc")}</p>
      </Card>
    );
  const open = q.data.reports.filter((r) => r.status === "open");
  return (
    <div className="animate-rise space-y-8">
      <PageHeader eyebrow={t("mod.eyebrow")} title={t("mod.title")} description={t("mod.desc")} />
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
                  {data.area} · {data.date} ·{" "}
                  {data.consent ? t("mod.consentGiven") : t("mod.consentMissing")}
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
        <h2 className="mb-3 text-xl font-semibold">
          {t("mod.reports")} ({open.length})
        </h2>
        {open.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("mod.reportsEmpty")}</p>
        ) : (
          <ul className="grid gap-3">
            {open.map((r) => (
              <li key={r.id} className="rounded-xl border bg-background p-4 text-sm">
                <p className="font-semibold">{t(`r.${r.reason}`)}</p>
                <p className="text-xs text-muted-foreground">
                  {t(`k.${r.target_kind}`)} · {r.target_id} · {formatDate(r.created_at)}
                </p>
                {r.details && <p className="mt-2">{r.details}</p>}
                <Input
                  aria-label={t("mod.note")}
                  placeholder={t("mod.note")}
                  maxLength={500}
                  className="mt-3"
                  value={notes[r.id] ?? ""}
                  onChange={(e) => setNotes({ ...notes, [r.id]: e.target.value })}
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    onClick={() =>
                      void act(
                        () =>
                          review({
                            data: { id: r.id, decision: "reviewed", note: notes[r.id] ?? "" },
                          }),
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
                        () =>
                          review({
                            data: { id: r.id, decision: "dismissed", note: notes[r.id] ?? "" },
                          }),
                        t("mod.dismissed"),
                      )
                    }
                  >
                    {t("mod.dismiss")}
                  </Button>
                  {(r.target_kind === "listings" || r.target_kind === "needs") && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        void act(
                          () =>
                            close({
                              data: {
                                targetKind: r.target_kind as "listings" | "needs",
                                targetId: r.target_id,
                                note: notes[r.id] ?? "",
                              },
                            }),
                          t("mod.closed"),
                        )
                      }
                    >
                      {t("mod.closeItem")}
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() =>
                      void act(
                        () =>
                          restrict({
                            data: {
                              targetKind: r.target_kind as "listings" | "needs" | "fieldEvidence",
                              targetId: r.target_id,
                              restrict: true,
                              reason: notes[r.id] ?? "",
                            },
                          }),
                        t("mod.restrictedOk"),
                      )
                    }
                  >
                    {t("mod.restrict")}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      void act(
                        () =>
                          restrict({
                            data: {
                              targetKind: r.target_kind as "listings" | "needs" | "fieldEvidence",
                              targetId: r.target_id,
                              restrict: false,
                              reason: notes[r.id] ?? "",
                            },
                          }),
                        t("mod.unrestrictedOk"),
                      )
                    }
                  >
                    {t("mod.unrestrict")}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section>
        <h2 className="mb-3 text-xl font-semibold">{t("mod.log")}</h2>
        {log.isLoading ? (
          <p className="text-sm text-muted-foreground">{t("loading")}</p>
        ) : !log.data?.length ? (
          <p className="text-sm text-muted-foreground">{t("mod.logEmpty")}</p>
        ) : (
          <ul className="divide-y rounded-xl border bg-background text-sm">
            {log.data.map((l) => (
              <li key={l.id} className="flex flex-wrap gap-x-3 gap-y-1 p-3">
                <span className="font-medium">{l.action.replace(/_/g, " ")}</span>
                <span className="text-muted-foreground">
                  {l.target_kind} · {l.target_id.slice(0, 24)}
                </span>
                <span className="text-muted-foreground">{formatDate(l.created_at)}</span>
                {l.note && <span className="w-full">{l.note}</span>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

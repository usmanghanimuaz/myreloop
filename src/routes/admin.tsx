import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AccountButton } from "@/components/reloop/AccountButton";
import { Card, PageHeader, formatDate } from "@/components/reloop/shared";
import { getModerationQueue, moderateEvidence, reviewReport } from "@/lib/reloop/account.functions";
import { REPORT_REASON_LABEL } from "@/lib/reloop/moderation";
import { useStoreMeta } from "@/lib/reloop/store";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Moderation — ReLoop" },
      { name: "description", content: "ReLoop moderation for evidence review and reports. Admins only." },
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
  if (!hydrated) return <p className="p-8 text-muted-foreground">Loading…</p>;
  if (!userId)
    return (
      <Card className="max-w-md">
        <p className="mb-4 text-sm">Moderators must sign in.</p>
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
  const q = useQuery({ queryKey: ["reloop-account", "moderation"], queryFn: () => load() });
  const act = async (fn: () => Promise<unknown>, ok: string) => {
    try {
      await fn();
      toast.success(ok);
      await qc.invalidateQueries({ queryKey: ["reloop-account"] });
      await qc.invalidateQueries({ queryKey: ["reloop-public"] });
    } catch {
      toast.error("Action failed");
    }
  };
  if (q.isLoading) return <p className="p-8 text-muted-foreground">Loading moderation queue…</p>;
  if (q.isError) return <p role="alert" className="p-8 text-destructive">Could not load the queue.</p>;
  if (!q.data?.allowed)
    return (
      <Card className="max-w-lg">
        <p className="flex items-center gap-2 font-semibold">
          <ShieldAlert className="size-5" aria-hidden /> Access denied
        </p>
        <p className="mt-2 text-sm text-muted-foreground">This area is only for ReLoop moderators.</p>
      </Card>
    );
  const open = q.data.reports.filter((r) => r.status === "open");
  return (
    <div className="animate-rise space-y-8">
      <PageHeader eyebrow="Moderation" title="Evidence review and reports" description="Every action is re-checked on the server." />
      <section>
        <h2 className="mb-3 text-xl font-semibold">Evidence awaiting review ({q.data.evidence.length})</h2>
        {q.data.evidence.length === 0 ? (
          <p className="text-sm text-muted-foreground">No submissions waiting.</p>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {q.data.evidence.map(({ key, data }) => (
              <li key={key} className="rounded-xl border bg-background p-4 text-sm">
                <p className="font-semibold">{String(data["title"] ?? "")}</p>
                <p className="mt-1 text-muted-foreground">{String(data["description"] ?? "")}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {String(data["area"] ?? "")} · {String(data["date"] ?? "")} · consent{" "}
                  {data["consent"] ? "given" : "missing"}
                  {data["rejected"] ? " · previously rejected" : ""}
                </p>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" onClick={() => void act(() => validate({ data: { key, approve: true } }), "Published")}>Approve</Button>
                  <Button size="sm" variant="outline" onClick={() => void act(() => validate({ data: { key, approve: false } }), "Rejected")}>Reject</Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section>
        <h2 className="mb-3 text-xl font-semibold">Open reports ({open.length})</h2>
        {open.length === 0 ? (
          <p className="text-sm text-muted-foreground">No open reports.</p>
        ) : (
          <ul className="grid gap-3">
            {open.map((r) => (
              <li key={r.id} className="rounded-xl border bg-background p-4 text-sm">
                <p className="font-semibold">{REPORT_REASON_LABEL[r.reason as keyof typeof REPORT_REASON_LABEL] ?? r.reason}</p>
                <p className="text-xs text-muted-foreground">
                  {r.target_kind} · {r.target_id} · {formatDate(r.created_at)}
                </p>
                {r.details && <p className="mt-2">{r.details}</p>}
                <div className="mt-3 flex gap-2">
                  <Button size="sm" onClick={() => void act(() => review({ data: { id: r.id, decision: "reviewed" } }), "Marked reviewed")}>Mark reviewed</Button>
                  <Button size="sm" variant="outline" onClick={() => void act(() => review({ data: { id: r.id, decision: "dismissed" } }), "Dismissed")}>Dismiss</Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

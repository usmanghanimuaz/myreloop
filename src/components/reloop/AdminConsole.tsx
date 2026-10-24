import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  FileCheck,
  Inbox,
  LayoutDashboard,
  PackageOpen,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  ShieldOff,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { useConsoleT, type ConsoleKey } from "@/lib/i18n-console";
import { useDashT } from "@/lib/i18n-dash";
import { getAdminConsole, moderateMember } from "@/lib/reloop/admin.functions";
import {
  closeReportedRecord,
  getModerationQueue,
  moderateEvidence,
  reviewReport,
} from "@/lib/reloop/account.functions";
import { formatDate } from "./shared";
import { formatTotals } from "@/lib/reloop/impact";
import { CATEGORY_LABEL } from "@/lib/reloop/types";
import { LanguageSwitcher } from "./Footer";
import { cn } from "@/lib/utils";

const MODULES = [
  ["overview", LayoutDashboard],
  ["members", Users],
  ["listings", PackageOpen],
  ["requests", ClipboardList],
  ["reports", ShieldCheck],
  ["evidence", FileCheck],
  ["restricted", ShieldOff],
  ["resolved", CheckCircle2],
  ["handovers", Activity],
  ["impact", BarChart3],
  ["support", Inbox],
  ["audit", ClipboardList],
  ["settings", Settings],
] as const;
type Module = (typeof MODULES)[number][0];
type Row = {
  id: string;
  title: string;
  area: string;
  status: string;
  date: string;
  body: ReactNode;
  action?: ReactNode;
};

export function AdminConsole() {
  const t = useConsoleT();
  const d = useDashT();
  const load = useServerFn(getAdminConsole);
  const queueLoad = useServerFn(getModerationQueue);
  const memberAction = useServerFn(moderateMember);
  const close = useServerFn(closeReportedRecord);
  const review = useServerFn(reviewReport);
  const validate = useServerFn(moderateEvidence);
  const qc = useQueryClient();
  const [module, setModule] = useState<Module>("overview");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Row | null>(null);
  const [pending, setPending] = useState<((note: string) => Promise<unknown>) | null>(null);
  const [note, setNote] = useState("");
  const [needsNote, setNeedsNote] = useState(true);
  const [busy, setBusy] = useState(false);
  const q = useQuery({ queryKey: ["reloop-account", "admin-console"], queryFn: () => load() });
  const queue = useQuery({
    queryKey: ["reloop-account", "moderation"],
    queryFn: () => queueLoad(),
    enabled: q.data?.allowed === true,
  });
  const changeModule = (next: Module) => {
    setModule(next);
    setSearch("");
    setStatus("all");
    setPage(0);
  };
  const ask = (action: (reason: string) => Promise<unknown>, requireNote = true) => {
    setNeedsNote(requireNote);
    setNote("");
    setPending(() => action);
  };
  const refresh = async () => {
    await qc.invalidateQueries({ queryKey: ["reloop-account"] });
  };
  const execute = async () => {
    if (!pending || (needsNote && note.trim().length < 3)) return;
    setBusy(true);
    try {
      await pending(note.trim());
      setPending(null);
      setSelected(null);
      toast.success(d("confirmed"));
      await refresh();
      await qc.invalidateQueries({ queryKey: ["reloop-public"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : d("mod.failed"));
    } finally {
      setBusy(false);
    }
  };
  if (q.isPending)
    return (
      <div className="space-y-4" aria-busy="true">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((n) => (
            <Skeleton key={n} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
        <p className="sr-only">{d("loading")}</p>
      </div>
    );
  if (q.isError)
    return (
      <div role="alert" className="space-y-4 p-8">
        <p>{d("mod.loadError")}</p>
        <Button onClick={() => void q.refetch()}>
          <RefreshCw />
          {d("retry")}
        </Button>
      </div>
    );
  const data = q.data;
  if (!data?.allowed)
    return (
      <section className="border-s-4 border-destructive bg-card p-8">
        <ShieldCheck className="mb-4 size-8 text-destructive" />
        <h1 className="text-2xl">{d("mod.denied")}</h1>
        <p className="mt-3 text-muted-foreground">{d("mod.deniedDesc")}</p>
      </section>
    );
  const memberName = (id?: string) =>
    data.members.find((m) => m.id === id)?.display_name || id?.slice(0, 8) || "—";
  const restricted = (id: string) => data.restrictions.some((r) => r.user_id === id);
  const openReports = data.reports.filter((r) => r.status === "open");
  const detailList = (id: string) => (
    <div className="space-y-4">
      <h3 className="font-semibold">{t("listings")}</h3>
      {data.state.listings
        .filter((l) => l.ownerId === id)
        .map((l) => (
          <p key={l.id}>
            {l.title} · {l.status}
          </p>
        ))}
      <h3 className="font-semibold">{t("requests")}</h3>
      {data.state.needs
        .filter((l) => l.ownerId === id)
        .map((l) => (
          <p key={l.id}>
            {l.title ?? l.description} · {l.status}
          </p>
        ))}
      {data.state.interests
        .filter(
          (r) =>
            r.ownerId === id ||
            [...data.state.listings, ...data.state.needs].some(
              (l) => l.id === r.listingId && l.ownerId === id,
            ),
        )
        .map((r) => (
          <p key={r.id}>
            {r.id.slice(0, 8)} · {r.status && d(`st.${r.status}`)}
          </p>
        ))}
    </div>
  );
  const recordRows: Row[] = [
    ...data.state.listings.map((l) => ({ ...l, kind: "listings" as const })),
    ...data.state.needs.map((n) => ({ ...n, kind: "needs" as const })),
  ]
    .filter((r) => (module === "listings" ? r.kind === "listings" : r.kind === "needs"))
    .map((r) => ({
      id: r.id,
      title: r.title ?? r.description,
      area: r.area ?? "—",
      status: r.status ?? "open",
      date: r.createdAt,
      body: (
        <div className="space-y-3">
          <p>{r.description}</p>
          <p>
            {CATEGORY_LABEL[r.category]} · {r.quantity ?? "—"} {r.unit ?? ""} · {r.mode ?? "FREE"}
          </p>
          <p>
            {t("name")}: {memberName(r.ownerId)}
          </p>
          <p>
            {t("area")}: {r.area}
          </p>
          {data.reports
            .filter((rep) => rep.target_id === r.id)
            .map((rep) => (
              <p key={rep.id}>
                {t("reports")}: {d(`r.${rep.reason}`)} · {rep.status}
              </p>
            ))}
        </div>
      ),
      action:
        r.status !== "closed" ? (
          <Button
            variant="destructive"
            onClick={() =>
              ask((reason) => close({ data: { targetKind: r.kind, targetId: r.id, note: reason } }))
            }
          >
            {d("mod.closeItem")}
          </Button>
        ) : undefined,
    }));
  let rows: Row[] = [];
  if (module === "members" || module === "restricted")
    rows = data.members
      .filter((m) => module !== "restricted" || restricted(m.id))
      .map((m) => ({
        id: m.id,
        title: memberName(m.id),
        area: m.general_area || "—",
        status: restricted(m.id) ? t("restricted") : t("active"),
        date: m.created_at,
        body: detailList(m.id),
        action: (
          <Button
            variant={restricted(m.id) ? "outline" : "destructive"}
            onClick={() =>
              ask((reason) =>
                memberAction({ data: { id: m.id, restrict: !restricted(m.id), reason } }),
              )
            }
          >
            {d(restricted(m.id) ? "mod.unrestrict" : "mod.restrict")}
          </Button>
        ),
      }));
  if (module === "listings" || module === "requests") rows = recordRows;
  if (module === "reports" || module === "resolved")
    rows = data.reports
      .filter((r) => (module === "reports" ? r.status === "open" : r.status !== "open"))
      .map((r) => ({
        id: r.id,
        title: d(`r.${r.reason}`),
        area: `${r.target_kind} · ${r.target_id.slice(0, 16)}`,
        status: r.status,
        date: r.created_at,
        body: (
          <div className="space-y-3">
            <p className="break-words">{r.details || "—"}</p>
            <p className="break-all">{r.target_id}</p>
            {r.reviewed_at && <p>{formatDate(r.reviewed_at)}</p>}
          </div>
        ),
        action:
          r.status === "open" ? (
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() =>
                  ask((reason) =>
                    review({ data: { id: r.id, decision: "reviewed", note: reason } }),
                  )
                }
              >
                {d("mod.markReviewed")}
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  ask((reason) =>
                    review({ data: { id: r.id, decision: "dismissed", note: reason } }),
                  )
                }
              >
                {d("mod.dismiss")}
              </Button>
            </div>
          ) : undefined,
      }));
  if (module === "handovers")
    rows = data.state.interests.map((r) => ({
      id: r.id,
      title:
        [...data.state.listings, ...data.state.needs].find((l) => l.id === r.listingId)?.title ??
        r.listingId,
      area: memberName(r.ownerId),
      status: r.status ?? "pending",
      date: r.createdAt,
      body: (
        <div className="space-y-3">
          <p>{r.status && d(`st.${r.status}`)}</p>
          <p>
            {r.quantity ?? "—"} {r.unit ?? ""}
          </p>
          <p>{r.note || "—"}</p>
          <p>{t("disputesText")}</p>
        </div>
      ),
    }));
  if (module === "support")
    rows = data.support.map((r) => ({
      id: r.id,
      title: r.subject,
      area: r.name,
      status: r.kind,
      date: r.created_at,
      body: <p className="whitespace-pre-wrap break-words">{r.message}</p>,
    }));
  if (module === "audit")
    rows = data.log.map((r) => ({
      id: r.id,
      title: r.action.replaceAll("_", " "),
      area: memberName(r.actor_id),
      status: r.target_kind,
      date: r.created_at,
      body: (
        <div className="space-y-3">
          <p className="break-all">{r.target_id}</p>
          <p>{r.note || "—"}</p>
          <p>
            {t("name")}: {memberName(r.actor_id)}
          </p>
        </div>
      ),
    }));
  const statuses = [...new Set(rows.map((r) => r.status))];
  const filtered = rows.filter(
    (r) =>
      (status === "all" || r.status === status) &&
      `${r.title} ${r.area} ${r.status} ${r.id}`.toLowerCase().includes(search.toLowerCase()),
  );
  const pageRows = filtered.slice(page * 10, page * 10 + 10);
  const empty = (
    <div className="py-16 text-center">
      <Inbox className="mx-auto mb-4 size-10 text-muted-foreground" />
      <h3 className="text-xl">{t("empty")}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{t("emptyText")}</p>
    </div>
  );
  const table = (
    <>
      <div className="mb-5 flex flex-wrap gap-3">
        <div className="relative min-w-0 flex-1">
          <Search className="absolute start-3 top-3 size-4 text-muted-foreground" />
          <Input
            aria-label={t("search")}
            placeholder={t("search")}
            className="ps-9"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
          />
        </div>
        <select
          className="field w-auto max-w-full"
          aria-label={t("status")}
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(0);
          }}
        >
          <option value="all">{t("all")}</option>
          {statuses.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>
      {filtered.length ? (
        <>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-start text-sm">
              <thead className="bg-muted text-muted-foreground">
                <tr>
                  {[t("view"), t("area"), t("status"), t("date")].map((h) => (
                    <th key={h} className="p-3 text-start font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y bg-card">
                {pageRows.map((r) => (
                  <tr key={r.id}>
                    <td className="min-w-40 p-3">
                      <Button
                        variant="link"
                        className="h-auto whitespace-normal p-0 text-start"
                        onClick={() => setSelected(r)}
                      >
                        {r.title}
                      </Button>
                    </td>
                    <td className="p-3">{r.area}</td>
                    <td className="p-3">
                      <span className="rounded-md bg-secondary px-2 py-1 text-xs text-secondary-foreground">
                        {r.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap p-3 text-muted-foreground">
                      {formatDate(r.date)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground">
              {page * 10 + 1}–{Math.min(page * 10 + 10, filtered.length)} / {filtered.length}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
              >
                <ArrowLeft className="rtl:rotate-180" />
                {t("previous")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={(page + 1) * 10 >= filtered.length}
                onClick={() => setPage(page + 1)}
              >
                {t("next")}
                <ArrowRight className="rtl:rotate-180" />
              </Button>
            </div>
          </div>
        </>
      ) : (
        empty
      )}
    </>
  );
  return (
    <div className="min-w-0">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b pb-6">
        <div>
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold text-primary">
            <ShieldCheck className="size-4" />
            ReLoop / {t("console")}
          </p>
          <h1 className="text-3xl font-semibold">{t("console")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t("private")}</p>
        </div>
        <Button variant="outline" onClick={() => void refresh()}>
          <RefreshCw className={cn("size-4", q.isFetching && "animate-spin")} />
          {t("refresh")}
        </Button>
      </header>
      <div className="grid min-w-0 gap-6 xl:grid-cols-[210px_minmax(0,1fr)]">
        <nav
          aria-label={t("console")}
          className="flex gap-1 overflow-x-auto border-b pb-3 xl:flex-col xl:overflow-visible xl:border-b-0 xl:border-e xl:pe-4"
        >
          {MODULES.map(([key, Icon]) => (
            <Button
              key={key}
              variant={module === key ? "secondary" : "ghost"}
              className="h-auto shrink-0 justify-start gap-2 px-3 py-2.5 text-start xl:w-full xl:whitespace-normal"
              aria-current={module === key ? "page" : undefined}
              onClick={() => changeModule(key)}
            >
              <Icon className="size-4 shrink-0" />
              <span>{t(key)}</span>
              {key === "reports" && openReports.length > 0 && (
                <span className="ms-auto text-xs">{openReports.length}</span>
              )}
            </Button>
          ))}
        </nav>
        <section className="min-w-0">
          <div className="mb-5 flex items-center justify-between gap-2">
            <h2 className="text-2xl font-semibold">{t(module)}</h2>
            <span className="text-xs text-muted-foreground">{t("private").split("·")[0]}</span>
          </div>
          {data.truncated && (
            <p className="mb-4 rounded-lg bg-warning p-3 text-sm text-warning-foreground">
              {t("limited")}
            </p>
          )}
          {module === "overview" ? (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                {(
                  [
                    ["members", data.memberCount, Users],
                    ["listings", data.state.listings.length, PackageOpen],
                    ["reports", openReports.length, ShieldCheck],
                    ["confirmed", data.verifiedExchanges, CheckCircle2],
                  ] as const
                ).map(([key, count, Icon]) => (
                  <div key={key} className="rounded-lg border bg-card p-5">
                    <Icon className="mb-4 size-5 text-primary" />
                    <p className="text-sm text-muted-foreground">{t(key)}</p>
                    <p className="mt-1 text-3xl font-semibold tabular-nums">{count}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex flex-wrap gap-2">
                <Button onClick={() => changeModule("reports")}>
                  {t("reports")}
                  <ArrowRight className="rtl:rotate-180" />
                </Button>
                <Button variant="outline" onClick={() => changeModule("evidence")}>
                  {t("evidence")}
                </Button>
                <Button variant="outline" onClick={() => changeModule("support")}>
                  {t("support")}
                </Button>
              </div>
              <h3 className="mt-8 border-b pb-3 text-lg font-semibold">{t("audit")}</h3>
              {data.log.length ? (
                <ul className="divide-y">
                  {data.log.slice(0, 5).map((l) => (
                    <li key={l.id} className="flex flex-wrap justify-between gap-2 py-4 text-sm">
                      <span>{l.action.replaceAll("_", " ")}</span>
                      <span className="text-muted-foreground">{formatDate(l.created_at)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                empty
              )}
            </>
          ) : module === "evidence" ? (
            <>
              {queue.isPending ? (
                <Skeleton className="h-40" />
              ) : queue.isError ? (
                <div role="alert">
                  <p>{d("mod.loadError")}</p>
                  <Button onClick={() => void queue.refetch()}>{d("retry")}</Button>
                </div>
              ) : !queue.data?.evidence.length ? (
                empty
              ) : (
                <ul className="space-y-4">
                  {queue.data.evidence.map((e) => (
                    <li key={e.key} className="rounded-lg border bg-card p-5">
                      <h3 className="text-lg font-semibold">{e.title}</h3>
                      <p className="mt-2 text-sm">{e.description}</p>
                      <p className="mt-3 text-xs text-muted-foreground">
                        {e.area} · {e.date} ·{" "}
                        {d(e.consent ? "mod.consentGiven" : "mod.consentMissing")}
                      </p>
                      <div className="mt-4 flex gap-2">
                        <Button
                          disabled={!e.consent}
                          onClick={() =>
                            ask(() => validate({ data: { key: e.key, approve: true } }), false)
                          }
                        >
                          {d("mod.approve")}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() =>
                            ask(() => validate({ data: { key: e.key, approve: false } }), false)
                          }
                        >
                          {d("mod.reject")}
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : module === "impact" ? (
            <>
              <div className="rounded-lg border bg-card p-6">
                <p className="text-sm text-muted-foreground">{t("confirmed")}</p>
                <p className="mt-2 text-4xl font-semibold">{data.verifiedExchanges}</p>
                <p className="mt-4 font-medium">{formatTotals(data.verified)}</p>
              </div>
              <p className="mt-5 text-sm text-muted-foreground">{t("methodology")}</p>
              {data.verifiedExchanges === 0 && empty}
            </>
          ) : module === "settings" ? (
            <div className="space-y-6 border-t pt-5">
              <p className="text-sm leading-relaxed text-muted-foreground">{t("settingsText")}</p>
              <LanguageSwitcher />
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="outline">
                  <Link to="/privacy">{d("privacy")}</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/terms">{d("terms")}</Link>
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                {t("unsupported")}: {t("impact")} (traffic) · {t("support")} (email)
              </p>
            </div>
          ) : (
            <>
              {module === "handovers" && (
                <p className="mb-5 text-sm text-muted-foreground">{t("disputesText")}</p>
              )}
              {module === "support" && (
                <p className="mb-5 text-sm text-muted-foreground">{t("supportText")}</p>
              )}
              {table}
              {module === "requests" && (
                <>
                  <h3 className="mt-8 mb-4 text-lg font-semibold">
                    {d("incoming")} / {d("outgoing")}
                  </h3>
                  {data.state.interests.length ? (
                    <ul className="divide-y">
                      {data.state.interests.map((r) => (
                        <li key={r.id} className="flex flex-wrap gap-2 py-3 text-sm">
                          <span>{r.listingId}</span>
                          <span>{r.status && d(`st.${r.status}`)}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    empty
                  )}
                </>
              )}
            </>
          )}
        </section>
      </div>
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="break-words">{selected?.title}</DialogTitle>
            <DialogDescription>
              {selected?.area} · {selected?.status}
            </DialogDescription>
          </DialogHeader>
          {selected?.body}
          {selected?.action}
        </DialogContent>
      </Dialog>
      <AlertDialog open={!!pending} onOpenChange={(open) => !open && !busy && setPending(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirm")}</AlertDialogTitle>
            <AlertDialogDescription>
              {needsNote ? t("confirmText") : d("mod.desc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {needsNote && (
            <Input
              aria-label={t("reason")}
              placeholder={t("reason")}
              maxLength={300}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>{d("cancelReq")}</AlertDialogCancel>
            <Button
              disabled={busy || (needsNote && note.trim().length < 3)}
              onClick={() => void execute()}
            >
              {busy ? d("saving") : t("confirm")}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

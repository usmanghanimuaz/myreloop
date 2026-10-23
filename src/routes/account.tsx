import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { Bell, Inbox, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AccountButton } from "@/components/reloop/AccountButton";
import { PushToggle } from "@/components/reloop/PushToggle";
import { Card, EmptyState, PageHeader, StatusBadge, formatDate } from "@/components/reloop/shared";
import { acceptTerms, getMyProfile, saveMyProfile } from "@/lib/reloop/account.functions";
import { AccountInputSchema } from "@/lib/reloop/moderation";
import { actions, useAppState, useStoreMeta } from "@/lib/reloop/store";
import type { InterestRequest } from "@/lib/reloop/types";
import { useDashT } from "@/lib/i18n-dash";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "My ReLoop — your items, needs and handovers" },
      {
        name: "description",
        content:
          "Manage your ReLoop profile, listings, needs and incoming or outgoing reuse requests in one private place.",
      },
      { property: "og:title", content: "My ReLoop" },
      {
        property: "og:description",
        content: "Your private ReLoop dashboard for reuse listings, needs and handovers.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/account" }],
  }),
  component: Account,
});

function Account() {
  const { userId, hydrated } = useStoreMeta();
  const t = useDashT();
  if (!hydrated) return <p className="p-8 text-muted-foreground">{t("loading")}</p>;
  if (!userId)
    return (
      <div className="animate-rise">
        <PageHeader
          eyebrow={t("eyebrow")}
          title={t("signedOutTitle")}
          description={t("signedOutDesc")}
        />
        <Card className="max-w-md">
          <p className="mb-4 text-sm text-muted-foreground">{t("privacyNote")}</p>
          <AccountButton />
        </Card>
      </div>
    );
  return <Dashboard userId={userId} />;
}

function Dashboard({ userId }: { userId: string }) {
  const state = useAppState();
  const { busy } = useStoreMeta();
  const t = useDashT();
  const myListings = state.listings.filter((l) => l.ownerId === userId);
  const myNeeds = state.needs.filter((n) => n.ownerId === userId);
  const targetTitle = (i: InterestRequest) =>
    (i.targetKind === "needs"
      ? state.needs.find((n) => n.id === i.listingId)?.title
      : state.listings.find((l) => l.id === i.listingId)?.title) ?? t("item");
  const targetOwner = (i: InterestRequest) =>
    i.targetKind === "needs"
      ? state.needs.find((n) => n.id === i.listingId)?.ownerId
      : state.listings.find((l) => l.id === i.listingId)?.ownerId;
  const sorted = [...state.interests].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const incoming = sorted.filter((i) => i.ownerId !== userId && targetOwner(i) === userId);
  const outgoing = sorted.filter((i) => i.ownerId === userId);
  const isDone = (i: InterestRequest) =>
    ["completed", "rejected", "cancelled"].includes(i.status ?? "pending");
  const history = [...incoming, ...outgoing].filter(isDone);
  const activeIncoming = incoming.filter((i) => !isDone(i));
  const activeOutgoing = outgoing.filter((i) => !isDone(i));
  const attention = [...incoming, ...outgoing].filter(
    (i) =>
      (i.status === "pending" && incoming.includes(i)) ||
      ((i.status === "accepted" || i.status === "handover") && i.confirmedBy !== userId),
  );

  async function run(fn: () => Promise<unknown>, ok: string) {
    try {
      await fn();
      toast.success(ok);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("error"));
    }
  }

  const RequestRow = ({ i, incomingRow }: { i: InterestRequest; incomingRow: boolean }) => {
    const status = i.status ?? "pending";
    return (
      <li className="rounded-xl border bg-background p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-medium">{targetTitle(i)}</p>
            <p className="text-xs text-muted-foreground">
              {i.targetKind === "needs" ? t("offerForNeed") : t("requestForItem")} ·{" "}
              {formatDate(i.createdAt)}
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            {t(`st.${status}`)}
          </span>
        </div>
        {i.note && <p className="mt-2 text-sm">“{i.note}”</p>}
        <div className="mt-3 flex flex-wrap gap-2">
          {incomingRow && status === "pending" && (
            <>
              <Button
                size="sm"
                disabled={busy}
                onClick={() =>
                  void run(() => actions.respondRequest(i.id, "accept"), t("accepted"))
                }
              >
                {t("accept")}
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={busy}
                onClick={() =>
                  void run(() => actions.respondRequest(i.id, "reject"), t("declined"))
                }
              >
                {t("decline")}
              </Button>
            </>
          )}
          {(status === "accepted" || status === "handover") && i.confirmedBy !== userId && (
            <Button
              size="sm"
              disabled={busy}
              onClick={() =>
                void run(() => actions.respondRequest(i.id, "confirm"), t("confirmed"))
              }
            >
              {t("confirm")}
            </Button>
          )}
          {!incomingRow && status === "pending" && (
            <Button
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={() => void run(() => actions.respondRequest(i.id, "cancel"), t("cancelled"))}
            >
              {t("cancelReq")}
            </Button>
          )}
        </div>
      </li>
    );
  };

  return (
    <div className="animate-rise space-y-8">
      <PageHeader eyebrow={t("eyebrow")} title={t("title")} description={t("desc")} />
      <ProfileCard />
      <PushToggle />

      <section aria-labelledby="inbox-h">
        <h2
          id="inbox-h"
          className="mb-3 flex items-center gap-2 font-display text-2xl font-semibold"
        >
          <Bell className="size-5" aria-hidden /> {t("attention")}
        </h2>
        {attention.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("attentionEmpty")}</p>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {attention.map((i) => (
              <RequestRow key={i.id} i={i} incomingRow={incoming.includes(i)} />
            ))}
          </ul>
        )}
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <section aria-labelledby="in-h">
          <h2 id="in-h" className="mb-3 flex items-center gap-2 text-xl font-semibold">
            <Inbox className="size-5" aria-hidden /> {t("incoming")}
          </h2>
          {activeIncoming.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("incomingEmpty")}</p>
          ) : (
            <ul className="grid gap-3">
              {activeIncoming.map((i) => (
                <RequestRow key={i.id} i={i} incomingRow />
              ))}
            </ul>
          )}
        </section>
        <section aria-labelledby="out-h">
          <h2 id="out-h" className="mb-3 flex items-center gap-2 text-xl font-semibold">
            <Send className="size-5" aria-hidden /> {t("outgoing")}
          </h2>
          {activeOutgoing.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("outgoingEmpty")}</p>
          ) : (
            <ul className="grid gap-3">
              {activeOutgoing.map((i) => (
                <RequestRow key={i.id} i={i} incomingRow={false} />
              ))}
            </ul>
          )}
        </section>
      </div>

      <section aria-labelledby="hist-h">
        <h2 id="hist-h" className="mb-3 text-xl font-semibold">
          {t("history")}
        </h2>
        {history.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("historyEmpty")}</p>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {history.map((i) => (
              <RequestRow key={i.id} i={i} incomingRow={incoming.includes(i)} />
            ))}
          </ul>
        )}
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <section aria-labelledby="ml-h">
          <h2 id="ml-h" className="mb-3 text-xl font-semibold">
            {t("listings")}
          </h2>
          {myListings.length === 0 ? (
            <EmptyState icon={<Inbox className="size-5" aria-hidden />} title={t("listingsEmpty")}>
              <p className="mb-3">{t("listingsHint")}</p>
              <Button asChild size="sm">
                <Link to="/exchange">{t("shareItem")}</Link>
              </Button>
            </EmptyState>
          ) : (
            <ul className="grid gap-2">
              {myListings.map((l) => (
                <li
                  key={l.id}
                  className="flex items-center justify-between gap-3 rounded-xl border bg-background p-3"
                >
                  <span className="min-w-0 truncate font-medium">{l.title}</span>
                  <StatusBadge status={l.status} />
                </li>
              ))}
            </ul>
          )}
        </section>
        <section aria-labelledby="mn-h">
          <h2 id="mn-h" className="mb-3 text-xl font-semibold">
            {t("needs")}
          </h2>
          {myNeeds.length === 0 ? (
            <EmptyState icon={<Inbox className="size-5" aria-hidden />} title={t("needsEmpty")}>
              <p className="mb-3">{t("needsHint")}</p>
              <Button asChild size="sm">
                <Link to="/needs">{t("postNeed")}</Link>
              </Button>
            </EmptyState>
          ) : (
            <ul className="grid gap-2">
              {myNeeds.map((n) => (
                <li
                  key={n.id}
                  className="flex items-center justify-between gap-3 rounded-xl border bg-background p-3"
                >
                  <span className="min-w-0 truncate font-medium">{n.title ?? n.description}</span>
                  <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                    {n.status
                      ? t(`st.${n.status}`) === `st.${n.status}`
                        ? n.status
                        : t(`st.${n.status}`)
                      : t("open")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function ProfileCard() {
  const load = useServerFn(getMyProfile);
  const save = useServerFn(saveMyProfile);
  const accept = useServerFn(acceptTerms);
  const qc = useQueryClient();
  const t = useDashT();
  const q = useQuery({ queryKey: ["reloop-account", "profile"], queryFn: () => load() });
  const [form, setForm] = useState({
    displayName: "",
    generalArea: "",
    firstName: "",
    lastName: "",
    phone: "",
    notifyRequests: true,
    notifyUpdates: true,
  });
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (q.data)
      setForm({
        displayName: q.data.displayName,
        generalArea: q.data.generalArea,
        firstName: q.data.firstName,
        lastName: q.data.lastName,
        phone: q.data.phone,
        notifyRequests: q.data.notifyRequests,
        notifyUpdates: q.data.notifyUpdates,
      });
  }, [q.data]);
  if (q.isLoading)
    return (
      <Card>
        <p className="text-sm text-muted-foreground">{t("loading")}</p>
      </Card>
    );
  if (q.isError)
    return (
      <Card>
        <p role="alert" className="text-sm text-destructive">
          {t("profileError")}
        </p>
        <Button size="sm" variant="outline" className="mt-3" onClick={() => void q.refetch()}>
          {t("retry")}
        </Button>
      </Card>
    );
  const field = (id: keyof typeof form, label: string, max: number, extra?: object) => (
    <div className="grid gap-1.5">
      <Label htmlFor={`pf-${id}`}>{label}</Label>
      <Input
        id={`pf-${id}`}
        maxLength={max}
        value={form[id] as string}
        onChange={(e) => setForm({ ...form, [id]: e.target.value })}
        {...extra}
      />
    </div>
  );
  return (
    <div className="space-y-4">
      {q.data?.restricted && (
        <Card className="border-destructive/40">
          <p role="alert" className="text-sm text-destructive">
            {t("restricted")}
          </p>
        </Card>
      )}
      {!q.data?.termsAccepted && (
        <Card className="border-primary/40">
          <p className="text-sm">
            {t("termsNeeded")}{" "}
            <Link to="/terms" className="underline">
              {t("terms")}
            </Link>{" "}
            ·{" "}
            <Link to="/privacy" className="underline">
              {t("privacy")}
            </Link>
          </p>
          <Button
            size="sm"
            className="mt-3"
            onClick={async () => {
              try {
                await accept();
                await qc.invalidateQueries({ queryKey: ["reloop-account", "profile"] });
                toast.success(t("termsOk"));
              } catch {
                toast.error(t("error"));
              }
            }}
          >
            {t("acceptTerms")}
          </Button>
        </Card>
      )}
      <Card>
        <form
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={async (e) => {
            e.preventDefault();
            const parsed = AccountInputSchema.safeParse(form);
            if (!parsed.success) return setErr(parsed.error.issues[0]?.message ?? t("invalid"));
            setErr("");
            setSaving(true);
            try {
              await save({ data: parsed.data });
              await qc.invalidateQueries({ queryKey: ["reloop-account", "profile"] });
              toast.success(t("profileSaved"));
            } catch {
              toast.error(t("profileSaveError"));
            } finally {
              setSaving(false);
            }
          }}
        >
          <h2 className="font-display text-xl font-semibold sm:col-span-2">{t("profileTitle")}</h2>
          {field("firstName", t("firstName"), 60, { autoComplete: "given-name" })}
          {field("lastName", t("lastName"), 60, { autoComplete: "family-name" })}
          {field("displayName", t("displayName"), 60)}
          {field("generalArea", t("area"), 80)}
          <div className="sm:col-span-2">
            {field("phone", t("phone"), 20, { type: "tel", autoComplete: "tel", inputMode: "tel" })}
            <p className="mt-1 text-xs text-muted-foreground">{t("phoneNote")}</p>
          </div>
          <fieldset className="grid gap-2 sm:col-span-2">
            <legend className="mb-1 text-sm font-medium">{t("prefs")}</legend>
            {(["notifyRequests", "notifyUpdates"] as const).map((k) => (
              <label key={k} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="size-4 accent-primary"
                  checked={form[k]}
                  onChange={(e) => setForm({ ...form, [k]: e.target.checked })}
                />
                {t(k)}
              </label>
            ))}
          </fieldset>
          {err && (
            <p role="alert" className="text-sm text-destructive sm:col-span-2">
              {err}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
            <Button type="submit" disabled={saving}>
              {saving ? t("saving") : t("saveProfile")}
            </Button>
            <p className="text-xs text-muted-foreground">
              {t("neverShare")}{" "}
              {q.data?.isAdmin && (
                <Link to="/admin" className="font-medium text-primary underline">
                  {t("openModeration")}
                </Link>
              )}
            </p>
          </div>
        </form>
      </Card>
    </div>
  );
}

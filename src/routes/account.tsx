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
import { Card, EmptyState, PageHeader, StatusBadge, formatDate } from "@/components/reloop/shared";
import { getMyProfile, saveMyProfile } from "@/lib/reloop/account.functions";
import { ProfileInputSchema } from "@/lib/reloop/moderation";
import { actions, useAppState, useStoreMeta } from "@/lib/reloop/store";
import type { InterestRequest } from "@/lib/reloop/types";

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

const STATUS_TEXT: Record<string, string> = {
  pending: "Waiting for a reply",
  accepted: "Accepted — arrange a safe handover",
  rejected: "Declined",
  handover: "Handover confirmed by one person",
  completed: "Completed — confirmed by both people",
  cancelled: "Cancelled",
};

function Account() {
  const { userId, hydrated } = useStoreMeta();
  if (!hydrated) return <p className="p-8 text-muted-foreground">Loading…</p>;
  if (!userId)
    return (
      <div className="animate-rise">
        <PageHeader
          eyebrow="My ReLoop"
          title="Your reuse activity in one place"
          description="Sign in to manage what you share, what you need, and requests from neighbours."
        />
        <Card className="max-w-md">
          <p className="mb-4 text-sm text-muted-foreground">
            Your profile only shows a display name and a general area — never your email, phone or
            exact address.
          </p>
          <AccountButton />
        </Card>
      </div>
    );
  return <Dashboard userId={userId} />;
}

function Dashboard({ userId }: { userId: string }) {
  const state = useAppState();
  const { busy } = useStoreMeta();
  const myListings = state.listings.filter((l) => l.ownerId === userId);
  const myNeeds = state.needs.filter((n) => n.ownerId === userId);
  const targetTitle = (i: InterestRequest) =>
    (i.targetKind === "needs"
      ? state.needs.find((n) => n.id === i.listingId)?.title
      : state.listings.find((l) => l.id === i.listingId)?.title) ?? "Item";
  const targetOwner = (i: InterestRequest) =>
    i.targetKind === "needs"
      ? state.needs.find((n) => n.id === i.listingId)?.ownerId
      : state.listings.find((l) => l.id === i.listingId)?.ownerId;
  const sorted = [...state.interests].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const incoming = sorted.filter((i) => i.ownerId !== userId && targetOwner(i) === userId);
  const outgoing = sorted.filter((i) => i.ownerId === userId);
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
      toast.error(e instanceof Error ? e.message : "Something went wrong");
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
              {i.targetKind === "needs" ? "Offer for a need" : "Request for an item"} ·{" "}
              {formatDate(i.createdAt)}
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            {STATUS_TEXT[status] ?? status}
          </span>
        </div>
        {i.note && <p className="mt-2 text-sm">“{i.note}”</p>}
        <div className="mt-3 flex flex-wrap gap-2">
          {incomingRow && status === "pending" && (
            <>
              <Button
                size="sm"
                disabled={busy}
                onClick={() => void run(() => actions.respondRequest(i.id, "accept"), "Accepted")}
              >
                Accept
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={busy}
                onClick={() => void run(() => actions.respondRequest(i.id, "reject"), "Declined")}
              >
                Decline
              </Button>
            </>
          )}
          {(status === "accepted" || status === "handover") && i.confirmedBy !== userId && (
            <Button
              size="sm"
              disabled={busy}
              onClick={() =>
                void run(() => actions.respondRequest(i.id, "confirm"), "Handover confirmed")
              }
            >
              Confirm handover happened
            </Button>
          )}
          {!incomingRow && status === "pending" && (
            <Button
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={() => void run(() => actions.respondRequest(i.id, "cancel"), "Cancelled")}
            >
              Cancel request
            </Button>
          )}
        </div>
      </li>
    );
  };

  return (
    <div className="animate-rise space-y-8">
      <PageHeader
        eyebrow="My ReLoop"
        title="Your items, needs and handovers"
        description="Private to you. An exchange only counts as completed once both people confirm the handover."
      />
      <ProfileCard />

      <section aria-labelledby="inbox-h">
        <h2
          id="inbox-h"
          className="mb-3 flex items-center gap-2 font-display text-2xl font-semibold"
        >
          <Bell className="size-5" aria-hidden /> Needs your attention
        </h2>
        {attention.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing waiting on you right now.</p>
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
            <Inbox className="size-5" aria-hidden /> Incoming requests
          </h2>
          {incoming.length === 0 ? (
            <p className="text-sm text-muted-foreground">No one has requested your items yet.</p>
          ) : (
            <ul className="grid gap-3">
              {incoming.map((i) => (
                <RequestRow key={i.id} i={i} incomingRow />
              ))}
            </ul>
          )}
        </section>
        <section aria-labelledby="out-h">
          <h2 id="out-h" className="mb-3 flex items-center gap-2 text-xl font-semibold">
            <Send className="size-5" aria-hidden /> Your requests and offers
          </h2>
          {outgoing.length === 0 ? (
            <p className="text-sm text-muted-foreground">You haven't requested anything yet.</p>
          ) : (
            <ul className="grid gap-3">
              {outgoing.map((i) => (
                <RequestRow key={i.id} i={i} incomingRow={false} />
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <section aria-labelledby="ml-h">
          <h2 id="ml-h" className="mb-3 text-xl font-semibold">
            Your listings
          </h2>
          {myListings.length === 0 ? (
            <EmptyState
              title="No listings yet"
              description="Before you throw something usable away, list it for FREE or EXCHANGE."
            >
              <Button asChild size="sm">
                <Link to="/exchange">Share an item</Link>
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
            Your needs
          </h2>
          {myNeeds.length === 0 ? (
            <EmptyState title="No needs posted" description="Ask for an item before buying new.">
              <Button asChild size="sm">
                <Link to="/needs">Post a need</Link>
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
                    {n.status ?? "open"}
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
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["reloop-account", "profile"], queryFn: () => load() });
  const [form, setForm] = useState({ displayName: "", generalArea: "" });
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (q.data) setForm({ displayName: q.data.displayName, generalArea: q.data.generalArea });
  }, [q.data]);
  if (q.isError)
    return (
      <Card>
        <p role="alert" className="text-sm text-destructive">
          Could not load your profile.
        </p>
      </Card>
    );
  return (
    <Card>
      <form
        className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
        onSubmit={async (e) => {
          e.preventDefault();
          const parsed = ProfileInputSchema.safeParse(form);
          if (!parsed.success) return setErr(parsed.error.issues[0]?.message ?? "Invalid");
          setErr("");
          setSaving(true);
          try {
            await save({ data: parsed.data });
            await qc.invalidateQueries({ queryKey: ["reloop-account", "profile"] });
            toast.success("Profile saved");
          } catch {
            toast.error("Could not save your profile");
          } finally {
            setSaving(false);
          }
        }}
      >
        <div className="grid gap-1.5">
          <Label htmlFor="pf-name">Display name</Label>
          <Input
            id="pf-name"
            maxLength={60}
            value={form.displayName}
            onChange={(e) => setForm({ ...form, displayName: e.target.value })}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="pf-area">General area (neighbourhood or city)</Label>
          <Input
            id="pf-area"
            maxLength={80}
            value={form.generalArea}
            onChange={(e) => setForm({ ...form, generalArea: e.target.value })}
          />
        </div>
        <Button type="submit" disabled={saving || q.isLoading}>
          {saving ? "Saving…" : "Save profile"}
        </Button>
        {err && (
          <p role="alert" className="text-sm text-destructive sm:col-span-3">
            {err}
          </p>
        )}
        <p className="text-xs text-muted-foreground sm:col-span-3">
          Never add your email, phone number or exact address.{" "}
          {q.data?.isAdmin && (
            <Link to="/admin" className="font-medium text-primary underline">
              Open moderation
            </Link>
          )}
        </p>
      </form>
    </Card>
  );
}

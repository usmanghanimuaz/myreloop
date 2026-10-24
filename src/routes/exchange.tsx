import { createFileRoute } from "@tanstack/react-router";
import { ReportButton } from "@/components/reloop/ReportButton";
import { MapPin, Pencil, Plus, Search, Send, Trash2, PackageOpen, ImageIcon } from "lucide-react";
import { SitePhoto } from "@/components/reloop/SitePhoto";
import { useConsoleT } from "@/lib/i18n-console";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/lib/i18n";
import { CommunityNeeds, RequestBoard, saved } from "@/components/reloop/CommunityNeeds";
import { ListingPhoto } from "@/components/reloop/ListingPhoto";
import { ListingFormDialog } from "@/components/reloop/ListingFormDialog";
import {
  Card,
  EmptyState,
  Notice,
  OriginBadge,
  PageHeader,
  StatusBadge,
  formatDate,
} from "@/components/reloop/shared";
import { looksLikeContactDetails } from "@/lib/reloop/schema";
import { IMAGES, UNSPLASH_CREDIT } from "@/lib/reloop/images";
import { actions, useAppState, useStoreMeta } from "@/lib/reloop/store";
import {
  CATEGORIES,
  CATEGORY_LABEL,
  CONDITIONS,
  CONDITION_LABEL,
  type Category,
  type Listing,
  type ListingStatus,
} from "@/lib/reloop/types";

export const Route = createFileRoute("/exchange")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Available Items — I Have — ReLoop" },
      {
        name: "description",
        content:
          "Browse, list and request reusable items from neighbours — free or in exchange, never for sale. Every item passed on is one less thing thrown away.",
      },
      { property: "og:title", content: "Available Items — I Have — ReLoop" },
      {
        property: "og:description",
        content: "A local board for passing on usable items, free or in exchange.",
      },
    ],
    links: [{ rel: "canonical", href: "/exchange" }],
  }),
  component: Exchange,
});

function Exchange() {
  const state = useAppState();
  const meta = useStoreMeta();
  const { t } = useI18n();
  const c = useConsoleT();
  const [mode, setMode] = useState("all");
  const [condition, setCondition] = useState("all");
  const [area, setArea] = useState("");
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<Category | "all">("all");
  const [status, setStatus] = useState<ListingStatus | "all">("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Listing | undefined>();
  const [viewId, setViewId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Listing | null>(null);

  const interestCount = useMemo(() => {
    const m = new Map<string, number>();
    for (const i of state.interests) m.set(i.listingId, (m.get(i.listingId) ?? 0) + 1);
    return m;
  }, [state.interests]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return state.listings.filter(
      (l) =>
        (cat === "all" || l.category === cat) &&
        (mode === "all" || (l.mode ?? "FREE") === mode) &&
        (status === "all" || l.status === status) &&
        (condition === "all" || l.condition === condition) &&
        l.area.toLowerCase().includes(area.toLowerCase()) &&
        (!term ||
          `${l.title} ${l.description} ${l.area} ${CATEGORY_LABEL[l.category]}`
            .toLowerCase()
            .includes(term)),
    );
  }, [state.listings, q, cat, status, mode, condition, area]);

  const viewing = state.listings.find((l) => l.id === viewId) ?? null;

  return (
    <div className="animate-rise">
      <PageHeader
        eyebrow="Available Items — I Have"
        title={c("marketplace")}
        description={c("marketText")}
      >
        <Button
          onClick={() => {
            setEditing(undefined);
            setFormOpen(true);
          }}
        >
          <Plus /> {t("home.ctaShare")}
        </Button>
      </PageHeader>

      <section className="mb-8 grid overflow-hidden border-y md:grid-cols-3">
        <SitePhoto image={IMAGES.cardboard} className="h-48 w-full object-cover md:h-full" />
        <div className="p-6 md:col-span-2">
          <h2 className="text-xl font-semibold">What belongs here?</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            <li>
              Usable, clean items you no longer need — boxes, jars, clothes, furniture, working
              electronics — offered <strong>FREE</strong> or for <strong>EXCHANGE</strong>. Nothing
              is sold here.
            </li>
            <li>
              Describe the condition honestly: like new, good, worn but usable, or damaged. Wash or
              wipe items before handover.
            </li>
            <li>
              Never list hazardous waste (batteries, paint, chemicals, medicines, gas canisters) —
              those belong at designated collection points.
            </li>
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">{UNSPLASH_CREDIT.label}</p>
        </div>
      </section>

      <Card className="mb-6 grid gap-3 p-4 md:grid-cols-[1fr_auto_auto]">
        <div className="relative">
          <Label htmlFor="search" className="sr-only">
            Search listings
          </Label>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by keyword or area"
            className="pl-9"
          />
        </div>
        <div>
          <Label htmlFor="cat" className="sr-only">
            Category
          </Label>
          <select
            id="cat"
            className="field"
            value={cat}
            onChange={(e) => setCat(e.target.value as Category | "all")}
          >
            <option value="all">All materials</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABEL[c]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="status" className="sr-only">
            Availability
          </Label>
          <select
            id="status"
            className="field"
            value={status}
            onChange={(e) => setStatus(e.target.value as ListingStatus | "all")}
          >
            <option value="all">Any availability</option>
            <option value="available">Available</option>
            <option value="reserved">Reserved</option>
            <option value="exchanged">Exchanged</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </Card>
      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="filter-condition">Condition</Label>
          <select
            id="filter-condition"
            className="field"
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
          >
            <option value="all">Any condition</option>
            {CONDITIONS.map((c) => (
              <option key={c} value={c}>
                {CONDITION_LABEL[c]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="filter-area">Pickup area</Label>
          <Input id="filter-area" value={area} onChange={(e) => setArea(e.target.value)} />
        </div>
      </div>

      <div className="mb-4">
        <Label htmlFor="filter-mode">Transaction mode</Label>
        <select
          id="filter-mode"
          className="field"
          value={mode}
          onChange={(e) => setMode(e.target.value)}
        >
          <option value="all">All modes</option>
          <option>FREE</option>
          <option>EXCHANGE</option>
        </select>
      </div>
      <p className="mb-3 text-sm text-muted-foreground" aria-live="polite">
        {filtered.length} listing{filtered.length === 1 ? "" : "s"}
      </p>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<PackageOpen className="size-6" />}
          title={state.listings.length ? t("empty.noMatch") : t("empty.listings")}
        >
          {state.listings.length
            ? "Try a different keyword or clear the filters."
            : "Be the first to list something reusable."}
        </EmptyState>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((l) => (
            <li key={l.id}>
              <Button
                variant="ghost"
                onClick={() => setViewId(l.id)}
                className="group block h-full w-full overflow-hidden whitespace-normal rounded-lg border bg-card p-0 text-start transition hover:border-primary/40"
              >
                <div className="px-4 pt-4 mb-3 flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-primary">
                    {CATEGORY_LABEL[l.category]}
                  </span>
                  <StatusBadge status={l.status} />
                </div>
                {l.photos?.[0] &&
                  meta.userId &&
                  (l.ownerId === meta.userId ||
                    state.interests.some(
                      (i) =>
                        i.listingId === l.id &&
                        i.ownerId === meta.userId &&
                        ["accepted", "handover", "completed"].includes(i.status ?? "pending"),
                    )) && <ListingPhoto path={l.photos[0]} title={l.title} />}
                {(!l.photos?.[0] ||
                  !meta.userId ||
                  !(
                    l.ownerId === meta.userId ||
                    state.interests.some(
                      (i) =>
                        i.listingId === l.id &&
                        i.ownerId === meta.userId &&
                        ["accepted", "handover", "completed"].includes(i.status ?? "pending"),
                    )
                  )) && (
                  <div className="flex aspect-[4/3] flex-col items-center justify-center gap-3 bg-secondary text-primary">
                    <ImageIcon className="size-10" aria-hidden />
                    <span className="text-xs">{CATEGORY_LABEL[l.category]}</span>
                  </div>
                )}
                <div className="p-4">
                  <p className="mb-2 text-xs font-semibold text-primary">{l.mode ?? "FREE"}</p>
                  <h3 className="text-lg font-semibold group-hover:text-primary">{l.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {l.quantity} {l.unit} · {CONDITION_LABEL[l.condition]}
                  </p>
                  <p className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="size-3.5" /> {l.area}
                  </p>
                  <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                    <OriginBadge origin={l.origin} />
                    <span>
                      {interestCount.get(l.id) ?? 0} interested · {formatDate(l.createdAt)}
                    </span>
                  </div>
                </div>
              </Button>
            </li>
          ))}
        </ul>
      )}

      <CommunityNeeds />
      <RequestBoard />
      <ListingDetail
        listing={viewing}
        interest={viewing ? (interestCount.get(viewing.id) ?? 0) : 0}
        onClose={() => setViewId(null)}
        onEdit={(l) => {
          setEditing(l);
          setFormOpen(true);
        }}
        onDelete={(l) => setDeleting(l)}
      />
      <ListingFormDialog open={formOpen} onOpenChange={setFormOpen} listing={editing} />

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{deleting?.title}”?</AlertDialogTitle>
            <AlertDialogDescription>
              Removes this listing and pending requests. Active or completed handovers cannot be
              deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (
                  deleting &&
                  !(await saved(() => actions.deleteListing(deleting.id), "Listing deleted"))
                )
                  return;
                setDeleting(null);
                setViewId(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ListingDetail({
  listing,
  interest,
  onClose,
  onEdit,
  onDelete,
}: {
  listing: Listing | null;
  interest: number;
  onClose: () => void;
  onEdit: (l: Listing) => void;
  onDelete: (l: Listing) => void;
}) {
  const [note, setNote] = useState("");
  const [err, setErr] = useState("");
  const { userId, busy } = useStoreMeta();
  const { interests } = useAppState();
  const own = !!userId && listing?.ownerId === userId;
  const photoAccess =
    own ||
    interests.some(
      (i) =>
        i.listingId === listing?.id &&
        i.ownerId === userId &&
        ["accepted", "handover", "completed"].includes(i.status ?? "pending"),
    );
  return (
    <Dialog
      open={!!listing}
      onOpenChange={(o) => {
        if (!o) {
          onClose();
          setNote("");
          setErr("");
        }
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        {listing && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <StatusBadge status={listing.status} />
                <OriginBadge origin={listing.origin} />
              </div>
              <DialogTitle className="font-display text-2xl">{listing.title}</DialogTitle>
              <DialogDescription>
                {CATEGORY_LABEL[listing.category]} · {listing.quantity} {listing.unit} ·{" "}
                {CONDITION_LABEL[listing.condition]}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 text-sm">
              {photoAccess
                ? listing.photos?.map((path) => (
                    <ListingPhoto key={path} path={path} title={listing.title} />
                  ))
                : !!listing.photos?.length && (
                    <p className="text-muted-foreground">
                      Private photos become available after your request is accepted.
                    </p>
                  )}
              <p className="font-semibold">{listing.mode ?? "FREE"}</p>
              {listing.mode === "EXCHANGE" && listing.exchangePreference && (
                <p>Requested in exchange: {listing.exchangePreference}</p>
              )}
              {listing.description && <p>{listing.description}</p>}
              <p className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="size-4" /> {listing.area}
              </p>
              <p className="text-muted-foreground">
                Listed {formatDate(listing.createdAt)} · {interest} interest request
                {interest === 1 ? "" : "s"}
              </p>
              {!own && <ReportButton targetKind="listings" targetId={listing.id} />}
            </div>

            {own && (
              <div className="space-y-3 rounded-xl border bg-background p-4">
                <p className="text-sm font-medium">Manage your listing</p>
                <div className="flex flex-wrap gap-2">
                  {(["available", "closed"] as const).map((s) => (
                    <Button
                      key={s}
                      size="sm"
                      variant={listing.status === s ? "default" : "outline"}
                      aria-pressed={listing.status === s}
                      disabled={busy}
                      onClick={() =>
                        void saved(() => actions.setListingStatus(listing.id, s), `Marked as ${s}`)
                      }
                    >
                      {s === "available" ? "Available" : "Close listing"}
                    </Button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => onEdit(listing)}>
                    <Pencil /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive"
                    onClick={() => onDelete(listing)}
                  >
                    <Trash2 /> Delete
                  </Button>
                </div>
              </div>
            )}

            {listing.status === "available" && !own && listing.origin !== "sample" ? (
              <form
                className="space-y-2"
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (looksLikeContactDetails(note))
                    return setErr("Please don't include emails or phone numbers.");
                  if (note.length > 200) return setErr("Keep the note under 200 characters.");
                  if (!(await saved(() => actions.sendInterest(listing.id, note), "Interest sent")))
                    return;
                  setNote("");
                  setErr("");
                }}
              >
                <Label htmlFor="note">Send interest</Label>
                <Textarea
                  id="note"
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Optional: how you'd use it"
                  aria-invalid={!!err || undefined}
                />
                {err && <p className="text-xs text-destructive">{err}</p>}
                <Button type="submit" size="sm" disabled={!userId || busy}>
                  <Send /> Send interest
                </Button>
              </form>
            ) : (
              <Notice>
                This listing is not open for new requests — it may be reserved, completed or closed.
              </Notice>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

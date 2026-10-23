import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Clock, Target, Undo2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { saved } from "@/components/reloop/CommunityNeeds";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, OriginBadge, PageHeader, formatDate } from "@/components/reloop/shared";
import { actions, useAppState, useStoreMeta } from "@/lib/reloop/store";
import { IMAGES, UNSPLASH_CREDIT } from "@/lib/reloop/images";
import {
  CATEGORIES,
  CATEGORY_LABEL,
  UNITS,
  type CommunityAction,
  type Category,
  type DiversionType,
  type Unit,
} from "@/lib/reloop/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/actions")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Community Activity & Exchange — ReLoop" },
      {
        name: "description",
        content:
          "Real community actions and exchange records with clear open, accepted and completed states — plus safe, respectful local handover guidance.",
      },
      { property: "og:title", content: "Community Activity & Exchange — ReLoop" },
      {
        property: "og:description",
        content: "Real activity, safe handovers, and only confirmed completions count.",
      },
    ],
    links: [{ rel: "canonical", href: "/actions" }],
  }),
  component: Actions,
});

function Actions() {
  const state = useAppState();
  const [completing, setCompleting] = useState<CommunityAction | null>(null);
  const open = state.actions.filter((a) => a.status === "open");
  const done = state.actions.filter((a) => a.status === "completed");

  return (
    <div className="animate-rise">
      <PageHeader
        eyebrow="Community Activity & Exchange"
        title="Community activity & exchange"
        description="Real actions and exchange records only. States are honest: open means not yet done, completed means someone recorded it. Confirmed exchanges need both participants. Nothing here is invented."
      />

      <section className="mb-10 grid overflow-hidden rounded-2xl border bg-card shadow-card md:grid-cols-3">
        <img
          src={IMAGES.volunteer.src}
          alt={IMAGES.volunteer.alt}
          loading="lazy"
          className="h-44 w-full object-cover md:h-full"
        />
        <div className="p-6 md:col-span-2">
          <h2 className="text-xl font-semibold">Safe, respectful local handovers</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            <li>
              Meet in a public, well-lit place during the day, and tell someone where you're going.
            </li>
            <li>Check the item matches its description before taking it home.</li>
            <li>Be on time, be polite, and don't pressure anyone into an exchange.</li>
            <li>
              Only mark an exchange completed after it really happened — both sides confirm, and
              only confirmed completions count toward verified impact.
            </li>
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">{UNSPLASH_CREDIT.label}</p>
        </div>
      </section>
      <h2 className="mb-3 text-xl font-semibold">Open ({open.length})</h2>
      <div className="mb-10 grid gap-4 md:grid-cols-2">
        {open.map((a) => (
          <ActionCard key={a.id} a={a} onComplete={() => setCompleting(a)} />
        ))}
        {open.length === 0 && (
          <p className="text-sm text-muted-foreground">All actions are completed — nice work.</p>
        )}
      </div>
      <h2 className="mb-3 text-xl font-semibold">Completed ({done.length})</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {done.map((a) => (
          <ActionCard key={a.id} a={a} />
        ))}
      </div>
      <CompleteDialog action={completing} onClose={() => setCompleting(null)} />
    </div>
  );
}

function ActionCard({ a, onComplete }: { a: CommunityAction; onComplete?: () => void }) {
  const { userId, busy } = useStoreMeta();
  const done = a.status === "completed";
  return (
    <Card className={cn("flex flex-col", done && "bg-muted/60")}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
            done ? "bg-lime/60 text-lime-foreground" : "bg-secondary text-secondary-foreground",
          )}
        >
          {done ? (
            <>
              <CheckCircle2 className="size-3.5" /> Completed
              {a.completedAt ? ` ${formatDate(a.completedAt)}` : ""}
            </>
          ) : (
            "Open"
          )}
        </span>
        {done && <OriginBadge origin={a.origin} />}
      </div>
      <h3 className="text-lg font-semibold">{a.title}</h3>
      <p className="mt-1 flex items-start gap-2 text-sm text-muted-foreground">
        <Target className="mt-0.5 size-4 shrink-0 text-primary" /> {a.goal}
      </p>
      <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm">
        {a.instructions.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ol>
      <div className="mt-auto flex items-center justify-between gap-2 pt-4">
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="size-3.5" /> ~{a.durationMinutes} min
        </span>
        {done ? (
          a.ownerId === userId &&
          a.origin === "user" && (
            <Button
              size="sm"
              variant="ghost"
              disabled={busy}
              onClick={() => {
                void saved(() => actions.reopenAction(a.id), "Action reopened");
              }}
            >
              <Undo2 /> Undo
            </Button>
          )
        ) : (
          <Button size="sm" disabled={!userId || busy} onClick={onComplete}>
            <CheckCircle2 /> Record completion
          </Button>
        )}
      </div>
    </Card>
  );
}

function CompleteDialog({
  action,
  onClose,
}: {
  action: CommunityAction | null;
  onClose: () => void;
}) {
  const { busy, userId } = useStoreMeta();
  const [confirmed, setConfirmed] = useState(false);
  const [qty, setQty] = useState("");
  const [unit, setUnit] = useState<Unit>("kg");
  const [category, setCategory] = useState<Category>("plastic");
  const [diversion, setDiversion] = useState<DiversionType>("recycle");
  const [err, setErr] = useState("");

  function reset() {
    setConfirmed(false);
    setQty("");
    setErr("");
  }

  return (
    <Dialog
      open={!!action}
      onOpenChange={(o) => {
        if (!o) {
          onClose();
          reset();
        }
      }}
    >
      <DialogContent onOpenAutoFocus={() => action && setCategory(action.category)}>
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Record “{action?.title}”</DialogTitle>
          <DialogDescription>
            Only record actions that actually took place. Adding a quantity is optional.
          </DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-4"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!action) return;
            if (!confirmed) return setErr("Please confirm that this action took place.");
            const n = qty.trim() === "" ? 0 : Number(qty);
            if (!Number.isFinite(n) || n < 0 || n > 10000)
              return setErr("Enter a valid quantity, or leave it empty.");
            if (
              !(await saved(
                () =>
                  actions.completeAction(
                    action.id,
                    n > 0 ? { category, quantity: n, unit, diversion } : undefined,
                  ),
                "Action recorded",
              ))
            )
              return;
            onClose();
            reset();
          }}
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="c-qty">Quantity (optional)</Label>
              <Input
                id="c-qty"
                type="number"
                min="0"
                step="any"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="c-unit">Unit</Label>
              <select
                id="c-unit"
                className="field"
                value={unit}
                onChange={(e) => setUnit(e.target.value as Unit)}
              >
                {UNITS.map((u) => (
                  <option key={u}>{u}</option>
                ))}
              </select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="c-cat">Material</Label>
              <select
                id="c-cat"
                className="field"
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {CATEGORY_LABEL[c]}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="c-div">Outcome</Label>
              <select
                id="c-div"
                className="field"
                value={diversion}
                onChange={(e) => setDiversion(e.target.value as DiversionType)}
              >
                <option value="reuse">Reused / donated / repaired</option>
                <option value="recycle">Recycled</option>
              </select>
            </div>
          </div>
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              className="mt-1 size-4 accent-primary"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
            />
            I confirm this action took place.
          </label>
          {err && (
            <p className="text-xs text-destructive" role="alert">
              {err}
            </p>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onClose();
                reset();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!userId || busy}>
              Record as completed
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

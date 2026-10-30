import { useState } from "react";
import { ReportButton } from "./ReportButton";
import { AiAssistControl } from "./AiAssistControl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/lib/i18n";
import { NeedInputSchema } from "@/lib/reloop/schema";
import { actions, useAppState, useStoreMeta } from "@/lib/reloop/store";
import { CATEGORIES, CATEGORY_LABEL, UNITS } from "@/lib/reloop/types";
import { Card, OriginBadge } from "./shared";

export async function saved(action: () => Promise<unknown>, message: string) {
  try {
    await action();
    toast.success(message);
    return true;
  } catch (error) {
    toast.error(error instanceof Error ? error.message : "Could not save");
    return false;
  }
}
export function CommunityNeeds() {
  const { needs } = useAppState();
  const { userId, busy } = useStoreMeta();
  const { t } = useI18n();
  const [draft, setDraft] = useState({
    title: "",
    description: "",
    category: "textiles",
    quantity: "1",
    unit: "items",
    area: "",
    mode: "FREE",
  });
  const [err, setErr] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [exchangePreference, setExchangePreference] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [mode, setMode] = useState("all");
  const filtered = needs.filter(
    (n) =>
      (category === "all" || n.category === category) &&
      (mode === "all" || n.mode === mode) &&
      `${n.title} ${n.description} ${n.area}`.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <section id="community-needs" className="mt-10 scroll-mt-20">
      <h2 className="mb-4 text-2xl font-semibold">{t("needs.heading")}</h2>
      {!userId ? (
        <p className="mb-6 rounded-md border-y bg-muted px-4 py-4 text-sm text-muted-foreground">
          {t("needs.signIn")}
        </p>
      ) : (
        <form
          className="mb-6 grid gap-3 border-y py-5 sm:grid-cols-2"
          onSubmit={async (e) => {
            e.preventDefault();
            const parsed = NeedInputSchema.safeParse({ ...draft, exchangePreference });
            if (!parsed.success) return setErr(parsed.error.issues[0]?.message ?? "Check the form");
            if (
              await saved(
                () =>
                  editing
                    ? actions.updateNeed(editing, parsed.data)
                    : actions.postNeed(parsed.data),
                editing ? "Need updated" : "Need posted",
              )
            ) {
              setDraft((d) => ({ ...d, title: "", description: "" }));
              setExchangePreference("");
              setEditing(null);
              setErr("");
            }
          }}
        >
          {(["title", "description", "quantity", "area"] as const).map((k) => (
            <div key={k} className="grid gap-1.5">
              <Label htmlFor={`need-${k}`}>
                {k === "area"
                  ? t("needs.area")
                  : k === "title"
                    ? t("needs.title")
                    : k === "quantity"
                      ? t("needs.quantity")
                      : t("needs.description")}
              </Label>
              <Input
                id={`need-${k}`}
                type={k === "quantity" ? "number" : "text"}
                min={k === "quantity" ? 1 : undefined}
                value={draft[k]}
                onChange={(e) => setDraft((d) => ({ ...d, [k]: e.target.value }))}
              />
            </div>
          ))}
          <div>
            <Label htmlFor="need-category">{t("needs.category")}</Label>
            <select
              id="need-category"
              className="field"
              value={draft.category}
              onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABEL[c]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="need-unit">{t("needs.unit")}</Label>
            <select
              id="need-unit"
              className="field"
              value={draft.unit}
              onChange={(e) => setDraft((d) => ({ ...d, unit: e.target.value }))}
            >
              {UNITS.map((u) => (
                <option key={u}>{u}</option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="need-mode">{t("needs.preference")}</Label>
            <select
              id="need-mode"
              className="field"
              value={draft.mode}
              onChange={(e) => setDraft((d) => ({ ...d, mode: e.target.value }))}
            >
              <option>FREE</option>
              <option>EXCHANGE</option>
            </select>
          </div>
          {draft.mode === "EXCHANGE" && (
            <div>
              <Label htmlFor="need-exchange">{t("needs.exchangeOffer")}</Label>
              <Input
                id="need-exchange"
                value={exchangePreference}
                onChange={(e) => setExchangePreference(e.target.value)}
                maxLength={200}
              />
            </div>
          )}
          <Button type="submit" disabled={!userId || busy}>
            {editing ? t("needs.save") : t("needs.post")}
          </Button>
          {editing && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setEditing(null);
                setDraft((d) => ({ ...d, title: "", description: "" }));
                setExchangePreference("");
              }}
            >
              {t("needs.cancelEdit")}
            </Button>
          )}
          {err && (
            <p role="alert" className="text-sm text-destructive">
              {err}
            </p>
          )}
        </form>
      )}
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <div>
          <Label htmlFor="need-search">{t("needs.search")}</Label>
          <Input id="need-search" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="need-filter-category">{t("needs.category")}</Label>
          <select
            id="need-filter-category"
            className="field"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="all">{t("needs.allCategories")}</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABEL[c]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="need-filter-mode">{t("needs.preference")}</Label>
          <select
            id="need-filter-mode"
            className="field"
            value={mode}
            onChange={(e) => setMode(e.target.value)}
          >
            <option value="all">{t("needs.allModes")}</option>
            <option>FREE</option>
            <option>EXCHANGE</option>
          </select>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.map((n) => (
          <Card key={n.id}>
            <div className="flex justify-between gap-2">
              <h3 className="font-semibold">{n.title ?? n.description}</h3>
              <OriginBadge origin={n.origin} />
            </div>
            <p className="mt-2 text-sm">{n.description}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {n.quantity ?? 1} {n.unit ?? "items"} · {n.mode ?? "FREE"} · {n.status ?? "open"}
              {n.area && (
                <>
                  <br />
                  {n.area}
                </>
              )}
            </p>
            {n.mode === "EXCHANGE" && n.exchangePreference && (
              <p className="mt-2 text-sm">
                {t("needs.offering")} {n.exchangePreference}
              </p>
            )}
            {userId !== n.ownerId && <ReportButton targetKind="needs" targetId={n.id} />}
            {userId === n.ownerId && n.status === "open" && (
              <AiAssistControl task="match" initialQuery={`${n.title ?? ""} ${n.description}`} />
            )}
            {userId === n.ownerId && n.status === "open" && (
              <Button
                className="mt-3"
                size="sm"
                variant="outline"
                disabled={busy}
                onClick={() => void saved(() => actions.closeNeed(n.id), "Need closed")}
              >
                {t("needs.close")}
              </Button>
            )}
            {userId === n.ownerId && ["open", "closed"].includes(n.status ?? "open") && (
              <div className="mt-3 flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busy}
                  onClick={() => {
                    setEditing(n.id);
                    setDraft({
                      title: n.title ?? "",
                      description: n.description,
                      category: n.category,
                      quantity: String(n.quantity ?? 1),
                      unit: n.unit ?? "items",
                      area: n.area ?? "",
                      mode: n.mode ?? "FREE",
                    });
                    setExchangePreference(n.exchangePreference ?? "");
                    document.getElementById("community-needs")?.scrollIntoView();
                  }}
                >
                  {t("needs.edit")}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busy}
                  onClick={() => {
                    if (window.confirm("Delete this need? Pending offers will become unavailable."))
                      void saved(() => actions.deleteNeed(n.id), "Need deleted");
                  }}
                >
                  {t("needs.delete")}
                </Button>
              </div>
            )}
            {userId && userId !== n.ownerId && n.origin !== "sample" && n.status === "open" && (
              <OfferForm id={n.id} quantity={n.quantity ?? 1} unit={n.unit ?? "items"} />
            )}
          </Card>
        ))}
      </div>
      {!filtered.length && <p className="text-muted-foreground">{t("needs.none")}</p>}
    </section>
  );
}
function OfferForm({
  id,
  quantity,
  unit,
}: {
  id: string;
  quantity: number;
  unit: (typeof UNITS)[number];
}) {
  const [note, setNote] = useState("");
  const { busy } = useStoreMeta();
  const { t } = useI18n();
  return (
    <form
      className="mt-3 space-y-2"
      onSubmit={async (e) => {
        e.preventDefault();
        if (await saved(() => actions.sendOffer(id, note, quantity, unit), "Offer sent"))
          setNote("");
      }}
    >
      <Label htmlFor={`offer-${id}`}>{t("needs.offerNote")}</Label>
      <Textarea
        id={`offer-${id}`}
        value={note}
        maxLength={200}
        onChange={(e) => setNote(e.target.value)}
        placeholder={t("needs.offerPlaceholder")}
      />
      <Button size="sm" disabled={busy}>
        {t("req.offer")} {quantity} {unit}
      </Button>
    </form>
  );
}

export function RequestBoard() {
  const state = useAppState();
  const { userId, busy } = useStoreMeta();
  const { t } = useI18n();
  const requests = state.interests.filter((i) => i.origin !== "sample");
  return (
    <section className="mt-10">
      <h2 className="mb-4 text-2xl font-semibold">{t("req.heading")}</h2>
      {!userId ? (
        <p className="text-muted-foreground">{t("req.signIn")}</p>
      ) : !requests.length ? (
        <p className="text-muted-foreground">{t("req.none")}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {requests.map((i) => {
            const target =
              i.targetKind === "needs"
                ? state.needs.find((n) => n.id === i.listingId)
                : state.listings.find((l) => l.id === i.listingId);
            const own = target?.ownerId === userId;
            const status = i.status ?? "pending";
            return (
              <Card key={i.id}>
                <h3 className="font-semibold">{target?.title ?? "Item unavailable"}</h3>
                <p className="mt-2 text-sm">
                  {i.targetKind === "needs" ? t("req.offer") : t("req.interest")} ·{" "}
                  {own ? t("req.received") : t("req.sent")} · {status}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{i.note || t("req.noNote")}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {own && status === "pending" && (
                    <>
                      <Button
                        size="sm"
                        disabled={busy}
                        onClick={() =>
                          void saved(
                            () => actions.respondRequest(i.id, "accept"),
                            "Request accepted",
                          )
                        }
                      >
                        {t("req.accept")}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busy}
                        onClick={() =>
                          void saved(
                            () => actions.respondRequest(i.id, "reject"),
                            "Request rejected",
                          )
                        }
                      >
                        {t("req.reject")}
                      </Button>
                    </>
                  )}
                  {["accepted", "handover"].includes(status) && i.confirmedBy !== userId && (
                    <Button
                      size="sm"
                      disabled={busy}
                      onClick={() =>
                        void saved(
                          () => actions.respondRequest(i.id, "confirm"),
                          "Handover confirmation saved",
                        )
                      }
                    >
                      {t("req.confirm")}
                    </Button>
                  )}
                  {i.confirmedBy === userId && status === "handover" && (
                    <p className="text-sm text-muted-foreground">{t("req.waiting")}</p>
                  )}
                  {["pending", "accepted", "handover"].includes(status) && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busy}
                      onClick={() =>
                        void saved(
                          () => actions.respondRequest(i.id, "cancel"),
                          "Request cancelled",
                        )
                      }
                    >
                      {t("req.cancel")}
                    </Button>
                  )}
                </div>
                {["accepted", "handover"].includes(status) && (
                  <p className="mt-3 text-xs text-muted-foreground">
                    Agree a public handover place in your request note. Both participants must
                    confirm the completed handover.
                  </p>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}

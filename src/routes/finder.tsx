import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Recycle, RefreshCw, Wrench, HeartHandshake, Info } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ListingFormDialog } from "@/components/reloop/ListingFormDialog";
import { Card, Notice, PageHeader } from "@/components/reloop/shared";
import { getRecommendations, type RecommendationGroup } from "@/lib/reloop/guidance";
import { actions } from "@/lib/reloop/store";
import {
  CATEGORIES, CATEGORY_LABEL, CONDITIONS, CONDITION_LABEL, OUTCOMES, OUTCOME_LABEL, UNITS,
  type Category, type Condition, type IntendedOutcome, type Unit,
} from "@/lib/reloop/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/finder")({
  head: () => ({
    meta: [
      { title: "Find a Better Use — ReLoop" },
      { name: "description", content: "Get practical reuse, repair, donation and recycling guidance for household materials." },
      { property: "og:title", content: "Find a Better Use — ReLoop" },
      { property: "og:description", content: "Practical, local guidance for reusable household materials." },
    ],
  }),
  component: Finder,
});

const ICONS: Record<RecommendationGroup["kind"], typeof Recycle> = {
  reuse: RefreshCw, repair: Wrench, donate: HeartHandshake, recycle: Recycle, safety: AlertTriangle, check: Info,
};

function Finder() {
  const [category, setCategory] = useState<Category>("cardboard");
  const [quantity, setQuantity] = useState("1");
  const [unit, setUnit] = useState<Unit>("items");
  const [condition, setCondition] = useState<Condition>("good");
  const [outcome, setOutcome] = useState<IntendedOutcome>("reuse");
  const [hazardous, setHazardous] = useState(false);
  const [result, setResult] = useState<RecommendationGroup[] | null>(null);
  const [qtyError, setQtyError] = useState("");
  const [listOpen, setListOpen] = useState(false);

  const qty = Number(quantity);
  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!Number.isFinite(qty) || qty <= 0) return setQtyError("Enter a quantity greater than 0");
    setQtyError("");
    setResult(getRecommendations({ category, condition, outcome, hazardous }));
  }
  const unsafe = result?.[0]?.kind === "safety" && result.length === 1;

  return (
    <div className="animate-rise">
      <PageHeader eyebrow="Waste-to-Value Finder" title="Find a better use" description="Describe what you have. Guidance comes from a built-in, editable dataset of general advice — not live local recycling data or image recognition." />
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <form onSubmit={submit} className="grid gap-4" noValidate>
            <div className="grid gap-1.5">
              <Label htmlFor="f-cat">Material category</Label>
              <select id="f-cat" className="field" value={category} onChange={(e) => setCategory(e.target.value as Category)}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="f-qty">Approx. quantity</Label>
                <Input id="f-qty" type="number" min="0" step="any" value={quantity} onChange={(e) => setQuantity(e.target.value)} aria-invalid={!!qtyError || undefined} aria-describedby={qtyError ? "f-qty-err" : undefined} />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="f-unit">Unit</Label>
                <select id="f-unit" className="field" value={unit} onChange={(e) => setUnit(e.target.value as Unit)}>
                  {UNITS.map((u) => <option key={u}>{u}</option>)}
                </select>
              </div>
              {qtyError && <p id="f-qty-err" className="col-span-2 text-xs text-destructive">{qtyError}</p>}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="f-cond">Condition</Label>
              <select id="f-cond" className="field" value={condition} onChange={(e) => setCondition(e.target.value as Condition)}>
                {CONDITIONS.map((c) => <option key={c} value={c}>{CONDITION_LABEL[c]}</option>)}
              </select>
            </div>
            <fieldset className="grid gap-2">
              <legend className="mb-1 text-sm font-medium">What would you like to do?</legend>
              <div className="flex flex-wrap gap-2">
                {OUTCOMES.map((o) => (
                  <label key={o} className={cn("cursor-pointer rounded-full border px-3 py-1.5 text-sm transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring", outcome === o ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-accent")}>
                    <input type="radio" name="outcome" value={o} checked={outcome === o} onChange={() => setOutcome(o)} className="sr-only" />
                    {OUTCOME_LABEL[o]}
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="flex items-start gap-2 text-sm">
              <input type="checkbox" className="mt-1 size-4 accent-primary" checked={hazardous} onChange={(e) => setHazardous(e.target.checked)} />
              It contains batteries, chemicals, paint, gas, sharps or medicines
            </label>
            <Button type="submit">Get recommendations</Button>
          </form>
        </Card>

        <div className="lg:col-span-3">
          {!result ? (
            <div className="grid h-full min-h-64 place-items-center rounded-2xl border border-dashed p-8 text-center text-muted-foreground">
              <div><Recycle className="mx-auto mb-3 size-8 text-primary" /> Fill in the form to see reuse and recycling options.</div>
            </div>
          ) : (
            <div className="space-y-4" aria-live="polite">
              {result.map((g) => {
                const Icon = ICONS[g.kind];
                return (
                  <Card key={g.kind} className={cn("animate-rise", g.kind === "safety" && "border-warning-foreground/30 bg-warning/40")}>
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <h2 className="flex items-center gap-2 text-lg font-semibold"><Icon className="size-5 text-primary" /> {g.title}</h2>
                      {g.pathway !== "safety" && (
                        <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", g.pathway === "reuse" ? "bg-lime/60 text-lime-foreground" : "bg-secondary text-secondary-foreground")}>
                          {g.pathway === "reuse" ? "Keeps it in use" : "Recovers the material"}
                        </span>
                      )}
                    </div>
                    <ul className="list-disc space-y-1 pl-5 text-sm">{g.tips.map((t) => <li key={t}>{t}</li>)}</ul>
                  </Card>
                );
              })}
              {!unsafe && (
                <Card className="flex flex-wrap items-center gap-3">
                  <p className="mr-auto text-sm text-muted-foreground">Next step for {qty} {unit} of {CATEGORY_LABEL[category].toLowerCase()}:</p>
                  <Button variant="outline" onClick={() => setListOpen(true)}>List on Reuse Exchange</Button>
                  <Button
                    onClick={() => {
                      actions.planFromFinder({ category, quantity: qty, unit, diversion: outcome === "recycle" ? "recycle" : "reuse", note: `${OUTCOME_LABEL[outcome]} ${qty} ${unit} ${CATEGORY_LABEL[category].toLowerCase()}` });
                      toast.success("Saved as a planned entry", { description: "It counts as diverted only once you mark it done in the Impact Tracker." });
                    }}
                  >Save as plan</Button>
                </Card>
              )}
              <Notice>Plans are labelled “planned — not yet verified” until you record that they actually happened.</Notice>
            </div>
          )}
        </div>
      </div>
      <ListingFormDialog
        open={listOpen}
        onOpenChange={setListOpen}
        prefill={{ category, quantity: String(qty), unit, condition, title: "" }}
      />
    </div>
  );
}

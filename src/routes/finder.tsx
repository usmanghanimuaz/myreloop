import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  ExternalLink,
  Recycle,
  RefreshCw,
  Wrench,
  HeartHandshake,
  Info,
} from "lucide-react";
import { useState } from "react";
import { saved } from "@/components/reloop/CommunityNeeds";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ListingFormDialog } from "@/components/reloop/ListingFormDialog";
import { Card, Notice, PageHeader } from "@/components/reloop/shared";
import { getRecommendations, GUIDANCE, type RecommendationGroup } from "@/lib/reloop/guidance";
import { IMAGES, UNSPLASH_CREDIT } from "@/lib/reloop/images";
import { actions, useStoreMeta } from "@/lib/reloop/store";
import {
  CATEGORIES,
  CATEGORY_LABEL,
  CONDITIONS,
  CONDITION_LABEL,
  OUTCOMES,
  OUTCOME_LABEL,
  UNITS,
  type Category,
  type Condition,
  type IntendedOutcome,
  type Unit,
} from "@/lib/reloop/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/finder")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Material Guidance — ReLoop" },
      {
        name: "description",
        content:
          "A visual learning library: how to reuse, repair, recycle and safely handle paper, glass, plastic, metal, textiles, furniture, electronics and hazardous waste.",
      },
      { property: "og:title", content: "Material Guidance — ReLoop" },
      {
        property: "og:description",
        content: "Practical reuse, repair and recycling guidance for everyday materials.",
      },
    ],
  }),
  component: Finder,
});

const ICONS: Record<RecommendationGroup["kind"], typeof Recycle> = {
  reuse: RefreshCw,
  repair: Wrench,
  donate: HeartHandshake,
  recycle: Recycle,
  safety: AlertTriangle,
  check: Info,
};

function Finder() {
  const { userId, busy } = useStoreMeta();
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
      <PageHeader
        eyebrow="Material Guidance"
        title="Learn what to do with each material"
        description="A practical library for everyday materials — reuse, repair, recycle or dispose safely. Below the library, a quick tool gives tailored suggestions for an item you have. General advice only; local collection rules vary."
      />
      <MaterialLibrary />
      <h2 className="mb-4 mt-12 text-2xl font-semibold">Quick tool: find a better use</h2>
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <form onSubmit={submit} className="grid gap-4" noValidate>
            <div className="grid gap-1.5">
              <Label htmlFor="f-cat">Material category</Label>
              <select
                id="f-cat"
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
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="f-qty">Approx. quantity</Label>
                <Input
                  id="f-qty"
                  type="number"
                  min="0"
                  step="any"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  aria-invalid={!!qtyError || undefined}
                  aria-describedby={qtyError ? "f-qty-err" : undefined}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="f-unit">Unit</Label>
                <select
                  id="f-unit"
                  className="field"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as Unit)}
                >
                  {UNITS.map((u) => (
                    <option key={u}>{u}</option>
                  ))}
                </select>
              </div>
              {qtyError && (
                <p id="f-qty-err" className="col-span-2 text-xs text-destructive">
                  {qtyError}
                </p>
              )}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="f-cond">Condition</Label>
              <select
                id="f-cond"
                className="field"
                value={condition}
                onChange={(e) => setCondition(e.target.value as Condition)}
              >
                {CONDITIONS.map((c) => (
                  <option key={c} value={c}>
                    {CONDITION_LABEL[c]}
                  </option>
                ))}
              </select>
            </div>
            <fieldset className="grid gap-2">
              <legend className="mb-1 text-sm font-medium">What would you like to do?</legend>
              <div className="flex flex-wrap gap-2">
                {OUTCOMES.map((o) => (
                  <label
                    key={o}
                    className={cn(
                      "cursor-pointer rounded-full border px-3 py-1.5 text-sm transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
                      outcome === o
                        ? "border-primary bg-primary text-primary-foreground"
                        : "bg-card hover:bg-accent",
                    )}
                  >
                    <input
                      type="radio"
                      name="outcome"
                      value={o}
                      checked={outcome === o}
                      onChange={() => setOutcome(o)}
                      className="sr-only"
                    />
                    {OUTCOME_LABEL[o]}
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                className="mt-1 size-4 accent-primary"
                checked={hazardous}
                onChange={(e) => setHazardous(e.target.checked)}
              />
              It contains batteries, chemicals, paint, gas, sharps or medicines
            </label>
            <Button type="submit">Get recommendations</Button>
          </form>
        </Card>

        <div className="lg:col-span-3">
          {!result ? (
            <div className="grid h-full min-h-64 place-items-center rounded-2xl border border-dashed p-8 text-center text-muted-foreground">
              <div>
                <Recycle className="mx-auto mb-3 size-8 text-primary" /> Fill in the form to see
                reuse and recycling options.
              </div>
            </div>
          ) : (
            <div className="space-y-4" aria-live="polite">
              {result.map((g) => {
                const Icon = ICONS[g.kind];
                return (
                  <Card
                    key={g.kind}
                    className={cn(
                      "animate-rise",
                      g.kind === "safety" && "border-warning-foreground/30 bg-warning/40",
                    )}
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <h2 className="flex items-center gap-2 text-lg font-semibold">
                        <Icon className="size-5 text-primary" /> {g.title}
                      </h2>
                      {g.pathway !== "safety" && (
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-xs font-medium",
                            g.pathway === "reuse"
                              ? "bg-lime/60 text-lime-foreground"
                              : "bg-secondary text-secondary-foreground",
                          )}
                        >
                          {g.pathway === "reuse" ? "Keeps it in use" : "Recovers the material"}
                        </span>
                      )}
                    </div>
                    <ul className="list-disc space-y-1 pl-5 text-sm">
                      {g.tips.map((t) => (
                        <li key={t}>{t}</li>
                      ))}
                    </ul>
                  </Card>
                );
              })}
              {!unsafe && (
                <Card className="flex flex-wrap items-center gap-3">
                  <p className="mr-auto text-sm text-muted-foreground">
                    Next step for {qty} {unit} of {CATEGORY_LABEL[category].toLowerCase()}:
                  </p>
                  <Button variant="outline" onClick={() => setListOpen(true)}>
                    List on Reuse Exchange
                  </Button>
                  <Button
                    disabled={!userId || busy}
                    onClick={async () => {
                      if (
                        !(await saved(
                          () =>
                            actions.planFromFinder({
                              category,
                              quantity: qty,
                              unit,
                              diversion: outcome === "recycle" ? "recycle" : "reuse",
                              note: `${OUTCOME_LABEL[outcome]} ${qty} ${unit} ${CATEGORY_LABEL[category].toLowerCase()}`,
                            }),
                          "Plan saved",
                        ))
                      )
                        return;
                    }}
                  >
                    Save as plan
                  </Button>
                </Card>
              )}
              <Notice>
                Plans are labelled “planned — not yet verified” until you record that they actually
                happened.
              </Notice>
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

/** Verified external education links (checked 23 October 2026). */
const GUIDE_LINKS = [
  {
    title: "Recycling basics and benefits",
    org: "US Environmental Protection Agency",
    url: "https://www.epa.gov/recycle/recycling-basics-and-benefits",
    note: "How recycling works and why reduction and reuse come first.",
  },
  {
    title: "Sustainable Materials Management",
    org: "US Environmental Protection Agency",
    url: "https://www.epa.gov/smm",
    note: "Using and reusing materials more productively across their whole life cycle.",
  },
  {
    title: "Household hazardous waste",
    org: "US Environmental Protection Agency",
    url: "https://www.epa.gov/hw",
    note: "Safe handling of paints, chemicals, batteries and other hazardous household items.",
  },
  {
    title: "Global E-waste Monitor 2024",
    org: "ITU / UNITAR",
    url: "https://www.itu.int/en/ITU-D/Environment/Pages/Publications/The-Global-E-Waste-Monitor-2024.aspx",
    note: "Why discarded electronics need formal, environmentally sound recycling.",
  },
  {
    title: "Global Waste Management Outlook 2024",
    org: "UN Environment Programme",
    url: "https://www.unep.org/resources/global-waste-management-outlook-2024",
    note: "Global waste scenarios and the case for prevention within a circular economy.",
  },
  {
    title: "WRAP — circular living resources",
    org: "WRAP (UK climate action NGO)",
    url: "https://wrap.org.uk",
    note: "Practical campaigns on food waste, textiles and recycling.",
  },
] as const;

const CATEGORY_IMAGE: Partial<Record<Category, (typeof IMAGES)[keyof typeof IMAGES]>> = {
  cardboard: IMAGES.cardboard,
  paper: IMAGES.paper,
  plastic: IMAGES.reusableBottle,
  textiles: IMAGES.textiles,
  electronics: IMAGES.electronics,
  organic: IMAGES.organic,
  other: IMAGES.woodFurniture,
};

function MaterialLibrary() {
  return (
    <section aria-label="Material guidance library" className="space-y-6">
      {CATEGORIES.map((cat, i) => {
        const g = GUIDANCE[cat];
        const img = CATEGORY_IMAGE[cat];
        const blocks: { label: string; tips: string[] }[] = [
          { label: "Reuse", tips: g.reuse },
          { label: "Repair", tips: g.repair },
          { label: "Donate / share", tips: g.donate },
          { label: "Recycle", tips: g.recycle },
        ];
        return (
          <article
            key={cat}
            className="grid overflow-hidden rounded-2xl border bg-card shadow-card md:grid-cols-3"
          >
            {img ? (
              <img
                src={img.src}
                alt={img.alt}
                loading="lazy"
                className={cn(
                  "h-44 w-full object-cover md:h-full",
                  i % 2 === 1 && "md:order-2",
                )}
              />
            ) : (
              <div
                className={cn(
                  "grid h-44 place-items-center bg-secondary text-primary md:h-full",
                  i % 2 === 1 && "md:order-2",
                )}
              >
                <Recycle className="size-10" aria-hidden />
              </div>
            )}
            <div className="p-6 md:col-span-2">
              <h3 className="text-xl font-semibold">{CATEGORY_LABEL[cat]}</h3>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                {blocks
                  .filter((b) => b.tips.length > 0)
                  .map((b) => (
                    <div key={b.label}>
                      <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                        {b.label}
                      </p>
                      <ul className="mt-1 list-disc space-y-1 pl-4 text-sm text-muted-foreground">
                        {b.tips.map((t) => (
                          <li key={t}>{t}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
              </div>
              {g.safety.length > 0 && (
                <p className="mt-4 rounded-xl bg-warning/50 px-4 py-3 text-sm text-warning-foreground">
                  <AlertTriangle className="mr-1 inline size-4" aria-hidden />{" "}
                  <strong>Safety:</strong> {g.safety.join(" ")}
                </p>
              )}
            </div>
          </article>
        );
      })}
      <p className="text-xs text-muted-foreground">{UNSPLASH_CREDIT.label}</p>

      <Card>
        <h2 className="mb-1 text-xl font-semibold">Learn more from authoritative sources</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          General advice from public environmental bodies. Your local collection rules always come
          first.
        </p>
        <ul className="grid gap-3 md:grid-cols-2">
          {GUIDE_LINKS.map((l) => (
            <li key={l.url} className="rounded-xl border bg-background p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">{l.org}</p>
              <a
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 flex items-center gap-1 font-medium underline underline-offset-4"
              >
                {l.title} <ExternalLink className="size-3.5 shrink-0" aria-hidden />
              </a>
              <p className="mt-1 text-sm text-muted-foreground">{l.note}</p>
            </li>
          ))}
        </ul>
      </Card>
    </section>
  );
}

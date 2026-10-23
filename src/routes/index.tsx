import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  HandHeart,
  PackageOpen,
  Recycle,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, OriginBadge, formatDate } from "@/components/reloop/shared";
import { HERO_OG_IMAGE, IMAGES, UNSPLASH_CREDIT } from "@/lib/reloop/images";
import { formatTotals, summarizeImpact } from "@/lib/reloop/impact";
import { useAppState, useStoreMeta } from "@/lib/reloop/store";
import { CATEGORY_LABEL } from "@/lib/reloop/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "ReLoop — Don't Waste It. Reuse It." },
      {
        name: "description",
        content:
          "ReLoop helps neighbours pass on usable items for free or exchange, repair and reuse everyday materials, and recycle responsibly — with honest, verified impact tracking.",
      },
      { property: "og:title", content: "ReLoop — Don't Waste It. Reuse It." },
      {
        property: "og:description",
        content:
          "A community reuse and environmental guidance platform: keep useful things out of the bin.",
      },
      { property: "og:image", content: HERO_OG_IMAGE },
      { name: "twitter:image", content: HERO_OG_IMAGE },
    ],
  }),
  component: Home,
});

const STEPS = [
  {
    title: "Keep it out of the bin",
    text: "Before you throw something away, ask: could someone nearby still use it? A box, a jar, a chair, a working kettle — most “rubbish” still has a use.",
  },
  {
    title: "List it free, or post a need",
    text: "Offer what you have for FREE or EXCHANGE, or tell neighbours what you're looking for. No selling, no payments — just passing things on.",
  },
  {
    title: "Meet locally, hand over safely",
    text: "Arrange a polite, public handover nearby. Both sides confirm the exchange, so the impact record is real — not guessed.",
  },
] as const;

const EVERYDAY = [
  {
    image: IMAGES.cardboard,
    name: "Cardboard boxes",
    text: "Sturdy boxes help neighbours who are moving or storing things. Flatten and keep them dry; greasy or food-soiled cardboard often can't be recycled.",
  },
  {
    image: IMAGES.reusableBottle,
    name: "Clean plastic containers",
    text: "Rinsed containers can store parts, seeds or craft supplies. Never reuse containers that held chemicals for food or play.",
  },
  {
    image: IMAGES.textiles,
    name: "Clothes & textiles",
    text: "Wearable clothes can be swapped or donated. Small tears and loose buttons are quick repairs; unwearable fabric can become cleaning rags.",
  },
  {
    image: IMAGES.furniture,
    name: "Small furniture",
    text: "A solid chair or shelf deserves a second home. List it with an honest condition note and let someone nearby collect it.",
  },
  {
    image: IMAGES.electronics,
    name: "Electronics — only when safe",
    text: "Working devices can be passed on after wiping personal data. Damaged electronics and loose batteries are a fire risk: use an official e-waste collection point, never the household bin.",
  },
] as const;

const TODAY = [
  "Rinse and sort containers the way your local collection service asks — rules differ between areas.",
  "Reuse jars and boxes at home before recycling them.",
  "Try repairing before replacing: a loose screw, a new zip, a fresh plug often solves it.",
  "Keep batteries, paint, chemicals, medicines and e-waste separate, and use designated collection points.",
  "Never burn rubbish — smoke from burning plastic and mixed waste is toxic.",
  "Never dump waste in drains, streams or empty plots — it blocks drainage and poisons water.",
] as const;

function Home() {
  const state = useAppState();
  const { userId } = useStoreMeta();
  const impact = useMemo(() => summarizeImpact(state), [state]);
  const activeListings = state.listings.filter((l) => l.status === "available");
  const openNeeds = state.needs.filter((n) => n.status === "open");
  const suggested = useMemo(() => {
    const cats = new Set(activeListings.map((l) => l.category));
    return state.actions.filter((a) => a.status === "open" && cats.has(a.category)).slice(0, 3);
  }, [state, activeListings]);

  return (
    <div className="animate-rise">
      {/* 1 — Photographic hero: mission first */}
      <section className="relative mb-12 overflow-hidden rounded-3xl">
        <img
          src={IMAGES.communitySorting.src}
          alt={IMAGES.communitySorting.alt}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-sidebar/95 via-sidebar/80 to-sidebar/30" />
        <div className="relative max-w-2xl p-8 text-sidebar-foreground md:p-14">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-lime">ReLoop</p>
          <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
            Don't throw useful things away. Pass them on.
          </h1>
          <p className="mt-4 text-lg opacity-90">
            ReLoop is a community waste-to-value platform. Share surplus items with neighbours for
            free or in exchange, learn how to repair and recycle safely, and record what actually
            got reused — so less ends up in bins, drains and dumps.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild variant="lime" size="lg">
              <Link to="/exchange">
                Explore available items <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="lime" size="lg">
              <Link to="/exchange" hash="community-needs">
                Share an item / Post a need
              </Link>
            </Button>
          </div>
          <p className="mt-6 text-xs opacity-60">
            <a href={UNSPLASH_CREDIT.url} target="_blank" rel="noopener noreferrer">
              {UNSPLASH_CREDIT.label}
            </a>
          </p>
        </div>
      </section>

      {/* 2 — How ReLoop works */}
      <section className="mb-12">
        <h2 className="mb-2 text-2xl font-semibold md:text-3xl">How ReLoop works</h2>
        <p className="mb-6 max-w-2xl text-muted-foreground">
          Three simple steps turn would-be waste into someone else's useful find.
        </p>
        <ol className="grid gap-4 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.title} className="rounded-2xl border bg-card p-6 shadow-card">
              <span className="mb-3 grid size-10 place-items-center rounded-full bg-primary font-display text-lg font-semibold text-primary-foreground">
                {i + 1}
              </span>
              <h3 className="text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* 3 — Everyday materials, image-led */}
      <section className="mb-12">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold md:text-3xl">
              Everyday things that deserve a second life
            </h2>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Most household “waste” is reusable, repairable or recyclable. A few common examples:
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/finder">
              <Search /> Open the material guidance
            </Link>
          </Button>
        </div>
        <div className="space-y-6">
          {EVERYDAY.map((e, i) => (
            <article
              key={e.name}
              className="grid overflow-hidden rounded-2xl border bg-card shadow-card md:grid-cols-5"
            >
              <img
                src={e.image.src}
                alt={e.image.alt}
                loading="lazy"
                className={`h-48 w-full object-cover md:col-span-2 md:h-full ${
                  i % 2 === 1 ? "md:order-2" : ""
                }`}
              />
              <div className="flex flex-col justify-center p-6 md:col-span-3 md:p-8">
                <h3 className="text-xl font-semibold">{e.name}</h3>
                <p className="mt-2 text-muted-foreground">{e.text}</p>
              </div>
            </article>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          <a href={UNSPLASH_CREDIT.url} target="_blank" rel="noopener noreferrer">
            {UNSPLASH_CREDIT.label}
          </a>
          {" · "}Guidance is general advice — always confirm your local collection rules.
        </p>
      </section>

      {/* 4 — What you can do today */}
      <section className="mb-12 grid gap-6 rounded-3xl bg-secondary p-6 md:grid-cols-2 md:p-10">
        <div>
          <h2 className="text-2xl font-semibold md:text-3xl">What can you do today?</h2>
          <p className="mt-2 text-muted-foreground">
            Small, concrete habits that keep pollution out of the air, soil and water.
          </p>
          <img
            src={IMAGES.sortingBins.src}
            alt={IMAGES.sortingBins.alt}
            loading="lazy"
            className="mt-6 rounded-2xl object-cover"
          />
          <p className="mt-2 text-xs text-muted-foreground">{UNSPLASH_CREDIT.label}</p>
        </div>
        <ul className="space-y-3 self-center">
          {TODAY.map((t) => (
            <li key={t} className="flex items-start gap-3 rounded-xl bg-card p-4 text-sm shadow-card">
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* 5 — Live community sections (secondary) */}
      <section className="mb-12">
        <h2 className="mb-2 text-2xl font-semibold md:text-3xl">Happening in the community</h2>
        <p className="mb-6 max-w-2xl text-muted-foreground">
          Real records from this ReLoop community. Items marked “Sample data” are fictional
          examples and never count as real impact.
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <p className="text-sm text-muted-foreground">Two-party confirmed handovers</p>
            <p className="mt-2 font-display text-3xl font-semibold">
              {formatTotals(impact.verified)}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              {impact.verifiedExchanges} confirmed exchanges · self-reported records are separate.
            </p>
          </Card>
          <Card>
            <p className="text-sm text-muted-foreground">Available items right now</p>
            <p className="mt-2 font-display text-3xl font-semibold">{activeListings.length}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Yours:{" "}
              <strong>
                {activeListings.filter((l) => l.ownerId === userId && l.origin === "user").length}
              </strong>{" "}
              · Sample: {activeListings.filter((l) => l.origin === "sample").length}
            </p>
          </Card>
          <Card>
            <p className="text-sm text-muted-foreground">Open community needs</p>
            <p className="mt-2 font-display text-3xl font-semibold">{openNeeds.length}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Neighbours looking for materials you might have.
            </p>
          </Card>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-xl font-semibold">
              <PackageOpen className="size-5 text-primary" /> Recent available items
            </h3>
            {activeListings.length === 0 ? (
              <p className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
                Nothing listed yet — be the first to pass something on.
              </p>
            ) : (
              activeListings.slice(0, 3).map((l) => (
                <p key={l.id} className="border-b py-3">
                  <Link to="/exchange" className="font-medium text-primary">
                    {l.title}
                  </Link>{" "}
                  · {l.quantity} {l.unit} <OriginBadge origin={l.origin} />
                </p>
              ))
            )}
            <Button asChild variant="outline" size="sm" className="mt-4">
              <Link to="/exchange">Browse all items</Link>
            </Button>
          </div>
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-xl font-semibold">
              <HandHeart className="size-5 text-primary" /> Recent community needs
            </h3>
            {openNeeds.length === 0 ? (
              <p className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
                No open needs right now — post one if you're looking for something.
              </p>
            ) : (
              openNeeds.slice(0, 3).map((n) => (
                <p key={n.id} className="border-b py-3">
                  <Link to="/exchange" hash="community-needs" className="font-medium text-primary">
                    {n.title ?? n.description}
                  </Link>{" "}
                  · {n.mode ?? "FREE"} <OriginBadge origin={n.origin} />
                </p>
              ))
            )}
            <Button asChild variant="outline" size="sm" className="mt-4">
              <Link to="/exchange" hash="community-needs">
                See all needs
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-5">
          <Card className="lg:col-span-3">
            <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold">
              <Clock className="size-5 text-primary" /> Recent community activity
            </h3>
            {state.activity.length === 0 ? (
              <p className="text-sm text-muted-foreground">No activity recorded yet.</p>
            ) : (
              <ul className="divide-y">
                {state.activity.slice(0, 7).map((e) => (
                  <li key={e.id} className="flex items-start justify-between gap-3 py-3 text-sm">
                    <span>{e.message}</span>
                    <span className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
                      {formatDate(e.createdAt)} <OriginBadge origin={e.origin} />
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Card className="lg:col-span-2">
            <h3 className="mb-1 flex items-center gap-2 text-xl font-semibold">
              <Sparkles className="size-5 text-primary" /> Suggested actions
            </h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Based on materials currently on the exchange.
            </p>
            {suggested.length === 0 ? (
              <p className="text-sm text-muted-foreground">No matching open actions right now.</p>
            ) : (
              <ul className="space-y-3">
                {suggested.map((a) => (
                  <li key={a.id} className="rounded-xl border bg-background p-3">
                    <p className="font-medium">{a.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Matches {CATEGORY_LABEL[a.category].toLowerCase()} listings ·{" "}
                      {a.durationMinutes} min
                    </p>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              <Button asChild size="sm" variant="outline">
                <Link to="/actions">
                  <Users /> Community activity
                </Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link to="/exchange">
                  <Recycle /> Exchange
                </Link>
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* 6 — Closing CTA */}
      <section className="relative overflow-hidden rounded-3xl">
        <img
          src={IMAGES.beachCleanup.src}
          alt={IMAGES.beachCleanup.alt}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-sidebar/95 via-sidebar/70 to-sidebar/20" />
        <div className="relative flex min-h-72 flex-col items-start justify-end p-8 text-sidebar-foreground md:p-12">
          <h2 className="max-w-xl text-3xl font-semibold">Join your local reuse loop</h2>
          <p className="mt-3 max-w-xl opacity-90">
            Every item passed on is one less thing burned, dumped or buried. Sign in, list what you
            don't need, and help a neighbour today.
          </p>
          <Button asChild variant="lime" size="lg" className="mt-5">
            <Link to="/exchange">
              Start sharing <ArrowRight />
            </Link>
          </Button>
          <p className="mt-4 text-xs opacity-60">{UNSPLASH_CREDIT.label}</p>
        </div>
      </section>
    </div>
  );
}

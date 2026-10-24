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
import { useMemo, useState } from "react";
import { ListingFormDialog } from "@/components/reloop/ListingFormDialog";
import { SitePhoto } from "@/components/reloop/SitePhoto";
import { useConsoleT } from "@/lib/i18n-console";
import { Button } from "@/components/ui/button";
import { Card, OriginBadge, formatDate } from "@/components/reloop/shared";
import { useI18n } from "@/lib/i18n";
import { CARDBOARD_SOURCE, HERO_OG_IMAGE, IMAGES, UNSPLASH_CREDIT } from "@/lib/reloop/images";
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
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Home,
});

const STEP_KEYS = [1, 2, 3, 4] as const;

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
  const { t } = useI18n();
  const c = useConsoleT();
  const [postOpen, setPostOpen] = useState(false);
  const impact = useMemo(() => summarizeImpact(state), [state]);
  const activeListings = state.listings.filter(
    (l) => l.status === "available" && l.origin === "user",
  );
  const openNeeds = state.needs.filter((n) => n.status === "open" && n.origin === "user");
  const completedExchanges = useMemo(
    () =>
      state.interests
        .filter((i) => i.status === "completed" && i.origin === "user")
        .map((i) => ({
          interest: i,
          listing: state.listings.find((l) => l.id === i.listingId),
        }))
        .slice(0, 4),
    [state.interests, state.listings],
  );
  const suggested = useMemo(() => {
    const cats = new Set(activeListings.map((l) => l.category));
    return state.actions.filter((a) => a.status === "open" && cats.has(a.category)).slice(0, 3);
  }, [state, activeListings]);

  return (
    <div className="animate-rise">
      {/* 1 — Photographic hero: mission first */}
      <section className="relative -mx-4 -mt-8 mb-12 overflow-hidden md:-mx-8 md:-mt-12">
        <SitePhoto
          image={IMAGES.communitySorting}
          eager
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-sidebar/95 via-sidebar/80 to-sidebar/30" />
        <div className="relative max-w-2xl px-6 py-14 text-sidebar-foreground md:px-12 md:py-16">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-lime">
            {t("home.eyebrow")}
          </p>
          <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
            <span className="mb-3 block text-lg text-lime">ReLoop</span>
            {c("hero")}
          </h1>
          <p className="mt-4 text-lg opacity-90">{t("home.heroText")}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild variant="lime" size="lg">
              <Link to="/exchange">
                {t("home.ctaExplore")} <ArrowRight className="rtl:rotate-180" />
              </Link>
            </Button>
            <Button variant="secondary" size="lg" onClick={() => setPostOpen(true)}>
              {t("home.ctaShare")}
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link to="/needs">{t("home.ctaNeed")}</Link>
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
        <h2 className="mb-2 text-2xl font-semibold md:text-3xl">{t("home.howTitle")}</h2>
        <p className="mb-6 max-w-2xl text-muted-foreground">{t("home.howText")}</p>
        <ol className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {STEP_KEYS.map((n) => (
            <li key={n} className="border-t border-border py-5 pe-5">
              <span className="mb-3 block font-display text-2xl font-semibold text-primary">
                {n}
              </span>
              <h3 className="text-lg font-semibold">{t(`home.step${n}Title` as const)}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {t(`home.step${n}Text` as const)}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* 3 — Everyday materials, image-led */}
      <section className="mb-12">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold md:text-3xl">
              {c("examples")}
            </h2>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              {c("examplesText")}
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/finder">
              <Search /> Open the material guidance
            </Link>
          </Button>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {EVERYDAY.map((e) => (
            <article
              key={e.name}
              className="overflow-hidden rounded-lg border bg-card"
            >
              <SitePhoto
                image={e.image}
                className="aspect-[4/3] w-full object-cover"
              />
              <div className="p-5">
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

      <section className="relative mb-12 overflow-hidden">
        <SitePhoto image={IMAGES.cardboardSorting} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-sidebar/80" />
        <div className="relative max-w-xl px-6 py-12 text-sidebar-foreground md:p-10">
          <h2 className="text-3xl font-semibold">{c("reuseAction")}</h2>
          <p className="mt-3 leading-relaxed">{c("reuseText")}</p>
          <Button asChild variant="secondary" className="mt-5 h-auto whitespace-normal py-3 text-start">
            <a href="https://www.pexels.com/search/videos/recycling/" target="_blank" rel="noopener noreferrer">{c("watch")}<ArrowRight className="shrink-0 rtl:rotate-180" /></a>
          </Button>
          <a href={CARDBOARD_SOURCE} target="_blank" rel="noopener noreferrer" className="mt-5 block text-xs underline">Unsplash · illustrative photo · Unsplash License</a>
        </div>
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
            <li
              key={t}
              className="flex items-start gap-3 rounded-xl bg-card p-4 text-sm shadow-card"
            >
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* 5 — Live community sections (secondary) */}
      <section className="mb-12">
        <h2 className="mb-2 text-2xl font-semibold md:text-3xl">{t("home.communityTitle")}</h2>
        <p className="mb-6 max-w-2xl text-muted-foreground">{t("home.communityText")}</p>
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
              Yours: <strong>{activeListings.filter((l) => l.ownerId === userId).length}</strong>
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
                {t("home.noListings")}
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
              <Link to="/exchange">{t("common.browseAll")}</Link>
            </Button>
          </div>
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-xl font-semibold">
              <HandHeart className="size-5 text-primary" /> Recent community needs
            </h3>
            {openNeeds.length === 0 ? (
              <p className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
                {t("home.noNeeds")}
              </p>
            ) : (
              openNeeds.slice(0, 3).map((n) => (
                <p key={n.id} className="border-b py-3">
                  <Link to="/needs" className="font-medium text-primary">
                    {n.title ?? n.description}
                  </Link>{" "}
                  · {n.mode ?? "FREE"} <OriginBadge origin={n.origin} />
                </p>
              ))
            )}
            <Button asChild variant="outline" size="sm" className="mt-4">
              <Link to="/needs">{t("common.seeAllNeeds")}</Link>
            </Button>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="mb-3 flex items-center gap-2 text-xl font-semibold">
            <CheckCircle2 className="size-5 text-primary" /> Recently completed exchanges
          </h3>
          {completedExchanges.length === 0 ? (
            <p className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
              No completed exchanges yet. When two neighbours confirm a handover, it appears here —
              and only then does it count as verified impact.
            </p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {completedExchanges.map(({ interest, listing }) => (
                <li key={interest.id} className="rounded-xl border bg-card p-4 text-sm shadow-card">
                  <p className="font-medium">{listing?.title ?? "Exchange"}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {interest.quantity != null && interest.unit
                      ? `${interest.quantity} ${interest.unit} · `
                      : ""}
                    Confirmed by both participants · {formatDate(interest.createdAt)}{" "}
                    <OriginBadge origin={interest.origin} />
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-5">
          <Card className="lg:col-span-3">
            <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold">
              <Clock className="size-5 text-primary" /> Recent community activity
            </h3>
            {state.activity.filter((e) => e.origin === "user").length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("home.noActivity")}</p>
            ) : (
              <ul className="divide-y">
                {state.activity
                  .filter((e) => e.origin === "user")
                  .slice(0, 7)
                  .map((e) => (
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
            Passing on usable items can extend their useful life and prevent unnecessary waste.
            Sign in, list what you no longer need, and help a neighbour reuse it.
          </p>
          <Button asChild variant="lime" size="lg" className="mt-5">
            <Link to="/exchange">
              Start sharing <ArrowRight />
            </Link>
          </Button>
          <p className="mt-4 text-xs opacity-60">{UNSPLASH_CREDIT.label}</p>
        </div>
      </section>
      <ListingFormDialog open={postOpen} onOpenChange={setPostOpen} />
    </div>
  );
}

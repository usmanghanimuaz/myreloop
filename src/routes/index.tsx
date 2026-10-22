import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Clock, Recycle, Sparkles, Users } from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, OriginBadge, PageHeader, formatDate } from "@/components/reloop/shared";
import { formatTotals, summarizeImpact } from "@/lib/reloop/impact";
import { useAppState } from "@/lib/reloop/store";
import { CATEGORY_LABEL } from "@/lib/reloop/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {property:"og:type",content:"website"},
      {name:"twitter:card",content:"summary_large_image"},
      { title: "Overview — ReLoop" },
      { name: "description", content: "See material recorded for reuse, active exchange listings and community actions at a glance." },
      { property: "og:title", content: "ReLoop Overview" },
      { property: "og:description", content: "Turn local waste into local resources." },
    ],
  }),
  component: Overview,
});

function Overview() {
  const state = useAppState();
  const impact = useMemo(() => summarizeImpact(state), [state]);
  const activeListings = state.listings.filter((l) => l.status !== "exchanged");
  const suggested = useMemo(() => {
    const cats = new Set(activeListings.map((l) => l.category));
    return state.actions.filter((a) => a.status === "open" && cats.has(a.category)).slice(0, 3);
  }, [state, activeListings]);

  return (
    <div className="animate-rise">
      <section className="bg-hero mb-8 overflow-hidden rounded-3xl p-8 text-primary-foreground md:p-12">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-lime">ReLoop</p>
        <h1 className="max-w-2xl text-4xl font-semibold md:text-5xl">Turn local waste into local resources.</h1>
        <p className="mt-4 max-w-xl opacity-85">Share reusable materials with neighbours, get practical guidance, and record what actually got reused or recycled.</p>
        <Button asChild variant="lime" size="lg" className="mt-6">
          <Link to="/finder">Find a Better Use <ArrowRight /></Link>
        </Button>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-sm text-muted-foreground">Material recorded as reused or recycled</p>
          <p className="mt-2 font-display text-3xl font-semibold">{formatTotals(impact.completed)}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Yours: <strong>{formatTotals(impact.completedByOrigin.user)}</strong> · Sample: {formatTotals(impact.completedByOrigin.sample)}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-muted-foreground">Active exchange listings</p>
          <p className="mt-2 font-display text-3xl font-semibold">{activeListings.length}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Yours: <strong>{activeListings.filter((l) => l.origin === "user").length}</strong> · Sample: {activeListings.filter((l) => l.origin === "sample").length}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-muted-foreground">Completed community actions</p>
          <p className="mt-2 font-display text-3xl font-semibold">{impact.completedActions.user + impact.completedActions.sample}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Yours: <strong>{impact.completedActions.user}</strong> · Sample: {impact.completedActions.sample}
          </p>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold"><Clock className="size-5 text-primary" /> Recent activity</h2>
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
        </Card>
        <Card className="lg:col-span-2">
          <h2 className="mb-1 flex items-center gap-2 text-xl font-semibold"><Sparkles className="size-5 text-primary" /> Suggested actions</h2>
          <p className="mb-4 text-sm text-muted-foreground">Based on materials currently on the exchange.</p>
          {suggested.length === 0 ? (
            <p className="text-sm text-muted-foreground">No matching open actions right now.</p>
          ) : (
            <ul className="space-y-3">
              {suggested.map((a) => (
                <li key={a.id} className="rounded-xl border bg-background p-3">
                  <p className="font-medium">{a.title}</p>
                  <p className="text-xs text-muted-foreground">Matches {CATEGORY_LABEL[a.category].toLowerCase()} listings · {a.durationMinutes} min</p>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild size="sm" variant="outline"><Link to="/actions"><Users /> Actions</Link></Button>
            <Button asChild size="sm" variant="outline"><Link to="/exchange"><Recycle /> Exchange</Link></Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

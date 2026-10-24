import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Leaf, Recycle, Search, HandHeart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, LangNote, PageHeader } from "@/components/reloop/shared";
import { IMAGES, UNSPLASH_CREDIT } from "@/lib/reloop/images";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "How ReLoop Works — ReLoop" },
      {
        name: "description",
        content:
          "Four steps that prevent waste: think before discarding, reuse before buying new, give items another life free or by exchange, and manage the rest responsibly.",
      },
      { property: "og:title", content: "How ReLoop Works — ReLoop" },
      {
        property: "og:description",
        content:
          "Think before you throw, reuse before you buy, pass it on free or by exchange, and dispose responsibly.",
      },
    ],
    links: [{ rel: "canonical", href: "/how-it-works" }],
  }),
  component: HowItWorks,
});

const STEPS = [
  {
    icon: Trash2,
    title: "Before you throw it away",
    text: "Usable items are often thrown away simply because their owner no longer needs them. That wastes their remaining useful life and adds to the waste problem. If an item still works or can be used, list it on ReLoop instead of discarding it.",
  },
  {
    icon: Search,
    title: "Reuse before buying new",
    text: "Looking for something? Check the available items and community needs first. Choosing an existing usable item avoids the materials, energy and packaging needed to make a new one.",
  },
  {
    icon: HandHeart,
    title: "Give it another life",
    text: "Offer the item FREE or arrange an EXCHANGE. Someone who needs it contacts you, you agree a safe local handover, and both participants confirm — so the reuse record is real, not guessed.",
  },
  {
    icon: Recycle,
    title: "Manage waste responsibly",
    text: "When an item genuinely can't be reused, the material guidance helps you repair it, recycle it through the right stream, or take hazardous items like batteries and electronics to designated collection points.",
  },
] as const;

function HowItWorks() {
  return (
    <div className="animate-rise">
      <PageHeader
        eyebrow="How ReLoop Works"
        title="Four steps that keep useful things out of the bin"
        description="ReLoop exists to prevent waste first. Helping a neighbour is the direct, welcome result of keeping usable items in use."
      />
      <LangNote />

      <ol className="mb-12 grid gap-4 md:grid-cols-2">
        {STEPS.map((s, i) => (
          <li key={s.title} className="rounded-2xl border bg-card p-6 shadow-card">
            <div className="mb-3 flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-full bg-primary font-display text-lg font-semibold text-primary-foreground">
                {i + 1}
              </span>
              <s.icon className="size-6 text-primary" aria-hidden />
            </div>
            <h2 className="text-xl font-semibold">{s.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{s.text}</p>
          </li>
        ))}
      </ol>

      <section className="mb-12 grid items-center gap-6 rounded-3xl bg-secondary p-6 md:grid-cols-2 md:p-10">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-semibold">
            <Leaf className="size-6 text-primary" aria-hidden /> Why it matters
          </h2>
          <p className="mt-3 text-muted-foreground">
            Poorly managed waste can pollute land, water and air, attract pests, and contribute to
            contamination and health risks for people and animals. Not every discarded item causes
            harm on its own — but at scale, throwing away usable things grows landfills, litter and
            unnecessary demand for new products.
          </p>
          <p className="mt-3 text-muted-foreground">
            ReLoop doesn't claim to solve pollution alone. It makes the easiest waste-prevention
            step — passing on what you no longer need — simple, local and honest.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button asChild variant="lime">
              <Link to="/exchange">
                Share an item <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/waste-evidence">See the evidence</Link>
            </Button>
          </div>
        </div>
        <figure>
          <img
            src={IMAGES.communitySorting.src}
            alt={IMAGES.communitySorting.alt}
            loading="lazy"
            className="rounded-2xl object-cover"
          />
          <figcaption className="mt-2 text-xs text-muted-foreground">
            {UNSPLASH_CREDIT.label}
          </figcaption>
        </figure>
      </section>

      <Card>
        <h2 className="text-xl font-semibold">What ReLoop is not</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          <li>No selling and no payments — items are offered FREE or by EXCHANGE only.</li>
          <li>No invented impact figures — only handovers confirmed by both participants count.</li>
          <li>
            No replacement for local waste services — always follow your local collection rules.
          </li>
        </ul>
      </Card>
    </div>
  );
}

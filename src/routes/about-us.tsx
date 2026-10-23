import { createFileRoute, Link } from "@tanstack/react-router";
import { Code2, Leaf, Lightbulb, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, LangNote, PageHeader } from "@/components/reloop/shared";

export const Route = createFileRoute("/about-us")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "About Us — ReLoop" },
      {
        name: "description",
        content:
          "How ReLoop began at the Neighborhood Hacks hackathon, the environmental problem it addresses, and the builder behind the project.",
      },
      { property: "og:title", content: "About Us — ReLoop" },
      {
        property: "og:description",
        content:
          "The story behind ReLoop: from a hackathon spark to an environmental reuse platform.",
      },
    ],
    links: [{ rel: "canonical", href: "/about-us" }],
  }),
  component: AboutUs,
});

function AboutUs() {
  return (
    <div className="animate-rise">
      <PageHeader
        eyebrow="About Us"
        title="Why ReLoop exists"
        description="An environmental waste-prevention initiative that helps people reuse usable items instead of throwing them away."
      />
      <LangNote />

      <Card className="mb-8">
        <h2 className="text-xl font-semibold">How it started</h2>
        <p className="mt-3 text-muted-foreground">
          ReLoop began when I joined Neighborhood Hacks, a hackathon encouraging participants to
          build technology projects addressing real community problems, including Environment &
          Sustainability. This inspired me to explore how technology could help reduce unnecessary
          waste and encourage people to reuse items that might otherwise be thrown away. Through
          brainstorming with ChatGPT, I developed the idea for ReLoop and began turning it into a
          project.
        </p>
      </Card>

      <section className="mb-10 grid gap-4 md:grid-cols-2">
        <Card>
          <Leaf className="mb-2 size-6 text-primary" aria-hidden />
          <h2 className="text-xl font-semibold">The problem we care about</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Usable items are often thrown away simply because their owners no longer need them. That
            wastes the item's remaining useful life and adds to the waste problem. Poorly managed
            waste can pollute land, water and air, attract pests, and contribute to contamination
            and health risks for people and animals.
          </p>
        </Card>
        <Card>
          <Lightbulb className="mb-2 size-6 text-primary" aria-hidden />
          <h2 className="text-xl font-semibold">What ReLoop does</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            ReLoop encourages people to think before throwing usable items away: list them, offer
            them FREE or by EXCHANGE, let someone who needs them get in touch, and extend the item's
            useful life. When reuse isn't possible, ReLoop points to credible recycling and
            safe-disposal guidance. Community assistance is a direct and welcome outcome — but
            environmental protection is the mission.
          </p>
        </Card>
      </section>

      <section className="mb-10 rounded-3xl border bg-card p-6 shadow-card md:p-10">
        <h2 className="text-2xl font-semibold">Meet the builder behind ReLoop</h2>
        <p className="mt-3 max-w-3xl text-muted-foreground">
          ReLoop is built by an independent developer who started in frontend design and later
          explored AI-assisted development and vibe coding. Along the way they took part in
          different hackathons and technology competitions — including ForgeHack and a CTF
          (capture-the-flag) contest — and developed ReLoop through their own effort and
          brainstorming with ChatGPT. The website and app implementation is being built using
          Lovable as the development platform.
        </p>
        <ul className="mt-5 grid gap-3 text-sm md:grid-cols-3">
          <li className="rounded-xl border bg-background p-4">
            <Code2 className="mb-2 size-5 text-primary" aria-hidden />
            <strong>Builder:</strong> the project author — design, direction and development
            decisions are theirs.
          </li>
          <li className="rounded-xl border bg-background p-4">
            <Lightbulb className="mb-2 size-5 text-primary" aria-hidden />
            <strong>ChatGPT:</strong> supported brainstorming and AI-assisted exploration — not the
            founder.
          </li>
          <li className="rounded-xl border bg-background p-4">
            <Trophy className="mb-2 size-5 text-primary" aria-hidden />
            <strong>Lovable:</strong> the development platform used to build this app — not the
            founder.
          </li>
        </ul>
      </section>

      <Card>
        <h2 className="text-xl font-semibold">Get involved</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The most useful thing you can do is simple: before you throw something usable away, list
          it. Someone nearby may need exactly that.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button asChild variant="lime">
            <Link to="/exchange">Share an item</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/mission">Read our mission</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, LangNote, PageHeader } from "@/components/reloop/shared";
import { IMAGES, UNSPLASH_CREDIT } from "@/lib/reloop/images";

export const Route = createFileRoute("/mission")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Our Mission — ReLoop" },
      {
        name: "description",
        content:
          "ReLoop's mission: prevent waste by extending the useful life of everyday items through free sharing and exchange, with responsible recycling and disposal when reuse isn't possible.",
      },
      { property: "og:title", content: "Our Mission — ReLoop" },
      {
        property: "og:description",
        content:
          "Reuse first, recycle right, dispose safely — and keep useful things out of bins, drains and dumps.",
      },
    ],
    links: [{ rel: "canonical", href: "https://myreloop.lovable.app/mission" }],
  }),
  component: Mission,
});

function Mission() {
  return (
    <div className="animate-rise">
      <PageHeader
        eyebrow="Our Mission"
        title="Don't waste it. Reuse it. Keep our environment clean."
        description="ReLoop is primarily an environmental waste-prevention and reuse initiative. Community assistance is an important outcome — environmental protection is the purpose."
      />
      <LangNote />

      <section className="relative mb-10 overflow-hidden rounded-3xl">
        <img
          src={IMAGES.beachCleanup.src}
          alt={IMAGES.beachCleanup.alt}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-sidebar/95 via-sidebar/80 to-sidebar/30" />
        <div className="relative max-w-2xl p-8 text-sidebar-foreground md:p-12">
          <h2 className="text-2xl font-semibold md:text-3xl">What we believe</h2>
          <p className="mt-3 opacity-90">
            Every usable item thrown away is a double loss: its remaining useful life is wasted, and
            the waste problem grows. The cheapest, cleanest waste is the waste that never happens.
          </p>
          <p className="mt-6 text-xs opacity-60">{UNSPLASH_CREDIT.label}</p>
        </div>
      </section>

      <div className="mb-10 grid gap-4 md:grid-cols-3">
        <Card>
          <h2 className="text-lg font-semibold">Prevent</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Think before throwing usable items away. List them on ReLoop, offer them FREE or by
            EXCHANGE, and let someone who needs them extend their useful life.
          </p>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold">Guide</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            When reuse isn't possible, provide credible repair, recycling and safe-disposal guidance
            — including hazardous items like batteries and electronics.
          </p>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold">Be honest</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            No invented statistics, no exaggerated claims. Impact counts only what both participants
            confirm, and external research is always cited and kept separate.
          </p>
        </Card>
      </div>

      <Card>
        <h2 className="text-xl font-semibold">What we don't claim</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          ReLoop does not claim to solve pollution alone, and not every exchange has a quantified
          environmental impact. What we can say honestly: every usable item passed on is one less
          item thrown away — and that is worth doing.
        </p>
        <Button asChild variant="lime" className="mt-4">
          <Link to="/exchange">
            Start reusing <ArrowRight />
          </Link>
        </Button>
      </Card>
    </div>
  );
}

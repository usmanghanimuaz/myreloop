import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { PageHeader, UNSPLASH_NOTE } from "@/components/reloop/shared";
import { ARTICLES } from "@/lib/reloop/articles";

export const Route = createFileRoute("/blog")({
  head: ({ matches }) => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Learning Blog — ReLoop" },
      {
        name: "description",
        content:
          "Original, evidence-based articles on waste prevention: reuse before disposal, household waste habits, and safe disposal of batteries and electronics.",
      },
      { property: "og:title", content: "Learning Blog — ReLoop" },
      {
        property: "og:description",
        content: "Practical, source-linked environmental education from the ReLoop project.",
      },
    ],
    links: matches.some((match) => match.routeId === "/blog/$slug")
      ? []
      : [{ rel: "canonical", href: "https://myreloop.lovable.app/blog" }],
  }),
  component: Blog,
});

function Blog() {
  return (
    <div className="animate-rise">
      <PageHeader
        eyebrow="Learning Blog"
        title="Learn how to waste less"
        description="Original explanatory articles by the ReLoop project builder, with cited facts linked to authoritative public sources. No invented statistics, no fake popularity — just useful, honest guidance."
      />
      <div className="grid gap-6 md:grid-cols-3">
        {ARTICLES.map((a) => (
          <article
            key={a.slug}
            className="flex flex-col overflow-hidden rounded-2xl border bg-card shadow-card"
          >
            <img
              src={a.image.src}
              alt={a.image.alt}
              loading="lazy"
              className="h-44 w-full object-cover"
            />
            <div className="flex flex-1 flex-col p-5">
              <h2 className="text-lg font-semibold">{a.title}</h2>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">{a.description}</p>
              <p className="mt-3 text-xs text-muted-foreground">
                By the ReLoop project builder · {a.published}
              </p>
              <Link
                to="/blog/$slug"
                params={{ slug: a.slug }}
                className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary"
              >
                Read the article <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
          </article>
        ))}
      </div>
      <UNSPLASH_NOTE />
    </div>
  );
}

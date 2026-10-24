import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { LangNote, Notice, UNSPLASH_NOTE } from "@/components/reloop/shared";
import { getArticle } from "@/lib/reloop/articles";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const article = getArticle(params.slug);
    if (!article) throw notFound();
    return article;
  },
  head: ({ loaderData, params }) => ({
    meta: [
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: `${loaderData?.title ?? "Article"} — ReLoop Blog` },
      { name: "description", content: loaderData?.description ?? "" },
      { property: "og:title", content: loaderData?.title ?? "ReLoop Blog" },
      { property: "og:description", content: loaderData?.description ?? "" },
      { property: "og:url", content: `https://myreloop.lovable.app/blog/${params.slug}` },
    ],
    links: [{ rel: "canonical", href: `https://myreloop.lovable.app/blog/${params.slug}` }],
    scripts: loaderData
      ? [
          {
            type: "application/ld+json",
            children: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Article",
              headline: loaderData.title,
              description: loaderData.description,
              author: { "@type": "Person", name: "ReLoop project builder" },
              datePublished: "2026-10-23",
              dateModified: "2026-10-23",
            }),
          },
          {
            type: "application/ld+json",
            children: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: "/" },
                { "@type": "ListItem", position: 2, name: "Learning Blog", item: "/blog" },
                { "@type": "ListItem", position: 3, name: loaderData.title },
              ],
            }),
          },
        ]
      : [],
  }),
  component: ArticlePage,
});

function ArticlePage() {
  const article = Route.useLoaderData();
  return (
    <article className="animate-rise">
      <Link
        to="/blog"
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-primary"
      >
        <ArrowLeft className="size-4 rtl:rotate-180" aria-hidden /> All articles
      </Link>
      <header className="mb-6 max-w-3xl">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Learning Blog
        </p>
        <h1 className="text-3xl font-semibold md:text-4xl">{article.title}</h1>
        <p className="mt-3 text-muted-foreground">{article.description}</p>
        <p className="mt-3 text-xs text-muted-foreground">
          By the ReLoop project builder · Published {article.published} · Updated {article.updated}
        </p>
      </header>
      <LangNote />
      <figure className="mb-8">
        <img
          src={article.image.src}
          alt={article.image.alt}
          className="max-h-96 w-full rounded-2xl object-cover"
        />
        <UNSPLASH_NOTE />
      </figure>
      <div className="max-w-3xl space-y-8">
        {article.blocks.map((b, i) => (
          <section key={i}>
            {b.heading && <h2 className="mb-2 text-2xl font-semibold">{b.heading}</h2>}
            {b.paragraphs.map((p, j) => (
              <p key={j} className="mt-3 text-muted-foreground">
                {p}
              </p>
            ))}
          </section>
        ))}
      </div>
      <section className="mt-10 max-w-3xl rounded-2xl border bg-card p-6 shadow-card">
        <h2 className="text-lg font-semibold">Sources & further reading</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {article.sources.map((s) => (
            <li key={s.url}>
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary underline underline-offset-4"
              >
                {s.title}
              </a>{" "}
              — {s.organization}
            </li>
          ))}
        </ul>
        <Notice className="mt-4">
          Explanations above are ReLoop's own writing; cited facts belong to the linked sources.
          Always follow your local waste-collection rules.
        </Notice>
      </section>
    </article>
  );
}

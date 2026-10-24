import { createFileRoute } from "@tanstack/react-router";
import { CommunityNeeds, RequestBoard } from "@/components/reloop/CommunityNeeds";
import { PageHeader } from "@/components/reloop/shared";
import { useConsoleT } from "@/lib/i18n-console";
import { SitePhoto } from "@/components/reloop/SitePhoto";
import { IMAGES, UNSPLASH_CREDIT } from "@/lib/reloop/images";

export const Route = createFileRoute("/needs")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Community Needs — I Need — ReLoop" },
      {
        name: "description",
        content:
          "Post what you're looking for — free or exchange — and let neighbours with matching usable items offer them instead of throwing them away.",
      },
      { property: "og:title", content: "Community Needs — I Need — ReLoop" },
      {
        property: "og:description",
        content: "Reuse before buying new: post a need and let someone's surplus become your find.",
      },
    ],
    links: [{ rel: "canonical", href: "/needs" }],
  }),
  component: NeedsPage,
});

function NeedsPage() {
  const t = useConsoleT();
  return (
    <div className="animate-rise">
      <PageHeader
        eyebrow="Community Needs — I Need"
        title={t("needTitle")}
        description={t("needText")}
      />
      <figure className="mb-8">
        <SitePhoto image={IMAGES.furniture} className="h-48 w-full rounded-lg object-cover md:h-64" />
        <figcaption className="mt-2 text-xs text-muted-foreground"><a href={UNSPLASH_CREDIT.url} target="_blank" rel="noopener noreferrer">{UNSPLASH_CREDIT.label}</a></figcaption>
      </figure>
      <CommunityNeeds />
      <RequestBoard />
    </div>
  );
}

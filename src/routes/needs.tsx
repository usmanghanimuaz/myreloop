import { createFileRoute } from "@tanstack/react-router";
import { CommunityNeeds, RequestBoard } from "@/components/reloop/CommunityNeeds";
import { PageHeader } from "@/components/reloop/shared";

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
  return (
    <div className="animate-rise">
      <PageHeader
        eyebrow="Community Needs — I Need"
        title="Ask before you buy new"
        description="Looking for something? Post a need and neighbours who have a matching usable item can offer it — free or in exchange. Every fulfilled need is one less new product made and one less usable item thrown away."
      />
      <CommunityNeeds />
      <RequestBoard />
    </div>
  );
}

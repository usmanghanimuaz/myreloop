import { createFileRoute } from "@tanstack/react-router";
import { ContactForm } from "@/components/reloop/ContactForm";
import { Notice, PageHeader } from "@/components/reloop/shared";

export const Route = createFileRoute("/report")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        property: "og:description",
        content:
          "Report unsafe listings, misuse, or technical problems on ReLoop so the community stays trustworthy.",
      },
      { title: "Report a Problem — ReLoop" },
      {
        name: "description",
        content:
          "Report unsafe listings, misuse, or technical problems on ReLoop so the community stays trustworthy.",
      },
      { property: "og:title", content: "Report a Problem — ReLoop" },
    ],
    links: [{ rel: "canonical", href: "https://myreloop.lovable.app/report" }],
  }),
  component: Report,
});

function Report() {
  return (
    <div className="animate-rise">
      <PageHeader
        eyebrow="Report a Problem"
        title="Help keep ReLoop safe and honest"
        description="Report unsafe or misleading listings, misuse of the exchange, or technical problems. Include the page or listing title so we can find it."
      />
      <Notice className="mb-6">
        If someone is in immediate danger, contact your local emergency services first — this form
        is not monitored around the clock.
      </Notice>
      <div className="max-w-xl">
        <ContactForm kind="report" />
      </div>
    </div>
  );
}

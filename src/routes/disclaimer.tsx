import { createFileRoute, Link } from "@tanstack/react-router";
import { PolicyPage, PolicySection } from "@/components/reloop/shared";

export const Route = createFileRoute("/disclaimer")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        property: "og:description",
        content:
          "How ReLoop handles information: general guidance, cited external research, illustrative photos, and the limits of what we verify.",
      },
      { title: "Content Disclaimer — ReLoop" },
      {
        name: "description",
        content:
          "How ReLoop handles information: general guidance, cited external research, illustrative photos, and the limits of what we verify.",
      },
      { property: "og:title", content: "Content Disclaimer — ReLoop" },
    ],
    links: [{ rel: "canonical", href: "/disclaimer" }],
  }),
  component: Disclaimer,
});

function Disclaimer() {
  return (
    <PolicyPage eyebrow="Policies" title="Content Disclaimer" updated="23 October 2026">
      <PolicySection title="General guidance, not professional advice">
        <p>
          Material guidance and blog articles are general educational information. Waste and
          recycling rules differ between areas — always follow your local collection rules and local
          authorities.
        </p>
      </PolicySection>
      <PolicySection title="External research">
        <p>
          The{" "}
          <Link to="/waste-evidence" className="text-primary underline underline-offset-4">
            Waste & Evidence
          </Link>{" "}
          page links to published research from public environmental bodies. That material belongs
          to its publishers, is summarised in our own words, and is never presented as ReLoop's own
          measurements or as local observations.
        </p>
      </PolicySection>
      <PolicySection title="Photos">
        <p>
          Photos on informational pages are illustrative stock images (credited to Unsplash
          contributors). They are not documentary evidence of any specific place or event.
        </p>
      </PolicySection>
      <PolicySection title="Impact figures">
        <p>
          ReLoop shows only what participants actually record. Verified figures require both
          participants to confirm a handover; self-reported records are labelled as such. We do not
          publish estimated CO₂ or landfill-diversion figures.
        </p>
      </PolicySection>
      <PolicySection title="User listings">
        <p>
          Listings and needs are posted by community members. ReLoop does not inspect items and
          cannot guarantee their condition, safety or availability.
        </p>
      </PolicySection>
    </PolicyPage>
  );
}

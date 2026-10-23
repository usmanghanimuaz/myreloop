import { createFileRoute, Link } from "@tanstack/react-router";
import { PolicyPage, PolicySection } from "@/components/reloop/shared";

export const Route = createFileRoute("/safety")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { title: "Safety & Exchange Policy — ReLoop" },
      {
        name: "description",
        content:
          "How to exchange items safely on ReLoop: public meeting places, item inspection, hazardous-waste rules and reporting problems.",
      },
      { property: "og:title", content: "Safety & Exchange Policy — ReLoop" },
    ],
    links: [{ rel: "canonical", href: "/safety" }],
  }),
  component: Safety,
});

function Safety() {
  return (
    <PolicyPage eyebrow="Policies" title="Safety & Exchange Policy" updated="23 October 2026">
      <PolicySection title="Meeting for a handover">
        <p>
          Agree a public, well-lit place in your request notes — never share your home address
          publicly. Bring someone with you if you can, and tell a person you trust where you're
          going.
        </p>
      </PolicySection>
      <PolicySection title="Before you confirm">
        <p>
          Inspect the item before confirming the handover. Once both participants confirm, the
          exchange is recorded as verified — confirm only what actually happened.
        </p>
      </PolicySection>
      <PolicySection title="Items that must not be exchanged">
        <p>
          Do not list or accept hazardous household waste (paint, solvents, chemicals), loose or
          swollen batteries, expired medicines, or damaged mains-powered devices. The{" "}
          <Link to="/finder" className="text-primary underline underline-offset-4">
            Material Guidance
          </Link>{" "}
          page explains safe disposal routes for these.
        </p>
      </PolicySection>
      <PolicySection title="If something goes wrong">
        <p>
          Use the{" "}
          <Link to="/report" className="text-primary underline underline-offset-4">
            Report a Problem
          </Link>{" "}
          page. If anyone is in immediate danger, contact local emergency services first.
        </p>
      </PolicySection>
    </PolicyPage>
  );
}

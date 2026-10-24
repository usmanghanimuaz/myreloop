import { createFileRoute, Link } from "@tanstack/react-router";
import { PolicyPage, PolicySection } from "@/components/reloop/shared";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        property: "og:description",
        content:
          "The terms for using ReLoop: free and exchange-only listings, honest descriptions, safe handovers and acceptable use.",
      },
      { title: "Terms & Conditions — ReLoop" },
      {
        name: "description",
        content:
          "The terms for using ReLoop: free and exchange-only listings, honest descriptions, safe handovers and acceptable use.",
      },
      { property: "og:title", content: "Terms & Conditions — ReLoop" },
    ],
    links: [{ rel: "canonical", href: "https://myreloop.lovable.app/terms" }],
  }),
  component: Terms,
});

function Terms() {
  return (
    <PolicyPage eyebrow="Policies" title="Terms & Conditions" updated="23 October 2026">
      <PolicySection title="What ReLoop is">
        <p>
          ReLoop is an environmental waste-prevention initiative. It helps people list usable items
          they no longer need — offered FREE or by EXCHANGE only — so someone nearby can use them
          instead of the items being thrown away.
        </p>
      </PolicySection>
      <PolicySection title="No selling">
        <p>
          ReLoop does not support payments, prices or checkout. Listings or needs that attempt to
          sell items may be removed.
        </p>
      </PolicySection>
      <PolicySection title="Your responsibilities">
        <p>
          Describe items honestly, including condition. Do not list hazardous waste, illegal items,
          or anything you do not have the right to give away. Do not include personal contact
          details in public listing text — use the handover notes after a request is accepted.
        </p>
      </PolicySection>
      <PolicySection title="Handovers">
        <p>
          Handovers are arranged directly between participants. ReLoop records the confirmation but
          is not a party to the exchange and cannot guarantee items or behaviour. Follow the{" "}
          <Link to="/safety" className="text-primary underline underline-offset-4">
            Safety & Exchange Policy
          </Link>
          .
        </p>
      </PolicySection>
      <PolicySection title="Content and guidance">
        <p>
          Material guidance and educational articles are general information, not professional
          advice. Always follow your local waste-collection rules and the instructions of local
          authorities.
        </p>
      </PolicySection>
      <PolicySection title="Availability">
        <p>
          ReLoop is an independent project provided as-is. Features may change, and the service may
          be unavailable at times.
        </p>
      </PolicySection>
    </PolicyPage>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage, PolicySection } from "@/components/reloop/shared";

export const Route = createFileRoute("/community-guidelines")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { title: "Community Guidelines — ReLoop" },
      {
        name: "description",
        content:
          "How to keep ReLoop useful and trustworthy: honest listings, respectful handovers, and reuse-first behaviour.",
      },
      { property: "og:title", content: "Community Guidelines — ReLoop" },
    ],
    links: [{ rel: "canonical", href: "/community-guidelines" }],
  }),
  component: Guidelines,
});

function Guidelines() {
  return (
    <PolicyPage eyebrow="Policies" title="Community Guidelines" updated="23 October 2026">
      <PolicySection title="Reuse first">
        <p>
          ReLoop exists to prevent waste. List items that are genuinely usable, and describe their
          condition honestly — including flaws.
        </p>
      </PolicySection>
      <PolicySection title="Be respectful">
        <p>
          Treat other participants politely. Reply to requests in reasonable time, show up when you
          agree a handover, and cancel early if plans change.
        </p>
      </PolicySection>
      <PolicySection title="Keep it clean and safe">
        <p>
          Offer items in a condition you would be comfortable receiving. Never list hazardous waste,
          medicines, weapons, or illegal goods.
        </p>
      </PolicySection>
      <PolicySection title="Protect privacy">
        <p>
          Do not post other people's names, addresses or contact details. Keep handover arrangements
          in the private request notes.
        </p>
      </PolicySection>
      <PolicySection title="Honest records">
        <p>
          Only confirm a handover that actually happened. Verified impact depends on both
          participants telling the truth.
        </p>
      </PolicySection>
    </PolicyPage>
  );
}

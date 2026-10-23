import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, PageHeader } from "@/components/reloop/shared";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { title: "FAQ — ReLoop" },
      {
        name: "description",
        content:
          "Frequently asked questions about ReLoop: how free sharing and exchange work, safety, impact tracking and what ReLoop does not do.",
      },
      { property: "og:title", content: "FAQ — ReLoop" },
    ],
    links: [{ rel: "canonical", href: "/faq" }],
  }),
  component: Faq,
});

const QA = [
  {
    q: "Is ReLoop free to use?",
    a: "Yes. Items are offered FREE or by EXCHANGE only — there is no selling, no payments and no checkout anywhere on ReLoop.",
  },
  {
    q: "Why does ReLoop focus on reuse instead of recycling?",
    a: "Reuse sits earlier in the waste hierarchy: it extends an item's useful life without the energy and transport that recycling needs. When reuse isn't possible, ReLoop's material guidance points you to responsible recycling and safe disposal.",
  },
  {
    q: "How does an exchange work?",
    a: "List what you have (or post what you need), wait for an interest request or offer, agree a safe public handover place in your notes, and both participants confirm the handover afterwards. Only then does it count as verified reuse.",
  },
  {
    q: "Can I sell items on ReLoop?",
    a: "No. ReLoop is a waste-prevention initiative, not a marketplace. Everything is FREE or EXCHANGE.",
  },
  {
    q: "How is impact calculated?",
    a: "Only handovers confirmed by both participants count as verified reuse. Self-reported actions and plans are shown separately and clearly labelled. ReLoop never invents CO₂ or landfill figures.",
  },
  {
    q: "Is it safe to meet strangers for a handover?",
    a: "Follow the Safety & Exchange Policy: meet in a public place, bring someone if you can, inspect the item before confirming, and never share more personal detail than needed. Report problems through the Report a Problem page.",
  },
  {
    q: "What about hazardous items like batteries or paint?",
    a: "Do not list hazardous waste for exchange. The Material Guidance page explains safe handling and points to designated collection options.",
  },
  {
    q: "Who runs ReLoop?",
    a: "ReLoop is an independent project built by one developer — see the About Us page for the full story.",
  },
] as const;

function Faq() {
  return (
    <div className="animate-rise">
      <PageHeader
        eyebrow="FAQ"
        title="Frequently asked questions"
        description="Straight answers about how ReLoop works and what it does — and doesn't — do."
      />
      <div className="grid gap-4 md:grid-cols-2">
        {QA.map((item) => (
          <Card key={item.q}>
            <h2 className="text-lg font-semibold">{item.q}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{item.a}</p>
          </Card>
        ))}
      </div>
      <p className="mt-6 text-sm text-muted-foreground">
        Still unsure? <Link to="/contact" className="font-medium text-primary underline underline-offset-4">Contact us</Link>.
      </p>
    </div>
  );
}

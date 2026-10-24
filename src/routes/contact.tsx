import { createFileRoute } from "@tanstack/react-router";
import { ContactForm } from "@/components/reloop/ContactForm";
import { Notice, PageHeader } from "@/components/reloop/shared";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        property: "og:description",
        content:
          "Questions, feedback or partnership ideas for ReLoop — send a message through the contact form.",
      },
      { title: "Contact Us — ReLoop" },
      {
        name: "description",
        content:
          "Questions, feedback or partnership ideas for ReLoop — send a message through the contact form.",
      },
      { property: "og:title", content: "Contact Us — ReLoop" },
    ],
    links: [{ rel: "canonical", href: "https://myreloop.lovable.app/contact" }],
  }),
  component: Contact,
});

function Contact() {
  return (
    <div className="animate-rise">
      <PageHeader
        eyebrow="Contact Us"
        title="Get in touch"
        description="Questions, feedback, or ideas for working together on waste prevention — send a message below."
      />
      <Notice className="mb-6">
        ReLoop is a small independent project and does not yet have an official contact email or
        postal address. This form is the way to reach us; when an official address exists it will be
        published here.
      </Notice>
      <div className="max-w-xl">
        <ContactForm kind="contact" />
      </div>
    </div>
  );
}

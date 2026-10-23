import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage, PolicySection } from "@/components/reloop/shared";

export const Route = createFileRoute("/cookies")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { title: "Cookie Policy — ReLoop" },
      {
        name: "description",
        content:
          "ReLoop uses no tracking or advertising cookies — only the storage needed for sign-in and your language preference.",
      },
      { property: "og:title", content: "Cookie Policy — ReLoop" },
    ],
    links: [{ rel: "canonical", href: "/cookies" }],
  }),
  component: Cookies,
});

function Cookies() {
  return (
    <PolicyPage eyebrow="Policies" title="Cookie Policy" updated="23 October 2026">
      <PolicySection title="The short version">
        <p>
          ReLoop does not use advertising, analytics or tracking cookies. There is no cookie banner
          because there is nothing optional to consent to.
        </p>
      </PolicySection>
      <PolicySection title="What is stored in your browser">
        <p>
          Two functional items only: your sign-in session (stored by the authentication service so
          you stay signed in) and your chosen interface language (so the site remembers it between
          visits). Neither is used to track you across other websites.
        </p>
      </PolicySection>
      <PolicySection title="Third-party content">
        <p>
          Illustrative photos are loaded from Unsplash's image servers, and fonts from Google Fonts.
          Those services may see your request for the file (like any image on the web) but ReLoop
          does not send them your account data.
        </p>
      </PolicySection>
      <PolicySection title="If this changes">
        <p>
          If optional analytics are ever added, this page will be updated and consent will be
          requested before any non-essential storage is used.
        </p>
      </PolicySection>
    </PolicyPage>
  );
}

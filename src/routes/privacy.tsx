import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage, PolicySection } from "@/components/reloop/shared";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        property: "og:description",
        content:
          "What data ReLoop stores: account sign-in, your listings, needs, offers, photos and evidence notes — and what it does not collect.",
      },
      { title: "Privacy Policy — ReLoop" },
      {
        name: "description",
        content:
          "What data ReLoop stores: account sign-in, your listings, needs, offers, photos and evidence notes — and what it does not collect.",
      },
      { property: "og:title", content: "Privacy Policy — ReLoop" },
    ],
    links: [{ rel: "canonical", href: "https://myreloop.lovable.app/privacy" }],
  }),
  component: Privacy,
});

function Privacy() {
  return (
    <PolicyPage eyebrow="Policies" title="Privacy Policy" updated="23 October 2026">
      <PolicySection title="What we store">
        <p>
          If you sign in with email/password or Google, we store your account identity to keep your
          records yours. Your private profile holds your first/last name, display name, general
          area, optional unverified phone, notification preferences, terms acceptance and
          mission-popup dismissal. We store the listings, needs, offers, handover confirmations,
          impact records and evidence notes you create. Listing photos you upload are stored
          privately and are visible only to you and authorized handover participants.
        </p>
      </PolicySection>
      <PolicySection title="Administration and support">
        <p>
          Authorized administrators can review display names, general areas, listings, needs,
          requests, handover states, safety reports and submitted evidence for moderation. The
          administration console does not display member email addresses or private phone numbers.
          Contact-form names and message content can be read by authorized administrators; do not
          include sensitive information or exact addresses in a support message.
        </p>
      </PolicySection>
      <PolicySection title="What is public">
        <p>
          Listings and community needs you post are visible to other visitors so the exchange can
          work. Your private observation notes, plans and completion records stay scoped to your
          account or handover participants. Submitted field evidence remains private unless
          validated for public visibility; authorized administrators can review it.
        </p>
      </PolicySection>
      <PolicySection title="What we do not do">
        <p>
          We do not run advertising or analytics trackers, we do not sell data, and we do not
          collect precise location. Listings use a general area description that you write yourself.
        </p>
      </PolicySection>
      <PolicySection title="Local browser storage">
        <p>
          Your chosen interface language is saved in your browser's local storage so it persists
          between visits. Sign-in session data is also kept in browser storage by the authentication
          service. Mission-popup dismissal is also stored per guest or account in this browser;
          signed-in profiles additionally save dismissal across devices. See the Cookie Policy for
          details.
        </p>
      </PolicySection>
      <PolicySection title="Your choices">
        <p>
          You can edit or delete your listings and needs at any time, and delete your own impact
          plans. To ask about your data, use the contact form.
        </p>
      </PolicySection>
    </PolicyPage>
  );
}

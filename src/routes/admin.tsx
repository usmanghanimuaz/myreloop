import { createFileRoute } from "@tanstack/react-router";
import { AccountButton } from "@/components/reloop/AccountButton";
import { AdminConsole } from "@/components/reloop/AdminConsole";
import { useStoreMeta } from "@/lib/reloop/store";
import { useDashT } from "@/lib/i18n-dash";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Console — ReLoop" },
      {
        name: "description",
        content:
          "Private ReLoop administration: members, reuse listings, reports, handovers, support and moderation history.",
      },
      { property: "og:title", content: "Admin Console — ReLoop" },
      {
        property: "og:description",
        content:
          "Private administration of ReLoop reuse activity, safety reports and member controls.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: Admin,
});

function Admin() {
  const { userId, hydrated } = useStoreMeta();
  const t = useDashT();
  if (!hydrated) return <p className="p-8 text-muted-foreground">{t("loading")}</p>;
  if (!userId)
    return (
      <section className="max-w-lg border-s-4 border-primary bg-card p-8">
        <h1 className="mb-4 text-2xl">{t("mod.signIn")}</h1>
        <AccountButton />
      </section>
    );
  return <AdminConsole />;
}

import { createFileRoute } from "@tanstack/react-router";
import { AccountButton } from "@/components/reloop/AccountButton";
import { AdminConsole } from "@/components/reloop/AdminConsole";
import { useStoreMeta } from "@/lib/reloop/store";
import { useDashT } from "@/lib/i18n-dash";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Moderation — ReLoop" },
      {
        name: "description",
        content: "ReLoop moderation for evidence review and reports. Admins only.",
      },
      { property: "og:title", content: "Moderation — ReLoop" },
      { property: "og:description", content: "Admins only." },
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

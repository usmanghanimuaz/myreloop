import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  HandHeart,
  PackageOpen,
  Recycle,
  ShieldCheck,
  Camera,
  MessagesSquare,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ListingFormDialog } from "@/components/reloop/ListingFormDialog";
import { SitePhoto } from "@/components/reloop/SitePhoto";
import { useAboutT } from "@/lib/i18n-about";
import { CARDBOARD_SOURCE, IMAGES } from "@/lib/reloop/images";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — ReLoop | Useful things deserve a second life" },
      {
        name: "description",
        content:
          "ReLoop connects people with useful surplus items and neighbours who need them. Discover our reuse-first mission, Free and Exchange, and safe, honest handovers.",
      },
      { property: "og:title", content: "About Us — ReLoop" },
      {
        property: "og:description",
        content:
          "A community reuse platform: pass on useful things, find what you need and reduce avoidable waste.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "https://myreloop.lovable.app/about" },
    ],
    links: [{ rel: "canonical", href: "https://myreloop.lovable.app/about" }],
  }),
  component: AboutUs,
});

function AboutUs() {
  const t = useAboutT();
  const [postOpen, setPostOpen] = useState(false);
  const steps = [
    { title: "have", text: "haveText", icon: PackageOpen, to: "/exchange" },
    { title: "need", text: "needText", icon: HandHeart, to: "/needs" },
    { title: "connect", text: "connectText", icon: Recycle, to: "/account" },
  ] as const;
  const principles = [
    { title: "reuse", text: "reuseText", icon: Recycle },
    { title: "honest", text: "honestText", icon: Camera },
    { title: "respect", text: "respectText", icon: MessagesSquare },
    { title: "safe", text: "safeText", icon: ShieldCheck },
    { title: "free", text: "freeText", icon: HandHeart },
  ] as const;
  return (
    <div className="animate-rise">
      <section className="relative -mx-4 -mt-8 mb-3 overflow-hidden md:-mx-8 md:-mt-12">
        <SitePhoto
          image={{ ...IMAGES.cardboardSorting, alt: t("photo") }}
          eager
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-sidebar/95 via-sidebar/80 to-sidebar/40" />
        <div className="relative max-w-2xl px-6 py-14 text-sidebar-foreground md:px-12 md:py-16">
          <p className="mb-3 text-sm font-semibold text-lime">ReLoop · {t("label")}</p>
          <h1 className="text-4xl font-semibold leading-tight md:text-5xl">{t("title")}</h1>
          <p className="mt-5 text-lg leading-relaxed">{t("intro")}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild variant="lime" size="lg">
              <Link to="/exchange">
                {t("browse")}
                <ArrowRight className="shrink-0 rtl:rotate-180" />
              </Link>
            </Button>
            <Button variant="secondary" size="lg" onClick={() => setPostOpen(true)}>
              {t("post")}
            </Button>
          </div>
        </div>
      </section>
      <a
        href={CARDBOARD_SOURCE}
        target="_blank"
        rel="noopener noreferrer"
        className="mb-12 block text-xs text-muted-foreground underline underline-offset-4"
      >
        {t("credit")}
      </a>

      <section className="mb-12" aria-labelledby="why-reloop">
        <h2 id="why-reloop" className="text-3xl font-semibold">
          {t("why")}
        </h2>
        <div className="mt-6 grid gap-8 md:grid-cols-2">
          <div className="border-s-4 border-primary ps-5">
            <h3 className="text-xl font-semibold">{t("exampleLabel")}</h3>
            <p className="mt-3 leading-relaxed text-muted-foreground">{t("example")}</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold">{t("mission")}</h3>
            <p className="mt-3 leading-relaxed text-muted-foreground">{t("missionText")}</p>
          </div>
        </div>
      </section>

      <section className="mb-12 border-y py-10" aria-labelledby="community-works">
        <h2 id="community-works" className="text-3xl font-semibold">
          {t("how")}
        </h2>
        <ol className="mt-7 grid gap-8 md:grid-cols-3">
          {steps.map((step, i) => (
            <li key={step.title}>
              <div className="mb-4 flex items-center gap-3 text-primary">
                <span className="font-display text-3xl">0{i + 1}</span>
                <step.icon className="size-6" aria-hidden />
              </div>
              <h3 className="text-xl font-semibold">
                <Link
                  to={step.to}
                  className="underline decoration-border underline-offset-4 hover:decoration-primary"
                >
                  {t(step.title)}
                </Link>
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t(step.text)}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mb-12" aria-labelledby="reloop-beliefs">
        <h2 id="reloop-beliefs" className="text-3xl font-semibold">
          {t("beliefs")}
        </h2>
        <ul className="mt-7 grid gap-x-8 md:grid-cols-2">
          {principles.map((principle) => (
            <li key={principle.title} className="flex gap-4 border-b py-5">
              <principle.icon className="mt-1 size-5 shrink-0 text-primary" aria-hidden />
              <div>
                <h3 className="text-lg font-semibold">{t(principle.title)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {t(principle.text)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-secondary px-6 py-10 md:px-10">
        <h2 className="text-3xl font-semibold">{t("start")}</h2>
        <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">{t("startText")}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/exchange">
              {t("browse")}
              <ArrowRight className="rtl:rotate-180" />
            </Link>
          </Button>
          <Button variant="outline" onClick={() => setPostOpen(true)}>
            {t("post")}
          </Button>
        </div>
      </section>
      <ListingFormDialog open={postOpen} onOpenChange={setPostOpen} />
    </div>
  );
}

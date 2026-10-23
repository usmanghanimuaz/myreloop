import { Link } from "@tanstack/react-router";
import { Recycle } from "lucide-react";
import { LANGUAGES, useI18n, type Lang } from "@/lib/i18n";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { lang, setLang, t } = useI18n();
  return (
    <label className={className}>
      <span className="sr-only">{t("common.language")}</span>
      <select
        aria-label={t("common.language")}
        value={lang}
        onChange={(e) => setLang(e.target.value as Lang)}
        className="w-full rounded-lg border border-sidebar-border bg-sidebar px-2 py-1.5 text-sm text-sidebar-foreground"
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function Footer() {
  const { t } = useI18n();
  const groups: { heading: string; links: { to: string; label: string }[] }[] = [
    {
      heading: t("footer.explore"),
      links: [
        { to: "/", label: t("footer.home") },
        { to: "/exchange", label: t("footer.items") },
        { to: "/needs", label: t("footer.needs") },
        { to: "/finder", label: t("footer.guidance") },
        { to: "/actions", label: t("footer.activity") },
        { to: "/impact", label: t("footer.impact") },
      ],
    },
    {
      heading: t("footer.learn"),
      links: [
        { to: "/about", label: t("footer.evidence") },
        { to: "/stories", label: t("footer.stories") },
        { to: "/blog", label: t("footer.blog") },
        { to: "/faq", label: t("footer.faq") },
        { to: "/how-it-works", label: t("footer.how") },
      ],
    },
    {
      heading: t("footer.about"),
      links: [
        { to: "/about-us", label: t("footer.aboutUs") },
        { to: "/mission", label: t("footer.mission") },
        { to: "/contact", label: t("footer.contact") },
        { to: "/report", label: t("footer.report") },
      ],
    },
    {
      heading: t("footer.policies"),
      links: [
        { to: "/terms", label: t("footer.terms") },
        { to: "/privacy", label: t("footer.privacy") },
        { to: "/cookies", label: t("footer.cookies") },
        { to: "/community-guidelines", label: t("footer.guidelines") },
        { to: "/safety", label: t("footer.safety") },
        { to: "/disclaimer", label: t("footer.disclaimer") },
      ],
    },
  ];
  return (
    <footer className="mt-16 border-t bg-sidebar text-sidebar-foreground">
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
        <div className="grid gap-8 md:grid-cols-[1.2fr_repeat(4,1fr)]">
          <div>
            <p className="flex items-center gap-2 font-display text-lg font-semibold">
              <span className="grid size-7 place-items-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Recycle className="size-4" aria-hidden />
              </span>
              ReLoop
            </p>
            <p className="mt-3 max-w-xs text-sm opacity-75">{t("footer.tagline")}</p>
          </div>
          {groups.map((g) => (
            <nav key={g.heading} aria-label={g.heading}>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider opacity-70">
                {g.heading}
              </h2>
              <ul className="space-y-2 text-sm">
                {g.links.map((l) => (
                  <li key={l.to}>
                    <Link
                      to={l.to}
                      className="opacity-80 underline-offset-4 hover:opacity-100 hover:underline"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <p className="mt-10 border-t border-sidebar-border pt-4 text-xs opacity-60">
          ReLoop — {t("common.tagline")}. Photos: Unsplash contributors (illustrative). External
          research remains the property of its publishers.
        </p>
      </div>
    </footer>
  );
}

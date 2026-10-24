import { Link, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  BookOpen,
  Camera,
  HandHeart,
  Home,
  Info,
  Menu,
  Newspaper,
  PackageOpen,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useI18n } from "@/lib/i18n";
import { hydrateStore, useStoreMeta } from "@/lib/reloop/store";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { AccountButton } from "./AccountButton";
import { LogoMark } from "./LogoMark";
import { Footer, LanguageSwitcher } from "./Footer";

const NAV = [
  { to: "/", key: "nav.home", icon: Home },
  { to: "/exchange", key: "nav.exchange", icon: PackageOpen },
  { to: "/needs", key: "nav.needs", icon: HandHeart },
  { to: "/finder", key: "nav.finder", icon: BookOpen },
  { to: "/waste-evidence", key: "nav.about", icon: Info },
  { to: "/about", key: "footer.aboutUs", icon: Users },
  { to: "/stories", key: "nav.stories", icon: Camera },
  { to: "/actions", key: "nav.actions", icon: Users },
  { to: "/impact", key: "nav.impact", icon: BarChart3 },
  { to: "/blog", key: "nav.blog", icon: Newspaper },
] as const;

function Logo() {
  const { t } = useI18n();
  return (
    <Link to="/" className="flex min-w-0 items-center gap-2.5 rounded-lg">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
        <LogoMark className="size-5" />
      </span>
      <span className="min-w-0">
        <span className="block font-display text-xl font-semibold leading-none">ReLoop</span>
        <span className="block truncate text-[11px] opacity-70">{t("common.tagline")}</span>
      </span>
    </Link>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: (() => void) | undefined }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { t } = useI18n();
  const { userId } = useStoreMeta();
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    if (!userId) return setIsAdmin(false);
    let live = true;
    // Display only; /admin data is re-checked server-side and in the database.
    void supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle()
      .then(({ data }) => live && setIsAdmin(!!data));
    return () => {
      live = false;
    };
  }, [userId]);
  const items = [
    ...NAV,
    ...(userId ? [{ to: "/account", key: "nav.account", icon: UserRound } as const] : []),
    ...(isAdmin ? [{ to: "/admin", key: "nav.admin", icon: ShieldCheck } as const] : []),
  ];
  return (
    <nav aria-label={t("nav.main")} className="flex flex-col gap-1">
      {items.map(({ to, key, icon: Icon }) => {
        const active = to === "/" ? path === "/" : path.startsWith(to);
        return (
          <Link
            key={key}
            to={to}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-sidebar-ring",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
            )}
          >
            <Icon className={cn("size-4 shrink-0", active && "text-sidebar-primary")} aria-hidden />
            <span className="leading-snug">{t(key)}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarBody({ onNavigate }: { onNavigate?: (() => void) | undefined }) {
  const { t } = useI18n();
  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto p-5 text-sidebar-foreground">
      <Logo />
      <NavLinks onNavigate={onNavigate} />
      <div className="mt-auto space-y-3">
        <LanguageSwitcher />
        <p className="rounded-xl bg-sidebar-accent/70 p-3 text-xs leading-relaxed text-sidebar-foreground/80">
          {t("footer.tagline")}
        </p>
        <AccountButton />
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const meta = useStoreMeta();
  const { t } = useI18n();
  useEffect(() => {
    hydrateStore();
  }, []);
  useEffect(() => {
    if (meta.recoveredFromCorruptData)
      toast.warning("Saved data was unreadable, so the demo dataset was restored.");
  }, [meta.recoveredFromCorruptData]);

  return (
    <div className="min-h-screen bg-background">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-card focus:px-4 focus:py-2"
      >
        {t("nav.skip")}
      </a>
      <aside className="fixed inset-y-0 left-0 hidden w-64 bg-sidebar lg:block rtl:left-auto rtl:right-0">
        <SidebarBody />
      </aside>
      <header className="sticky top-0 z-30 flex items-center justify-between gap-2 bg-sidebar px-4 py-3 text-sidebar-foreground lg:hidden">
        <Logo />
        <div className="flex items-center gap-2">
          <LanguageSwitcher className="w-28" />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                aria-label={t("nav.open")}
                className="grid size-10 place-items-center rounded-xl hover:bg-sidebar-accent"
              >
                <Menu className="size-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 border-0 bg-sidebar p-0">
              <SheetTitle className="sr-only">{t("nav.main")}</SheetTitle>
              <SidebarBody onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
        </div>
      </header>
      <div className="lg:pl-64 rtl:lg:pl-0 rtl:lg:pr-64">
        <main id="main">
          {!meta.storageAvailable && (
            <p className="bg-warning px-6 py-2 text-sm text-warning-foreground">
              Browser storage is unavailable — changes will be lost when you close this tab.
            </p>
          )}
          <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-12">{children}</div>
        </main>
        <Footer />
      </div>
    </div>
  );
}

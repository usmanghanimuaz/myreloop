import { Link, useRouterState } from "@tanstack/react-router";
import { BarChart3, Info, LayoutGrid, Menu, Recycle, RotateCcw, Search, Users } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { actions, hydrateStore, useStoreMeta } from "@/lib/reloop/store";
import { cn } from "@/lib/utils";
import { AccountButton } from "./AccountButton";

const NAV = [
  { to: "/", label: "Overview", icon: LayoutGrid },
  { to: "/finder", label: "Find a Better Use", icon: Search },
  { to: "/exchange", label: "Reuse Exchange", icon: Recycle },
  { to: "/actions", label: "Community Actions", icon: Users },
  { to: "/impact", label: "Impact Tracker", icon: BarChart3 },
  { to: "/about", label: "About the Project", icon: Info },
] as const;

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5 rounded-lg">
      <span className="grid size-9 place-items-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
        <Recycle className="size-5" aria-hidden />
      </span>
      <span>
        <span className="block font-display text-xl font-semibold leading-none">ReLoop</span>
        <span className="text-[11px] opacity-70">Local waste → local resources</span>
      </span>
    </Link>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: (() => void) | undefined }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav aria-label="Main" className="flex flex-col gap-1">
      {NAV.map(({ to, label, icon: Icon }) => {
        const active = to === "/" ? path === "/" : path.startsWith(to);
        return (
          <Link
            key={to}
            to={to}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-sidebar-ring",
              active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
            )}
          >
            <Icon className={cn("size-4", active && "text-sidebar-primary")} aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function ResetButton() {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground">
          <RotateCcw className="size-4" aria-hidden /> Reset demo data
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reset demo data?</AlertDialogTitle>
          <AlertDialogDescription>
            This restores the original sample dataset and permanently clears everything you created on this device: listings, interest requests, completed actions, impact records and evidence notes.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={async () => {
              try { await actions.resetDemo(); toast.success("Your records cleared"); }
              catch(error) { toast.error(error instanceof Error ? error.message : "Could not clear records"); }
            }}
          >
            Reset everything
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function SidebarBody({ onNavigate }: { onNavigate?: (() => void) | undefined }) {
  return (
    <div className="flex h-full flex-col gap-8 p-5 text-sidebar-foreground">
      <Logo />
      <NavLinks onNavigate={onNavigate} />
      <div className="mt-auto space-y-3">
        <p className="rounded-xl bg-sidebar-accent/70 p-3 text-xs leading-relaxed text-sidebar-foreground/80">
          Shared community listings. Records marked <strong>Sample</strong> are fictional and excluded from real impact.
        </p>
        <AccountButton />
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const meta = useStoreMeta();
  useEffect(() => {
    hydrateStore();
  }, []);
  useEffect(() => {
    if (meta.recoveredFromCorruptData) toast.warning("Saved data was unreadable, so the demo dataset was restored.");
  }, [meta.recoveredFromCorruptData]);

  return (
    <div className="min-h-screen bg-background">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-card focus:px-4 focus:py-2">
        Skip to content
      </a>
      <aside className="fixed inset-y-0 left-0 hidden w-64 bg-sidebar lg:block">
        <SidebarBody />
      </aside>
      <header className="sticky top-0 z-30 flex items-center justify-between bg-sidebar px-4 py-3 text-sidebar-foreground lg:hidden">
        <Logo />
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button aria-label="Open navigation" className="grid size-10 place-items-center rounded-xl hover:bg-sidebar-accent">
              <Menu className="size-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 border-0 bg-sidebar p-0">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <SidebarBody onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
      </header>
      <main id="main" className="lg:pl-64">
        {!meta.storageAvailable && (
          <p className="bg-warning px-6 py-2 text-sm text-warning-foreground">
            Browser storage is unavailable — changes will be lost when you close this tab.
          </p>
        )}
        <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-12">{children}</div>
      </main>
    </div>
  );
}

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { ListingStatus, Origin } from "@/lib/reloop/types";

export function PageHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        {eyebrow && (
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            {eyebrow}
          </p>
        )}
        <h1 className="text-3xl font-semibold text-foreground md:text-4xl">{title}</h1>
        {description && <p className="mt-3 text-muted-foreground">{description}</p>}
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </header>
  );
}

export function OriginBadge({ origin, className }: { origin: Origin; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
        origin === "sample" ? "bg-sample text-sample-foreground" : "bg-user text-user-foreground",
        className,
      )}
    >
      {origin === "sample" ? "Sample data" : "Community record"}
    </span>
  );
}

const STATUS_STYLE: Record<ListingStatus, string> = {
  available: "bg-lime/60 text-lime-foreground",
  reserved: "bg-warning text-warning-foreground",
  exchanged: "bg-muted text-muted-foreground",
  closed: "bg-muted text-muted-foreground",
};
export function StatusBadge({ status }: { status: ListingStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize",
        STATUS_STYLE[status],
      )}
    >
      {status}
    </span>
  );
}

export function Card({ className, children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("rounded-2xl border bg-card p-5 shadow-card", className)} {...rest}>
      {children}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed bg-card/60 px-6 py-12 text-center">
      <div className="mb-3 grid size-12 place-items-center rounded-full bg-secondary text-primary">
        {icon}
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      {children && <div className="mt-2 max-w-sm text-sm text-muted-foreground">{children}</div>}
    </div>
  );
}

export function Notice({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={cn("rounded-xl bg-sample/60 px-4 py-3 text-sm text-sample-foreground", className)}
    >
      {children}
    </p>
  );
}

export function PolicyPage({
  eyebrow,
  title,
  updated,
  children,
}: {
  eyebrow: string;
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <div className="animate-rise">
      <PageHeader eyebrow={eyebrow} title={title} description={`Last updated: ${updated}`} />
      <div className="max-w-3xl space-y-6">{children}</div>
      <Notice className="mt-8 max-w-3xl">
        This page explains how ReLoop works in plain language. It is not legal advice and has not
        been reviewed by a lawyer.
      </Notice>
    </div>
  );
}

export function PolicySection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 text-xl font-semibold">{title}</h2>
      <div className="space-y-2 text-sm text-muted-foreground">{children}</div>
    </section>
  );
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

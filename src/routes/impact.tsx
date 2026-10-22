import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, Check, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import { saved } from "@/components/reloop/CommunityNeeds";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, EmptyState, Notice, OriginBadge, PageHeader, formatDate } from "@/components/reloop/shared";
import { computeInsights, formatTotals, summarizeImpact } from "@/lib/reloop/impact";
import { actions, useAppState } from "@/lib/reloop/store";
import { CATEGORIES, CATEGORY_LABEL, UNITS, type Category, type Unit } from "@/lib/reloop/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/impact")({
  head: () => ({
    meta: [
      {property:"og:type",content:"website"},
      {name:"twitter:card",content:"summary_large_image"},
      { title: "Impact Tracker — ReLoop" },
      { name: "description", content: "Transparent, unit-consistent tracking of material recorded as reused or recycled, plus community insights." },
      { property: "og:title", content: "Impact Tracker — ReLoop" },
      { property: "og:description", content: "Only what you record counts. No invented CO2 figures." },
    ],
  }),
  component: Impact,
});

function Impact() {
  const state = useAppState();
  const s = useMemo(() => summarizeImpact(state), [state]);
  const ins = useMemo(() => computeInsights(state), [state]);
  const [unit, setUnit] = useState<Unit>("kg");
  const chart = s.byCategory.filter((r) => r.unit === unit).map((r) => ({ name: CATEGORY_LABEL[r.category], quantity: r.quantity }));
  const log = [...state.impact].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div className="animate-rise">
      <PageHeader eyebrow="Transparent Impact Tracker" title="Impact tracker" description="Material counts as diverted only when someone records that it was actually reused or recycled. Units are never added together. No CO₂ or landfill estimates are shown." />

      <div className="grid gap-4 md:grid-cols-4">
        <Stat label="Recorded as diverted" value={formatTotals(s.completed)} />
        <Stat label="Reused" value={formatTotals(s.byDiversion.reuse)} />
        <Stat label="Recycled" value={formatTotals(s.byDiversion.recycle)} />
        <Stat label="Planned — not yet verified" value={formatTotals(s.planned)} muted />
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Your records: {formatTotals(s.completedByOrigin.user)} · Sample records: {formatTotals(s.completedByOrigin.sample)} · Completed actions: {s.completedActions.user} yours, {s.completedActions.sample} sample
      </p>

      <Card className="mt-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">Quantity by category</h2>
          <div role="group" aria-label="Unit" className="flex gap-1 rounded-full border bg-background p-1">
            {UNITS.map((u) => (
              <button key={u} aria-pressed={unit === u} onClick={() => setUnit(u)} className={cn("rounded-full px-3 py-1 text-sm", unit === u ? "bg-primary text-primary-foreground" : "hover:bg-accent")}>{u}</button>
            ))}
          </div>
        </div>
        {chart.length === 0 ? (
          <EmptyState icon={<BarChart3 className="size-6" />} title={`Nothing recorded in ${unit} yet`}>Complete an exchange or record an action with a quantity.</EmptyState>
        ) : (
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={chart}>
                <CartesianGrid vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} allowDecimals />
                <Tooltip formatter={(v) => [`${v} ${unit}`, "Recorded"]} cursor={{ fill: "var(--color-muted)" }} />
                <Bar dataKey="quantity" fill="var(--color-chart-1)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      <Card className="mt-6">
        <h2 className="mb-4 text-xl font-semibold">Activity log</h2>
        {log.length === 0 ? <p className="text-sm text-muted-foreground">No records yet.</p> : (
          <ul className="divide-y">
            {log.map((e) => (
              <li key={e.id} className="flex flex-wrap items-center gap-3 py-3 text-sm">
                <span className="mr-auto">
                  <strong>{e.quantity} {e.unit}</strong> {CATEGORY_LABEL[e.category].toLowerCase()} — {e.note}
                  <span className="block text-xs text-muted-foreground">{formatDate(e.createdAt)} · {e.diversion === "reuse" ? "Reuse" : "Recycling"} · via {e.source}</span>
                </span>
                <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", e.completed ? "bg-lime/60 text-lime-foreground" : "bg-warning text-warning-foreground")}>{e.completed ? "Recorded" : "Planned — unverified"}</span>
                <OriginBadge origin={e.origin} />
                {!e.completed && e.origin === "user" && (
                  <>
                    <Button size="sm" variant="outline" onClick={() => { void saved(()=>actions.markPlanCompleted(e.id),"Recorded as done"); }}><Check /> Mark done</Button>
                    <Button size="icon" variant="ghost" aria-label="Delete plan" onClick={()=>void saved(()=>actions.deleteImpactEntry(e.id),"Plan removed")}><Trash2 /></Button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <section className="mt-10">
        <PageHeader eyebrow="Community Insights" title="Insights" description="Calculated from shared listings and your account records. They don't represent any real city or neighbourhood." />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <InsightList title="Most listed materials" rows={ins.mostListed.map((r) => [CATEGORY_LABEL[r.category], `${r.count}`])} />
          <InsightList title="Most exchange interest" rows={ins.mostInterest.map((r) => [CATEGORY_LABEL[r.category], `${r.count}`])} />
          <Card><h3 className="text-sm font-medium text-muted-foreground">Open community actions</h3><p className="mt-2 font-display text-4xl font-semibold">{ins.openActions}</p></Card>
          <Card>
            <h3 className="mb-2 text-sm font-medium text-muted-foreground">Unmet reuse needs</h3>
            {ins.unmetNeeds.length === 0 ? <p className="text-sm">None right now.</p> : (
              <ul className="space-y-2 text-sm">{ins.unmetNeeds.map((n) => <li key={n.category}><strong>{CATEGORY_LABEL[n.category]}</strong> ({n.count}): <span className="text-muted-foreground">{n.examples.join("; ")}</span></li>)}</ul>
            )}
          </Card>
        </div>

      </section>
    </div>
  );
}

function Stat({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return <Card className={cn(muted && "bg-muted/60")}><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 font-display text-2xl font-semibold">{value}</p></Card>;
}

function InsightList({ title, rows }: { title: string; rows: [string, string][] }) {
  return (
    <Card>
      <h3 className="mb-2 text-sm font-medium text-muted-foreground">{title}</h3>
      {rows.length === 0 ? <p className="text-sm">No data yet.</p> : (
        <ol className="space-y-1 text-sm">{rows.slice(0, 5).map(([k, v]) => <li key={k} className="flex justify-between"><span>{k}</span><span className="font-semibold">{v}</span></li>)}</ol>
      )}
    </Card>
  );
}

function NeedForm() {
  const [category, setCategory] = useState<Category>("textiles");
  const [desc, setDesc] = useState("");
  const [err, setErr] = useState("");
  return (
    <Card className="mt-4">
      <form className="grid gap-3 md:grid-cols-[180px_1fr_auto] md:items-end" onSubmit={async (e) => {
        e.preventDefault();
        if (desc.trim().length < 3) return setErr("Describe the need in a few words.");
        if (desc.length > 120) return setErr("Keep it under 120 characters.");
        if(!await saved(()=>actions.addNeed(category,desc),"Need posted")) return; setDesc(""); setErr(""); toast.success("Reuse need posted");
      }}>
        <div className="grid gap-1.5"><Label htmlFor="n-cat">Material needed</Label>
          <select id="n-cat" className="field" value={category} onChange={(e) => setCategory(e.target.value as Category)}>{CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>)}</select>
        </div>
        <div className="grid gap-1.5"><Label htmlFor="n-desc">What do you need it for?</Label><Input id="n-desc" value={desc} onChange={(e) => setDesc(e.target.value)} aria-invalid={!!err || undefined} /></div>
        <Button type="submit">Post need</Button>
        {err && <p className="text-xs text-destructive md:col-span-3">{err}</p>}
      </form>
      <Notice className="mt-3">A need is “unmet” while no available listing exists in that material.</Notice>
    </Card>
  );
}

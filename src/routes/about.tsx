import { createFileRoute } from "@tanstack/react-router";
import { School, Store, Users, Recycle } from "lucide-react";
import { useEffect, useState } from "react";
import { saved } from "@/components/reloop/CommunityNeeds";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, Notice, PageHeader } from "@/components/reloop/shared";
import { actions, useAppState, useStoreMeta } from "@/lib/reloop/store";
import { wasteSources, sourceRetrievalDate } from "@/lib/reloop/sources";
import type { Evidence } from "@/lib/reloop/types";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Waste Problem & Evidence — ReLoop" },
      {
        name: "description",
        content:
          "Source-linked waste education from UNEP, ITU, EPA and Punjab EPD, with private community observation notes.",
      },
      { property: "og:title", content: "Waste Problem & Evidence — ReLoop" },
      {
        property: "og:description",
        content:
          "Published environmental research kept separate from personal observations and ReLoop impact.",
      },
    ],
  }),
  component: About,
});

const FIELDS: { key: keyof Evidence; label: string; long?: boolean; type?: string }[] = [
  { key: "problem", label: "Observed local waste problem", long: true },
  { key: "community", label: "Neighbourhood or community affected" },
  { key: "date", label: "Date of observation", type: "date" },
  { key: "method", label: "Research method", long: true },
  { key: "interviewed", label: "Number of residents interviewed (if applicable)", type: "number" },
  { key: "findings", label: "Anonymized findings", long: true },
  { key: "limitations", label: "Supporting evidence and limitations", long: true },
  { key: "howReloopHelps", label: "How ReLoop addresses the problem", long: true },
];

function About() {
  const state = useAppState();
  const { userId, busy } = useStoreMeta();
  const [ev, setEv] = useState<Evidence>(state.evidence);
  useEffect(() => setEv(state.evidence), [state.evidence]);

  return (
    <div className="animate-rise">
      <PageHeader
        eyebrow="About the Project"
        title="Why ReLoop"
        description="ReLoop helps communities reduce avoidable waste by turning reusable household materials into useful local resources — through an exchange board, practical guidance, community actions and honest impact tracking."
      />

      <Card className="mb-8">
        <h2 className="text-xl font-semibold">Community reuse and honest records</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          <li>
            Listings and needs are shared. Your evidence notes, plans and completion records are
            saved privately to your account.
          </li>
          <li>
            Records labelled “Sample data” are fictional and exist so the app can be explored.
          </li>
          <li>
            Guidance is general advice from a built-in dataset — always check local collection
            rules.
          </li>
          <li>No CO₂ or landfill figures are estimated.</li>
        </ul>
      </Card>
      <section className="mb-10">
        <h2 className="mb-2 text-2xl font-semibold">Waste problem & published evidence</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Published research and government guidance — not neighbourhood observations or ReLoop
          impact measurements.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {wasteSources.map((source) => (
            <Card key={source.url}>
              <p className="text-xs font-semibold uppercase text-primary">{source.organization}</p>
              <h3 className="mt-2 text-lg font-semibold">
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-4"
                >
                  {source.title}
                </a>
              </h3>
              <p className="mt-3 text-sm">{source.summary}</p>
              <p className="mt-3 text-xs text-muted-foreground">
                Published: {source.published}
                <br />
                Retrieved: {sourceRetrievalDate}
                <br />
                Attribution: {source.organization}. Original summary with source link; media reuse
                rights not confirmed.
              </p>
            </Card>
          ))}
        </div>
        <Notice className="mt-3">
          Report images, charts and videos are not reproduced because their reuse permissions have
          not been confirmed.
        </Notice>
      </section>

      <h2 className="mb-1 text-2xl font-semibold">Community evidence</h2>
      <p className="mb-4 text-sm text-muted-foreground">
        Fill this in with real research. Empty fields stay marked as awaiting validation — nothing
        here is pre-filled or invented.
      </p>
      <Card>
        <form
          className="grid gap-4 md:grid-cols-2"
          onSubmit={async (e) => {
            e.preventDefault();
            await saved(() => actions.saveEvidence(ev), "Evidence saved privately to your account");
          }}
        >
          {FIELDS.map((f) => {
            const empty = !ev[f.key].trim();
            return (
              <div key={f.key} className={f.long ? "grid gap-1.5 md:col-span-2" : "grid gap-1.5"}>
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor={`ev-${f.key}`}>{f.label}</Label>
                  {empty && (
                    <span className="rounded-full bg-warning px-2 py-0.5 text-[11px] font-semibold text-warning-foreground">
                      Awaiting validation
                    </span>
                  )}
                </div>
                {f.long ? (
                  <Textarea
                    id={`ev-${f.key}`}
                    rows={3}
                    value={ev[f.key]}
                    onChange={(e) => setEv({ ...ev, [f.key]: e.target.value })}
                  />
                ) : (
                  <Input
                    id={`ev-${f.key}`}
                    type={f.type ?? "text"}
                    min={f.type === "number" ? 0 : undefined}
                    value={ev[f.key]}
                    onChange={(e) => setEv({ ...ev, [f.key]: e.target.value })}
                  />
                )}
              </div>
            );
          })}
          <div className="md:col-span-2">
            <Button type="submit" disabled={!userId || busy}>
              Save evidence
            </Button>
            {!userId && (
              <p className="mt-2 text-sm text-muted-foreground">
                Sign in to save private evidence notes.
              </p>
            )}
          </div>
        </form>
      </Card>
      <Notice className="mt-3">
        Don't record names or contact details of interviewees. Keep findings anonymized.
      </Notice>

      <h2 className="mb-4 mt-10 text-2xl font-semibold">Piloting ReLoop</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {[
          {
            icon: Users,
            t: "Residents",
            d: "Start with one street or building group. Run a 4-week trial of the exchange and one cleanup, recording every completed exchange.",
          },
          {
            icon: School,
            t: "Schools",
            d: "Use the textile and paper actions as class projects; let students run the Impact Tracker and present what was actually recorded.",
          },
          {
            icon: Store,
            t: "Local shops",
            d: "Partner with a refill or grocery shop to accept clean jars and packaging collected through the action board.",
          },
          {
            icon: Recycle,
            t: "Local recyclers",
            d: "Ask recyclers to review the guidance dataset so it matches what is accepted locally, and agree how drop-offs are confirmed.",
          },
        ].map(({ icon: Icon, t, d }) => (
          <Card key={t}>
            <Icon className="mb-2 size-6 text-primary" />
            <h3 className="text-lg font-semibold">{t}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{d}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { ReportButton } from "@/components/reloop/ReportButton";
import { ExternalLink, PlayCircle, ShieldCheck, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { saved } from "@/components/reloop/CommunityNeeds";
import { Card, LangNote, Notice, PageHeader } from "@/components/reloop/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { IMAGES, UNSPLASH_CREDIT } from "@/lib/reloop/images";
import { FieldEvidenceInputSchema, type FieldEvidenceInput } from "@/lib/reloop/schema";
import { actions, useAppState, useStoreMeta } from "@/lib/reloop/store";

export const Route = createFileRoute("/stories")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Community Stories & Field Evidence — ReLoop" },
      {
        name: "description",
        content:
          "Watch official environmental explainers from UNEP, WHO and EPA, and share your own local field evidence — reviewed before it is shown publicly.",
      },
      { property: "og:title", content: "Community Stories & Field Evidence — ReLoop" },
      {
        property: "og:description",
        content:
          "Official videos on waste and plastic pollution, plus privacy-safe community field evidence.",
      },
    ],
    links: [{ rel: "canonical", href: "https://myreloop.lovable.app/stories" }],
  }),
  component: Stories,
});

/**
 * Official educational videos and explainers. Links checked 23 October 2026
 * (UNEP pages block automated fetchers with 403 but load in a browser).
 * We link out rather than embed or rehost — media rights stay with the publisher.
 */
const WATCH = [
  {
    title: "Plastic, not so fantastic",
    publisher: "UN Environment Programme",
    url: "https://www.unep.org/en/news-and-stories/video/plastic-not-so-fantastic",
    note: "A short official video on why single-use plastic is a design problem, not just a litter problem.",
  },
  {
    title: "Plastic pollution: harmful chemicals in our plastics",
    publisher: "UN Environment Programme",
    url: "https://www.unep.org/en/news-and-stories/video/plastic-pollution-harmful-chemicals-our-plastics",
    note: "What chemicals in everyday plastics mean for health and the environment.",
  },
  {
    title: "Youth call to action on plastic pollution — video series",
    publisher: "UN Environment Programme",
    url: "https://www.unep.org/en/news-and-stories/video/youth-call-action-plastic-pollution-new-unep-video-series",
    note: "Young people explain why plastic pollution matters to their generation.",
  },
  {
    title: "Health risks and opportunities in the global waste crisis",
    publisher: "World Health Organization (Dec 2025)",
    url: "https://www.who.int/news/item/16-12-2025-who-highlights-health-risks-and-opportunities-in-the-global-waste-crisis",
    note: "WHO on how mismanaged waste creates health risks — and what better systems prevent.",
  },
  {
    title: "Waste Pollution 101",
    publisher: "UN Environment Programme",
    url: "https://www.unep.org/interactives/beat-waste-pollution/",
    note: "An interactive explainer on where waste goes and why prevention beats cleanup.",
  },
  {
    title: "Used lithium-ion batteries",
    publisher: "US Environmental Protection Agency",
    url: "https://www.epa.gov/recycle/used-lithium-ion-batteries",
    note: "Why lithium batteries cause fires in bins and trucks, and how to dispose of them.",
  },
] as const;

const emptyForm = {
  kind: "photo" as "photo" | "video-link",
  title: "",
  description: "",
  area: "",
  date: "",
  externalUrl: "",
  consent: false,
};

function Stories() {
  const state = useAppState();
  const { userId, busy } = useStoreMeta();
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);

  const validated = state.fieldEvidence.filter((e) => e.validated);
  const mine = userId ? state.fieldEvidence.filter((e) => e.ownerId === userId) : [];

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    let mediaPath: string | undefined;
    if (form.kind === "photo") {
      if (!file) return setErrors({ mediaPath: "Choose a photo to upload" });
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5_000_000)
        return setErrors({ mediaPath: "Use JPG, PNG or WebP up to 5 MB" });
      setUploading(true);
      const ext = file.type === "image/jpeg" ? "jpg" : file.type === "image/png" ? "png" : "webp";
      const path = `${userId}/evidence-${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from("reloop-photos")
        .upload(path, file, { contentType: file.type });
      setUploading(false);
      if (error) return setErrors({ mediaPath: "Photo upload failed. Please try again." });
      mediaPath = path;
    }
    const parsed = FieldEvidenceInputSchema.safeParse({
      kind: form.kind,
      title: form.title,
      description: form.description,
      area: form.area,
      date: form.date,
      mediaPath,
      externalUrl: form.kind === "video-link" ? form.externalUrl : undefined,
      consent: form.consent,
    });
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues)
        fieldErrors[String(issue.path[0] ?? "form")] = issue.message;
      setErrors(fieldErrors);
      return;
    }
    const ok = await saved(
      () => actions.submitFieldEvidence(parsed.data as FieldEvidenceInput),
      "Evidence submitted — it will appear publicly once reviewed",
    );
    if (ok) {
      setForm(emptyForm);
      setFile(null);
    } else if (mediaPath) {
      await supabase.storage.from("reloop-photos").remove([mediaPath]);
    }
  }

  return (
    <div className="animate-rise">
      <PageHeader
        eyebrow="Community Stories & Field Evidence"
        title="Watch, learn, and share what you see"
        description="Official videos and explainers from environmental bodies — plus a place to document what waste looks like in your own neighbourhood. Community evidence stays private until reviewed."
      />
      <LangNote />

      <section className="mb-12 grid overflow-hidden rounded-2xl border bg-card shadow-card md:grid-cols-3">
        <img
          src={IMAGES.beachCleanup.src}
          alt={IMAGES.beachCleanup.alt}
          loading="lazy"
          className="h-44 w-full object-cover md:h-full"
        />
        <div className="p-6 md:col-span-2">
          <h2 className="text-xl font-semibold">Why evidence matters</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Real change starts with seeing the problem clearly. The videos below come from official
            environmental organisations; the field evidence form lets you document local conditions
            honestly — with your consent, and only shared publicly after review.
          </p>
          <p className="mt-3 text-xs text-muted-foreground">{UNSPLASH_CREDIT.label}</p>
        </div>
      </section>

      <h2 className="mb-2 text-2xl font-semibold">Watch & learn</h2>
      <p className="mb-5 max-w-2xl text-sm text-muted-foreground">
        Official videos and explainers, linked directly to their publishers. We link out rather than
        re-host — the media belongs to the organisations that made it.
      </p>
      <div className="mb-12 grid gap-4 md:grid-cols-2">
        {WATCH.map((v) => (
          <Card key={v.url}>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
              <PlayCircle className="size-4" aria-hidden /> {v.publisher}
            </p>
            <h3 className="mt-2 text-lg font-semibold">
              <a
                href={v.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4"
              >
                {v.title}
              </a>
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">{v.note}</p>
            <a
              href={v.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary underline underline-offset-4"
            >
              Watch on the official site <ExternalLink className="size-3.5" aria-hidden />
            </a>
          </Card>
        ))}
      </div>

      <h2 className="mb-2 text-2xl font-semibold">Community field evidence</h2>
      <p className="mb-5 max-w-2xl text-sm text-muted-foreground">
        Documented by community members, reviewed before publishing. Direct video upload is not
        supported — share a photo, or link to a video you posted yourself on a public platform.
      </p>

      {validated.length === 0 ? (
        <Notice className="mb-8">
          No community evidence has been validated yet. Submissions appear here only after review —
          nothing unverified is shown publicly.
        </Notice>
      ) : (
        <div className="mb-8 grid gap-4 md:grid-cols-2">
          {validated.map((e) => (
            <Card key={e.id}>
              <p className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                <ShieldCheck className="size-4" aria-hidden /> Reviewed community evidence
              </p>
              <h3 className="mt-2 text-lg font-semibold">{e.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{e.description}</p>
              <p className="mt-3 text-xs text-muted-foreground">
                {e.area} · Observed {e.date}
                {e.kind === "photo" && " · Photo held in private storage"}
              </p>
              {e.kind === "video-link" && e.externalUrl && (
                <a
                  href={e.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary underline underline-offset-4"
                >
                  Watch the video <ExternalLink className="size-3.5" aria-hidden />
                </a>
              )}
              <ReportButton targetKind="fieldEvidence" targetId={e.id} />
            </Card>
          ))}
        </div>
      )}

      <Card>
        <h3 className="mb-1 text-xl font-semibold">Submit field evidence</h3>
        <p className="mb-4 text-sm text-muted-foreground">
          Share a photo you took, or a link to a video you published yourself. Include a general
          area (never an exact address) and the date. Your submission is private until reviewed.
        </p>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={submit} noValidate>
          <div className="grid gap-1.5">
            <Label htmlFor="fe-kind">Evidence type</Label>
            <select
              id="fe-kind"
              className="field"
              value={form.kind}
              onChange={(e) => setForm({ ...form, kind: e.target.value as "photo" | "video-link" })}
            >
              <option value="photo">Photo I took</option>
              <option value="video-link">Link to a video I published</option>
            </select>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="fe-date">Date of observation</Label>
            <Input
              id="fe-date"
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              aria-invalid={!!errors["date"] || undefined}
            />
            {errors["date"] && <p className="text-xs text-destructive">{errors["date"]}</p>}
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="fe-title">Title</Label>
            <Input
              id="fe-title"
              value={form.title}
              maxLength={80}
              placeholder="e.g. Overflowing bins near the market"
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              aria-invalid={!!errors["title"] || undefined}
            />
            {errors["title"] && <p className="text-xs text-destructive">{errors["title"]}</p>}
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="fe-area">General area</Label>
            <Input
              id="fe-area"
              value={form.area}
              maxLength={60}
              placeholder="e.g. Near the central library — no exact addresses"
              onChange={(e) => setForm({ ...form, area: e.target.value })}
              aria-invalid={!!errors["area"] || undefined}
            />
            {errors["area"] && <p className="text-xs text-destructive">{errors["area"]}</p>}
          </div>
          <div className="grid gap-1.5 md:col-span-2">
            <Label htmlFor="fe-desc">Description</Label>
            <Textarea
              id="fe-desc"
              rows={3}
              value={form.description}
              maxLength={400}
              placeholder="What does the evidence show? No names or contact details."
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              aria-invalid={!!errors["description"] || undefined}
            />
            {errors["description"] && (
              <p className="text-xs text-destructive">{errors["description"]}</p>
            )}
          </div>
          {form.kind === "photo" ? (
            <div className="grid gap-1.5 md:col-span-2">
              <Label htmlFor="fe-photo">Photo (JPG, PNG or WebP, up to 5 MB)</Label>
              <Input
                id="fe-photo"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={!userId}
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                aria-invalid={!!errors["mediaPath"] || undefined}
              />
              {errors["mediaPath"] && (
                <p className="text-xs text-destructive">{errors["mediaPath"]}</p>
              )}
            </div>
          ) : (
            <div className="grid gap-1.5 md:col-span-2">
              <Label htmlFor="fe-url">Video link (https://)</Label>
              <Input
                id="fe-url"
                type="url"
                value={form.externalUrl}
                placeholder="https://…"
                onChange={(e) => setForm({ ...form, externalUrl: e.target.value })}
                aria-invalid={!!errors["externalUrl"] || undefined}
              />
              {errors["externalUrl"] && (
                <p className="text-xs text-destructive">{errors["externalUrl"]}</p>
              )}
            </div>
          )}
          <label className="flex items-start gap-2 text-sm md:col-span-2">
            <input
              type="checkbox"
              className="mt-1 size-4 accent-primary"
              checked={form.consent}
              onChange={(e) => setForm({ ...form, consent: e.target.checked })}
            />
            <span>
              I took this photo or published this video myself, I have the right to share it, and I
              consent to ReLoop showing it publicly after review. It contains no identifiable people
              without their permission.
              {errors["consent"] && (
                <span className="block text-xs text-destructive">{errors["consent"]}</span>
              )}
            </span>
          </label>
          <div className="md:col-span-2">
            <Button type="submit" disabled={!userId || busy || uploading}>
              <Upload className="size-4" aria-hidden />{" "}
              {uploading ? "Uploading…" : "Submit for review"}
            </Button>
            {!userId && (
              <p className="mt-2 text-sm text-muted-foreground">
                Sign in to submit field evidence.
              </p>
            )}
          </div>
        </form>
      </Card>

      {mine.length > 0 && (
        <section className="mt-8">
          <h3 className="mb-3 text-lg font-semibold">Your submissions</h3>
          <ul className="space-y-2">
            {mine.map((e) => (
              <li
                key={e.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border bg-card px-4 py-3 text-sm"
              >
                <span className="min-w-0">
                  <strong>{e.title}</strong> · {e.area} · {e.date}
                </span>
                <span className="flex items-center gap-2">
                  <span
                    className={
                      e.validated
                        ? "rounded-full bg-lime/50 px-2 py-0.5 text-[11px] font-medium text-lime-foreground"
                        : "rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
                    }
                  >
                    {e.validated ? "Published" : "Awaiting review"}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={busy}
                    onClick={() =>
                      void saved(() => actions.deleteFieldEvidence(e.id), "Submission removed")
                    }
                  >
                    Remove
                  </Button>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
      <Notice className="mt-6">
        Submissions are stored privately and shown publicly only after review. Don't include
        identifiable people, exact addresses, or contact details.
      </Notice>
    </div>
  );
}

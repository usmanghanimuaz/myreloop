import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { PHOTO_DRAFT_COPY } from "@/lib/i18n-photo-draft";
import { draftListingFromPhoto } from "@/lib/reloop/photo-draft.functions";
import type { PhotoDraft } from "@/lib/reloop/photo-draft";

export function PhotoDraftControl({ path, disabled, onApply, onBusy }: {
  path: string; disabled: boolean; onApply: (draft: PhotoDraft) => void; onBusy: (busy: boolean) => void;
}) {
  const { lang, dir } = useI18n();
  const copy = PHOTO_DRAFT_COPY[lang];
  const analyze = useServerFn(draftListingFromPhoto);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState<PhotoDraft | null>(null);
  const [error, setError] = useState("");
  async function generate() {
    setConsent(false); setBusy(true); onBusy(true); setError(""); setDraft(null);
    try {
      const result = await analyze({ data: { path, lang } });
      if ("draft" in result && result.draft) setDraft(result.draft);
      else if ("error" in result && result.error) setError("message" in result && result.message ? result.message : copy[result.error]);
    } catch { setError(copy.unavailable); }
    finally { setBusy(false); onBusy(false); }
  }
  return <div dir={dir} className="grid gap-2 border-t border-border pt-3">
    <Button type="button" variant="outline" disabled={disabled || busy} onClick={() => setConsent(true)} className="w-full whitespace-normal">
      {busy ? <LoaderCircle className="size-4 motion-safe:animate-spin" /> : <Sparkles className="size-4" />}{busy ? copy.generating : copy.generate}
    </Button>
    {consent && <div className="grid gap-2">
      <p className="text-sm text-muted-foreground">{copy.consent}</p>
      <div className="flex flex-wrap gap-2"><Button type="button" onClick={generate}>{copy.confirm}</Button><Button type="button" variant="ghost" onClick={() => setConsent(false)}>{copy.cancel}</Button></div>
    </div>}
    {busy && <p role="status" className="text-sm text-muted-foreground">{copy.generating}</p>}
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    {draft && <div className="grid gap-2">
      <p className="text-sm font-medium">{copy.review}</p><p className="font-medium">{draft.title}</p><p className="text-sm">{draft.description}</p>
      <p className="text-xs text-muted-foreground">{copy.check}</p>
      <div className="flex flex-wrap gap-2"><Button type="button" onClick={() => { onApply(draft); setDraft(null); }}>{copy.apply}</Button><Button type="button" variant="ghost" onClick={() => setDraft(null)}>{copy.dismiss}</Button></div>
    </div>}
  </div>;
}
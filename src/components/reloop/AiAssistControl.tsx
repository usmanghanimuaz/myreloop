import { useId, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { LoaderCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/lib/i18n";
import { AI_ASSIST_COPY } from "@/lib/i18n-ai-assist";
import { PHOTO_DRAFT_COPY } from "@/lib/i18n-photo-draft";
import { askReLoopAi } from "@/lib/reloop/ai-assist.functions";
import type { AiAssistInput, AiAssistOutput } from "@/lib/reloop/ai-assist";
import { wasteSources } from "@/lib/reloop/sources";
import { useAppState, useStoreMeta } from "@/lib/reloop/store";
import type { Category } from "@/lib/reloop/types";

type Props = { task: "match"; initialQuery?: string } | { task: "guidance"; category: Category } | { task: "translate"; id: string } | { task: "safety"; id: string; kind: "listings" | "needs" };
export function AiAssistControl(props: Props) {
  const { lang, dir } = useI18n();
  const copy = AI_ASSIST_COPY[lang];
  const { userId } = useStoreMeta();
  const { listings } = useAppState();
  const ask = useServerFn(askReLoopAi);
  const inputId = useId();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState(props.task === "match" ? props.initialQuery ?? "" : "");
  const [output, setOutput] = useState<AiAssistOutput | null>(null);
  const [error, setError] = useState("");
  const [empty, setEmpty] = useState(false);
  const needsQuery = props.task === "match" || props.task === "guidance";
  if (!userId) return null;
  async function generate() {
    setBusy(true); setError(""); setOutput(null); setEmpty(false); setOpen(false);
    const base = { lang, consent: true as const };
    const data: AiAssistInput = props.task === "match" ? { ...base, task: "match", query }
      : props.task === "guidance" ? { ...base, task: "guidance", category: props.category, query }
      : { ...base, ...props };
    try {
      const result = await ask({ data });
      if ("output" in result && result.output) setOutput(result.output);
      else if ("empty" in result) setEmpty(true);
      else setError("message" in result && result.message ? result.message : PHOTO_DRAFT_COPY[lang].unavailable);
    } catch { setError(PHOTO_DRAFT_COPY[lang].unavailable); }
    finally { setBusy(false); }
  }
  return <div dir={dir} className="my-3 grid min-w-0 gap-3 border-y py-3">
    <Button type="button" variant="outline" className="h-auto min-h-10 justify-start whitespace-normal text-start" disabled={busy} onClick={() => { setOpen(!open); setOutput(null); setError(""); setEmpty(false); }}>
      {busy ? <LoaderCircle className="size-4 shrink-0 motion-safe:animate-spin" /> : <Sparkles className="size-4 shrink-0" />}{busy ? copy.busy : copy[props.task]}
    </Button>
    {open && <div className="grid gap-3">
      {needsQuery && <div className="grid gap-2"><Label htmlFor={inputId}>{copy.question}</Label><Textarea id={inputId} maxLength={400} value={query} onChange={(e) => setQuery(e.target.value)} /></div>}
      <p className="text-sm text-muted-foreground">{copy.consent}</p>
      <div className="flex flex-wrap gap-2"><Button type="button" disabled={needsQuery && query.trim().length < 3} onClick={() => void generate()}>{copy.confirm}</Button><Button type="button" variant="ghost" onClick={() => setOpen(false)}>{copy.cancel}</Button></div>
    </div>}
    {busy && <p role="status" className="text-sm text-muted-foreground">{copy.busy}</p>}
    {error && <p role="alert" className="break-words text-sm text-destructive">{error}</p>}
    {empty && <p role="status" className="text-sm text-muted-foreground">{copy.empty}</p>}
    {output && <div aria-live="polite" className="grid gap-2 break-words">
      <p className="text-xs text-muted-foreground">{copy.review}</p><h3 className="font-semibold">{output.title}</h3><p className="whitespace-pre-wrap text-sm">{output.text}</p>
      {props.task === "match" && <ul className="grid gap-2">{output.ids.map((id) => { const item = listings.find((l) => l.id === id && l.status === "available"); return item ? <li key={id}><Link className="text-sm text-primary underline" to="/exchange">{item.title} · {item.mode}</Link></li> : null; })}</ul>}
      {props.task === "guidance" && <><p className="text-xs text-muted-foreground">{copy.local}</p><ul>{output.ids.map((id) => { const source = wasteSources[Number(id)]; return source ? <li key={id}><a className="text-sm text-primary underline" href={source.url} target="_blank" rel="noreferrer">{source.organization}: {source.title}</a></li> : null; })}</ul></>}
      <Button type="button" variant="ghost" className="justify-self-start" onClick={() => setOutput(null)}>{PHOTO_DRAFT_COPY[lang].dismiss}</Button>
    </div>}
  </div>;
}
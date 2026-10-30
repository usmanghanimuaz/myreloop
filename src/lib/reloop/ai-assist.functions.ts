import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { AiAssistInputSchema, aiItemProjection, safeAiText } from "./ai-assist";
import { CATEGORIES, isHazardousCategory } from "./types";
import { isAdminAllowed } from "./admin-model";
import { wasteSources } from "./sources";

const itemSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  description: z.string(),
  category: z.enum(CATEGORIES),
  mode: z.enum(["FREE", "EXCHANGE"]).optional(),
  status: z.string().optional(),
});

export const askReLoopAi = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => AiAssistInputSchema.parse(input))
  .handler(async ({ data, context }) => {
    // Every request is opt-in. Never accept client-supplied records, sources or role claims.
    if (data.task === "safety") {
      const role = await context.supabase.rpc("has_role", {
        _user_id: context.userId,
        _role: "admin",
      });
      if (!isAdminAllowed(role)) throw new Error("Not allowed.");
    }
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) return { error: "unavailable" as const };
    const { runAiAssist } = await import("./ai-assist.server");
    if (data.task === "guidance") {
      const sources = wasteSources.map((source, i) => ({
        id: String(i),
        title: source.title,
        summary: source.summary,
      }));
      return runAiAssist(
        getRequest(),
        key,
        "Give a short general explanation using ONLY supplied source summaries, with source ids in ids. If they cannot answer the specific question, say so; no unsupported disposal instructions or local collection promises. Reuse comes before recycling. Always say local rules vary and users must check their local authority. For hazardous categories never suggest sharing, DIY repair, burning, household bins or drains; recommend designated specialist collection. title is a short heading; text is the explanation. Max 1000 characters.",
        {
          lang: data.lang,
          question: safeAiText(data.query, 400),
          category: data.category,
          hazardous: isHazardousCategory(data.category),
          sources,
        },
        sources.map((s) => s.id),
      );
    }
    const kind = data.task === "safety" ? data.kind : "listings";
    let query = context.supabase
      .from("reloop_records")
      .select("data")
      .eq("kind", kind)
      .eq("sample", false);
    if (data.task !== "match") query = query.eq("key", `${kind}:${data.id}`);
    const result = await query.order("key").limit(data.task === "match" ? 100 : 1);
    if (result.error) throw new Error("Items unavailable.");
    const items = (result.data ?? []).flatMap((row) => {
      const parsed = itemSchema.safeParse(row.data);
      return parsed.success ? [parsed.data] : [];
    });
    if (data.task === "match") {
      const candidates = items
        .filter(
          (item) =>
            item.status === "available" &&
            !isHazardousCategory(item.category) &&
            (item.mode === "FREE" || item.mode === "EXCHANGE"),
        )
        .map(aiItemProjection);
      if (!candidates.length) return { empty: true as const };
      return runAiAssist(
        getRequest(),
        key,
        "Select up to five genuinely relevant items from the supplied current available item subset (at most 100 records). ids must be supplied item ids, in relevance order. No invented matches; return ids empty when none fit. Explain relevance and uncertainty briefly. Do not claim geographic proximity, availability guarantees or confirmed suitability. title is a short heading; text is a short explanation. Do not make requests, reservations or alter deterministic recommendations.",
        { lang: data.lang, need: safeAiText(data.query, 400), items: candidates },
        candidates.map((item) => item.id),
      );
    }
    const item = items[0];
    if (!item) return { empty: true as const };
    return runAiAssist(
      getRequest(),
      key,
      data.task === "translate"
        ? "Translate ONLY the supplied item's title and description faithfully, preserving uncertainty. title is the translated title and text is the translated description. Do not add facts, change Free/Exchange, claim condition or invent quantities. ids is empty. This is a read-only translation, never edit or publish the item."
        : "Review ONLY supplied public item text for possible hazardous material, sales, misleading claims or contact sharing. title is a review heading and text is a concise advisory flag explanation or no obvious text issue. ids is empty. State that this is not a safety guarantee and a human must review. Do not moderate, ban, validate evidence or change any data. Never repeat contact data.",
      { lang: data.lang, item: aiItemProjection(item) },
      [],
      data.task === "translate" && !safeAiText(item.description),
    );
  });

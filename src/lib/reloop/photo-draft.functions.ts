import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { PhotoDraftInputSchema, normalizePhotoDraft, ownsDraftPhoto, photoBytesMatch } from "./photo-draft";
import { TERMS_VERSION } from "./moderation";

export const draftListingFromPhoto = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => PhotoDraftInputSchema.parse(input))
  .handler(async ({ data, context }) => {
    if (!ownsDraftPhoto(data.path, context.userId)) throw new Error("Photo unavailable.");
    const [profile, restriction] = await Promise.all([
      context.supabase.from("profiles").select("terms_accepted_at, terms_version").eq("id", context.userId).maybeSingle(),
      context.supabase.from("member_restrictions").select("user_id").eq("user_id", context.userId).maybeSingle(),
    ]);
    if (profile.error || restriction.error) throw new Error("Account check unavailable.");
    if (restriction.data) return { error: "restricted" as const };
    if (!profile.data?.terms_accepted_at || profile.data.terms_version !== TERMS_VERSION) return { error: "terms" as const };
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) return { error: "unavailable" as const };
    const { data: photo, error } = await context.supabase.storage.from("reloop-photos").download(data.path);
    if (error || !photo) throw new Error("Photo unavailable.");
    if (photo.size > 5 * 1024 * 1024) return { error: "invalidPhoto" as const };
    const bytes = new Uint8Array(await photo.arrayBuffer());
    if (!photoBytesMatch(bytes, photo.type)) return { error: "invalidPhoto" as const };
    const { analyzeListingPhoto } = await import("./photo-draft.server");
    return analyzeListingPhoto(getRequest(), key, bytes, photo.type, data.lang);
  });
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PhotoDraftControl } from "./PhotoDraftControl";
import { ListingInputSchema, type ListingInput } from "@/lib/reloop/schema";
import { actions, useStoreMeta } from "@/lib/reloop/store";
import { supabase } from "@/integrations/supabase/client";
import {
  CATEGORIES,
  CATEGORY_LABEL,
  CONDITIONS,
  CONDITION_LABEL,
  UNITS,
  type Listing,
  isHazardousCategory,
} from "@/lib/reloop/types";

type Draft = Record<Exclude<keyof ListingInput, "photos">, string>;
const blank: Draft = {
  title: "",
  category: "cardboard",
  quantity: "1",
  unit: "items",
  condition: "good",
  description: "",
  area: "",
  mode: "FREE",
  exchangePreference: "",
};

export function ListingFormDialog({
  open,
  onOpenChange,
  listing,
  prefill,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  listing?: Listing | undefined;
  prefill?: Partial<Draft> | undefined;
  onSaved?: ((l?: Listing) => void) | undefined;
}) {
  const [draft, setDraft] = useState<Draft>(blank);
  const [errors, setErrors] = useState<Partial<Record<keyof Draft, string>>>({});
  const { userId } = useStoreMeta();
  const [photos, setPhotos] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setDraft(
      listing
        ? {
            ...listing,
            mode: listing.mode ?? "FREE",
            exchangePreference: listing.exchangePreference ?? "",
            quantity: String(listing.quantity),
          }
        : { ...blank, ...prefill },
    );
    setPhotos(listing?.photos ?? []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, listing?.id]);

  const set =
    (k: keyof Draft) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setDraft((d) => ({ ...d, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy || aiBusy) return;
    const res = ListingInputSchema.safeParse({ ...draft, photos });
    if (!res.success) {
      const errs: Partial<Record<keyof Draft, string>> = {};
      for (const i of res.error.issues) errs[i.path[0] as keyof Draft] ??= i.message;
      setErrors(errs);
      return;
    }
    setBusy(true);
    try {
      if (listing) {
        await actions.updateListing(listing.id, res.data);
        toast.success("Listing updated");
        onSaved?.();
      } else {
        const l = await actions.createListing(res.data);
        toast.success("Listing published to the exchange");
        onSaved?.(l);
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save listing");
    } finally {
      setBusy(false);
    }
  }

  const err = (k: keyof Draft) =>
    errors[k] ? (
      <p id={`${k}-err`} className="text-xs text-destructive">
        {errors[k]}
      </p>
    ) : null;
  const aria = (k: keyof Draft) => ({
    "aria-invalid": !!errors[k] || undefined,
    "aria-describedby": errors[k] ? `${k}-err` : undefined,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {listing ? "Edit listing" : "List an item"}
          </DialogTitle>
          <DialogDescription>
            Share a general area only. Never add your address, email or phone number.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4" noValidate>
          <div className="grid gap-1.5">
            <Label htmlFor="title">Item title</Label>
            <Input
              id="title"
              value={draft.title}
              onChange={set("title")}
              placeholder="e.g. Glass jars with lids"
              {...aria("title")}
            />
            {err("title")}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="category">Material</Label>
              <select
                id="category"
                className="field"
                value={draft.category}
                onChange={set("category")}
              >
                {CATEGORIES.filter((c) => !isHazardousCategory(c)).map((c) => (
                  <option key={c} value={c}>
                    {CATEGORY_LABEL[c]}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                Batteries, chemicals, medicines, lamps and hygiene waste can't be listed — see
                Material Guidance for safe disposal.
              </p>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="condition">Condition</Label>
              <select
                id="condition"
                className="field"
                value={draft.condition}
                onChange={set("condition")}
              >
                {CONDITIONS.map((c) => (
                  <option key={c} value={c}>
                    {CONDITION_LABEL[c]}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                step="any"
                inputMode="decimal"
                value={draft.quantity}
                onChange={set("quantity")}
                {...aria("quantity")}
              />
              {err("quantity")}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="unit">Unit</Label>
              <select id="unit" className="field" value={draft.unit} onChange={set("unit")}>
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="area">General area</Label>
            <Input
              id="area"
              value={draft.area}
              onChange={set("area")}
              placeholder="e.g. Near the central library"
              {...aria("area")}
            />
            {err("area")}
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="mode">Transaction mode</Label>
            <select id="mode" className="field" value={draft.mode} onChange={set("mode")}>
              <option>FREE</option>
              <option>EXCHANGE</option>
            </select>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="photos">Photos (up to 4, JPG/PNG/WebP, 5 MB each)</Label>
            <Input
              id="photos"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              disabled={busy || aiBusy || !userId}
              onChange={async (e) => {
                const files = Array.from(e.target.files ?? []);
                if (!userId) return;
                if (photos.length + files.length > 4) {
                  toast.error("Maximum 4 photos");
                  return;
                }
                if (
                  files.some(
                    (f) =>
                      f.size > 5 * 1024 * 1024 ||
                      !["image/jpeg", "image/png", "image/webp"].includes(f.type),
                  )
                ) {
                  toast.error("Use JPG, PNG or WebP up to 5 MB");
                  return;
                }
                setBusy(true);
                try {
                  const paths: string[] = [];
                  for (const [index, file] of files.entries()) {
                    setUploadProgress(`Uploading photo ${index + 1} of ${files.length}…`);
                    const ext =
                      file.type === "image/jpeg"
                        ? "jpg"
                        : file.type === "image/png"
                          ? "png"
                          : "webp";
                    const path = `${userId}/${crypto.randomUUID()}.${ext}`;
                    const { error } = await supabase.storage
                      .from("reloop-photos")
                      .upload(path, file, { contentType: file.type });
                    if (error) throw new Error("Photo upload failed. Please try again.");
                    paths.push(path);
                  }
                  setPhotos((p) => [...p, ...paths]);
                } catch (error) {
                  toast.error(error instanceof Error ? error.message : "Photo upload failed");
                } finally {
                  setBusy(false);
                  setUploadProgress("");
                }
              }}
            />
            {uploadProgress && (
              <p role="status" className="text-sm text-muted-foreground">
                {uploadProgress}
              </p>
            )}
            {photos.map((path, i) => (
              <div key={path} className="flex items-center justify-between text-sm">
                <span>Photo {i + 1}</span>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={busy || aiBusy}
                  onClick={async () => {
                    if (!listing?.photos?.includes(path)) {
                      const { error } = await supabase.storage.from("reloop-photos").remove([path]);
                      if (error) {
                        toast.error("Could not remove photo");
                        return;
                      }
                    }
                    setPhotos((p) => p.filter((x) => x !== path));
                  }}
                >
                  Remove
                </Button>
              </div>
            ))}
            {userId && photos[0] && (
              <PhotoDraftControl
                key={photos[0]}
                path={photos[0]}
                disabled={busy}
                onBusy={setAiBusy}
                onApply={(suggestion) => setDraft((d) => ({ ...d, ...suggestion }))}
              />
            )}
          </div>
          {draft.mode === "EXCHANGE" && (
            <div className="grid gap-1.5">
              <Label htmlFor="exchangePreference">Requested item / exchange preference</Label>
              <Input
                id="exchangePreference"
                value={draft.exchangePreference}
                onChange={set("exchangePreference")}
                maxLength={200}
              />
              {err("exchangePreference")}
            </div>
          )}
          <div className="grid gap-1.5">
            <Label htmlFor="description">
              Short description{" "}
              <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="description"
              rows={3}
              value={draft.description}
              onChange={set("description")}
              {...aria("description")}
            />
            {err("description")}
          </div>
          {!userId && (
            <p role="status" className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
              Please sign in to publish a listing. Use the Sign in button in the menu.
            </p>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy || aiBusy || !userId}>
              {busy ? "Saving…" : listing ? "Save changes" : "Publish listing"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

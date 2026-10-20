import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ListingInputSchema, type ListingInput } from "@/lib/reloop/schema";
import { actions } from "@/lib/reloop/store";
import { CATEGORIES, CATEGORY_LABEL, CONDITIONS, CONDITION_LABEL, UNITS, type Listing } from "@/lib/reloop/types";

type Draft = Record<keyof ListingInput, string>;
const blank: Draft = { title: "", category: "cardboard", quantity: "1", unit: "items", condition: "good", description: "", area: "" };

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

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setDraft(
      listing
        ? { ...listing, quantity: String(listing.quantity) }
        : { ...blank, ...prefill },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, listing?.id]);

  const set = (k: keyof Draft) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setDraft((d) => ({ ...d, [k]: e.target.value }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = ListingInputSchema.safeParse(draft);
    if (!res.success) {
      const errs: Partial<Record<keyof Draft, string>> = {};
      for (const i of res.error.issues) errs[i.path[0] as keyof Draft] ??= i.message;
      setErrors(errs);
      return;
    }
    if (listing) {
      actions.updateListing(listing.id, res.data);
      toast.success("Listing updated");
      onSaved?.();
    } else {
      const l = actions.createListing(res.data);
      toast.success("Listing published to the exchange");
      onSaved?.(l);
    }
    onOpenChange(false);
  }

  const err = (k: keyof Draft) =>
    errors[k] ? (
      <p id={`${k}-err`} className="text-xs text-destructive">
        {errors[k]}
      </p>
    ) : null;
  const aria = (k: keyof Draft) => ({ "aria-invalid": !!errors[k] || undefined, "aria-describedby": errors[k] ? `${k}-err` : undefined });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">{listing ? "Edit listing" : "List an item"}</DialogTitle>
          <DialogDescription>Share a general area only. Never add your address, email or phone number.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4" noValidate>
          <div className="grid gap-1.5">
            <Label htmlFor="title">Item title</Label>
            <Input id="title" value={draft.title} onChange={set("title")} placeholder="e.g. Glass jars with lids" {...aria("title")} />
            {err("title")}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="category">Material</Label>
              <select id="category" className="field" value={draft.category} onChange={set("category")}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>
                ))}
              </select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="condition">Condition</Label>
              <select id="condition" className="field" value={draft.condition} onChange={set("condition")}>
                {CONDITIONS.map((c) => (
                  <option key={c} value={c}>{CONDITION_LABEL[c]}</option>
                ))}
              </select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="quantity">Quantity</Label>
              <Input id="quantity" type="number" min="0" step="any" inputMode="decimal" value={draft.quantity} onChange={set("quantity")} {...aria("quantity")} />
              {err("quantity")}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="unit">Unit</Label>
              <select id="unit" className="field" value={draft.unit} onChange={set("unit")}>
                {UNITS.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="area">General area</Label>
            <Input id="area" value={draft.area} onChange={set("area")} placeholder="e.g. Near the central library" {...aria("area")} />
            {err("area")}
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="description">Short description <span className="font-normal text-muted-foreground">(optional)</span></Label>
            <Textarea id="description" rows={3} value={draft.description} onChange={set("description")} {...aria("description")} />
            {err("description")}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">{listing ? "Save changes" : "Publish listing"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import { useState } from "react";
import { Flag } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { fileReport } from "@/lib/reloop/account.functions";
import { REPORT_REASONS, REPORT_REASON_LABEL, type ReportInput } from "@/lib/reloop/moderation";
import { useStoreMeta } from "@/lib/reloop/store";

export function ReportButton({
  targetKind,
  targetId,
}: {
  targetKind: ReportInput["targetKind"];
  targetId: string;
}) {
  const { userId } = useStoreMeta();
  const send = useServerFn(fileReport);
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportInput["reason"]>("unsafe");
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);
  if (!userId) return null;
  if (!open)
    return (
      <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={() => setOpen(true)}>
        <Flag aria-hidden /> Report
      </Button>
    );
  return (
    <form
      className="mt-3 grid gap-2 rounded-xl border bg-background p-3 text-sm"
      onSubmit={async (e) => {
        e.preventDefault();
        if (details.length > 1000) return toast.error("Keep details under 1000 characters.");
        setBusy(true);
        try {
          await send({ data: { targetKind, targetId, reason, details } });
          toast.success("Report sent to moderators. Thank you.");
          setOpen(false);
          setDetails("");
        } catch {
          toast.error("Could not send the report. Please try again.");
        } finally {
          setBusy(false);
        }
      }}
    >
      <Label htmlFor={`rr-${targetId}`}>Why are you reporting this?</Label>
      <select
        id={`rr-${targetId}`}
        className="h-9 rounded-md border bg-background px-2"
        value={reason}
        onChange={(e) => setReason(e.target.value as ReportInput["reason"])}
      >
        {REPORT_REASONS.map((r) => (
          <option key={r} value={r}>
            {REPORT_REASON_LABEL[r]}
          </option>
        ))}
      </select>
      <Textarea
        aria-label="Details (optional)"
        placeholder="Details (optional, no personal contact info)"
        rows={2}
        maxLength={1000}
        value={details}
        onChange={(e) => setDetails(e.target.value)}
      />
      <div className="flex gap-2">
        <Button size="sm" type="submit" disabled={busy}>
          Send report
        </Button>
        <Button size="sm" type="button" variant="outline" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

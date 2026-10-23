import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/reloop/shared";
import { supabase } from "@/integrations/supabase/client";

const MessageSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(100),
  email: z.string().trim().email("Please enter a valid email address.").max(255),
  subject: z.string().trim().min(3, "Please add a short subject.").max(150),
  message: z.string().trim().min(10, "Please describe it in at least 10 characters.").max(2000),
});

type Status = "idle" | "sending" | "sent" | "error";

export function ContactForm({ kind }: { kind: "contact" | "report" }) {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = MessageSchema.safeParse(form);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      return;
    }
    setErrors({});
    setStatus("sending");
    const { error } = await supabase.from("contact_messages").insert({ kind, ...parsed.data });
    setStatus(error ? "error" : "sent");
  }

  if (status === "sent") {
    return (
      <Card>
        <h2 className="text-lg font-semibold">Message received</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Thank you — your {kind === "report" ? "report" : "message"} has been saved. We read every
          message, but please note ReLoop is a small independent project, so replies may take time.
        </p>
      </Card>
    );
  }

  const field = (key: keyof typeof form, label: string, long = false, type = "text") => (
    <div className="grid gap-1.5">
      <Label htmlFor={`cf-${key}`}>{label}</Label>
      {long ? (
        <Textarea
          id={`cf-${key}`}
          rows={5}
          value={form[key]}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          aria-invalid={!!errors[key] || undefined}
        />
      ) : (
        <Input
          id={`cf-${key}`}
          type={type}
          value={form[key]}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          aria-invalid={!!errors[key] || undefined}
        />
      )}
      {errors[key] && (
        <p role="alert" className="text-xs text-destructive">
          {errors[key]}
        </p>
      )}
    </div>
  );

  return (
    <Card>
      <form className="grid gap-4" onSubmit={submit} noValidate>
        {field("name", "Your name")}
        {field("email", "Your email", false, "email")}
        {field("subject", kind === "report" ? "What is the problem?" : "Subject")}
        {field(
          "message",
          kind === "report"
            ? "Describe the problem (include the page or listing if relevant)"
            : "Your message",
          true,
        )}
        <div>
          <Button type="submit" disabled={status === "sending"}>
            {status === "sending" ? "Sending…" : kind === "report" ? "Send report" : "Send message"}
          </Button>
          {status === "error" && (
            <p role="alert" className="mt-2 text-sm text-destructive">
              Could not send right now. Please try again in a moment.
            </p>
          )}
        </div>
      </form>
    </Card>
  );
}

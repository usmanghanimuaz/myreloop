import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset password — ReLoop" },
      { name: "description", content: "Set a new password for your ReLoop account." },
      { property: "og:title", content: "Reset password — ReLoop" },
      { property: "og:description", content: "Set a new password for your ReLoop account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      toast.error("Link expired — request a new reset email");
      return;
    }
    toast.success("Password updated");
    navigate({ to: "/account" });
  }
  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <h1 className="font-display text-3xl">Set a new password</h1>
      <form onSubmit={submit} className="mt-6 space-y-3">
        <Label htmlFor="new-pass">New password</Label>
        <Input id="new-pass" type="password" autoComplete="new-password" minLength={8} maxLength={72} value={password} onChange={(e) => setPassword(e.target.value)} />
        <Button type="submit" disabled={busy} className="w-full">Save password</Button>
      </form>
    </main>
  );
}

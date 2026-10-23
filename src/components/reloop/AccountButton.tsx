import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { LogIn, LogOut } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";
import { useStoreMeta } from "@/lib/reloop/store";
import { SignupSchema, TERMS_VERSION } from "@/lib/reloop/moderation";
import { Link } from "@tanstack/react-router";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function AccountButton() {
  const { userId } = useStoreMeta();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [agree, setAgree] = useState(false);
  const [awaitingCode, setAwaitingCode] = useState(false);
  const [error, setError] = useState("");

  function fail(message: string) {
    setError(message);
    toast.error(message);
  }

  async function google() {
    setBusy(true);
    setError("");
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
        extraParams: { prompt: "select_account" },
      });
      if (result.error) throw result.error;
      if (!result.redirected) setOpen(false);
    } catch (e) {
      fail(e instanceof Error ? e.message : "Google sign-in failed");
    } finally {
      setBusy(false);
    }
  }

  function validate(): boolean {
    if (!EMAIL_RE.test(email.trim())) return (fail("Enter a valid email address"), false);
    if (password.length < 8) return (fail("Password must be at least 8 characters"), false);
    return true;
  }

  async function signInEmail(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!validate()) return;
    setBusy(true);
    const { error: err } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setBusy(false);
    if (err) {
      if (/confirm/i.test(err.message)) {
        setAwaitingCode(true);
        await resend();
        return;
      }
      return fail("Email or password is incorrect");
    }
    toast.success("Signed in");
    setOpen(false);
  }

  async function signUpEmail(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const parsed = SignupSchema.safeParse({ firstName, lastName, email, password, acceptTerms: agree });
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Check the form");
    setBusy(true);
    const { data, error: err } = await supabase.auth.signUp({
      email: parsed.data.email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        // Profile fields only; roles are never derived from signup data.
        data: {
          first_name: parsed.data.firstName,
          last_name: parsed.data.lastName,
          terms_version: TERMS_VERSION,
        },
      },
    });
    setBusy(false);
    if (err) return fail(err.message);
    if (data.session) {
      setOpen(false);
      return;
    }
    setAwaitingCode(true);
    toast.success("Check your email for the verification code");
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const token = code.trim();
    if (!/^\d{6,8}$/.test(token)) return fail("Enter the code from your email");
    setBusy(true);
    let { error: err } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token,
      type: "signup",
    });
    if (err) {
      ({ error: err } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token,
        type: "email",
      }));
    }
    setBusy(false);
    if (err) return fail("That code is invalid or expired");
    toast.success("Email verified — you are signed in");
    setOpen(false);
    setAwaitingCode(false);
  }

  async function resend() {
    const { error: err } = await supabase.auth.resend({
      type: "signup",
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin },
    });
    if (err) fail(err.message);
    else toast.success("A new verification email was sent");
  }

  async function forgot() {
    setError("");
    if (!EMAIL_RE.test(email.trim())) return fail("Enter your email first");
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (err) fail(err.message);
    else toast.success("Password reset link sent to your email");
  }

  async function signOut() {
    setBusy(true);
    try {
      await qc.cancelQueries();
      const { error: err } = await supabase.auth.signOut();
      if (err) throw err;
      qc.clear();
      window.location.assign("/");
    } catch {
      toast.error("Could not sign out");
      setBusy(false);
    }
  }

  const fields = (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="auth-email">Email</Label>
        <Input
          id="auth-email"
          type="email"
          autoComplete="email"
          maxLength={254}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="auth-password">Password</Label>
        <Input
          id="auth-password"
          type="password"
          autoComplete={tab === "signup" ? "new-password" : "current-password"}
          minLength={8}
          maxLength={72}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
    </>
  );

  return (
    <>
      <Button
        className="w-full border border-sidebar-border bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground"
        disabled={busy}
        onClick={() => (userId ? void signOut() : setOpen(true))}
      >
        {userId ? (
          <>
            <LogOut /> Sign out
          </>
        ) : (
          <>
            <LogIn /> Sign in
          </>
        )}
      </Button>
      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) {
            setAwaitingCode(false);
            setCode("");
            setError("");
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Join ReLoop</DialogTitle>
            <DialogDescription>
              Sign in to share items, post needs and coordinate handovers.
            </DialogDescription>
          </DialogHeader>

          {awaitingCode ? (
            <form onSubmit={verifyCode} className="space-y-3">
              <p className="text-sm text-muted-foreground">
                We emailed a verification message to <strong>{email}</strong>. Enter the code from
                it below, or simply click the verification link in that email.
              </p>
              <div className="space-y-1.5">
                <Label htmlFor="auth-code">Verification code</Label>
                <Input
                  id="auth-code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={8}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                />
              </div>
              {error && (
                <p className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              )}
              <Button type="submit" className="w-full" disabled={busy}>
                Verify and continue
              </Button>
              <div className="flex justify-between text-sm">
                <button type="button" className="underline" onClick={() => void resend()}>
                  Resend email
                </button>
                <button type="button" className="underline" onClick={() => setAwaitingCode(false)}>
                  Back
                </button>
              </div>
              <p className="text-xs text-muted-foreground">Not arrived? Check your spam folder.</p>
            </form>
          ) : (
            <>
              <Button disabled={busy} onClick={() => void google()}>
                Continue with Google
              </Button>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="h-px flex-1 bg-border" /> or use email{" "}
                <span className="h-px flex-1 bg-border" />
              </div>
              <Tabs value={tab} onValueChange={(v) => (setTab(v), setError(""))}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Log in</TabsTrigger>
                  <TabsTrigger value="signup">Create account</TabsTrigger>
                </TabsList>
                <TabsContent value="signin">
                  <form onSubmit={signInEmail} className="space-y-3">
                    {fields}
                    {error && (
                      <p className="text-sm text-destructive" role="alert">
                        {error}
                      </p>
                    )}
                    <Button type="submit" className="w-full" disabled={busy}>
                      Log in
                    </Button>
                    <button
                      type="button"
                      className="text-sm underline"
                      onClick={() => void forgot()}
                    >
                      Forgot password?
                    </button>
                  </form>
                </TabsContent>
                <TabsContent value="signup">
                  <form onSubmit={signUpEmail} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="auth-first">First name</Label>
                        <Input
                          id="auth-first"
                          autoComplete="given-name"
                          maxLength={60}
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="auth-last">Last name (optional)</Label>
                        <Input
                          id="auth-last"
                          autoComplete="family-name"
                          maxLength={60}
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                        />
                      </div>
                    </div>
                    {fields}
                    <label className="flex items-start gap-2 text-sm">
                      <input
                        type="checkbox"
                        className="mt-1 size-4 accent-primary"
                        checked={agree}
                        onChange={(e) => setAgree(e.target.checked)}
                      />
                      <span>
                        I agree to the{" "}
                        <Link to="/terms" className="underline">
                          Terms
                        </Link>{" "}
                        and{" "}
                        <Link to="/privacy" className="underline">
                          Privacy Policy
                        </Link>
                        .
                      </span>
                    </label>
                    {error && (
                      <p className="text-sm text-destructive" role="alert">
                        {error}
                      </p>
                    )}
                    <Button type="submit" className="w-full" disabled={busy}>
                      Create account
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      New accounts are regular members. A verification email is sent to confirm your
                      address. Your name stays private unless you choose a display name; you can
                      add an optional private phone later in My ReLoop.
                    </p>
                  </form>
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

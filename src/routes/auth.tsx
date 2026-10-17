import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";
import { signInWithGoogle } from "@/components/AuthPrompt";
import { useSession } from "@/hooks/use-session";
import { PasswordInput } from "@/components/PasswordInput";

export const Route = createFileRoute("/auth")({
  validateSearch: z.object({
    next: z.string().optional().catch(undefined),
    mode: z.enum(["signin", "signup", "forgot"]).catch("signin"),
  }),
  head: () => ({
    meta: [
      { title: "Log in or sign up — Kodanz" },
      { name: "description", content: "Create a free Kodanz account to save camps and plan your family's summer." },
      { property: "og:title", content: "Log in or sign up — Kodanz" },
      { property: "og:description", content: "Save camps for each child and plan summer on a calendar." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

const schema = z.object({ email: z.string().trim().email().max(255), password: z.string().min(8).max(72) });

function safeNext(n?: string | null) {
  return n && n.startsWith("/") && !n.startsWith("//") ? n : "/planner";
}

function AuthPage() {
  const { next, mode: initial } = Route.useSearch();
  const navigate = useNavigate();
  const { user } = useSession();
  const [mode, setMode] = useState(initial);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (user) navigate({ href: safeNext(next ?? sessionStorage.getItem("kodanz-next")), replace: true });
  }, [user]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "forgot") {
      const em = z.string().trim().email().safeParse(email);
      if (!em.success) { toast.error("Enter a valid email"); return; }
      setBusy(true);
      const { error } = await supabase.auth.resetPasswordForEmail(em.data, { redirectTo: `${window.location.origin}/reset-password` });
      setBusy(false);
      if (error) toast.error(error.message); else setSent(true);
      return;
    }
    const p = schema.safeParse({ email, password });
    if (!p.success) { toast.error("Enter a valid email and a password of 8+ characters"); return; }
    setBusy(true);
    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({ ...p.data, options: { emailRedirectTo: window.location.origin + safeNext(next) } });
      if (error) toast.error(error.message);
      else if (!data.session) setSent(true);
    } else {
      const { error } = await supabase.auth.signInWithPassword(p.data);
      if (error) toast.error(error.message);
    }
    setBusy(false);
  };

  const title = mode === "signup" ? "Create your free account" : mode === "forgot" ? "Reset your password" : "Welcome back";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <Logo size="lg" />
      <div className="mt-8 w-full max-w-sm rounded-3xl border bg-card p-6 shadow-soft">
        {sent ? (
          <div className="text-center">
            <h1 className="text-xl font-bold text-navy">Check your email</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {mode === "forgot"
                ? `If an account exists for ${email}, we sent a link to set a new password.`
                : `We sent a confirmation link to ${email}. Click it to finish creating your account.`}
            </p>
            <button onClick={() => { setSent(false); setMode("signin"); }} className="mt-4 text-sm font-semibold text-teal underline">Back to log in</button>
          </div>
        ) : (
          <>
            <h1 className="text-xl font-bold text-navy">{title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {mode === "forgot" ? "Enter your email and we'll send you a reset link." : "Save favorites, add your kids and plan every week."}
            </p>
            {mode !== "forgot" && (
              <>
                <button onClick={() => signInWithGoogle(next)} className="mt-5 w-full rounded-xl border py-3 font-semibold text-navy hover:bg-muted">Continue with Google</button>
                <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />or<span className="h-px flex-1 bg-border" /></div>
              </>
            )}
            <form onSubmit={submit} className={mode === "forgot" ? "mt-5 space-y-3" : "space-y-3"}>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full rounded-xl border bg-background px-3 py-2.5 outline-none focus:ring-2 focus:ring-ring" />
              {mode !== "forgot" && <PasswordInput value={password} onChange={setPassword} />}
              {mode === "signin" && (
                <div className="text-right">
                  <button type="button" onClick={() => setMode("forgot")} className="text-sm font-semibold text-teal underline">Forgot password?</button>
                </div>
              )}
              <button disabled={busy} className="w-full rounded-xl bg-primary py-3 font-semibold text-primary-foreground disabled:opacity-50">
                {mode === "signup" ? "Create account" : mode === "forgot" ? "Send reset link" : "Log in"}
              </button>
            </form>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              {mode === "forgot" ? "Remembered it? " : mode === "signup" ? "Already have an account? " : "New to Kodanz? "}
              <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="font-semibold text-teal underline">
                {mode === "signin" ? "Create an account" : "Log in"}
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

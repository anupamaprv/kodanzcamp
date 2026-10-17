import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";
import { PasswordInput } from "@/components/PasswordInput";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set a new password — Kodanz" },
      { name: "description", content: "Choose a new password for your Kodanz account." },
      { property: "og:title", content: "Set a new password — Kodanz" },
      { property: "og:description", content: "Reset your Kodanz password." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPage,
});

function ResetPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (window.location.hash.includes("type=recovery")) setReady(true);
    const { data } = supabase.auth.onAuthStateChange((e) => { if (e === "PASSWORD_RECOVERY") setReady(true); });
    supabase.auth.getSession().then(({ data: s }) => { if (s.session) setReady(true); });
    return () => data.subscription.unsubscribe();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.length < 8) { toast.error("Use at least 8 characters"); return; }
    if (pw !== pw2) { toast.error("Passwords don't match"); return; }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Password updated");
    navigate({ to: "/planner" });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <Logo size="lg" />
      <div className="mt-8 w-full max-w-sm rounded-3xl border bg-card p-6 shadow-soft">
        <h1 className="text-xl font-bold text-navy">Set a new password</h1>
        {ready ? (
          <form onSubmit={submit} className="mt-4 space-y-3">
            <PasswordInput value={pw} onChange={setPw} placeholder="New password (8+ characters)" />
            <PasswordInput value={pw2} onChange={setPw2} placeholder="Confirm new password" />
            <button disabled={busy} className="w-full rounded-xl bg-primary py-3 font-semibold text-primary-foreground disabled:opacity-50">Save password</button>
          </form>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">
            Open this page from the reset link in your email. <Link to="/auth" search={{ mode: "forgot" }} className="font-semibold text-teal underline">Send a new link</Link>
          </p>
        )}
      </div>
    </div>
  );
}

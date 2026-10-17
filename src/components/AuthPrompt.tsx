import { Link, useLocation } from "@tanstack/react-router";
import { Heart, CalendarDays, Users, X } from "lucide-react";
import { toast } from "sonner";
import { lovable } from "@/integrations/lovable";

export async function signInWithGoogle(next?: string) {
  if (next) sessionStorage.setItem("kodanz-next", next);
  const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
  if (r.error) toast.error("Google sign-in didn't work. Please try again.");
}

/** Shown when a signed-out visitor tries a members-only action. */
export function AuthPrompt({ onClose, title = "Save this camp?" }: { onClose: () => void; title?: string }) {
  const loc = useLocation();
  const next = loc.href;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-navy/40 p-4 sm:items-center" onClick={onClose}>
      <div role="dialog" aria-label={title} className="w-full max-w-sm rounded-3xl bg-card p-6 text-center shadow-soft" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} aria-label="Close" className="float-right rounded-full p-1 hover:bg-muted"><X className="h-5 w-5" /></button>
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-coral-soft text-coral"><Heart className="h-6 w-6" /></div>
        <h2 className="mt-4 text-xl font-bold text-navy">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">Create a free account to save favorites, plan each child's summer and see it on a calendar.</p>
        <ul className="mt-4 space-y-1 text-left text-sm">
          <li className="flex items-center gap-2"><Heart className="h-4 w-4 text-teal" /> Favorites for each child</li>
          <li className="flex items-center gap-2"><Users className="h-4 w-4 text-teal" /> Add all your kids</li>
          <li className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-teal" /> Family summer calendar</li>
        </ul>
        <button onClick={() => signInWithGoogle(next)} className="mt-5 w-full rounded-xl bg-primary py-3 font-semibold text-primary-foreground">Continue with Google</button>
        <Link to="/auth" search={{ next, mode: "signup" }} className="mt-2 block w-full rounded-xl border py-3 font-semibold text-navy hover:bg-muted">Continue with Email</Link>
        <p className="mt-3 text-sm text-muted-foreground">Already have an account? <Link to="/auth" search={{ next, mode: "signin" }} className="font-semibold text-teal underline">Log in</Link></p>
      </div>
    </div>
  );
}

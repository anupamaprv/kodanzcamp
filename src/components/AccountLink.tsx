import { Link } from "@tanstack/react-router";
import { CalendarDays } from "lucide-react";
import { useSession } from "@/hooks/use-session";

export function AccountLink() {
  const { user, ready } = useSession();
  if (!ready) return <span className="h-9 w-24" />;
  return user ? (
    <Link to="/planner" className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
      <CalendarDays className="h-4 w-4" /> My summer
    </Link>
  ) : (
    <Link to="/auth" search={{ mode: "signin" }} className="rounded-full border bg-card px-4 py-2 text-sm font-semibold text-navy hover:bg-muted">
      Log in
    </Link>
  );
}

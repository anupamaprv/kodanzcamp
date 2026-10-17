import { Link } from "@tanstack/react-router";

export function Logo({ size = "md" }: { size?: "md" | "lg" }) {
  return (
    <Link to="/" className="relative inline-flex items-end font-display font-bold text-navy">
      <span className={size === "lg" ? "text-4xl" : "text-2xl"}>Kodanz</span>
      <svg viewBox="0 0 24 24" className="absolute -right-3 -top-2 h-5 w-5 text-sun" aria-hidden>
        <circle cx="12" cy="12" r="4" fill="currentColor" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
          <line key={a} x1="12" y1="2" x2="12" y2="5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" transform={`rotate(${a} 12 12)`} />
        ))}
      </svg>
    </Link>
  );
}

export function SiteHeader() {
  return (
    <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
      <Logo />
      <span className="hidden rounded-full border bg-card px-4 py-1.5 font-display text-xs font-semibold text-navy sm:inline">
        A NEW SUMMER-PLANNING APP
      </span>
    </header>
  );
}

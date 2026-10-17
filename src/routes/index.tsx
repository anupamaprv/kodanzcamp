import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin, Search, CalendarPlus, Map, DollarSign, Users, ArrowRight } from "lucide-react";
import hero from "@/assets/hero.jpg";
import { SiteHeader } from "@/components/Logo";
import { INTERESTS } from "@/lib/camps";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kodanz — Find summer camps near you" },
      { name: "description", content: "Search summer camps by ZIP, age and interests. Compare distance and cost on a list or map, then save weeks to your calendar." },
      { property: "og:title", content: "Kodanz — Find summer camps near you" },
      { property: "og:description", content: "Discover camps, compare costs and commutes, and plan every week of summer." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const FEATURES = [
  { icon: Search, title: "Matched camps", text: "Filtered to your child's age and interests." },
  { icon: Map, title: "List or map", text: "See distance and drive time from your ZIP." },
  { icon: DollarSign, title: "Compare costs", text: "Sort by price per week or full summer." },
  { icon: CalendarPlus, title: "Save to calendar", text: "Pick a few weeks or the whole summer." },
];

function Home() {
  const navigate = useNavigate();
  const [zip, setZip] = useState("");
  const [age, setAge] = useState("8");
  const [interests, setInterests] = useState<string[]>([]);
  const [error, setError] = useState("");

  const toggle = (i: string) =>
    setInterests((cur) => (cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i]));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{5}$/.test(zip.trim())) return setError("Enter a 5-digit ZIP code");
    navigate({ to: "/camps", search: { zip: zip.trim(), age: Number(age), interests: interests.join(","), view: "list", sort: "distance", radius: 20, fullDay: false } });
  };

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute -right-40 -top-40 h-[28rem] w-[28rem] rounded-full bg-sun-soft" />
      <div className="pointer-events-none absolute -left-32 top-[38rem] h-72 w-72 rounded-full bg-teal-soft" />
      <div className="relative">
        <SiteHeader />

        <section className="mx-auto grid max-w-6xl gap-10 px-6 pb-16 pt-6 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div>
            <h1 className="text-4xl font-bold leading-[1.05] text-navy md:text-6xl">
              Summer camp planning shouldn't feel like a{" "}
              <span className="text-teal">second full-time job.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              Kodanz is like Zillow for summer camps: discover camps near you, compare cost and commute,
              and plan every week of summer in one place.
            </p>

            <form onSubmit={submit} className="mt-8 rounded-3xl border bg-card p-6 shadow-soft">
              <h2 className="text-xl font-semibold text-navy">Find their next big adventure.</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_8rem]">
                <label className="block">
                  <span className="text-sm font-semibold">ZIP code</span>
                  <div className="mt-1 flex items-center gap-2 rounded-xl border bg-background px-3 focus-within:ring-2 focus-within:ring-ring">
                    <MapPin className="h-4 w-4 text-teal" />
                    <input
                      value={zip}
                      onChange={(e) => { setZip(e.target.value); setError(""); }}
                      inputMode="numeric"
                      maxLength={5}
                      placeholder="19709"
                      className="w-full bg-transparent py-2.5 outline-none"
                    />
                  </div>
                </label>
                <label className="block">
                  <span className="text-sm font-semibold">Child's age</span>
                  <select value={age} onChange={(e) => setAge(e.target.value)} className="mt-1 w-full rounded-xl border bg-background px-3 py-2.5 outline-none focus:ring-2 focus:ring-ring">
                    {Array.from({ length: 13 }, (_, i) => i + 4).map((a) => <option key={a}>{a}</option>)}
                  </select>
                </label>
              </div>
              {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
              <div className="mt-4">
                <span className="text-sm font-semibold">Interests <span className="font-normal text-muted-foreground">(optional)</span></span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {INTERESTS.map((i) => {
                    const on = interests.includes(i);
                    return (
                      <button type="button" key={i} onClick={() => toggle(i)} aria-pressed={on}
                        className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold transition ${on ? "border-teal bg-teal text-accent-foreground" : "bg-background hover:border-teal"}`}>
                        {i}
                      </button>
                    );
                  })}
                </div>
              </div>
              <button type="submit" className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 font-display font-semibold text-primary-foreground transition hover:opacity-90">
                Explore camps <ArrowRight className="h-4 w-4" />
              </button>
              <p className="mt-3 text-center text-xs text-muted-foreground">No login needed to browse.</p>
            </form>
          </div>

          <div className="relative">
            <img src={hero} alt="Kids watching a summer sunset over a lake" width={1200} height={1008} className="aspect-[4/5] w-full rounded-[2rem] object-cover shadow-soft" />
            <span className="absolute -left-3 top-8 rounded-full bg-sun px-4 py-1.5 font-display text-sm font-semibold text-navy">TOGETHER</span>
            <p className="absolute bottom-6 left-6 right-6 rounded-2xl bg-card/90 p-4 font-display text-lg font-semibold text-navy backdrop-blur">
              Less stress. More summers like this.
            </p>
          </div>
        </section>

        <section className="bg-card/60 py-16">
          <div className="mx-auto max-w-6xl px-6">
            <p className="eyebrow">What's on Kodanz</p>
            <h2 className="mt-2 text-3xl font-bold text-navy md:text-4xl">Everything you need to plan summer.</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map(({ icon: Icon, title, text }) => (
                <div key={title} className="rounded-2xl border bg-card p-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-soft text-teal"><Icon className="h-5 w-5" /></div>
                  <h3 className="mt-4 font-semibold text-navy">{title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{text}</p>
                </div>
              ))}
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {[
                ["01", "Start with your family", "ZIP code, age and interests. That's it."],
                ["02", "Compare the trade-offs", "Sort by distance or cost; flip to the map."],
                ["03", "Pencil in your weeks", "Choose partial weeks or full summer, then add to your calendar."],
              ].map(([n, t, d]) => (
                <div key={n} className="flex gap-4">
                  <span className="font-display text-3xl font-bold text-teal">{n}</span>
                  <div><h3 className="font-semibold text-navy">{t}</h3><p className="text-sm text-muted-foreground">{d}</p></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <footer className="mx-auto flex max-w-6xl items-center gap-2 px-6 py-8 text-sm text-muted-foreground">
          <Users className="h-4 w-4" /> Registration always happens with the camp provider.
        </footer>
      </div>
    </div>
  );
}

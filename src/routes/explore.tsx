import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Search, MapPin, CalendarDays, CalendarCheck, Users, Heart, BriefcaseBusiness, Route as RouteIcon, Plane, Download, Share2, ShieldCheck, SlidersHorizontal, Check, ExternalLink, Mail, CircleDollarSign, Wallet, Sparkles } from "lucide-react";
import { SiteHeader, Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import summer from "@/assets/explore-summer.jpg";
import matched from "@/assets/feature-matched.jpg";
import map from "@/assets/feature-map.jpg";
import calendar from "@/assets/feature-calendar.jpg";
import arts from "@/assets/camp-arts.jpg";
import sports from "@/assets/camp-sports.jpg";
import nature from "@/assets/camp-nature.jpg";

export const Route = createFileRoute("/explore")({
  head: () => ({
    meta: [
      { title: "Explore Kodanz — A summer that fits your family" },
      { name: "description", content: "Explore Kodanz: find summer camps, compare costs and locations, plan for every child, and coordinate summer with friends." },
      { property: "og:title", content: "Explore Kodanz — A summer that fits your family" },
      { property: "og:description", content: "From the first camp search to a shared summer calendar, discover everything Kodanz brings together for your family." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://kodanzcamp.lovable.app/explore" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://kodanzcamp.lovable.app/explore" }],
  }),
  component: Explore,
});

const extras = [
  { icon: Heart, title: "A shortlist worth saving", text: "Favorite camps for your children and return to the ones your family loves.", color: "bg-coral-soft text-coral" },
  { icon: CircleDollarSign, title: "A budget you can see", text: "Compare favorite camps by weekly cost and estimate your family’s summer total with what-if picks—nothing is saved or charged.", color: "bg-sun-soft text-navy" },
  { icon: Plane, title: "Make room for life", text: "Add family trips and personal activities for everyone or just one child, with their own color in the planner.", color: "bg-lilac-soft text-lilac" },
  { icon: Download, title: "Take summer with you", text: "Export a full-summer PDF for selected children, side-by-side or on separate pages. Download calendar invites with available camp website links.", color: "bg-teal-soft text-teal" },
  { icon: Share2, title: "Send a little inspiration", text: "Share public camp links by text, email, WhatsApp, Facebook or X, without sharing your family’s plans.", color: "bg-sun-soft text-navy" },
  { icon: ShieldCheck, title: "Know what’s confirmed", text: "See source links, checked dates, availability status, and estimated or synthetic labels. Confirm final details with the provider.", color: "bg-teal-soft text-teal" },
  { icon: Mail, title: "A family account", text: "Sign in with email or Google, manage multiple children, and keep your favorites and plans together. Password reset is there when you need it.", color: "bg-coral-soft text-coral" },
];

function FeatureLine({ icon: Icon, title, text }: { icon: typeof Search; title: string; text: string }) {
  return <li className="flex gap-3"><Icon className="mt-1 size-5 shrink-0 text-teal" aria-hidden="true" /><div><h3 className="text-base font-semibold text-navy">{title}</h3><p className="mt-1 text-sm leading-relaxed text-muted-foreground">{text}</p></div></li>;
}

function Explore() {
  return (
    <div className="explore-page">
      <SiteHeader />
      <main>
        <section className="relative isolate flex min-h-[480px] items-center overflow-hidden md:min-h-[510px]">
          <img src={summer} alt="Children painting and playing soccer together at summer camp" width={1536} height={864} className="absolute inset-0 -z-20 h-full w-full object-cover object-[65%_center]" />
          <div className="explore-photo-shade absolute inset-0 -z-10" />
          <div className="mx-auto w-full max-w-6xl px-6 py-14 text-primary-foreground">
            <p className="mb-5 flex items-center gap-2 font-display text-xs font-semibold uppercase"><Sparkles className="size-4 text-sun" /> A summer that fits your family</p>
            <h1 className="text-4xl font-bold leading-tight md:text-6xl">Explore Kodanz</h1>
            <p className="mt-5 max-w-md text-xl font-semibold leading-relaxed">Big adventures for them.<br />A little breathing room for you.</p>
            <p className="mt-4 max-w-md text-base leading-relaxed text-primary-foreground/90">Find the right camps, bring every child’s summer together, and make plans with friends. All in one place.</p>
            <Button asChild size="lg" className="mt-7 bg-sun text-navy hover:bg-sun/90"><Link to="/">Find their next adventure <ArrowRight /></Link></Button>
            <p className="mt-3 text-xs text-primary-foreground/85">Browse freely. Sign in to save, plan, and share.</p>
          </div>
        </section>

        <div className="border-b bg-card">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-x-4 gap-y-5 px-6 py-6 md:grid-cols-4">
            {[{ icon: Search, title: "Discover", text: "Their interests. Your neighborhood." }, { icon: MapPin, title: "Compare", text: "Costs, locations, and commutes." }, { icon: CalendarDays, title: "Plan", text: "Every child. Every summer week." }, { icon: Users, title: "Connect", text: "More friends in the same camps." }].map(({ icon: Icon, title, text }) => <div key={title} className="flex gap-3"><Icon className="mt-1 size-5 shrink-0 text-teal" /><div><p className="font-display text-sm font-semibold">{title}</p><p className="mt-1 text-xs text-muted-foreground">{text}</p></div></div>)}
          </div>
        </div>

        <section className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-16 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="eyebrow">01 / Find their thing</p>
            <h2 className="mt-3 text-3xl font-bold leading-tight text-navy md:text-4xl">A whole summer of<br className="hidden md:block" /> “can I try that?”</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">From art and coding to sports, swimming, and outdoor adventures. Start with a ZIP code, their age, and what lights them up.</p>
            <ul className="mt-6 space-y-5">
              <FeatureLine icon={SlidersHorizontal} title="Less scrolling, better matches" text="Choose interests, a 5, 10, 20 or 30 mile radius, and exclude half-day camps when you need a longer day." />
              <FeatureLine icon={CircleDollarSign} title="Compare the trade-offs" text="Sort by nearest location or lowest weekly cost. See camp hours, ages, and available provider details." />
              <FeatureLine icon={ExternalLink} title="Go straight to the source" text="Review official camp websites, or suggest a camp or correction for review." />
            </ul>
            <Button asChild variant="link" className="mt-5 px-0 text-teal"><Link to="/">Discover camps <ArrowRight /></Link></Button>
          </div>
          <div className="relative">
            <img src={matched} alt="Illustration of a parent comparing summer camps" width={768} height={768} loading="lazy" className="aspect-[5/4] w-full rounded-lg object-cover" />
            <div className="mt-3 grid grid-cols-3 gap-3">
              {[{ src: arts, title: "Create" }, { src: sports, title: "Play" }, { src: nature, title: "Explore" }].map(({ src, title }) => <div key={title} className="relative overflow-hidden rounded-lg"><img src={src} alt={`${title} at summer camp`} width={320} height={240} loading="lazy" className="aspect-[4/3] w-full object-cover" /><span className="absolute bottom-2 left-2 rounded bg-card/95 px-2 py-1 text-xs font-semibold text-navy">{title}</span></div>)}
            </div>
          </div>
        </section>

        <section className="bg-teal-soft/50">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-16 lg:grid-cols-2 lg:gap-16">
            <img src={map} alt="Illustration of a neighborhood map with camp location pins" width={768} height={768} loading="lazy" className="aspect-[5/4] w-full rounded-lg object-cover" />
            <div>
              <p className="eyebrow">02 / See the bigger picture</p>
              <h2 className="mt-3 text-3xl font-bold leading-tight text-navy md:text-4xl">Great camp.<br />Does it fit your day?</h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">A camp can be perfect for your child and still be tricky for your schedule. Bring home, work, and camp into the same picture.</p>
              <ul className="mt-6 space-y-5">
                <FeatureLine icon={MapPin} title="List today, map tomorrow" text="Switch to a Google street map with camp price pins and your search radius." />
                <FeatureLine icon={BriefcaseBusiness} title="Home and work, together" text="Save a home ZIP and multiple office ZIPs. See them on the map alongside selected camps; your saved home ZIP also starts your next search." />
                <FeatureLine icon={RouteIcon} title="Think through the school-run shuffle" text="Multi-child Driving Zone shows camps by child. Request road-route comparisons from private saved places to compare drop-off and pickup options." />
              </ul>
              <p className="mt-5 border-l-2 border-teal pl-3 text-xs leading-relaxed text-muted-foreground">Search distances are straight-line estimates. Road-route comparisons are separate, on-demand estimates—not guaranteed travel times.</p>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-16 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="eyebrow">03 / Bring it all together</p>
            <h2 className="mt-3 text-3xl font-bold leading-tight text-navy md:text-4xl">Different kids.<br />One summer picture.</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">Plan the summer of 2027, June 7–September 3. One week or the whole season, one child or the whole crew.</p>
            <ul className="mt-6 space-y-5">
              <FeatureLine icon={Users} title="A plan for every child" text="Add multiple children and assign camp weeks to one or more of them." />
              <FeatureLine icon={CalendarCheck} title="See what's already booked" text="Weeks you've filled show an indicator right in the camp calendar—other camps, personal activities, and friend matches—so you can compare before committing. Planning entries are easy to remove." />
              <FeatureLine icon={CalendarDays} title="Spot the gaps before summer starts" text="See camps, open weeks, and scheduling conflicts in a week-by-week calendar." />
              <FeatureLine icon={Plane} title="Vacations count, too" text="Give family trips and personal activities their own color, so those weeks don’t need camps." />
              <FeatureLine icon={Wallet} title="Estimate the summer budget" text="Compare your favorite camps side by side, then estimate weekly costs per child and for the whole family. Try what-if picks and rate tweaks without changing your saved plans." />
            </ul>
            <Button asChild variant="link" className="mt-5 px-0 text-teal"><Link to="/planner">Open your summer planner <ArrowRight /></Link></Button>
          </div>
          <div>
            <img src={calendar} alt="Illustration of a colorful summer calendar" width={768} height={768} loading="lazy" className="aspect-[2/1] w-full rounded-lg object-cover" />
            <div className="mt-4 overflow-hidden rounded-lg border bg-card shadow-soft" aria-label="Illustrative two-child summer planner">
              <div className="flex items-center justify-between border-b px-4 py-3"><span className="font-display text-sm font-semibold">A little preview of summer</span><CalendarDays className="size-4 text-teal" /></div>
              <div className="grid grid-cols-[1fr_1fr_1fr] gap-2 p-4 text-xs sm:text-sm">
                <span className="text-muted-foreground">Example weeks</span><span className="font-semibold">Child 1</span><span className="font-semibold">Child 2</span>
                <span className="self-center">June 7–11</span><span className="rounded bg-teal-soft px-2 py-3 text-teal">Art camp</span><span className="rounded bg-sun-soft px-2 py-3 text-navy">Sports camp</span>
                <span className="self-center">June 14–18</span><span className="rounded bg-teal-soft px-2 py-3 text-teal">Nature camp</span><span className="rounded bg-teal-soft px-2 py-3 text-teal">Nature camp</span>
                <span className="self-center">June 21–25</span><span className="col-span-2 flex items-center justify-center gap-2 rounded border border-dashed border-lilac bg-lilac-soft px-2 py-3 text-lilac"><Plane className="size-4" /> Family trip</span>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-card">
          <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-16">
            <div><p className="eyebrow">04 / Better with friends</p><h2 className="mt-3 text-3xl font-bold leading-tight text-navy md:text-4xl">“Are your kids<br />going that week, too?”</h2><p className="mt-4 leading-relaxed text-muted-foreground">Turn that group-chat question into a shared plan. Invite signed-in friends to see selected children’s camp weeks, then find where your summers overlap.</p><p className="mt-5 flex items-start gap-2 text-sm text-muted-foreground"><ShieldCheck className="mt-0.5 size-5 shrink-0 text-teal" />Your home, work locations, and personal activities stay private. Invitations can be revoked.</p></div>
            <div className="space-y-0">
              {[{ title: "Invite your people", text: "Share only the children’s plans you select.", icon: Share2 }, { title: "Find your camp matches", text: "See overlapping camps and weeks with your own children.", icon: Check }, { title: "Make it your plan", text: "Click into camp details, then copy selected weeks to your child’s planner—without changing your friend’s plans.", icon: CalendarDays }].map(({ title, text, icon: Icon }, i) => <div key={title} className="flex gap-4 border-b py-5 last:border-b-0"><span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-teal-soft text-teal"><Icon className="size-5" /></span><div><p className="text-xs font-semibold text-teal">0{i + 1}</p><h3 className="mt-1 text-lg font-semibold">{title}</h3><p className="mt-1 text-sm leading-relaxed text-muted-foreground">{text}</p></div></div>)}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-16">
          <p className="eyebrow">The little things that help</p><h2 className="mt-3 text-3xl font-bold text-navy md:text-4xl">Less juggling. More possibility.</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{extras.map(({ icon: Icon, title, text, color }) => <article key={title} className="rounded-lg border bg-card p-6"><span className={`inline-flex size-10 items-center justify-center rounded-lg ${color}`}><Icon className="size-5" /></span><h3 className="mt-4 text-lg font-semibold text-navy">{title}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p></article>)}</div>
          <p className="mt-5 text-sm text-muted-foreground">Favorites, family planning, driving comparisons, and sharing require sign-in. Browsing camps doesn’t.</p>
        </section>

        <section className="bg-teal-soft">
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-6 py-12 md:flex-row md:items-center"><div><h2 className="text-3xl font-bold text-navy">Their next great summer starts here.</h2><p className="mt-3 text-muted-foreground">Start with their curiosity. Build a plan that works for everyone.</p></div><Button asChild size="lg" className="shrink-0"><Link to="/">Find camps <ArrowRight /></Link></Button></div>
        </section>
      </main>
      <footer className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-8 sm:flex-row sm:items-center sm:justify-between"><Logo /><p className="max-w-lg text-xs leading-relaxed text-muted-foreground">Kodanz helps you discover and plan—not book. Camp plans are tentative; confirm dates, prices, and registration with each provider.</p></footer>
    </div>
  );
}
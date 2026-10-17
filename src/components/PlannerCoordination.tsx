import { useEffect, useState } from "react";
import { CalendarDays, Check, Copy, Download, ExternalLink, Share2, Users, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CAMPS, SUMMER_WEEKS, weekLabel, type Camp } from "@/lib/camps";
import { useFamilyMutations, type Activity, type Kid, type Plan } from "@/lib/family";
import { adoptablePlans, matchingKids, plannerInviteUrl, type SharedPlanner } from "@/lib/planner-sharing";
import { usePlannerSharing } from "@/lib/planner-sharing-data";
import { buildPlannerIcs, buildPlannerPdf, deliverCalendar } from "@/lib/planner-export";
import { ScheduleDialog } from "@/components/ScheduleDialog";

type Props = { kids: Kid[]; plans: Plan[]; activities: Activity[]; invite?: string | undefined };

function ChildSelection({ kids, selected, onChange }: { kids: Kid[]; selected: string[]; onChange: (ids: string[]) => void }) {
  return <div className="flex flex-wrap gap-x-5 gap-y-2">{kids.map((kid) => <label key={kid.id} className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-navy">
    <input type="checkbox" checked={selected.includes(kid.id)} onChange={(e) => onChange(e.target.checked ? [...selected, kid.id] : selected.filter((id) => id !== kid.id))} />{kid.name}
  </label>)}</div>;
}

export function PlannerCoordination({ kids, plans, activities, invite }: Props) {
  const sharing = usePlannerSharing();
  const [mode, setMode] = useState<"export" | "share" | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [pdf, setPdf] = useState<Blob | null>(null);
  const [pdfError, setPdfError] = useState(false);
  const [link, setLink] = useState("");
  const [inviteInput, setInviteInput] = useState(invite ?? "");
  const [accepted, setAccepted] = useState(false);
  const [copySource, setCopySource] = useState<{ planner: SharedPlanner; kid: Kid } | null>(null);
  const [campDetail, setCampDetail] = useState<Camp | null>(null);
  const chosenKids = kids.filter((k) => selected.includes(k.id));

  useEffect(() => { setInviteInput(invite ?? ""); setAccepted(false); }, [invite]);
  useEffect(() => {
    if (mode !== "export" || !selected.length) { setPdf(null); return; }
    let active = true;
    setPdf(null); setPdfError(false);
    buildPlannerPdf(kids.filter((k) => selected.includes(k.id)), plans, activities).then((blob) => { if (active) setPdf(blob); }).catch(() => { if (active) setPdfError(true); });
    return () => { active = false; };
  }, [mode, selected, kids, plans, activities]);

  function open(next: "share" | "export") { setSelected(kids.map((k) => k.id)); setMode(next); setLink(""); }
  async function copyLink(url: string) {
    try { await navigator.clipboard.writeText(url); toast.success("Planner invitation copied"); }
    catch { toast.error("Select and copy the invitation link below"); }
  }
  async function createInvite() {
    try {
      const result = await sharing.create.mutateAsync({ title: title.trim() || `${chosenKids.map((k) => k.name).join(" & ")} · Summer 2027`.slice(0, 80), kid_ids: selected });
      setLink(plannerInviteUrl(result.token));
      toast.success("Private planner invitation created");
    } catch { toast.error("Could not create the invitation"); }
  }
  async function acceptInvite() {
    const input = inviteInput.trim();
    let token = input;
    try { token = new URL(input).searchParams.get("invite") ?? ""; } catch { /* Bare tokens are also accepted. */ }
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token)) { toast.error("Enter a valid planner invitation link"); return; }
    try { await sharing.accept.mutateAsync(token); setAccepted(true); setInviteInput(""); toast.success("Friend’s planner added"); }
    catch { toast.error("Invitation unavailable, revoked, or belongs to your own planner"); }
  }

  return <>
    <div className="mt-5 flex flex-wrap gap-2">
      <Button variant="outline" disabled={!kids.length} onClick={() => open("export")}><Download /> Export summer</Button>
      <Button variant="outline" disabled={!kids.length} onClick={() => open("share")}><Share2 /> Share planner</Button>
    </div>

    <section className="mt-8 border-t pt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-xl font-bold text-navy"><Users className="h-5 w-5 text-teal" /> Friends’ summer plans</h2>
        <Button variant="ghost" size="sm" onClick={() => sharing.shared.refetch()}>Refresh</Button>
      </div>
      <form className="mt-3 flex flex-wrap gap-2" onSubmit={(e) => { e.preventDefault(); void acceptInvite(); }}>
        <input aria-label="Friend's planner invitation" value={inviteInput} onChange={(e) => { setInviteInput(e.target.value); setAccepted(false); }} placeholder="Paste a friend’s planner invitation" className="min-w-0 flex-1 rounded-md border bg-card px-3 py-2 text-sm" />
        <Button type="submit" disabled={!inviteInput.trim() || sharing.accept.isPending}><Users />{sharing.accept.isPending ? "Accepting…" : "Accept invitation"}</Button>
      </form>
      {invite && !accepted && <p className="mt-2 text-sm text-muted-foreground">Accept this invitation to add your friend’s camp calendar.</p>}
      {sharing.shared.isLoading && <p className="mt-4 text-sm text-muted-foreground">Loading shared planners…</p>}
      {sharing.shared.isError && <p className="mt-4 text-sm text-destructive">Couldn’t load shared planners. Try refreshing.</p>}
      {sharing.shared.data?.length === 0 && <p className="mt-4 text-sm text-muted-foreground">No shared planners yet.</p>}
      <div className="mt-4 space-y-6">
        {sharing.shared.data?.map((friend) => <div key={friend.id} className="border-b pb-5 last:border-0">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="min-w-0 break-words font-bold text-navy">{friend.title}</h3>
            <Button variant="ghost" size="icon" aria-label={`Remove shared planner ${friend.title}`} title="Remove shared planner" onClick={async () => {
              try { await sharing.leave.mutateAsync(friend.id); } catch { toast.error("Couldn’t remove shared planner"); }
            }}><X /></Button>
          </div>
          <div className="overflow-x-auto rounded-lg border bg-card">
            <table className="w-full min-w-[1100px] text-xs">
              <thead><tr className="border-b"><th className="sticky left-0 z-10 min-w-32 bg-card px-3 py-3 text-left">Friend’s child</th>{SUMMER_WEEKS.map((week) => <th key={week} className="min-w-24 px-2 py-3 text-left text-muted-foreground">{weekLabel(week).split(" – ")[0]}</th>)}</tr></thead>
              <tbody>{friend.kids.map((kid) => <tr key={kid.id} className="border-b last:border-0">
                <td className="sticky left-0 z-10 bg-card px-3 py-3 align-top"><p className="font-semibold text-navy">{kid.name}</p><p className="text-muted-foreground">Age {kid.age}</p><Button variant="link" size="sm" className="mt-1 h-auto whitespace-normal px-0 text-teal" disabled={!friend.plans.some((p) => p.kid_id === kid.id) || !kids.length} onClick={() => setCopySource({ planner: friend, kid })}>Review & copy</Button></td>
                {SUMMER_WEEKS.map((week) => <td key={week} className="px-1 py-2 align-top"><div className="space-y-2">{friend.plans.filter((p) => p.kid_id === kid.id && p.week === week).map((plan) => {
                  const c = CAMPS.find((camp) => camp.id === plan.camp_id);
                  const matches = matchingKids(plan, kids, plans);
                  return <div key={plan.id} className={`rounded-md p-2 ${matches.length ? "bg-teal-soft" : "bg-muted"}`}>
                    <Button variant="link" className="h-auto w-full whitespace-normal p-0 text-left text-xs text-navy" onClick={() => c ? setCampDetail(c) : toast.error("Camp details are no longer available")}>{c?.name ?? plan.camp_id}</Button>
                    {matches.map((match) => <p key={match.id} className="mt-1 flex items-start gap-1 text-xs font-semibold text-teal"><Check className="mt-0.5 h-3 w-3 shrink-0" /> Matches {match.name}</p>)}
                  </div>;
                })}</div></td>)}
              </tr>)}</tbody>
            </table>
          </div>
        </div>)}
      </div>
      {!!sharing.invites.data?.length && <details className="mt-4">
        <summary className="cursor-pointer text-sm font-semibold text-teal">Your shared invitations ({sharing.invites.data.length})</summary>
        <ul className="mt-2 divide-y">{sharing.invites.data.map((invitation) => <li key={invitation.id} className="flex flex-wrap items-center gap-2 py-2 text-sm">
          <span className="min-w-0 flex-1 break-words">{invitation.title}</span>
          <Button variant="ghost" size="sm" onClick={() => copyLink(plannerInviteUrl(invitation.token))}><Copy /> Copy</Button>
          <Button variant="ghost" size="sm" disabled={sharing.revoke.isPending} onClick={async () => {
            if (!confirm("Stop sharing this planner with everyone using this invitation?")) return;
            try { await sharing.revoke.mutateAsync(invitation.id); toast.success("Invitation revoked"); } catch { toast.error("Couldn’t revoke invitation"); }
          }}>Revoke</Button>
        </li>)}</ul>
      </details>}
    </section>

    <Dialog open={mode !== null} onOpenChange={(open) => { if (!open) setMode(null); }}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto rounded-lg">
        <DialogHeader><DialogTitle>{mode === "export" ? "Export summer calendar" : "Share your summer planner"}</DialogTitle>
          <DialogDescription>{mode === "export" ? "June 7 – September 3, 2027. Choose the children to include." : "Share selected children’s camp plans with signed-in friends. Home, offices and personal activities stay private."}</DialogDescription></DialogHeader>
        <ChildSelection kids={kids} selected={selected} onChange={setSelected} />
        {mode === "export" ? <>
          <p className="text-sm text-muted-foreground">PDF includes all 13 weeks, open weeks and personal activities. Calendar file includes scheduled camps and activities.</p>
          <Button disabled={!pdf} onClick={() => { if (pdf) void deliverCalendar(pdf, "kodanz-summer-2027.pdf"); }}><Download />{pdf ? "Download full calendar PDF" : selected.length ? "Preparing PDF…" : "Select children"}</Button>
          {pdfError && <p className="text-sm text-destructive">Couldn’t prepare the PDF. Close and reopen to retry.</p>}
          <Button variant="outline" disabled={!selected.length} onClick={() => deliverCalendar(new Blob([buildPlannerIcs(chosenKids, plans, activities)], { type: "text/calendar;charset=utf-8" }), "kodanz-summer-2027.ics")}><CalendarDays /> Download calendar file (.ics)</Button>
        </> : <>
          <input aria-label="Shared planner name" placeholder="Planner name (optional)" maxLength={80} value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-md border bg-card px-3 py-2" />
          <p className="text-sm text-muted-foreground">Anyone you send the invitation to can sign in and accept it. They see live camp updates, but cannot change your planner. Revoke the invitation at any time.</p>
          <Button disabled={!selected.length || sharing.create.isPending} onClick={createInvite}><Share2 />{sharing.create.isPending ? "Creating…" : "Create invitation"}</Button>
          {link && <>
            <input aria-label="Private planner invitation link" readOnly value={link} onFocus={(e) => e.currentTarget.select()} className="w-full rounded-md border bg-muted px-3 py-2 text-sm" />
            <Button variant="outline" onClick={() => copyLink(link)}><Copy /> Copy invitation</Button>
            <Button variant="outline" asChild><a href={`mailto:?subject=${encodeURIComponent("Plan summer together on Kodanz")}&body=${encodeURIComponent(`Join my summer camp planner on Kodanz:\n${link}\nSign in to accept the invitation.`)}`}>Email invitation</a></Button>
          </>}
        </>}
      </DialogContent>
    </Dialog>
    {copySource && <CopySelections source={copySource} kids={kids} plans={plans} activities={activities} onClose={() => setCopySource(null)} onDetail={setCampDetail} />}
    <Dialog open={campDetail !== null} onOpenChange={(open) => { if (!open) setCampDetail(null); }}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto rounded-lg">
        {campDetail && <CampReview camp={campDetail} />}
      </DialogContent>
    </Dialog>
  </>;
}

function CampReview({ camp }: { camp: Camp }) {
  const [modify, setModify] = useState(false);
  return <>
    <DialogHeader><DialogTitle className="pr-4 text-navy">{camp.name}</DialogTitle><DialogDescription>{camp.provider} · {camp.city}, {camp.state}</DialogDescription></DialogHeader>
    <img src={camp.image} alt={camp.name} className="aspect-[2/1] w-full rounded-md object-cover" />
    <div className="space-y-2 text-sm"><p>{camp.address}</p><p>Ages {camp.minAge}–{camp.maxAge} · {camp.dayType === "half" ? "Half day" : "Full day"} · {camp.hours ?? "Hours not published"}</p><p className="font-semibold">{camp.pricePerWeek !== null ? `$${camp.pricePerWeek}/week` : "Ask provider for price"}</p>{camp.note && <p className="text-muted-foreground">{camp.note}</p>}</div>
    {camp.website && <Button variant="outline" asChild><a href={camp.website} target="_blank" rel="noopener noreferrer"><ExternalLink /> Provider details</a></Button>}
    <Button onClick={() => setModify(true)}><CalendarDays /> Choose weeks for my kids</Button>
    {modify && <ScheduleDialog camp={camp} onClose={() => setModify(false)} />}
  </>;
}

function CopySelections({ source, kids, plans, activities, onClose, onDetail }: { source: { planner: SharedPlanner; kid: Kid }; kids: Kid[]; plans: Plan[]; activities: Activity[]; onClose: () => void; onDetail: (camp: Camp) => void }) {
  const [targetId, setTargetId] = useState(kids[0]?.id ?? "");
  const sourcePlans = source.planner.plans.filter((p) => p.kid_id === source.kid.id);
  const [weeks, setWeeks] = useState<string[]>([...new Set(sourcePlans.map((p) => p.week))]);
  const target = kids.find((k) => k.id === targetId);
  const eligible = target ? adoptablePlans(sourcePlans, target, weeks, plans, activities, CAMPS) : [];
  const { addPlans } = useFamilyMutations();
  async function accept() {
    if (!eligible.length) return;
    try { await addPlans.mutateAsync(eligible); toast.success(`Added ${eligible.length} weeks to ${target?.name}’s planner`); onClose(); }
    catch { toast.error("Couldn’t add the selected weeks"); }
  }
  return <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}><DialogContent className="max-h-[90dvh] overflow-y-auto rounded-lg">
    <DialogHeader><DialogTitle>Copy {source.kid.name}’s camp selections</DialogTitle><DialogDescription>Choose weeks for your child. Existing plans and personal activities will not be replaced.</DialogDescription></DialogHeader>
    <label className="text-sm font-semibold">Add to<select aria-label="Copy camps to child" value={targetId} onChange={(e) => setTargetId(e.target.value)} className="mt-2 block w-full rounded-md border bg-card px-3 py-2">{kids.map((kid) => <option key={kid.id} value={kid.id}>{kid.name} (age {kid.age})</option>)}</select></label>
    <div className="max-h-64 space-y-2 overflow-y-auto">{SUMMER_WEEKS.filter((week) => sourcePlans.some((p) => p.week === week)).map((week) => {
      const available = target ? adoptablePlans(sourcePlans, target, [week], plans, activities, CAMPS).length > 0 : false;
      return <div key={week} className="rounded-md border p-3">
        <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" disabled={!available} checked={available && weeks.includes(week)} onChange={(e) => setWeeks(e.target.checked ? [...weeks, week] : weeks.filter((w) => w !== week))} />{weekLabel(week)}</label>
        {sourcePlans.filter((p) => p.week === week).map((plan) => { const camp = CAMPS.find((c) => c.id === plan.camp_id); return <Button key={plan.id} variant="link" className="mt-1 h-auto whitespace-normal p-0 text-sm text-teal" onClick={() => { if (camp) onDetail(camp); }}>{camp?.name ?? plan.camp_id}</Button>; })}
        {!available && <p className="mt-1 text-xs text-muted-foreground">Already planned, personal activity, or no age-eligible camp available this week.</p>}
      </div>;
    })}</div>
    <Button disabled={!eligible.length || addPlans.isPending} onClick={accept}><Check />{addPlans.isPending ? "Adding…" : `Accept ${eligible.length} selected week${eligible.length === 1 ? "" : "s"}`}</Button>
  </DialogContent></Dialog>;
}
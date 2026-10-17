import { useState } from "react";
import { Flag, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AuthPrompt } from "@/components/AuthPrompt";
import { useSession } from "@/hooks/use-session";
import { supabase } from "@/integrations/supabase/client";
import type { Camp } from "@/lib/camps";

export function CampTrust({ camp }: { camp: Camp }) {
  return <div className="mt-2 space-y-1 text-xs">
    <div className="flex flex-wrap gap-2"><span className={camp.sourceCheckedAt ? "font-semibold text-teal" : "text-muted-foreground"}>{camp.sourceCheckedAt ? "Official source checked" : camp.availability === "assumed" ? "Community flyer" : "Source not yet verified"}</span>
      <span className="font-semibold text-coral">{camp.availability === "confirmed" ? "2027 confirmed" : camp.availability === "assumed" ? "2027 assumed from flyer" : "2027 dates pending"}</span></div>
    {camp.sourceCheckedAt && <p className="text-muted-foreground">Last checked {camp.sourceCheckedAt}{camp.publishedPriceYear ? ` · price published for ${camp.publishedPriceYear}, not confirmed for 2027` : ""}</p>}
    {camp.sourceCheckedAt && camp.availability !== "confirmed" && <p className="text-muted-foreground">{camp.detailsYear ? `Ages and hours, where shown, are from ${camp.detailsYear}.` : "Source does not confirm 2027 ages or hours."} Confirm session-specific eligibility with the provider.</p>}
    {camp.sourceUrl && <a className="font-semibold text-teal underline" href={camp.sourceUrl} target="_blank" rel="noopener noreferrer">Official source</a>}
    <CampSubmission camp={camp} />
  </div>;
}

export function CampSubmission({ camp }: { camp?: Camp }) {
  const { user } = useSession();
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState(false);
  const [name, setName] = useState(camp?.name ?? "");
  const [url, setUrl] = useState(camp?.sourceUrl ?? camp?.website ?? "");
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  return <>
    <Button variant="ghost" size="sm" className="h-auto whitespace-normal px-0 py-1 text-xs text-muted-foreground" onClick={() => user ? setOpen(true) : setPrompt(true)}>{camp ? <Flag /> : <Send />}{camp ? "Report a correction" : "Submit a camp / provider update"}</Button>
    {prompt && <AuthPrompt title="Help keep camps accurate" description="Log in to send a correction or submit a camp for review." onClose={() => setPrompt(false)} />}
    <Dialog open={open} onOpenChange={setOpen}><DialogContent className="max-h-[90dvh] overflow-y-auto">
      <DialogHeader><DialogTitle>{camp ? "Report a correction" : "Submit a camp"}</DialogTitle><DialogDescription>Submissions are reviewed before any directory changes. Include the year for prices and dates.</DialogDescription></DialogHeader>
      {submitted ? <p role="status" className="font-semibold text-teal">Submitted — pending review.</p> : <form className="space-y-3" onSubmit={async (e) => {
        e.preventDefault();
        try { const parsed = new URL(url); if (parsed.protocol !== "https:") throw new Error(); } catch { toast.error("Enter a valid https source link"); return; }
        setBusy(true);
        try { const { error } = await supabase.from("camp_submissions").insert({ kind: camp ? "correction" : "provider", camp_id: camp?.id ?? null, name: name.trim(), source_url: url.trim(), details: details.trim() }); if (error) throw error; setSubmitted(true); }
        catch { toast.error("Could not send the submission. Please try again."); } finally { setBusy(false); }
      }}>
        <label className="block text-sm font-semibold">Camp name<input aria-label="Camp name" required maxLength={160} value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-md border bg-background p-2" /></label>
        <label className="block text-sm font-semibold">Official source link<input aria-label="Official source link" required type="url" value={url} onChange={(e) => setUrl(e.target.value)} className="mt-1 w-full rounded-md border bg-background p-2" /></label>
        <label className="block text-sm font-semibold">Details<textarea aria-label="Submission details" required minLength={10} maxLength={4000} rows={5} value={details} onChange={(e) => setDetails(e.target.value)} className="mt-1 w-full rounded-md border bg-background p-2" /></label>
        <Button type="submit" disabled={busy}><Send />{busy ? "Sending…" : "Send for review"}</Button>
      </form>}
    </DialogContent></Dialog>
  </>;
}
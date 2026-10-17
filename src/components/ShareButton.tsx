import { useState } from "react";
import { Copy, Facebook, Mail, MessageCircle, Share2 } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@/hooks/use-session";
import { AuthPrompt } from "@/components/AuthPrompt";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { canShareCamp, campShareUrl } from "@/lib/sharing";
import type { Camp } from "@/lib/camps";

export function ShareButton({ camp, zip }: { camp: Camp; zip: string }) {
  const { user, ready } = useSession();
  const [open, setOpen] = useState(false);
  const allowed = canShareCamp(user);
  const url = campShareUrl(camp.id, zip);
  const title = `${camp.name} — Kodanz`;
  const text = `${camp.name} in ${camp.city}, ${camp.state} · Summer 2027`;

  async function copy() {
    if (!canShareCamp(user)) return;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Camp link copied");
    } catch {
      toast.error("Couldn't copy the link. Select and copy it below.");
    }
  }

  async function deviceShare() {
    if (!canShareCamp(user)) return;
    if (!navigator.share) { await copy(); return; }
    try { await navigator.share({ title, text, url }); }
    catch (error) {
      if (!(error instanceof Error && error.name === "AbortError")) toast.error("Couldn't share. Try copying the link.");
    }
  }

  return <>
    <Button variant="outline" size="icon" disabled={!ready} onClick={() => setOpen(true)}
      aria-label={`Share ${camp.name}`} title="Share camp" className="shrink-0 text-teal hover:bg-teal-soft">
      <Share2 />
    </Button>
    {open && !allowed && <AuthPrompt onClose={() => setOpen(false)} title="Log in to share this camp" description="Log in or create a free account to share camps with family and friends." />}
    <Dialog open={open && allowed} onOpenChange={setOpen}>
      <DialogContent className="max-w-sm rounded-lg">
        <DialogHeader>
          <DialogTitle className="pr-5 text-navy">Share camp</DialogTitle>
          <DialogDescription>{camp.name} · {camp.city}, {camp.state}</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" asChild><a href={`https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`} target="_blank" rel="noopener noreferrer"><MessageCircle /> WhatsApp</a></Button>
          <Button variant="outline" asChild><a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer"><Facebook /> Facebook</a></Button>
          <Button variant="outline" asChild><a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer"><Share2 /> X</a></Button>
          <Button variant="outline" asChild><a href={`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${text}\n\n${url}`)}`}><Mail /> Email</a></Button>
        </div>
        <input aria-label="Camp share link" readOnly value={url} onFocus={(e) => e.currentTarget.select()} className="min-w-0 w-full rounded-md border bg-muted px-3 py-2 text-sm" />
        <Button onClick={copy}><Copy /> Copy link</Button>
        <Button variant="outline" onClick={deviceShare}><Share2 /> More sharing options</Button>
      </DialogContent>
    </Dialog>
  </>;
}
import { useState } from "react";
import { Briefcase, ChevronDown, Home, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { useHomeZip, usePlaceMutations, useSavedPlaces } from "@/lib/family";
import { useCommuteAddresses } from "@/lib/family";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

const isZip = (z: string) => /^\d{5}$/.test(z.trim());

export function SavedPlaces() {
  const home = useHomeZip(true);
  const places = useSavedPlaces(true);
  const { saveHome, addPlace, removePlace } = usePlaceMutations();
  const [homeInput, setHomeInput] = useState("");
  const [editingHome, setEditingHome] = useState(false);
  const [label, setLabel] = useState("");
  const [zip, setZip] = useState("");
  const [showPrivate, setShowPrivate] = useState(false);
  const addresses = useCommuteAddresses(true);
  const addressCount = (addresses.data ?? []).length;

  return (
    <section className="rounded-3xl border bg-card p-6">
      <h2 className="text-xl font-bold text-navy">Home & work</h2>
      <p className="text-sm text-muted-foreground">Save your home and each parent's office ZIP. We'll use home for searches and show all of them on the map.</p>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
        <Home className="h-4 w-4 text-teal" />
        <span className="font-semibold text-navy">Home</span>
        {home.data && !editingHome ? (
          <>
            <span>{home.data}</span>
            <button onClick={() => { setHomeInput(home.data ?? ""); setEditingHome(true); }} className="font-semibold text-teal underline">Change</button>
          </>
        ) : (
          <form className="flex gap-2" onSubmit={async (e) => {
            e.preventDefault();
            if (!isZip(homeInput)) { toast.error("Enter a 5-digit ZIP code"); return; }
            await saveHome.mutateAsync(homeInput.trim());
            setEditingHome(false);
          }}>
            <input value={homeInput} onChange={(e) => setHomeInput(e.target.value)} inputMode="numeric" maxLength={5} placeholder="19709" className="w-24 rounded-xl border bg-background px-3 py-1.5 outline-none focus:ring-2 focus:ring-ring" />
            <button className="rounded-xl bg-primary px-3 py-1.5 font-semibold text-primary-foreground">Save</button>
          </form>
        )}
      </div>

      <ul className="mt-3 flex flex-wrap gap-2">
        {(places.data ?? []).map((p) => (
          <li key={p.id} className="flex shrink-0 items-center gap-2 rounded-full border bg-background px-3 py-1.5 text-sm">
            <Briefcase className="h-4 w-4 shrink-0 text-coral" />
            <b className="max-w-[16ch] truncate text-navy">{p.label}</b>
            <span>{p.zip}</span>
            <button aria-label={`Remove ${p.label}`} onClick={() => removePlace.mutate(p.id)} className="text-muted-foreground hover:text-navy"><X className="h-4 w-4" /></button>
          </li>
        ))}
      </ul>

      <form className="mt-3 flex flex-wrap gap-2 text-sm" onSubmit={async (e) => {
        e.preventDefault();
        if (!label.trim()) { toast.error("Give the office a name, e.g. \"Mom's office\""); return; }
        if (!isZip(zip)) { toast.error("Enter a 5-digit ZIP code"); return; }
        await addPlace.mutateAsync({ label: label.trim().slice(0, 40), zip: zip.trim() });
        setLabel(""); setZip("");
      }}>
        <input value={label} onChange={(e) => setLabel(e.target.value)} maxLength={40} placeholder="Mom's office" className="min-w-0 flex-1 rounded-xl border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring" />
        <input value={zip} onChange={(e) => setZip(e.target.value)} inputMode="numeric" maxLength={5} placeholder="ZIP" className="w-24 rounded-xl border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring" />
        <button className="inline-flex items-center gap-1 rounded-xl bg-primary px-3 py-2 font-semibold text-primary-foreground"><Plus className="h-4 w-4" /> Add office</button>
      </form>
      <div className="mt-5 border-t pt-4">
        <button type="button" onClick={() => setShowPrivate((s) => !s)} aria-expanded={showPrivate} className="flex w-full items-center justify-between gap-2 text-left">
          <span>
            <span className="inline-flex items-center gap-2 font-semibold text-navy">Private starting addresses (optional)<ChevronDown className={`h-4 w-4 text-teal transition-transform ${showPrivate ? "rotate-180" : ""}`} /></span>
            <span className="block text-xs text-muted-foreground">{showPrivate ? "Used only for your driving calculations; never shared with friends." : `Expand to add street addresses used only for your driving calculations. ${addressCount ? `${addressCount} saved.` : "None saved."}`}</span>
          </span>
        </button>
        {showPrivate && <div className="mt-3 space-y-3">
          <p className="text-xs text-muted-foreground">Without an address, driving uses the ZIP center. Google receives the address when you calculate.</p>
          {home.data && <PrivateAddress placeKey="home" label="Home" />}
          {(places.data ?? []).map((p) => <PrivateAddress key={p.id} placeKey={p.id} label={p.label} />)}
        </div>}
      </div>
    </section>
  );
}

function PrivateAddress({ placeKey, label }: { placeKey: string; label: string }) {
  const addresses = useCommuteAddresses(true);
  const qc = useQueryClient();
  const saved = addresses.data?.find((p) => p.place_key === placeKey)?.address ?? "";
  const [draft, setDraft] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  return <form className="flex flex-wrap items-center gap-2" onSubmit={async (e) => {
    e.preventDefault(); setBusy(true);
    try {
      const value = (draft ?? saved).trim();
      const result = value ? await supabase.from("commute_addresses").upsert({ place_key: placeKey, address: value }, { onConflict: "user_id,place_key" }) : await supabase.from("commute_addresses").delete().eq("place_key", placeKey);
      if (result.error) throw result.error;
      await qc.invalidateQueries({ queryKey: ["commute_addresses"] }); setDraft(null); toast.success(value ? "Private address saved" : "Private address removed");
    } catch { toast.error("Could not save this address"); } finally { setBusy(false); }
  }}>
    <label className="min-w-0 flex-1 text-sm">{label}<input aria-label={`${label} private address`} value={draft ?? saved} onChange={(e) => setDraft(e.target.value)} maxLength={300} placeholder="Street, city, state ZIP" className="mt-1 w-full rounded-md border bg-background p-2" /></label>
    <Button type="submit" variant="outline" disabled={busy}>{busy ? "Saving…" : "Save address"}</Button>
    {saved && <Button variant="ghost" disabled={busy} onClick={async () => { const { error } = await supabase.from("commute_addresses").delete().eq("place_key", placeKey); if (error) { toast.error("Could not remove address"); return; } setDraft(""); await qc.invalidateQueries({ queryKey: ["commute_addresses"] }); }}>Remove</Button>}
  </form>;
}

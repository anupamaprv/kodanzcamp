import { useState } from "react";
import { Briefcase, Home, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { useHomeZip, usePlaceMutations, useSavedPlaces } from "@/lib/family";

const isZip = (z: string) => /^\d{5}$/.test(z.trim());

export function SavedPlaces() {
  const home = useHomeZip(true);
  const places = useSavedPlaces(true);
  const { saveHome, addPlace, removePlace } = usePlaceMutations();
  const [homeInput, setHomeInput] = useState("");
  const [editingHome, setEditingHome] = useState(false);
  const [label, setLabel] = useState("");
  const [zip, setZip] = useState("");

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

      <ul className="mt-3 space-y-2">
        {(places.data ?? []).map((p) => (
          <li key={p.id} className="flex items-center justify-between rounded-xl border px-3 py-2 text-sm">
            <span className="flex items-center gap-2"><Briefcase className="h-4 w-4 text-coral" /><b className="text-navy">{p.label}</b> {p.zip}</span>
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
    </section>
  );
}

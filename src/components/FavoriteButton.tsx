import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Heart, X } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@/hooks/use-session";
import { useFamilyMutations, useFavorites, useKids } from "@/lib/family";
import { AuthPrompt } from "@/components/AuthPrompt";
import type { Camp } from "@/lib/camps";

export function FavoriteButton({ camp }: { camp: Camp }) {
  const { user } = useSession();
  const favs = useFavorites(!!user);
  const kids = useKids(!!user);
  const m = useFamilyMutations();
  const fav = favs.data?.find((f) => f.camp_id === camp.id);
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);

  const openPicker = () => {
    setPicked(fav?.kid_ids ?? (kids.data ?? []).map((k) => k.id));
    setOpen(true);
  };

  const save = async () => {
    await m.saveFavorite.mutateAsync({ camp_id: camp.id, kid_ids: picked });
    toast.success(`Saved ${camp.name}`);
    setOpen(false);
  };

  const remove = async () => {
    await m.removeFavorite.mutateAsync(camp.id);
    toast(`Removed from favorites`);
    setOpen(false);
  };

  return (
    <>
      <button onClick={openPicker} aria-label={fav ? `Edit favorite ${camp.name}` : `Favorite ${camp.name}`} aria-pressed={!!fav}
        className={`shrink-0 rounded-xl border p-2 transition ${fav ? "border-coral bg-coral-soft text-coral" : "text-coral hover:bg-coral-soft"}`}>
        <Heart className={`h-5 w-5 ${fav ? "fill-current" : ""}`} />
      </button>
      {open && !user && <AuthPrompt onClose={() => setOpen(false)} />}
      {open && user && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-navy/40 p-4 sm:items-center" onClick={() => setOpen(false)}>
          <div role="dialog" aria-label="Save favorite" className="w-full max-w-sm rounded-3xl bg-card p-6 shadow-soft" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div><p className="eyebrow">Favorite</p><h2 className="mt-1 text-lg font-bold text-navy">{camp.name}</h2></div>
              <button onClick={() => setOpen(false)} aria-label="Close" className="rounded-full p-1 hover:bg-muted"><X className="h-5 w-5" /></button>
            </div>
            <p className="mt-4 text-sm font-semibold">Save for</p>
            {kids.data?.length ? (
              <div className="mt-2 space-y-2">
                {kids.data.map((k) => (
                  <label key={k.id} className="flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2">
                    <input type="checkbox" className="h-4 w-4 accent-teal" checked={picked.includes(k.id)}
                      onChange={() => setPicked((p) => (p.includes(k.id) ? p.filter((x) => x !== k.id) : [...p, k.id]))} />
                    <span className="font-semibold text-navy">{k.name}</span><span className="text-sm text-muted-foreground">Age {k.age}</span>
                  </label>
                ))}
                <p className="text-xs text-muted-foreground">Leave all unchecked to save it just for yourself.</p>
              </div>
            ) : (
              <p className="mt-1 text-sm text-muted-foreground">No kids added yet. <Link to="/planner" className="font-semibold text-teal underline">Add your kids</Link> to save camps for each one.</p>
            )}
            <div className="mt-5 flex gap-2">
              {fav && <button onClick={remove} className="flex-1 rounded-xl border py-2.5 font-semibold text-navy hover:bg-muted">Remove</button>}
              <button onClick={save} disabled={m.saveFavorite.isPending} className="flex-1 rounded-xl bg-primary py-2.5 font-semibold text-primary-foreground disabled:opacity-50">Save</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

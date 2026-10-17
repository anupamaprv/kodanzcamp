import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Kid = { id: string; name: string; age: number };
export type Favorite = { camp_id: string; kid_ids: string[] };
export type Activity = { id: string; kid_id: string | null; week: string; label: string };
export type Plan = { id: string; kid_id: string; camp_id: string; week: string };

export function useKids(enabled: boolean) {
  return useQuery({
    queryKey: ["kids"],
    enabled,
    queryFn: async () => {
      const { data, error } = await supabase.from("kids").select("id,name,age").order("created_at");
      if (error) throw error;
      return data as Kid[];
    },
  });
}

export function useFavorites(enabled: boolean) {
  return useQuery({
    queryKey: ["favorites"],
    enabled,
    queryFn: async () => {
      const { data, error } = await supabase.from("favorites").select("camp_id,kid_ids").order("created_at");
      if (error) throw error;
      return data as Favorite[];
    },
  });
}

export function usePlans(enabled: boolean) {
  return useQuery({
    queryKey: ["plans"],
    enabled,
    queryFn: async () => {
      const { data, error } = await supabase.from("plans").select("id,kid_id,camp_id,week");
      if (error) throw error;
      return data as Plan[];
    },
  });
}

export function useActivities(enabled: boolean) {
  return useQuery({
    queryKey: ["activities"],
    enabled,
    queryFn: async () => {
      const { data, error } = await supabase.from("activities").select("id,kid_id,week,label");
      if (error) throw error;
      return data as Activity[];
    },
  });
}

export function useFamilyMutations() {
  const qc = useQueryClient();
  const done = (key: string) => () => qc.invalidateQueries({ queryKey: [key] });
  return {
    addKid: useMutation({
      mutationFn: async (k: { name: string; age: number }) => {
        const { error } = await supabase.from("kids").insert(k);
        if (error) throw error;
      },
      onSuccess: done("kids"),
    }),
    removeKid: useMutation({
      mutationFn: async (id: string) => {
        const { error } = await supabase.from("kids").delete().eq("id", id);
        if (error) throw error;
      },
      onSuccess: () => { ["kids", "plans", "activities"].forEach((k) => qc.invalidateQueries({ queryKey: [k] })); },
    }),
    saveFavorite: useMutation({
      mutationFn: async (f: Favorite) => {
        const { error } = await supabase.from("favorites").upsert(f, { onConflict: "user_id,camp_id" });
        if (error) throw error;
      },
      onSuccess: done("favorites"),
    }),
    removeFavorite: useMutation({
      mutationFn: async (campId: string) => {
        const { error } = await supabase.from("favorites").delete().eq("camp_id", campId);
        if (error) throw error;
      },
      onSuccess: done("favorites"),
    }),
    addPlans: useMutation({
      mutationFn: async (rows: { kid_id: string; camp_id: string; week: string }[]) => {
        const { error } = await supabase.from("plans").upsert(rows, { onConflict: "kid_id,camp_id,week", ignoreDuplicates: true });
        if (error) throw error;
      },
      onSuccess: done("plans"),
    }),
    addActivity: useMutation({
      mutationFn: async (rows: { kid_id: string | null; week: string; label: string }[]) => {
        const { error } = await supabase.from("activities").insert(rows);
        if (error) throw error;
      },
      onSuccess: done("activities"),
    }),
    removeActivity: useMutation({
      mutationFn: async (id: string) => {
        const { error } = await supabase.from("activities").delete().eq("id", id);
        if (error) throw error;
      },
      onSuccess: done("activities"),
    }),
    removePlan: useMutation({
      mutationFn: async (id: string) => {
        const { error } = await supabase.from("plans").delete().eq("id", id);
        if (error) throw error;
      },
      onSuccess: done("plans"),
    }),
  };
}

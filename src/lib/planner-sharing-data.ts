import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import type { PlannerInvitation, SharedPlanner } from "@/lib/planner-sharing";

const sharedSchema = z.array(z.object({
  id: z.string().uuid(), title: z.string(),
  kids: z.array(z.object({ id: z.string().uuid(), name: z.string(), age: z.number() })),
  plans: z.array(z.object({ id: z.string().uuid(), kid_id: z.string().uuid(), camp_id: z.string(), week: z.string() })),
}));

export function useSharedPlanners(enabled = true) {
  return useQuery({ queryKey: ["shared-planners"], enabled, queryFn: async (): Promise<SharedPlanner[]> => {
    const { data, error } = await supabase.rpc("shared_planners");
    if (error) throw error;
    return sharedSchema.parse(data);
  } });
}

export function usePlannerSharing() {
  const qc = useQueryClient();
  const invites = useQuery({ queryKey: ["planner-invitations"], queryFn: async () => {
    const { data, error } = await supabase.from("planner_shares").select("id,title,kid_ids,token").order("created_at");
    if (error) throw error;
    return data as PlannerInvitation[];
  } });
  const shared = useSharedPlanners();
  const create = useMutation({ mutationFn: async (input: { title: string; kid_ids: string[] }) => {
    const { data, error } = await supabase.from("planner_shares").insert(input).select("id,title,kid_ids,token").single();
    if (error) throw error;
    return data;
  }, onSuccess: () => qc.invalidateQueries({ queryKey: ["planner-invitations"] }) });
  const revoke = useMutation({ mutationFn: async (id: string) => {
    const { error } = await supabase.from("planner_shares").delete().eq("id", id);
    if (error) throw error;
  }, onSuccess: () => qc.invalidateQueries({ queryKey: ["planner-invitations"] }) });
  const accept = useMutation({ mutationFn: async (token: string) => {
    const { error } = await supabase.rpc("accept_planner_share", { invite_token: token });
    if (error) throw error;
  }, onSuccess: () => qc.invalidateQueries({ queryKey: ["shared-planners"] }) });
  const leave = useMutation({ mutationFn: async (share_id: string) => {
    const { error } = await supabase.from("planner_share_recipients").delete().eq("share_id", share_id);
    if (error) throw error;
  }, onSuccess: () => qc.invalidateQueries({ queryKey: ["shared-planners"] }) });
  return { invites, shared, create, revoke, accept, leave };
}
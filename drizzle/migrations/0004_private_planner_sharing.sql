CREATE TABLE public.planner_shares (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL DEFAULT auth.uid(),
 title text NOT NULL,
 kid_ids uuid[] NOT NULL,
 token uuid NOT NULL DEFAULT gen_random_uuid() UNIQUE,
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.planner_shares TO authenticated;
GRANT ALL ON public.planner_shares TO service_role;
ALTER TABLE public.planner_shares ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owners read shares" ON public.planner_shares FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "owners create selected child shares" ON public.planner_shares FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND cardinality(kid_ids) > 0 AND length(title) BETWEEN 1 AND 80 AND NOT EXISTS (SELECT 1 FROM unnest(kid_ids) k WHERE NOT EXISTS (SELECT 1 FROM public.kids WHERE id = k AND user_id = auth.uid())));
CREATE POLICY "owners revoke shares" ON public.planner_shares FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE TABLE public.planner_share_recipients (
 share_id uuid NOT NULL REFERENCES public.planner_shares(id) ON DELETE CASCADE,
 user_id uuid NOT NULL DEFAULT auth.uid(),
 created_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY (share_id, user_id)
);
GRANT SELECT, DELETE ON public.planner_share_recipients TO authenticated;
GRANT ALL ON public.planner_share_recipients TO service_role;
ALTER TABLE public.planner_share_recipients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "recipients read invitations" ON public.planner_share_recipients FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "recipients leave invitations" ON public.planner_share_recipients FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE FUNCTION public.accept_planner_share(invite_token uuid) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE s public.planner_shares;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Sign in to accept this invitation'; END IF;
 SELECT * INTO s FROM public.planner_shares WHERE token = invite_token;
 IF s.id IS NULL THEN RAISE EXCEPTION 'Invitation unavailable or revoked'; END IF;
 IF s.user_id = auth.uid() THEN RAISE EXCEPTION 'This is your own planner invitation'; END IF;
 INSERT INTO public.planner_share_recipients(share_id,user_id) VALUES(s.id,auth.uid()) ON CONFLICT DO NOTHING;
 RETURN s.id;
END; $$;
REVOKE ALL ON FUNCTION public.accept_planner_share(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.accept_planner_share(uuid) TO authenticated;
CREATE FUNCTION public.shared_planners() RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
 SELECT coalesce(jsonb_agg(jsonb_build_object(
 'id', s.id, 'title', s.title,
 'kids', (SELECT coalesce(jsonb_agg(jsonb_build_object('id',k.id,'name',k.name,'age',k.age)), '[]'::jsonb) FROM public.kids k WHERE k.user_id=s.user_id AND k.id=ANY(s.kid_ids)),
 'plans', (SELECT coalesce(jsonb_agg(jsonb_build_object('id',p.id,'kid_id',p.kid_id,'camp_id',p.camp_id,'week',p.week)), '[]'::jsonb) FROM public.plans p WHERE p.user_id=s.user_id AND p.kid_id=ANY(s.kid_ids) AND p.week BETWEEN '2027-06-07' AND '2027-08-30')
 )), '[]'::jsonb)
 FROM public.planner_shares s JOIN public.planner_share_recipients r ON r.share_id=s.id WHERE r.user_id=auth.uid();
$$;
REVOKE ALL ON FUNCTION public.shared_planners() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.shared_planners() TO authenticated;
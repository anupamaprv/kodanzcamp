CREATE TABLE public.camp_submissions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL DEFAULT auth.uid(),
 kind text NOT NULL CHECK (kind IN ('correction','provider')), camp_id text, name text NOT NULL CHECK (length(name) BETWEEN 1 AND 160),
 source_url text NOT NULL CHECK (source_url ~ '^https://'), details text NOT NULL CHECK (length(details) BETWEEN 10 AND 4000),
 status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')), created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.camp_submissions TO authenticated;
GRANT ALL ON public.camp_submissions TO service_role;
ALTER TABLE public.camp_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY submissions_owner_read ON public.camp_submissions FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY submissions_owner_insert ON public.camp_submissions FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND status = 'pending');
CREATE TABLE public.commute_addresses (
 user_id uuid NOT NULL DEFAULT auth.uid(), place_key text NOT NULL, address text NOT NULL CHECK (length(address) BETWEEN 1 AND 300),
 updated_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY (user_id, place_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.commute_addresses TO authenticated;
GRANT ALL ON public.commute_addresses TO service_role;
ALTER TABLE public.commute_addresses ENABLE ROW LEVEL SECURITY;
CREATE POLICY commute_addresses_owner ON public.commute_addresses FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE TABLE public.commute_route_cache (
 user_id uuid NOT NULL DEFAULT auth.uid(), cache_key text NOT NULL, result jsonb NOT NULL, expires_at timestamptz NOT NULL,
 PRIMARY KEY (user_id, cache_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.commute_route_cache TO authenticated;
GRANT ALL ON public.commute_route_cache TO service_role;
ALTER TABLE public.commute_route_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY commute_cache_owner ON public.commute_route_cache FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
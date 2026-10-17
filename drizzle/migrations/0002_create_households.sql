CREATE TABLE public.households (
  user_id uuid PRIMARY KEY DEFAULT auth.uid(),
  home_zip text NOT NULL CHECK (home_zip ~ '^\d{5}$'),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.households TO authenticated;
GRANT ALL ON public.households TO service_role;
ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own household" ON public.households FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
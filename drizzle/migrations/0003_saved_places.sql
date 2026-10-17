CREATE TABLE public.saved_places (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  label text NOT NULL CHECK (char_length(label) BETWEEN 1 AND 40),
  zip text NOT NULL CHECK (zip ~ '^\d{5}$'),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_places TO authenticated;
GRANT ALL ON public.saved_places TO service_role;
ALTER TABLE public.saved_places ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own places" ON public.saved_places FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
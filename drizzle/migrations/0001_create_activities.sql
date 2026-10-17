CREATE TABLE public.activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  kid_id uuid REFERENCES public.kids(id) ON DELETE CASCADE,
  week date NOT NULL,
  label text NOT NULL CHECK (char_length(label) BETWEEN 1 AND 60),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.activities TO authenticated;
GRANT ALL ON public.activities TO service_role;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own activities" ON public.activities FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid() AND (kid_id IS NULL OR EXISTS (SELECT 1 FROM public.kids k WHERE k.id = kid_id AND k.user_id = auth.uid())));
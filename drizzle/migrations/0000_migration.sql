CREATE TABLE public.kids (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 40),
  age int NOT NULL CHECK (age BETWEEN 3 AND 18),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.kids TO authenticated;
GRANT ALL ON public.kids TO service_role;
ALTER TABLE public.kids ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own kids" ON public.kids FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TABLE public.favorites (
  user_id uuid NOT NULL DEFAULT auth.uid(),
  camp_id text NOT NULL CHECK (char_length(camp_id) <= 60),
  kid_ids uuid[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, camp_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.favorites TO authenticated;
GRANT ALL ON public.favorites TO service_role;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own favorites" ON public.favorites FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TABLE public.plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  kid_id uuid NOT NULL REFERENCES public.kids(id) ON DELETE CASCADE,
  camp_id text NOT NULL CHECK (char_length(camp_id) <= 60),
  week date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (kid_id, camp_id, week)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.plans TO authenticated;
GRANT ALL ON public.plans TO service_role;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own plans" ON public.plans FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid() AND EXISTS (SELECT 1 FROM public.kids k WHERE k.id = kid_id AND k.user_id = auth.uid()));

-- Table for family relationships between personas
CREATE TABLE public.relaciones_familiares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  persona_id uuid NOT NULL REFERENCES public.personas(id) ON DELETE CASCADE,
  familiar_id uuid REFERENCES public.personas(id) ON DELETE SET NULL,
  familiar_nombre text,
  parentesco text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.relaciones_familiares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can manage relaciones_familiares"
  ON public.relaciones_familiares
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

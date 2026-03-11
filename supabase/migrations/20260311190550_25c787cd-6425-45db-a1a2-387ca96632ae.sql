
-- Unique constraint on calificaciones for upsert support
ALTER TABLE public.calificaciones ADD CONSTRAINT calificaciones_item_matricula_unique UNIQUE (item_id, matricula_id);

-- Table for attendance per materia session
CREATE TABLE public.asistencia_materias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  materia_id uuid NOT NULL REFERENCES public.materias(id) ON DELETE CASCADE,
  matricula_id uuid NOT NULL REFERENCES public.matriculas(id) ON DELETE CASCADE,
  fecha date NOT NULL DEFAULT CURRENT_DATE,
  presente boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.asistencia_materias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can manage asistencia_materias"
  ON public.asistencia_materias
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

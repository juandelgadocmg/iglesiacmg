
-- Create periodos_academicos table
CREATE TABLE public.periodos_academicos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  escuela_id uuid NOT NULL REFERENCES public.cursos(id) ON DELETE CASCADE,
  nombre text NOT NULL,
  fecha_inicio date,
  fecha_fin date,
  fecha_matricula_inicio date,
  fecha_matricula_fin date,
  estado text NOT NULL DEFAULT 'Abierto',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create materias table
CREATE TABLE public.materias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  periodo_id uuid NOT NULL REFERENCES public.periodos_academicos(id) ON DELETE CASCADE,
  nombre text NOT NULL,
  descripcion text,
  horario text,
  maestro_nombre text,
  aula text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Add periodo_id and materia_id to matriculas
ALTER TABLE public.matriculas 
  ADD COLUMN periodo_id uuid REFERENCES public.periodos_academicos(id),
  ADD COLUMN materia_id uuid REFERENCES public.materias(id);

-- RLS for periodos_academicos
ALTER TABLE public.periodos_academicos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can manage periodos_academicos" ON public.periodos_academicos FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- RLS for materias
ALTER TABLE public.materias ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can manage materias" ON public.materias FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Trigger for updated_at on periodos
CREATE TRIGGER update_periodos_updated_at BEFORE UPDATE ON public.periodos_academicos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

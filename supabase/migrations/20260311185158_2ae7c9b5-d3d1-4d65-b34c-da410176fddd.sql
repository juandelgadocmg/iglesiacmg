
-- Aulas table
CREATE TABLE public.aulas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  direccion text,
  sede text DEFAULT 'Principal',
  activo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Add maestro_id and aula_id to materias
ALTER TABLE public.materias 
  ADD COLUMN maestro_id uuid REFERENCES public.personas(id),
  ADD COLUMN aula_id uuid REFERENCES public.aulas(id);

-- Cortes academicos (grade periods within a periodo)
CREATE TABLE public.cortes_academicos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  periodo_id uuid NOT NULL REFERENCES public.periodos_academicos(id) ON DELETE CASCADE,
  nombre text NOT NULL,
  numero integer NOT NULL DEFAULT 1,
  porcentaje numeric NOT NULL DEFAULT 100,
  fecha_inicio date,
  fecha_fin date,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Items calificables (gradeable items within a corte + materia)
CREATE TABLE public.items_calificables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  corte_id uuid NOT NULL REFERENCES public.cortes_academicos(id) ON DELETE CASCADE,
  materia_id uuid NOT NULL REFERENCES public.materias(id) ON DELETE CASCADE,
  nombre text NOT NULL,
  tipo text NOT NULL DEFAULT 'Clase',
  porcentaje numeric,
  fecha_inicio date,
  fecha_fin date,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Calificaciones (grades per student per item)
CREATE TABLE public.calificaciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES public.items_calificables(id) ON DELETE CASCADE,
  matricula_id uuid NOT NULL REFERENCES public.matriculas(id) ON DELETE CASCADE,
  nota numeric,
  observacion text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(item_id, matricula_id)
);

-- RLS policies
ALTER TABLE public.aulas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can manage aulas" ON public.aulas FOR ALL TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE public.cortes_academicos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can manage cortes" ON public.cortes_academicos FOR ALL TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE public.items_calificables ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can manage items" ON public.items_calificables FOR ALL TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE public.calificaciones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can manage calificaciones" ON public.calificaciones FOR ALL TO authenticated USING (true) WITH CHECK (true);

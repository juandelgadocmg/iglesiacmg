
-- Conceptos de pago para matrículas (configurable por curso)
CREATE TABLE public.conceptos_pago (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  curso_id uuid REFERENCES public.cursos(id) ON DELETE CASCADE NOT NULL,
  nombre text NOT NULL,
  monto numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.conceptos_pago ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can manage conceptos_pago" ON public.conceptos_pago FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Pagos de matrícula
CREATE TABLE public.pagos_matricula (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  matricula_id uuid REFERENCES public.matriculas(id) ON DELETE CASCADE NOT NULL,
  concepto_pago_id uuid REFERENCES public.conceptos_pago(id) ON DELETE CASCADE NOT NULL,
  estado text NOT NULL DEFAULT 'Pendiente',
  fecha_pago date,
  monto_pagado numeric DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.pagos_matricula ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can manage pagos_matricula" ON public.pagos_matricula FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Recursos académicos (archivos y enlaces)
CREATE TABLE public.recursos_academicos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  materia_id uuid REFERENCES public.materias(id) ON DELETE CASCADE NOT NULL,
  maestro_id uuid REFERENCES public.personas(id) ON DELETE SET NULL,
  titulo text NOT NULL,
  descripcion text,
  tipo text NOT NULL DEFAULT 'enlace',
  url text,
  archivo_url text,
  archivo_nombre text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.recursos_academicos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can manage recursos_academicos" ON public.recursos_academicos FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Homologaciones
CREATE TABLE public.homologaciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  persona_id uuid REFERENCES public.personas(id) ON DELETE CASCADE NOT NULL,
  materia_id uuid REFERENCES public.materias(id) ON DELETE SET NULL,
  materia_nombre text NOT NULL,
  institucion_origen text NOT NULL,
  calificacion_obtenida numeric,
  observaciones text,
  fecha_homologacion date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.homologaciones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can manage homologaciones" ON public.homologaciones FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Storage bucket for academic resources
INSERT INTO storage.buckets (id, name, public) VALUES ('recursos-academicos', 'recursos-academicos', true);

CREATE POLICY "Authenticated can upload recursos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'recursos-academicos');
CREATE POLICY "Authenticated can read recursos" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'recursos-academicos');
CREATE POLICY "Authenticated can delete recursos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'recursos-academicos');


-- Tabla de cursos de academia
CREATE TABLE public.cursos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  instructor TEXT,
  duracion_semanas INTEGER DEFAULT 1,
  fecha_inicio DATE,
  fecha_fin DATE,
  estado TEXT NOT NULL DEFAULT 'Activo',
  cupos INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabla de matrículas (inscripción a cursos)
CREATE TABLE public.matriculas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  curso_id UUID NOT NULL REFERENCES public.cursos(id) ON DELETE CASCADE,
  persona_id UUID NOT NULL REFERENCES public.personas(id) ON DELETE CASCADE,
  estado TEXT NOT NULL DEFAULT 'Activo',
  nota_final NUMERIC,
  fecha_matricula DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(curso_id, persona_id)
);

-- Tabla de certificados
CREATE TABLE public.certificados (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  matricula_id UUID NOT NULL REFERENCES public.matriculas(id) ON DELETE CASCADE,
  persona_id UUID NOT NULL REFERENCES public.personas(id) ON DELETE CASCADE,
  curso_id UUID NOT NULL REFERENCES public.cursos(id) ON DELETE CASCADE,
  codigo TEXT NOT NULL DEFAULT ('CERT-' || substr(gen_random_uuid()::text, 1, 8)),
  fecha_emision DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(matricula_id)
);

-- RLS para cursos
ALTER TABLE public.cursos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view cursos" ON public.cursos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert cursos" ON public.cursos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update cursos" ON public.cursos FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete cursos" ON public.cursos FOR DELETE TO authenticated USING (true);

-- RLS para matrículas
ALTER TABLE public.matriculas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can manage matriculas" ON public.matriculas FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- RLS para certificados
ALTER TABLE public.certificados ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can manage certificados" ON public.certificados FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Trigger updated_at para cursos
CREATE TRIGGER update_cursos_updated_at BEFORE UPDATE ON public.cursos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

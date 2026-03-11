
-- Table to track attendance per group report
CREATE TABLE public.reporte_asistencia (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reporte_id UUID NOT NULL REFERENCES public.reportes_grupos(id) ON DELETE CASCADE,
  persona_id UUID NOT NULL REFERENCES public.personas(id) ON DELETE CASCADE,
  presente BOOLEAN NOT NULL DEFAULT false,
  es_nuevo BOOLEAN NOT NULL DEFAULT false,
  motivo_ausencia TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(reporte_id, persona_id)
);

ALTER TABLE public.reporte_asistencia ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can manage reporte_asistencia"
  ON public.reporte_asistencia
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

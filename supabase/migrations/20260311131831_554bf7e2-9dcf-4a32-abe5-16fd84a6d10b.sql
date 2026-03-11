
CREATE TABLE public.peticiones_oracion (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  persona_id UUID REFERENCES public.personas(id) ON DELETE SET NULL,
  estado TEXT NOT NULL DEFAULT 'Pendiente',
  prioridad TEXT NOT NULL DEFAULT 'Normal',
  fecha_seguimiento DATE,
  fecha_respuesta DATE,
  notas_seguimiento TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.peticiones_oracion ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view peticiones" ON public.peticiones_oracion FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert peticiones" ON public.peticiones_oracion FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update peticiones" ON public.peticiones_oracion FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete peticiones" ON public.peticiones_oracion FOR DELETE TO authenticated USING (true);

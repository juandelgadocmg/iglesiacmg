
-- Create reportes_grupos table
CREATE TABLE public.reportes_grupos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  grupo_id UUID REFERENCES public.grupos(id) ON DELETE CASCADE NOT NULL,
  lider_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  mensaje TEXT NOT NULL DEFAULT '',
  observaciones TEXT,
  estado TEXT NOT NULL DEFAULT 'No Finalizado',
  ofrenda_casa_paz NUMERIC DEFAULT 0,
  total_reportado NUMERIC DEFAULT 0,
  ingreso_verificado_sobre NUMERIC,
  verificado_por UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  fecha_verificacion TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reportes_grupos ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Authenticated can view reportes_grupos"
  ON public.reportes_grupos FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated can insert reportes_grupos"
  ON public.reportes_grupos FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can update reportes_grupos"
  ON public.reportes_grupos FOR UPDATE TO authenticated
  USING (true);

CREATE POLICY "Authenticated can delete reportes_grupos"
  ON public.reportes_grupos FOR DELETE TO authenticated
  USING (true);

-- Updated_at trigger
CREATE TRIGGER update_reportes_grupos_updated_at
  BEFORE UPDATE ON public.reportes_grupos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

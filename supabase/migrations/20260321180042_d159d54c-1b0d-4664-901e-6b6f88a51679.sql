
-- Categorias de evento (ej: VIP, General) con aforo
CREATE TABLE public.evento_categorias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id uuid NOT NULL REFERENCES public.eventos(id) ON DELETE CASCADE,
  nombre text NOT NULL,
  aforo integer DEFAULT 0,
  inscritos integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.evento_categorias ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can manage evento_categorias" ON public.evento_categorias FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Encargados del evento
CREATE TABLE public.evento_encargados (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id uuid NOT NULL REFERENCES public.eventos(id) ON DELETE CASCADE,
  persona_id uuid NOT NULL REFERENCES public.personas(id) ON DELETE CASCADE,
  rol text DEFAULT 'Encargado',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(evento_id, persona_id)
);
ALTER TABLE public.evento_encargados ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can manage evento_encargados" ON public.evento_encargados FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Servidores/voluntarios del evento
CREATE TABLE public.evento_servidores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id uuid NOT NULL REFERENCES public.eventos(id) ON DELETE CASCADE,
  persona_id uuid NOT NULL REFERENCES public.personas(id) ON DELETE CASCADE,
  clasificacion text DEFAULT 'Ujier',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(evento_id, persona_id)
);
ALTER TABLE public.evento_servidores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can manage evento_servidores" ON public.evento_servidores FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Agregar color y fecha_visualizacion a eventos
ALTER TABLE public.eventos ADD COLUMN IF NOT EXISTS color text DEFAULT '#3b82f6';
ALTER TABLE public.eventos ADD COLUMN IF NOT EXISTS fecha_cierre_inscripciones date;

-- Agregar parent_id a categorias_financieras para subcategorías
ALTER TABLE public.categorias_financieras ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES public.categorias_financieras(id) ON DELETE SET NULL;

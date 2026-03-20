
-- Create equipos_ministeriales table for hierarchy management
CREATE TABLE public.equipos_ministeriales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  tipo text NOT NULL DEFAULT 'equipo', -- 'equipo', 'red', 'lider_red'
  red text NULL,
  lider_id uuid REFERENCES public.personas(id) ON DELETE SET NULL,
  parent_id uuid REFERENCES public.equipos_ministeriales(id) ON DELETE SET NULL,
  descripcion text NULL,
  estado text NOT NULL DEFAULT 'Activo',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.equipos_ministeriales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can manage equipos_ministeriales"
  ON public.equipos_ministeriales FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

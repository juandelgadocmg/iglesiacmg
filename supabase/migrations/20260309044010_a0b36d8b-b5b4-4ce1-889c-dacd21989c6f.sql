
-- Single-row church configuration table
CREATE TABLE public.configuracion_iglesia (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_iglesia text NOT NULL DEFAULT '',
  pastor_principal text DEFAULT '',
  telefono text DEFAULT '',
  email text DEFAULT '',
  direccion text DEFAULT '',
  ciudad text DEFAULT '',
  pais text DEFAULT '',
  sitio_web text DEFAULT '',
  logo_url text DEFAULT '',
  descripcion text DEFAULT '',
  horario_servicios text DEFAULT '',
  moneda text DEFAULT 'USD',
  zona_horaria text DEFAULT 'America/Bogota',
  color_primario text DEFAULT '#6366f1',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.configuracion_iglesia ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view config" ON public.configuracion_iglesia FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can update config" ON public.configuracion_iglesia FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can insert config" ON public.configuracion_iglesia FOR INSERT TO authenticated WITH CHECK (true);

-- Insert default row
INSERT INTO public.configuracion_iglesia (nombre_iglesia) VALUES ('Centro Mundial de Gloria');

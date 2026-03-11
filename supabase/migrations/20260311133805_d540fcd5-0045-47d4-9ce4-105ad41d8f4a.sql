
-- Procesos de crecimiento: define los pasos disponibles
CREATE TABLE public.procesos_crecimiento (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  orden integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Progreso de cada persona en los procesos
CREATE TABLE public.persona_procesos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  persona_id uuid NOT NULL REFERENCES public.personas(id) ON DELETE CASCADE,
  proceso_id uuid NOT NULL REFERENCES public.procesos_crecimiento(id) ON DELETE CASCADE,
  estado text NOT NULL DEFAULT 'No realizado',
  fecha_completado date,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(persona_id, proceso_id)
);

ALTER TABLE public.procesos_crecimiento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.persona_procesos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can manage procesos_crecimiento" ON public.procesos_crecimiento FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can manage persona_procesos" ON public.persona_procesos FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Insert default growth processes
INSERT INTO public.procesos_crecimiento (nombre, orden) VALUES
  ('Ingreso a la Iglesia', 1),
  ('Llamada de Consolidación 1', 2),
  ('Mensaje 1', 3),
  ('Llamada de Consolidación 2', 4),
  ('Mensaje 2', 5),
  ('Llamada de Consolidación 3', 6),
  ('Mensaje 3', 7),
  ('Mensaje 4', 8),
  ('Mensaje 5', 9),
  ('Mensaje 6', 10),
  ('Visita', 11),
  ('Consejería', 12),
  ('Fiesta de Bienvenida', 13),
  ('Nací para Triunfar Día 1', 14),
  ('Semana de Poder 1', 15),
  ('Una Nueva Vida y Un Nuevo Comienzo', 16),
  ('Retiro de Sanidad Interior y Liberación', 17),
  ('Bautismo', 18),
  ('Discipulado de Nuevos Creyentes', 19),
  ('Escuela de Evangelismo Sobrenatural', 20),
  ('Escuela de Líderes de Casa de Paz', 21),
  ('Retiro de Líderes de Casas de Paz', 22),
  ('Escuela de Mentores', 23),
  ('Retiro de Mentores', 24),
  ('Escuela del Ministerio Quíntuple', 25);

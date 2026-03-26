
CREATE TABLE public.planificaciones_grupo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grupo_id uuid REFERENCES public.grupos(id) ON DELETE CASCADE NOT NULL,
  red text,
  lider_nombre text NOT NULL,
  casa_de_paz text,
  evaluacion_equipo jsonb DEFAULT '{}',
  responsable_invitacion text,
  medios_invitacion text[] DEFAULT '{}',
  personas_invitadas integer DEFAULT 0,
  responsable_recordar text,
  medios_recordar text[] DEFAULT '{}',
  fecha_ayuno date,
  fecha_evangelizacion date,
  responsable_oracion text,
  responsable_adoracion text,
  responsable_dinamicas text,
  responsable_predicacion text,
  responsable_testimonios text,
  responsable_ayudas text,
  responsable_datos text,
  responsable_consolidacion text,
  responsable_seguimiento text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

ALTER TABLE public.planificaciones_grupo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can manage planificaciones" ON public.planificaciones_grupo
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

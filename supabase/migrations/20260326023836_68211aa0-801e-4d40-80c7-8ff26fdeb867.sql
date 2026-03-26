ALTER TABLE public.materias
  ADD COLUMN IF NOT EXISTS codigo text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS hab_calificaciones boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS hab_asistencia boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS hab_auto_matricula boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS asistencias_minimas integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS alerta_inasistencias boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS cantidad_inasistencias_alerta integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cupos integer DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS estado text NOT NULL DEFAULT 'En Curso';

-- Add tipo_certificado column for non-academic certificate types
ALTER TABLE public.certificados ADD COLUMN IF NOT EXISTS tipo_certificado text DEFAULT 'Curso';

-- Make curso_id and matricula_id nullable for non-academic certificates
ALTER TABLE public.certificados ALTER COLUMN curso_id DROP NOT NULL;
ALTER TABLE public.certificados ALTER COLUMN matricula_id DROP NOT NULL;

-- Add predicador and sede columns to servicios for reuniones functionality
ALTER TABLE public.servicios ADD COLUMN IF NOT EXISTS sede text DEFAULT 'Principal';
ALTER TABLE public.servicios ADD COLUMN IF NOT EXISTS habilitado_reserva boolean DEFAULT false;
ALTER TABLE public.servicios ADD COLUMN IF NOT EXISTS dia_reunion text;
ALTER TABLE public.servicios ADD COLUMN IF NOT EXISTS aforo integer;

-- Add demographic tracking columns to asistencia for reunion reports
ALTER TABLE public.asistencia ADD COLUMN IF NOT EXISTS clasificacion text;
ALTER TABLE public.asistencia ADD COLUMN IF NOT EXISTS es_nuevo boolean DEFAULT false;

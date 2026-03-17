
-- Fix sexo check constraint to allow 'Masculino'/'Femenino' instead of 'M'/'F'
ALTER TABLE public.personas DROP CONSTRAINT personas_sexo_check;
ALTER TABLE public.personas ADD CONSTRAINT personas_sexo_check CHECK (sexo = ANY (ARRAY['Masculino', 'Femenino', 'M', 'F']));

-- Add invitado_por column to personas
ALTER TABLE public.personas ADD COLUMN IF NOT EXISTS invitado_por text DEFAULT NULL;

-- Add seguimiento_por column to personas (text for name)
ALTER TABLE public.personas ADD COLUMN IF NOT EXISTS seguimiento_por text DEFAULT NULL;

-- Add tipo column to peticiones_oracion for categorization
ALTER TABLE public.peticiones_oracion ADD COLUMN IF NOT EXISTS tipo text DEFAULT NULL;

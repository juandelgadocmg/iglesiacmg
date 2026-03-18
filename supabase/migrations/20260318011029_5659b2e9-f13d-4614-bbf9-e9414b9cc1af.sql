
-- Add new columns to personas
ALTER TABLE public.personas ADD COLUMN IF NOT EXISTS tipo_documento text;
ALTER TABLE public.personas ADD COLUMN IF NOT EXISTS nacionalidad text;
ALTER TABLE public.personas ADD COLUMN IF NOT EXISTS whatsapp text;
ALTER TABLE public.personas ADD COLUMN IF NOT EXISTS vinculacion text;

-- Add new enum values to tipo_persona
ALTER TYPE public.tipo_persona ADD VALUE IF NOT EXISTS 'CDP';
ALTER TYPE public.tipo_persona ADD VALUE IF NOT EXISTS 'Iglesia Virtual';
ALTER TYPE public.tipo_persona ADD VALUE IF NOT EXISTS 'Estudiante Seminario';
ALTER TYPE public.tipo_persona ADD VALUE IF NOT EXISTS 'Discípulo';
ALTER TYPE public.tipo_persona ADD VALUE IF NOT EXISTS 'Maestro Seminario';
ALTER TYPE public.tipo_persona ADD VALUE IF NOT EXISTS 'Miembro No Activo';
ALTER TYPE public.tipo_persona ADD VALUE IF NOT EXISTS 'Líder Casa de Paz';
ALTER TYPE public.tipo_persona ADD VALUE IF NOT EXISTS 'Líder de Red';
ALTER TYPE public.tipo_persona ADD VALUE IF NOT EXISTS 'Mentor';
ALTER TYPE public.tipo_persona ADD VALUE IF NOT EXISTS 'Pastor Principal';


ALTER TABLE public.grupo_miembros ADD COLUMN IF NOT EXISTS rol text DEFAULT 'asistente';
ALTER TABLE public.reportes_grupos ADD COLUMN IF NOT EXISTS no_realizado boolean DEFAULT false;

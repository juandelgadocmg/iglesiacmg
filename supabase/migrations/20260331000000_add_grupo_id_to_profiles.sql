-- Agregar grupo_id a profiles para vincular lider_casa_paz / lider_red con su grupo
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS grupo_id UUID REFERENCES public.grupos(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.profiles.grupo_id IS 'Grupo asignado al usuario (usado para lider_casa_paz y lider_red)';

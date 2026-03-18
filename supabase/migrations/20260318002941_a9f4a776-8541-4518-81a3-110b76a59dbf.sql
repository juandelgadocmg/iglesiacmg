
ALTER TYPE public.tipo_grupo ADD VALUE IF NOT EXISTS 'Casas de paz';
ALTER TYPE public.tipo_grupo ADD VALUE IF NOT EXISTS 'Grupos encuentro';

ALTER TABLE public.grupos ADD COLUMN IF NOT EXISTS red text NULL;

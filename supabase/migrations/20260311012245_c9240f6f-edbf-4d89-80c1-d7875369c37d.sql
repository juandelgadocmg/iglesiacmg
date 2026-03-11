ALTER TABLE public.grupos 
  ADD COLUMN IF NOT EXISTS latitud double precision DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS longitud double precision DEFAULT NULL;
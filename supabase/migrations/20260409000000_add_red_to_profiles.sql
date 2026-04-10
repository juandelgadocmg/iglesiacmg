-- Agregar columna red a profiles para lider_red
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS red TEXT NULL;
COMMENT ON COLUMN public.profiles.red IS 'Red asignada al lider_red (ej: Nissi, Jireh, Adonai...)';

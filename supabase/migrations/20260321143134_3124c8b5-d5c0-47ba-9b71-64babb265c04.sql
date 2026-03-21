
ALTER TABLE public.items_calificables 
  ADD COLUMN es_calificable boolean NOT NULL DEFAULT true,
  ADD COLUMN visible_estudiante boolean NOT NULL DEFAULT true;

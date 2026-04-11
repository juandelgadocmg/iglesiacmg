-- Corregir inconsistencias entre tipo_persona y tipos_persona
-- Actualiza tipos_persona para que siempre refleje tipo_persona cuando hay inconsistencia

-- Caso 1: tipos_persona está vacío o no tiene el tipo actual → usar tipo_persona
UPDATE public.personas
SET tipos_persona = ARRAY[tipo_persona::text]
WHERE 
  (tipos_persona IS NULL OR tipos_persona = '{}')
  AND tipo_persona IS NOT NULL;

-- Caso 2: tipos_persona tiene ['Miembro'] pero tipo_persona es diferente → corregir
UPDATE public.personas
SET tipos_persona = ARRAY[tipo_persona::text]
WHERE 
  tipos_persona = ARRAY['Miembro'::text]
  AND tipo_persona != 'Miembro'
  AND tipo_persona IS NOT NULL;

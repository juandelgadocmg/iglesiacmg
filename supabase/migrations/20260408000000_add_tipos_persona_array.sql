-- Agregar columna tipos_persona como array de texto para permitir múltiples roles por persona
ALTER TABLE public.personas ADD COLUMN IF NOT EXISTS tipos_persona TEXT[] DEFAULT '{}';

-- Poblar tipos_persona con el valor actual de tipo_persona para todos los registros existentes
UPDATE public.personas
SET tipos_persona = ARRAY[tipo_persona::text]
WHERE tipos_persona = '{}' OR tipos_persona IS NULL;

COMMENT ON COLUMN public.personas.tipos_persona IS 'Array de tipos/roles de la persona (permite múltiples: Líder de Red, Maestro Seminario, etc.)';

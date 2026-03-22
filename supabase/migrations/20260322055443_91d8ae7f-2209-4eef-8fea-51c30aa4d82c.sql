ALTER TABLE public.personas ADD COLUMN IF NOT EXISTS qr_code text DEFAULT gen_random_uuid()::text;
UPDATE public.personas SET qr_code = gen_random_uuid()::text WHERE qr_code IS NULL;
ALTER TABLE public.personas ADD CONSTRAINT personas_qr_code_key UNIQUE (qr_code);
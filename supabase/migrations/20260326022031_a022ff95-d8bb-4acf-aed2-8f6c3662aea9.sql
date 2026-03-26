
-- Banners for the dashboard carousel
CREATE TABLE public.banners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  imagen_url TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'Activo',
  orden INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read banners"
  ON public.banners FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage banners"
  ON public.banners FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

-- Videos for the dashboard
CREATE TABLE public.videos_iglesia (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  youtube_url TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'Activo',
  orden INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.videos_iglesia ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read videos"
  ON public.videos_iglesia FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage videos"
  ON public.videos_iglesia FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

-- Tema de la semana + Señal en vivo in configuracion_iglesia
ALTER TABLE public.configuracion_iglesia
  ADD COLUMN IF NOT EXISTS tema_semana_titulo TEXT,
  ADD COLUMN IF NOT EXISTS tema_semana_descripcion TEXT,
  ADD COLUMN IF NOT EXISTS tema_semana_url TEXT,
  ADD COLUMN IF NOT EXISTS senal_en_vivo_url TEXT,
  ADD COLUMN IF NOT EXISTS senal_en_vivo_activa BOOLEAN DEFAULT false;

-- Storage bucket for banner images
INSERT INTO storage.buckets (id, name, public) VALUES ('banners', 'banners', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can read banners" ON storage.objects FOR SELECT USING (bucket_id = 'banners');
CREATE POLICY "Authenticated can upload banners" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'banners');
CREATE POLICY "Authenticated can delete banners" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'banners');

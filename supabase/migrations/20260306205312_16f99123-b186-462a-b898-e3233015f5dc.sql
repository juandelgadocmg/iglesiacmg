
-- Enum types
CREATE TYPE public.tipo_persona AS ENUM ('Miembro', 'Visitante', 'Líder', 'Servidor');
CREATE TYPE public.estado_iglesia AS ENUM ('Activo', 'Inactivo', 'En proceso');
CREATE TYPE public.tipo_grupo AS ENUM ('Células', 'Jóvenes', 'Mujeres', 'Hombres', 'Niños', 'Alabanza', 'Ujieres', 'Liderazgo', 'Discipulado');
CREATE TYPE public.tipo_servicio AS ENUM ('Culto general', 'Oración', 'Reunión de líderes', 'Escuela bíblica', 'Vigilia', 'Servicio especial');
CREATE TYPE public.tipo_finanza AS ENUM ('Ingreso', 'Gasto');
CREATE TYPE public.app_role AS ENUM ('admin', 'pastor', 'lider', 'secretaria', 'tesoreria', 'maestro', 'consulta');

-- Timestamp trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Personas table
CREATE TABLE public.personas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombres TEXT NOT NULL,
  apellidos TEXT NOT NULL,
  documento TEXT,
  fecha_nacimiento DATE,
  sexo TEXT CHECK (sexo IN ('M', 'F')),
  telefono TEXT,
  email TEXT,
  direccion TEXT,
  estado_civil TEXT,
  ocupacion TEXT,
  fecha_conversion DATE,
  fecha_bautismo DATE,
  fecha_ingreso DATE,
  estado_iglesia estado_iglesia NOT NULL DEFAULT 'Activo',
  tipo_persona tipo_persona NOT NULL DEFAULT 'Miembro',
  grupo_id UUID,
  ministerio TEXT,
  lider_responsable TEXT,
  observaciones TEXT,
  foto_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.personas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view personas" ON public.personas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert personas" ON public.personas FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update personas" ON public.personas FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete personas" ON public.personas FOR DELETE TO authenticated USING (true);

-- Grupos table
CREATE TABLE public.grupos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  tipo tipo_grupo NOT NULL,
  descripcion TEXT,
  lider_id UUID REFERENCES public.personas(id),
  ubicacion TEXT,
  dia_reunion TEXT,
  hora_reunion TEXT,
  estado TEXT NOT NULL DEFAULT 'Activo' CHECK (estado IN ('Activo', 'Inactivo')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.grupos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view grupos" ON public.grupos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert grupos" ON public.grupos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update grupos" ON public.grupos FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete grupos" ON public.grupos FOR DELETE TO authenticated USING (true);

-- FK personas -> grupos
ALTER TABLE public.personas ADD CONSTRAINT fk_personas_grupo FOREIGN KEY (grupo_id) REFERENCES public.grupos(id) ON DELETE SET NULL;

-- Grupo miembros
CREATE TABLE public.grupo_miembros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grupo_id UUID NOT NULL REFERENCES public.grupos(id) ON DELETE CASCADE,
  persona_id UUID NOT NULL REFERENCES public.personas(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(grupo_id, persona_id)
);
ALTER TABLE public.grupo_miembros ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can manage grupo_miembros" ON public.grupo_miembros FOR ALL TO authenticated USING (true);

-- Servicios table
CREATE TABLE public.servicios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  tipo tipo_servicio NOT NULL,
  fecha DATE NOT NULL,
  hora TEXT,
  lugar TEXT,
  predicador TEXT,
  descripcion TEXT,
  estado TEXT NOT NULL DEFAULT 'Programado' CHECK (estado IN ('Programado', 'Completado', 'Cancelado')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.servicios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view servicios" ON public.servicios FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert servicios" ON public.servicios FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update servicios" ON public.servicios FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete servicios" ON public.servicios FOR DELETE TO authenticated USING (true);

-- Asistencia table
CREATE TABLE public.asistencia (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  servicio_id UUID NOT NULL REFERENCES public.servicios(id) ON DELETE CASCADE,
  persona_id UUID NOT NULL REFERENCES public.personas(id) ON DELETE CASCADE,
  presente BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(servicio_id, persona_id)
);
ALTER TABLE public.asistencia ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can manage asistencia" ON public.asistencia FOR ALL TO authenticated USING (true);

-- Categorias financieras
CREATE TABLE public.categorias_financieras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  tipo tipo_finanza NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.categorias_financieras ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can manage categorias" ON public.categorias_financieras FOR ALL TO authenticated USING (true);

-- Finanzas table
CREATE TABLE public.finanzas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo tipo_finanza NOT NULL,
  categoria_id UUID REFERENCES public.categorias_financieras(id),
  categoria_nombre TEXT,
  descripcion TEXT,
  monto NUMERIC(12,2) NOT NULL,
  fecha DATE NOT NULL,
  metodo_pago TEXT,
  persona_id UUID REFERENCES public.personas(id),
  comprobante TEXT,
  registrado_por UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.finanzas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view finanzas" ON public.finanzas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert finanzas" ON public.finanzas FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update finanzas" ON public.finanzas FOR UPDATE TO authenticated USING (true);

-- Eventos table
CREATE TABLE public.eventos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  tipo TEXT,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE,
  lugar TEXT,
  cupos INTEGER,
  descripcion TEXT,
  estado TEXT NOT NULL DEFAULT 'Próximo' CHECK (estado IN ('Próximo', 'En curso', 'Finalizado', 'Cancelado')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.eventos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view eventos" ON public.eventos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert eventos" ON public.eventos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update eventos" ON public.eventos FOR UPDATE TO authenticated USING (true);

-- Inscripciones table
CREATE TABLE public.inscripciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id UUID NOT NULL REFERENCES public.eventos(id) ON DELETE CASCADE,
  persona_id UUID NOT NULL REFERENCES public.personas(id) ON DELETE CASCADE,
  estado_pago TEXT DEFAULT 'Pendiente' CHECK (estado_pago IN ('Pendiente', 'Pagado', 'Cancelado')),
  confirmado BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(evento_id, persona_id)
);
ALTER TABLE public.inscripciones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can manage inscripciones" ON public.inscripciones FOR ALL TO authenticated USING (true);

-- Donaciones table
CREATE TABLE public.donaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  persona_id UUID REFERENCES public.personas(id),
  monto NUMERIC(12,2) NOT NULL,
  tipo TEXT DEFAULT 'Única' CHECK (tipo IN ('Única', 'Recurrente')),
  metodo_pago TEXT,
  estado TEXT DEFAULT 'Completada' CHECK (estado IN ('Completada', 'Pendiente', 'Cancelada')),
  descripcion TEXT,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.donaciones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can manage donaciones" ON public.donaciones FOR ALL TO authenticated USING (true);

-- Update triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_personas_updated_at BEFORE UPDATE ON public.personas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_grupos_updated_at BEFORE UPDATE ON public.grupos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_servicios_updated_at BEFORE UPDATE ON public.servicios FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_finanzas_updated_at BEFORE UPDATE ON public.finanzas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_eventos_updated_at BEFORE UPDATE ON public.eventos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

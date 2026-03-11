import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// ============ ESCUELAS (cursos table used as top-level schools) ============
export function useEscuelas() {
  return useQuery({
    queryKey: ["escuelas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cursos")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateEscuela() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (escuela: { nombre: string; descripcion?: string }) => {
      const { data, error } = await supabase.from("cursos").insert({
        nombre: escuela.nombre,
        descripcion: escuela.descripcion,
        estado: "Activo",
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["escuelas"] }),
  });
}

export function useUpdateEscuela() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; nombre?: string; descripcion?: string; estado?: string }) => {
      const { error } = await supabase.from("cursos").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["escuelas"] }),
  });
}

export function useDeleteEscuela() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("cursos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["escuelas"] }),
  });
}

// ============ PERIODOS ============
export function usePeriodos(escuelaId: string | null) {
  return useQuery({
    queryKey: ["periodos", escuelaId],
    enabled: !!escuelaId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("periodos_academicos")
        .select("*")
        .eq("escuela_id", escuelaId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useAllPeriodos() {
  return useQuery({
    queryKey: ["periodos-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("periodos_academicos")
        .select("*, cursos(nombre)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreatePeriodo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (periodo: {
      escuela_id: string;
      nombre: string;
      fecha_inicio?: string;
      fecha_fin?: string;
      fecha_matricula_inicio?: string;
      fecha_matricula_fin?: string;
      estado?: string;
    }) => {
      const { data, error } = await supabase
        .from("periodos_academicos")
        .insert(periodo)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["periodos"] });
      qc.invalidateQueries({ queryKey: ["periodos-all"] });
    },
  });
}

export function useUpdatePeriodo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: any }) => {
      const { error } = await supabase.from("periodos_academicos").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["periodos"] });
      qc.invalidateQueries({ queryKey: ["periodos-all"] });
    },
  });
}

export function useDeletePeriodo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("periodos_academicos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["periodos"] });
      qc.invalidateQueries({ queryKey: ["periodos-all"] });
    },
  });
}

// ============ MATERIAS ============
export function useMaterias(periodoId: string | null) {
  return useQuery({
    queryKey: ["materias", periodoId],
    enabled: !!periodoId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("materias")
        .select("*")
        .eq("periodo_id", periodoId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateMateria() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (materia: {
      periodo_id: string;
      nombre: string;
      descripcion?: string;
      horario?: string;
      maestro_nombre?: string;
      aula?: string;
    }) => {
      const { data, error } = await supabase.from("materias").insert(materia).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["materias"] }),
  });
}

export function useDeleteMateria() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("materias").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["materias"] }),
  });
}

// ============ MATRICULAS ============
export function useMatriculas(periodoId: string | null) {
  return useQuery({
    queryKey: ["matriculas", periodoId],
    enabled: !!periodoId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("matriculas")
        .select("*, personas(nombres, apellidos, foto_url), materias(nombre)")
        .eq("periodo_id", periodoId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useAllMatriculas() {
  return useQuery({
    queryKey: ["matriculas-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("matriculas")
        .select("*, personas(nombres, apellidos, foto_url), cursos(nombre)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateMatricula() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (matricula: {
      curso_id: string;
      persona_id: string;
      periodo_id?: string;
      materia_id?: string;
    }) => {
      const { data, error } = await supabase.from("matriculas").insert(matricula).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["matriculas"] });
      qc.invalidateQueries({ queryKey: ["matriculas-all"] });
    },
  });
}

export function useUpdateMatricula() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; estado?: string; nota_final?: number }) => {
      const { error } = await supabase.from("matriculas").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["matriculas"] });
      qc.invalidateQueries({ queryKey: ["matriculas-all"] });
    },
  });
}

// ============ CERTIFICADOS ============
export function useCertificados() {
  return useQuery({
    queryKey: ["certificados"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("certificados")
        .select("*, personas(nombres, apellidos), cursos(nombre)")
        .order("fecha_emision", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateCertificado() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (cert: { matricula_id: string; persona_id: string; curso_id: string }) => {
      const { data, error } = await supabase.from("certificados").insert(cert).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["certificados"] }),
  });
}

// Legacy aliases
export const useCursos = useEscuelas;

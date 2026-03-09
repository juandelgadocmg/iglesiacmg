import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// ============ CURSOS ============
export function useCursos() {
  return useQuery({
    queryKey: ["cursos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cursos")
        .select("*, matriculas(count)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateCurso() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (curso: { nombre: string; descripcion?: string; instructor?: string; duracion_semanas?: number; fecha_inicio?: string; fecha_fin?: string; cupos?: number }) => {
      const { data, error } = await supabase.from("cursos").insert(curso).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cursos"] }),
  });
}

export function useUpdateCurso() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; estado?: string; [key: string]: any }) => {
      const { error } = await supabase.from("cursos").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cursos"] }),
  });
}

// ============ MATRICULAS ============
export function useMatriculas(cursoId: string | null) {
  return useQuery({
    queryKey: ["matriculas", cursoId],
    enabled: !!cursoId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("matriculas")
        .select("*, personas(nombres, apellidos), cursos(nombre)")
        .eq("curso_id", cursoId!)
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
        .select("*, personas(nombres, apellidos), cursos(nombre)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateMatricula() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (matricula: { curso_id: string; persona_id: string }) => {
      const { data, error } = await supabase.from("matriculas").insert(matricula).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["matriculas"] });
      qc.invalidateQueries({ queryKey: ["cursos"] });
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
    onSuccess: () => qc.invalidateQueries({ queryKey: ["matriculas"] }),
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

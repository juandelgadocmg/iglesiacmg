import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ReporteGrupo {
  id: string;
  grupo_id: string;
  lider_id: string | null;
  fecha: string;
  mensaje: string;
  observaciones: string | null;
  estado: string;
  ofrenda_casa_paz: number;
  total_reportado: number;
  ingreso_verificado_sobre: number | null;
  verificado_por: string | null;
  fecha_verificacion: string | null;
  created_at: string;
  updated_at: string;
  grupos?: { nombre: string; tipo: string } | null;
}

export function useReportesGrupos() {
  return useQuery({
    queryKey: ["reportes_grupos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reportes_grupos" as any)
        .select("*, grupos(nombre, tipo)")
        .order("fecha", { ascending: false });
      if (error) throw error;
      return data as unknown as ReporteGrupo[];
    },
  });
}

export function useCreateReporteGrupo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (reporte: {
      grupo_id: string;
      fecha: string;
      mensaje: string;
      observaciones?: string;
      ofrenda_casa_paz?: number;
      total_reportado?: number;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("reportes_grupos" as any)
        .insert({ ...reporte, lider_id: user?.id } as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reportes_grupos"] }),
  });
}

export function useUpdateReporteGrupo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: any }) => {
      const { error } = await supabase
        .from("reportes_grupos" as any)
        .update(updates as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reportes_grupos"] }),
  });
}

export function useDeleteReporteGrupo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("reportes_grupos" as any)
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reportes_grupos"] }),
  });
}

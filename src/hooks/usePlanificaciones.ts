import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function usePlanificaciones(grupoId?: string) {
  return useQuery({
    queryKey: ["planificaciones", grupoId],
    queryFn: async () => {
      let q = supabase.from("planificaciones_grupo").select("*").order("created_at", { ascending: false });
      if (grupoId) q = q.eq("grupo_id", grupoId);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });
}

export function useCreatePlanificacion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from("planificaciones_grupo").insert({ ...values, created_by: user?.id });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["planificaciones"] }),
  });
}

export function useDeletePlanificacion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("planificaciones_grupo").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["planificaciones"] }),
  });
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useConfiguracion() {
  return useQuery({
    queryKey: ["configuracion"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("configuracion_iglesia")
        .select("*")
        .limit(1)
        .single();
      if (error) throw error;
      return data;
    },
  });
}

export function useUpdateConfiguracion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (updates: Record<string, any>) => {
      // Get the single row id first
      const { data: existing } = await supabase
        .from("configuracion_iglesia")
        .select("id")
        .limit(1)
        .single();
      if (!existing) throw new Error("No config row found");
      const { error } = await supabase
        .from("configuracion_iglesia")
        .update(updates)
        .eq("id", existing.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["configuracion"] }),
  });
}

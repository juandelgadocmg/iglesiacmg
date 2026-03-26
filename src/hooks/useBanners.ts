import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useBanners() {
  return useQuery({
    queryKey: ["banners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("banners")
        .select("*")
        .order("orden", { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}

export function useActiveBanners() {
  return useQuery({
    queryKey: ["banners", "active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("banners")
        .select("*")
        .eq("estado", "Activo")
        .order("orden", { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateBanner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (banner: { titulo: string; imagen_url: string; orden?: number }) => {
      const { error } = await supabase.from("banners").insert(banner);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["banners"] }),
  });
}

export function useDeleteBanner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("banners").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["banners"] }),
  });
}

export function useUpdateBannerStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, estado }: { id: string; estado: string }) => {
      const { error } = await supabase.from("banners").update({ estado }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["banners"] }),
  });
}

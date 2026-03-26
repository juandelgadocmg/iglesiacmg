import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useVideosIglesia() {
  return useQuery({
    queryKey: ["videos_iglesia"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("videos_iglesia")
        .select("*")
        .order("orden", { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}

export function useActiveVideos() {
  return useQuery({
    queryKey: ["videos_iglesia", "active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("videos_iglesia")
        .select("*")
        .eq("estado", "Activo")
        .order("orden", { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateVideo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (video: { titulo: string; youtube_url: string; orden?: number }) => {
      const { error } = await supabase.from("videos_iglesia").insert(video);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["videos_iglesia"] }),
  });
}

export function useDeleteVideo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("videos_iglesia").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["videos_iglesia"] }),
  });
}

export function useUpdateVideoStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, estado }: { id: string; estado: string }) => {
      const { error } = await supabase.from("videos_iglesia").update({ estado }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["videos_iglesia"] }),
  });
}

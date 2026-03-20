import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface GrupoMiembro {
  id: string;
  grupo_id: string;
  persona_id: string;
  rol: string;
  created_at: string;
  persona?: {
    id: string;
    nombres: string;
    apellidos: string;
    foto_url: string | null;
    tipo_persona: string;
    telefono: string | null;
    email: string | null;
  };
}

export function useGrupoMiembros(grupoId: string | null) {
  return useQuery({
    queryKey: ["grupo_miembros_detail", grupoId],
    enabled: !!grupoId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("grupo_miembros")
        .select("*, personas:persona_id(id, nombres, apellidos, foto_url, tipo_persona, telefono, email)")
        .eq("grupo_id", grupoId!) as any;
      if (error) throw error;
      return (data || []).map((d: any) => ({
        ...d,
        persona: d.personas,
      })) as GrupoMiembro[];
    },
  });
}

export function useAddGrupoMiembro() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ grupo_id, persona_id, rol }: { grupo_id: string; persona_id: string; rol?: string }) => {
      const { data, error } = await supabase
        .from("grupo_miembros")
        .insert({ grupo_id, persona_id, rol: rol || "asistente" } as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["grupo_miembros_detail", vars.grupo_id] });
      qc.invalidateQueries({ queryKey: ["grupos"] });
    },
  });
}

export function useUpdateMiembroRol() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, grupo_id, rol }: { id: string; grupo_id: string; rol: string }) => {
      const { error } = await supabase
        .from("grupo_miembros")
        .update({ rol } as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["grupo_miembros_detail", vars.grupo_id] });
    },
  });
}

export function useRemoveGrupoMiembro() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, grupo_id }: { id: string; grupo_id: string }) => {
      const { error } = await supabase
        .from("grupo_miembros")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["grupo_miembros_detail", vars.grupo_id] });
      qc.invalidateQueries({ queryKey: ["grupos"] });
    },
  });
}

export function useSearchPersonas(query: string) {
  return useQuery({
    queryKey: ["search_personas", query],
    enabled: query.length >= 2,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("personas")
        .select("id, nombres, apellidos, foto_url, tipo_persona")
        .or(`nombres.ilike.%${query}%,apellidos.ilike.%${query}%,documento.ilike.%${query}%`)
        .limit(10);
      if (error) throw error;
      return data;
    },
  });
}

export const ROLES_GRUPO = [
  { value: "lider", label: "Líder" },
  { value: "sublider", label: "Sub Líder" },
  { value: "anfitrion", label: "Anfitrión" },
  { value: "colaborador", label: "Colaborador" },
  { value: "asistente", label: "Asistente" },
] as const;

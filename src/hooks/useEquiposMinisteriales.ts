import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface EquipoMinisterial {
  id: string;
  nombre: string;
  tipo: string;
  red: string | null;
  lider_id: string | null;
  lider2_id: string | null;
  parent_id: string | null;
  descripcion: string | null;
  estado: string;
  created_at: string;
  updated_at: string;
  lider?: { nombres: string; apellidos: string; foto_url: string | null } | null;
  lider2?: { nombres: string; apellidos: string; foto_url: string | null } | null;
  children?: EquipoMinisterial[];
}

export function useEquiposMinisteriales() {
  return useQuery({
    queryKey: ["equipos_ministeriales"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("equipos_ministeriales" as any)
        .select("*, personas:lider_id(nombres, apellidos, foto_url), lider2:lider2_id(nombres, apellidos, foto_url)")
        .order("created_at", { ascending: true }) as any;
      if (error) throw error;
      return (data || []).map((d: any) => ({
        ...d,
        lider: d.personas || null,
        lider2: d.lider2 || null,
      })) as EquipoMinisterial[];
    },
  });
}

export function useCreateEquipo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      nombre: string;
      tipo: string;
      red?: string;
      lider_id?: string;
      parent_id?: string;
      descripcion?: string;
    }) => {
      const { data, error } = await supabase
        .from("equipos_ministeriales" as any)
        .insert(payload as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["equipos_ministeriales"] }),
  });
}

export function useUpdateEquipo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: any }) => {
      const { error } = await supabase
        .from("equipos_ministeriales" as any)
        .update(updates as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["equipos_ministeriales"] }),
  });
}

export function useDeleteEquipo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("equipos_ministeriales" as any)
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["equipos_ministeriales"] }),
  });
}

// Build tree from flat list
export function buildHierarchyTree(items: EquipoMinisterial[]): EquipoMinisterial[] {
  const map = new Map<string, EquipoMinisterial>();
  const roots: EquipoMinisterial[] = [];

  items.forEach(item => map.set(item.id, { ...item, children: [] }));

  map.forEach(item => {
    if (item.parent_id && map.has(item.parent_id)) {
      map.get(item.parent_id)!.children!.push(item);
    } else {
      roots.push(item);
    }
  });

  return roots;
}

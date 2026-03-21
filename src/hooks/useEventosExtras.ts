import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// ============ EVENTO CATEGORIAS ============
export function useEventoCategorias(eventoId: string | null) {
  return useQuery({
    queryKey: ["evento-categorias", eventoId],
    enabled: !!eventoId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("evento_categorias")
        .select("*")
        .eq("evento_id", eventoId!)
        .order("created_at");
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateEventoCategoria() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (cat: { evento_id: string; nombre: string; aforo?: number }) => {
      const { data, error } = await supabase.from("evento_categorias").insert(cat).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["evento-categorias"] }),
  });
}

export function useDeleteEventoCategoria() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("evento_categorias").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["evento-categorias"] }),
  });
}

// ============ EVENTO ENCARGADOS ============
export function useEventoEncargados(eventoId: string | null) {
  return useQuery({
    queryKey: ["evento-encargados", eventoId],
    enabled: !!eventoId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("evento_encargados")
        .select("*, personas(nombres, apellidos, foto_url)")
        .eq("evento_id", eventoId!)
        .order("created_at");
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateEventoEncargado() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (enc: { evento_id: string; persona_id: string; rol?: string }) => {
      const { data, error } = await supabase.from("evento_encargados").insert(enc).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["evento-encargados"] }),
  });
}

export function useDeleteEventoEncargado() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("evento_encargados").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["evento-encargados"] }),
  });
}

// ============ EVENTO SERVIDORES ============
export function useEventoServidores(eventoId: string | null) {
  return useQuery({
    queryKey: ["evento-servidores", eventoId],
    enabled: !!eventoId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("evento_servidores")
        .select("*, personas(nombres, apellidos, foto_url)")
        .eq("evento_id", eventoId!)
        .order("created_at");
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateEventoServidor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (srv: { evento_id: string; persona_id: string; clasificacion?: string }) => {
      const { data, error } = await supabase.from("evento_servidores").insert(srv).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["evento-servidores"] }),
  });
}

export function useDeleteEventoServidor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("evento_servidores").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["evento-servidores"] }),
  });
}

// ============ CATEGORIAS FINANCIERAS CRUD ============
export function useCategoriasFinancieras() {
  return useQuery({
    queryKey: ["categorias-financieras"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categorias_financieras")
        .select("*")
        .order("nombre");
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateCategoriaFinanciera() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (cat: { nombre: string; tipo: "Ingreso" | "Gasto" }) => {
      const { data, error } = await supabase.from("categorias_financieras").insert(cat).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categorias-financieras"] }),
  });
}

export function useUpdateCategoriaFinanciera() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; nombre?: string; tipo?: "Ingreso" | "Gasto" }) => {
      const { error } = await supabase.from("categorias_financieras").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categorias-financieras"] }),
  });
}

export function useDeleteCategoriaFinanciera() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categorias_financieras").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categorias-financieras"] }),
  });
}

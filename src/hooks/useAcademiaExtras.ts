import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// ============ CONCEPTOS DE PAGO ============
export function useConceptosPago(cursoId: string | null) {
  return useQuery({
    queryKey: ["conceptos-pago", cursoId],
    enabled: !!cursoId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("conceptos_pago")
        .select("*")
        .eq("curso_id", cursoId!)
        .order("created_at");
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateConceptoPago() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (concepto: { curso_id: string; nombre: string; monto: number }) => {
      const { data, error } = await supabase.from("conceptos_pago").insert(concepto).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["conceptos-pago"] }),
  });
}

export function useDeleteConceptoPago() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("conceptos_pago").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["conceptos-pago"] }),
  });
}

// ============ PAGOS MATRICULA ============
export function usePagosMatricula(matriculaId: string | null) {
  return useQuery({
    queryKey: ["pagos-matricula", matriculaId],
    enabled: !!matriculaId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pagos_matricula")
        .select("*, conceptos_pago(nombre, monto)")
        .eq("matricula_id", matriculaId!)
        .order("created_at");
      if (error) throw error;
      return data;
    },
  });
}

export function useCreatePagosForMatricula() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ matriculaId, conceptoIds }: { matriculaId: string; conceptoIds: string[] }) => {
      const records = conceptoIds.map(id => ({
        matricula_id: matriculaId,
        concepto_pago_id: id,
        estado: "Pendiente" as string,
      }));
      const { error } = await supabase.from("pagos_matricula").insert(records);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pagos-matricula"] }),
  });
}

export function useUpdatePagoMatricula() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, estado, fecha_pago, monto_pagado }: { id: string; estado: string; fecha_pago?: string; monto_pagado?: number }) => {
      const updates: any = { estado };
      if (fecha_pago) updates.fecha_pago = fecha_pago;
      if (monto_pagado !== undefined) updates.monto_pagado = monto_pagado;
      const { error } = await supabase.from("pagos_matricula").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pagos-matricula"] });
      qc.invalidateQueries({ queryKey: ["pagos-escuela"] });
    },
  });
}

// ============ ALL PAGOS BY SCHOOL (for export & dashboard) ============
export function usePagosEscuela(escuelaId: string | null) {
  return useQuery({
    queryKey: ["pagos-escuela", escuelaId],
    enabled: !!escuelaId,
    queryFn: async () => {
      // Get all matriculas for this school
      const { data: matriculas, error: mErr } = await supabase
        .from("matriculas")
        .select("id, persona_id, estado, personas(nombres, apellidos)")
        .eq("curso_id", escuelaId!);
      if (mErr) throw mErr;
      if (!matriculas?.length) return [];

      const matriculaIds = matriculas.map((m: any) => m.id);
      const { data: pagos, error: pErr } = await supabase
        .from("pagos_matricula")
        .select("*, conceptos_pago(nombre, monto)")
        .in("matricula_id", matriculaIds);
      if (pErr) throw pErr;

      // Merge persona info into each pago
      const matriculaMap = new Map(matriculas.map((m: any) => [m.id, m]));
      return (pagos || []).map((p: any) => ({
        ...p,
        matricula: matriculaMap.get(p.matricula_id),
      }));
    },
  });
}

// ============ RECURSOS ACADEMICOS ============
export function useRecursos(materiaId: string | null) {
  return useQuery({
    queryKey: ["recursos-academicos", materiaId],
    enabled: !!materiaId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recursos_academicos")
        .select("*, personas(nombres, apellidos)")
        .eq("materia_id", materiaId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useAllRecursos() {
  return useQuery({
    queryKey: ["recursos-academicos-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recursos_academicos")
        .select("*, personas(nombres, apellidos), materias(nombre)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateRecurso() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (recurso: {
      materia_id: string;
      maestro_id?: string;
      titulo: string;
      descripcion?: string;
      tipo: string;
      url?: string;
      archivo_url?: string;
      archivo_nombre?: string;
    }) => {
      const { data, error } = await supabase.from("recursos_academicos").insert(recurso).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["recursos-academicos"] });
      qc.invalidateQueries({ queryKey: ["recursos-academicos-all"] });
    },
  });
}

export function useDeleteRecurso() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("recursos_academicos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["recursos-academicos"] });
      qc.invalidateQueries({ queryKey: ["recursos-academicos-all"] });
    },
  });
}

// ============ HOMOLOGACIONES ============
export function useHomologaciones(personaId?: string | null) {
  return useQuery({
    queryKey: ["homologaciones", personaId],
    queryFn: async () => {
      let q = supabase
        .from("homologaciones")
        .select("*, personas(nombres, apellidos), materias(nombre)")
        .order("created_at", { ascending: false });
      if (personaId) q = q.eq("persona_id", personaId);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateHomologacion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (h: {
      persona_id: string;
      materia_id?: string;
      materia_nombre: string;
      institucion_origen: string;
      calificacion_obtenida?: number;
      observaciones?: string;
      fecha_homologacion?: string;
    }) => {
      const { data, error } = await supabase.from("homologaciones").insert(h).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["homologaciones"] }),
  });
}

export function useDeleteHomologacion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("homologaciones").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["homologaciones"] }),
  });
}

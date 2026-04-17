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
  asistencia_count?: { presentes: number; ausentes: number; nuevos: number };
}

export interface ReporteAsistenciaItem {
  id: string;
  reporte_id: string;
  persona_id: string;
  presente: boolean;
  es_nuevo: boolean;
  motivo_ausencia: string | null;
  persona?: { nombres: string; apellidos: string; foto_url: string | null; tipo_persona: string };
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

      const reportes = data as unknown as ReporteGrupo[];

      // Fetch attendance counts for all reports
      const reporteIds = reportes.map((r) => r.id);
      if (reporteIds.length > 0) {
        const { data: asistencia } = await supabase
          .from("reporte_asistencia" as any)
          .select("reporte_id, presente, es_nuevo")
          .in("reporte_id", reporteIds) as any;

        const countMap: Record<string, { presentes: number; ausentes: number; nuevos: number }> = {};
        (asistencia || []).forEach((a: any) => {
          if (!countMap[a.reporte_id]) countMap[a.reporte_id] = { presentes: 0, ausentes: 0, nuevos: 0 };
          if (a.presente) countMap[a.reporte_id].presentes++;
          else countMap[a.reporte_id].ausentes++;
          if (a.es_nuevo) countMap[a.reporte_id].nuevos++;
        });

        reportes.forEach((r) => {
          r.asistencia_count = countMap[r.id] || { presentes: 0, ausentes: 0, nuevos: 0 };
        });
      }

      return reportes;
    },
  });
}

export function useReporteAsistencia(reporteId: string | null) {
  return useQuery({
    queryKey: ["reporte_asistencia", reporteId],
    enabled: !!reporteId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reporte_asistencia" as any)
        .select("*, personas:persona_id(nombres, apellidos, foto_url, tipo_persona)")
        .eq("reporte_id", reporteId!) as any;
      if (error) throw error;
      return (data || []).map((d: any) => ({
        ...d,
        persona: d.personas,
      })) as ReporteAsistenciaItem[];
    },
  });
}

export function useGrupoMiembrosForReport(grupoId: string | null) {
  return useQuery({
    queryKey: ["grupo_miembros_report", grupoId],
    enabled: !!grupoId,
    queryFn: async () => {
      // Step 1: get persona_ids from grupo_miembros
      const { data: membersData, error: membersError } = await supabase
        .from("grupo_miembros" as any)
        .select("persona_id, rol")
        .eq("grupo_id", grupoId!);

      if (membersError) throw membersError;
      if (!membersData || membersData.length === 0) return [];

      const personaIds = (membersData as any[]).map((m: any) => m.persona_id).filter(Boolean);
      if (personaIds.length === 0) return [];

      // Step 2: fetch personas separately to avoid join issues
      const { data: personasData, error: personasError } = await supabase
        .from("personas")
        .select("id, nombres, apellidos, foto_url, tipo_persona")
        .in("id", personaIds);

      if (personasError) throw personasError;

      return (personasData || []) as Array<{
        id: string; nombres: string; apellidos: string; foto_url: string | null; tipo_persona: string;
      }>;
    },
  });
}

export function useCreateReporteGrupo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      grupo_id: string;
      fecha: string;
      mensaje: string;
      observaciones?: string;
      ofrenda_casa_paz?: number;
      total_reportado?: number;
      no_realizado?: boolean;
      asistencia: Array<{ persona_id: string; presente: boolean; es_nuevo: boolean; motivo_ausencia?: string }>;
    }) => {
      const { asistencia, ...reporte } = payload;
      const { data: { user } } = await supabase.auth.getUser();
      
      // Create report
      const { data, error } = await supabase
        .from("reportes_grupos" as any)
        .insert({ ...reporte, lider_id: user?.id, estado: reporte.no_realizado ? "No Verificado" : "No Verificado" } as any)
        .select()
        .single();
      if (error) throw error;

      // Insert attendance records
      if (asistencia.length > 0) {
        const records = asistencia.map((a) => ({
          reporte_id: (data as any).id,
          persona_id: a.persona_id,
          presente: a.presente,
          es_nuevo: a.es_nuevo,
          motivo_ausencia: a.motivo_ausencia || null,
        }));
        const { error: aErr } = await supabase
          .from("reporte_asistencia" as any)
          .insert(records as any);
        if (aErr) throw aErr;
      }

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

import { useState, useMemo } from "react";
import * as XLSX from "xlsx";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Download, FileSpreadsheet, Loader2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

const MESES = [
  { value: "1", label: "Enero" }, { value: "2", label: "Febrero" },
  { value: "3", label: "Marzo" }, { value: "4", label: "Abril" },
  { value: "5", label: "Mayo" }, { value: "6", label: "Junio" },
  { value: "7", label: "Julio" }, { value: "8", label: "Agosto" },
  { value: "9", label: "Septiembre" }, { value: "10", label: "Octubre" },
  { value: "11", label: "Noviembre" }, { value: "12", label: "Diciembre" },
];

const PROCESOS = [
  "Ingreso a la Iglesia", "Llamada de Consolidación 1", "Mensaje 1",
  "Llamada de Consolidación 2", "Mensaje 2", "Llamada de Consolidación 3",
  "Mensaje 3", "Mensaje 4", "Mensaje 5", "Mensaje 6", "Visita",
  "Consejería", "Fiesta de Bienvenida", "Nací para Triunfar Día 1",
  "Semana de Poder 1", "Una Nueva Vida y Un Nuevo Comienzo",
  "Retiro de Sanidad Interior y Liberación", "Bautismo",
  "Discipulado de Nuevos Creyentes", "Escuela de Evangelismo Sobrenatural",
  "Escuela de Líderes de Casa de Paz", "Retiro de Líderes de Casas de Paz",
  "Escuela de Mentores", "Retiro de Mentores", "Escuela del Ministerio Quíntuple",
];

type FilterType = "mes" | "rango";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export default function ExportConsolidacionDialog({ open, onOpenChange }: Props) {
  const currentYear = new Date().getFullYear();
  const currentMonth = String(new Date().getMonth() + 1);

  const [filterType, setFilterType] = useState<FilterType>("mes");
  const [year, setYear] = useState(String(currentYear));
  const [month, setMonth] = useState(currentMonth);
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [previewCount, setPreviewCount] = useState<number | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [loadingExport, setLoadingExport] = useState(false);

  const years = useMemo(() => {
    const result = [];
    for (let y = currentYear; y >= 2020; y--) result.push(String(y));
    return result;
  }, [currentYear]);

  const filterLabel = useMemo(() => {
    if (filterType === "mes") {
      const m = MESES.find(m => m.value === month);
      return `${m?.label || ""} ${year}`;
    }
    if (fechaDesde && fechaHasta) return `${fechaDesde} al ${fechaHasta}`;
    return "";
  }, [filterType, year, month, fechaDesde, fechaHasta]);

  const getDateRange = () => {
    if (filterType === "mes") {
      const m = parseInt(month);
      const y = parseInt(year);
      const from = new Date(y, m - 1, 1);
      const to = new Date(y, m, 0);
      return {
        from: format(from, "yyyy-MM-dd"),
        to: format(to, "yyyy-MM-dd"),
      };
    }
    return { from: fechaDesde, to: fechaHasta };
  };

  const handlePreview = async () => {
    const { from, to } = getDateRange();
    if (!from || !to) return;
    setLoadingPreview(true);
    try {
      const { count } = await supabase
        .from("personas")
        .select("*", { count: "exact", head: true })
        .gte("created_at", `${from}T00:00:00`)
        .lte("created_at", `${to}T23:59:59`);
      setPreviewCount(count || 0);
    } catch {
      toast.error("Error al cargar vista previa");
    } finally {
      setLoadingPreview(false);
    }
  };

  // Auto preview when filter changes
  useMemo(() => {
    setPreviewCount(null);
  }, [filterType, year, month, fechaDesde, fechaHasta]);

  const handleExport = async () => {
    const { from, to } = getDateRange();
    if (!from || !to) { toast.error("Selecciona las fechas"); return; }
    setLoadingExport(true);
    try {
      // 1. Fetch personas in range
      const { data: personas, error: pErr } = await supabase
        .from("personas")
        .select(`
          id, nombres, apellidos, telefono, whatsapp, email, documento,
          tipo_documento, tipo_persona, estado_iglesia, grupo_id, created_at,
          fecha_nacimiento, sexo, barrio, direccion, nacionalidad,
          estado_civil, ocupacion, vinculacion, ministerio,
          invitado_por, seguimiento_por,
          grupos:grupo_id(nombre)
        `)
        .gte("created_at", `${from}T00:00:00`)
        .lte("created_at", `${to}T23:59:59`)
        .order("created_at", { ascending: true });

      if (pErr) throw pErr;
      if (!personas || personas.length === 0) {
        toast.warning("No hay personas en ese rango de fechas");
        setLoadingExport(false);
        return;
      }

      const personaIds = personas.map(p => p.id);

      // 2. Fetch all procesos definitions
      const { data: procesosData } = await supabase
        .from("procesos_crecimiento")
        .select("id, nombre, orden")
        .order("orden", { ascending: true });

      // 3. Fetch persona_procesos for these people
      const { data: ppData } = await supabase
        .from("persona_procesos")
        .select("persona_id, proceso_id, estado, fecha_completado")
        .in("persona_id", personaIds);

      // Build lookup: personaId -> procesoId -> record
      const ppMap = new Map<string, Map<string, any>>();
      (ppData || []).forEach((pp: any) => {
        if (!ppMap.has(pp.persona_id)) ppMap.set(pp.persona_id, new Map());
        ppMap.get(pp.persona_id)!.set(pp.proceso_id, pp);
      });

      // Build procesos name->id map
      const procesosByNombre = new Map<string, string>();
      (procesosData || []).forEach((p: any) => procesosByNombre.set(p.nombre, p.id));

      // 4. Build Excel rows
      const headers = [
        "N°", "Fecha Ingreso", "Nombres", "Apellidos", "Teléfono", "WhatsApp",
        "Email", "Tipo Documento", "Documento", "Tipo", "Estado Iglesia",
        "Grupo", "Fecha Nacimiento", "Sexo", "Barrio", "Dirección",
        "Nacionalidad", "Estado Civil", "Ocupación", "Vinculación", "Ministerio",
        "¿Quién lo invitó?", "Seguimiento por",
        ...PROCESOS,
      ];

      const rows = personas.map((p: any, idx: number) => {
        const personaProcesos = ppMap.get(p.id) || new Map();

        const procesosCols = PROCESOS.map(nombre => {
          const procesoId = procesosByNombre.get(nombre);
          if (!procesoId) return "";
          const pp = personaProcesos.get(procesoId);
          if (!pp) return "";
          const e = (pp.estado || "").toLowerCase();
          if (e === "realizado" || e === "finalizado") {
            return pp.fecha_completado
              ? format(parseISO(pp.fecha_completado), "dd/MM/yyyy")
              : "✓";
          }
          if (e === "en curso") return "En curso";
          return "";
        });

        return [
          idx + 1,
          p.created_at ? format(parseISO(p.created_at), "dd/MM/yyyy") : "",
          p.nombres || "",
          p.apellidos || "",
          p.telefono || "",
          p.whatsapp || "",
          p.email || "",
          p.tipo_documento || "",
          p.documento || "",
          p.tipo_persona || "",
          p.estado_iglesia || "",
          (p.grupos as any)?.nombre || "",
          p.fecha_nacimiento ? format(parseISO(p.fecha_nacimiento), "dd/MM/yyyy") : "",
          p.sexo || "",
          p.barrio || "",
          p.direccion || "",
          p.nacionalidad || "",
          p.estado_civil || "",
          p.ocupacion || "",
          p.vinculacion || "",
          p.ministerio || "",
          p.invitado_por || "",
          p.seguimiento_por || "",
          ...procesosCols,
        ];
      });

      // 5. Build workbook
      const wb = XLSX.utils.book_new();
      const wsData = [headers, ...rows];
      const ws = XLSX.utils.aoa_to_sheet(wsData);

      // Column widths
      const colWidths = headers.map((h, i) => {
        if (i === 0) return { wch: 5 };
        if (i <= 1) return { wch: 14 };
        if (i <= 4) return { wch: 22 };
        if (i >= 23) return { wch: 32 }; // proceso columns
        return { wch: 18 };
      });
      ws["!cols"] = colWidths;

      // Freeze header row
      ws["!freeze"] = { xSplit: 0, ySplit: 1 };

      XLSX.utils.book_append_sheet(wb, ws, "Consolidación");

      // Summary sheet
      const summary = [
        ["INFORME DE CONSOLIDACIÓN"],
        ["Período:", filterLabel],
        ["Generado:", format(new Date(), "dd/MM/yyyy HH:mm")],
        ["Total personas:", personas.length],
        [],
        ["Tipo", "Cantidad"],
      ];
      const tipoCounts: Record<string, number> = {};
      personas.forEach((p: any) => {
        const t = p.tipo_persona || "Sin tipo";
        tipoCounts[t] = (tipoCounts[t] || 0) + 1;
      });
      Object.entries(tipoCounts).forEach(([t, c]) => summary.push([t, String(c)]));

      const wsSummary = XLSX.utils.aoa_to_sheet(summary);
      wsSummary["!cols"] = [{ wch: 30 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(wb, wsSummary, "Resumen");

      const filename = `consolidacion_${filterLabel.replace(/\s+/g, "_").replace(/\//g, "-")}.xlsx`;
      XLSX.writeFile(wb, filename);
      toast.success(`Descargado: ${personas.length} personas`);
      onOpenChange(false);
    } catch (err: any) {
      toast.error("Error al exportar: " + (err.message || ""));
    } finally {
      setLoadingExport(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            Exportar Informe de Consolidación
          </DialogTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Descarga la información completa de personas (datos básicos + 25 procesos de crecimiento)
            en formato Excel. Filtra por fecha de ingreso.
          </p>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Filter type */}
          <div className="space-y-1.5">
            <Label>Tipo de filtro</Label>
            <Select value={filterType} onValueChange={v => setFilterType(v as FilterType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="mes">Por año y mes</SelectItem>
                <SelectItem value="rango">Por rango de fechas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Month/year filter */}
          {filterType === "mes" && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Año</Label>
                <Select value={year} onValueChange={setYear}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Mes</Label>
                <Select value={month} onValueChange={setMonth}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {MESES.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Date range filter */}
          {filterType === "rango" && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Desde</Label>
                <Input type="date" value={fechaDesde} onChange={e => setFechaDesde(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Hasta</Label>
                <Input type="date" value={fechaHasta} onChange={e => setFechaHasta(e.target.value)} />
              </div>
            </div>
          )}

          {/* Preview */}
          <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Vista previa</p>
              <Button
                size="sm" variant="outline" className="h-7 text-xs"
                onClick={handlePreview}
                disabled={loadingPreview || (filterType === "rango" && (!fechaDesde || !fechaHasta))}
              >
                {loadingPreview ? <Loader2 className="h-3 w-3 animate-spin" /> : "Contar personas"}
              </Button>
            </div>
            {previewCount !== null ? (
              <p className="text-sm">
                <span className="font-bold text-primary text-lg">{previewCount}</span>
                {" "}persona(s) coinciden con:{" "}
                <em className="text-muted-foreground">{filterLabel}</em>
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">Haz clic en "Contar personas" para ver cuántos registros se exportarán</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button
              onClick={handleExport}
              disabled={loadingExport || (filterType === "rango" && (!fechaDesde || !fechaHasta))}
              className="gap-2"
            >
              {loadingExport
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Generando...</>
                : <><Download className="h-4 w-4" /> Excel (plantilla)</>
              }
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

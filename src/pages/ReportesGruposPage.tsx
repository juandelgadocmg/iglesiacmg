import { useState, useMemo } from "react";
import PageHeader from "@/components/shared/PageHeader";
import MetricCard from "@/components/shared/MetricCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import ReporteGrupoFormDialog from "@/components/forms/ReporteGrupoFormDialog";
import { useReportesGrupos, useDeleteReporteGrupo, useUpdateReporteGrupo } from "@/hooks/useReportesGrupos";
import { cn } from "@/lib/utils";
import { format, isWithinInterval, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import {
  Plus, Search, FileText, ClipboardCheck, CheckCircle2, XCircle,
  AlertCircle, CalendarIcon, DollarSign, Trash2, ShieldCheck
} from "lucide-react";
import { toast } from "sonner";
import type { DateRange } from "react-day-picker";

const ESTADOS = ["Todos", "No Finalizado", "No Verificado", "Aprobado", "No Aprobado"] as const;

const estadoBadge: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; className?: string }> = {
  "No Finalizado": { variant: "secondary" },
  "No Verificado": { variant: "outline", className: "border-amber-500 text-amber-600" },
  "Aprobado": { variant: "default", className: "bg-success text-success-foreground" },
  "No Aprobado": { variant: "destructive" },
};

export default function ReportesGruposPage() {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("Todos");
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const { data: reportes, isLoading } = useReportesGrupos();
  const deleteReporte = useDeleteReporteGrupo();
  const updateReporte = useUpdateReporteGrupo();

  const filtered = useMemo(() => {
    if (!reportes) return [];
    return reportes.filter((r) => {
      if (tab !== "Todos" && r.estado !== tab) return false;
      if (search) {
        const q = search.toLowerCase();
        const match =
          r.mensaje.toLowerCase().includes(q) ||
          r.grupos?.nombre?.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (dateRange?.from) {
        const fecha = parseISO(r.fecha);
        const from = dateRange.from;
        const to = dateRange.to || dateRange.from;
        if (!isWithinInterval(fecha, { start: from, end: to })) return false;
      }
      return true;
    });
  }, [reportes, tab, search, dateRange]);

  const counts = useMemo(() => {
    if (!reportes) return { all: 0, noFin: 0, noVer: 0, apro: 0, noApro: 0 };
    return {
      all: reportes.length,
      noFin: reportes.filter((r) => r.estado === "No Finalizado").length,
      noVer: reportes.filter((r) => r.estado === "No Verificado").length,
      apro: reportes.filter((r) => r.estado === "Aprobado").length,
      noApro: reportes.filter((r) => r.estado === "No Aprobado").length,
    };
  }, [reportes]);

  const handleVerify = async (id: string) => {
    try {
      const { data: { user } } = await (await import("@/integrations/supabase/client")).supabase.auth.getUser();
      await updateReporte.mutateAsync({
        id,
        estado: "Aprobado",
        verificado_por: user?.id,
        fecha_verificacion: new Date().toISOString(),
      });
      toast.success("Reporte aprobado.");
    } catch {
      toast.error("Error al verificar el reporte.");
    }
  };

  const handleReject = async (id: string) => {
    try {
      await updateReporte.mutateAsync({ id, estado: "No Aprobado" });
      toast.success("Reporte rechazado.");
    } catch {
      toast.error("Error al rechazar el reporte.");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Reportes de Grupos" description="Gestión y verificación de reportes de células y grupos">
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Crear Reporte
        </Button>
      </PageHeader>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <MetricCard title="Todos" value={counts.all} icon={FileText} />
        <MetricCard title="No Finalizados" value={counts.noFin} icon={AlertCircle} variant="accent" />
        <MetricCard title="No Verificados" value={counts.noVer} icon={ClipboardCheck} variant="info" />
        <MetricCard title="Aprobados" value={counts.apro} icon={CheckCircle2} variant="success" />
        <MetricCard title="No Aprobados" value={counts.noApro} icon={XCircle} variant="default" />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por tema o grupo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <CalendarIcon className="h-4 w-4" />
              {dateRange?.from
                ? `${format(dateRange.from, "dd/MM/yy")}${dateRange.to ? ` - ${format(dateRange.to, "dd/MM/yy")}` : ""}`
                : "Filtrar fechas"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={2}
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
        {dateRange && (
          <Button variant="ghost" size="sm" onClick={() => setDateRange(undefined)}>
            Limpiar fechas
          </Button>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          {ESTADOS.map((e) => (
            <TabsTrigger key={e} value={e}>{e}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Report Cards */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Cargando reportes...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No se encontraron reportes.</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((r) => {
            const badge = estadoBadge[r.estado] || { variant: "secondary" as const };
            return (
              <div
                key={r.id}
                className="rounded-xl border bg-card p-5 space-y-3 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{r.mensaje}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {r.grupos?.nombre || "Grupo"} · {r.grupos?.tipo || ""}
                    </p>
                  </div>
                  <Badge variant={badge.variant} className={badge.className}>
                    {r.estado}
                  </Badge>
                </div>

                <div className="text-sm text-muted-foreground">
                  <CalendarIcon className="inline h-3.5 w-3.5 mr-1" />
                  {format(parseISO(r.fecha), "PPP", { locale: es })}
                </div>

                {r.observaciones && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{r.observaciones}</p>
                )}

                {/* Financial info */}
                <div className="bg-muted/50 rounded-lg p-3 space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Ingresos digitados por el líder
                  </p>
                  <div className="flex justify-between text-sm">
                    <span>Ofrenda Casa de Paz</span>
                    <span className="font-medium">${Number(r.ofrenda_casa_paz).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold">
                    <span>Total</span>
                    <span>${Number(r.total_reportado).toFixed(2)}</span>
                  </div>
                  {r.ingreso_verificado_sobre !== null && (
                    <div className="flex justify-between text-sm pt-1 border-t border-border">
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="h-3.5 w-3.5 text-success" />
                        Verificado en sobre
                      </span>
                      <span className="font-medium text-success">${Number(r.ingreso_verificado_sobre).toFixed(2)}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1">
                  {(r.estado === "No Verificado" || r.estado === "No Finalizado") && (
                    <>
                      <Button size="sm" variant="outline" className="gap-1 text-success" onClick={() => handleVerify(r.id)}>
                        <CheckCircle2 className="h-3.5 w-3.5" /> Aprobar
                      </Button>
                      <Button size="sm" variant="outline" className="gap-1 text-destructive" onClick={() => handleReject(r.id)}>
                        <XCircle className="h-3.5 w-3.5" /> Rechazar
                      </Button>
                    </>
                  )}
                  <Button size="sm" variant="ghost" className="ml-auto text-destructive" onClick={() => setDeleteId(r.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ReporteGrupoFormDialog open={showForm} onOpenChange={setShowForm} />
      <DeleteConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={async () => {
          if (deleteId) {
            await deleteReporte.mutateAsync(deleteId);
            toast.success("Reporte eliminado.");
            setDeleteId(null);
          }
        }}
        title="¿Eliminar reporte?"
        description="Esta acción no se puede deshacer."
      />
    </div>
  );
}

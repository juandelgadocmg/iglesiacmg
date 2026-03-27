import { useState, lazy, Suspense, useMemo } from "react";
import PageHeader from "@/components/shared/PageHeader";
import DataTable from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import GrupoFormDialog from "@/components/forms/GrupoFormDialog";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import ReporteGrupoFormDialog from "@/components/forms/ReporteGrupoFormDialog";
import GrupoPerfilView from "@/components/groups/GrupoPerfilView";
import GrupoHierarchyView from "@/components/groups/GrupoHierarchyView";
import PlanificacionGrupoFormDialog from "@/components/forms/PlanificacionGrupoFormDialog";
import { usePlanificaciones, useDeletePlanificacion } from "@/hooks/usePlanificaciones";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Users, Pencil, Plus, ClipboardList, Network, DollarSign, TrendingUp, BarChart3, FileText, Trash2, Eye } from "lucide-react";
import { useGrupos, useDeleteGrupo } from "@/hooks/useDatabase";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import ExportDropdown from "@/components/shared/ExportDropdown";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

const ReportesGruposContent = lazy(() => import("@/pages/ReportesGruposPage"));
const MapaGruposContent = lazy(() => import("@/pages/MapaGruposPage"));
const GraficoMinisterioContent = lazy(() => import("@/pages/GraficoMinisterioPage"));

const REDES = ["Nissi", "Rohi", "Jireh", "Adonai", "Shaddai", "Elohim"];

function useRedStats() {
  return useQuery({
    queryKey: ["red_dashboard_stats"],
    queryFn: async () => {
      // Fetch groups with red
      const { data: grupos } = await supabase
        .from("grupos")
        .select("id, nombre, red, grupo_miembros(count)")
        .eq("estado", "Activo");

      // Fetch all reportes_grupos with attendance data
      const { data: reportes } = await supabase
        .from("reportes_grupos")
        .select("grupo_id, ofrenda_casa_paz, estado, reporte_asistencia(presente)")
        .eq("estado", "Aprobado");

      const stats = REDES.map(red => {
        const redGrupos = (grupos || []).filter((g: any) => g.red === red);
        const grupoIds = new Set(redGrupos.map(g => g.id));
        const totalMiembros = redGrupos.reduce((s: number, g: any) => s + (g.grupo_miembros?.[0]?.count || 0), 0);

        const redReportes = (reportes || []).filter((r: any) => grupoIds.has(r.grupo_id));
        const totalOfrenda = redReportes.reduce((s: number, r: any) => s + (Number(r.ofrenda_casa_paz) || 0), 0);

        // Calc attendance from reporte_asistencia
        let totalPresentes = 0;
        let totalAsistenciaRecords = 0;
        redReportes.forEach((r: any) => {
          const asist = r.reporte_asistencia || [];
          totalAsistenciaRecords += asist.length;
          totalPresentes += asist.filter((a: any) => a.presente).length;
        });

        const promedioAsistencia = totalAsistenciaRecords > 0
          ? Math.round((totalPresentes / totalAsistenciaRecords) * 100)
          : 0;

        return {
          red,
          casasDePaz: redGrupos.length,
          totalMiembros,
          reportes: redReportes.length,
          totalOfrenda,
          promedioAsistencia,
          totalPresentes,
        };
      });

      return stats;
    },
  });
}

export default function GruposPage() {
  const { data: grupos, isLoading } = useGrupos();
  const deleteGrupo = useDeleteGrupo();
  const [editing, setEditing] = useState<any>(null);
  const [showReportForm, setShowReportForm] = useState(false);
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [selectedGrupoId, setSelectedGrupoId] = useState<string | null>(null);
  const { data: planificaciones } = usePlanificaciones();
  const deletePlan = useDeletePlanificacion();
  const [viewingPlan, setViewingPlan] = useState<any>(null);

  if (isLoading) {
    return (
      <div className="animate-fade-in space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  const tableData = (grupos || []).map(g => ({
    ...g,
    liderNombre: (g as any).personas ? `${(g as any).personas.nombres} ${(g as any).personas.apellidos}` : "—",
    miembrosCount: (g as any).grupo_miembros?.[0]?.count || 0,
  }));

  const handleDelete = async (id: string) => {
    try { await deleteGrupo.mutateAsync(id); toast.success("Grupo eliminado"); }
    catch { toast.error("Error al eliminar"); }
  };

  // If a group is selected, show profile view
  if (selectedGrupoId) {
    return <GrupoPerfilView grupoId={selectedGrupoId} onBack={() => setSelectedGrupoId(null)} />;
  }

  return (
    <div className="animate-fade-in">
      <PageHeader title="Grupos" description="Administración de células, ministerios, reportes y visualizaciones">
        <ExportDropdown title="Grupos" filename="grupos" columns={[
          { header: "Nombre", key: "nombre" }, { header: "Tipo", key: "tipo" },
          { header: "Red", key: "red" }, { header: "Líder", key: "liderNombre" },
          { header: "Día", key: "dia_reunion" }, { header: "Miembros", key: "miembrosCount" },
          { header: "Estado", key: "estado" },
        ]} data={tableData} />
        <GrupoFormDialog />
      </PageHeader>

      {editing && <GrupoFormDialog initialData={editing} onClose={() => setEditing(null)} />}

      <Tabs defaultValue="lista" className="space-y-4">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="lista">Grupos</TabsTrigger>
          <TabsTrigger value="jerarquia">Jerarquía</TabsTrigger>
          <TabsTrigger value="dashboard" className="gap-1.5">
            <BarChart3 className="h-3.5 w-3.5" /> Dashboard Redes
          </TabsTrigger>
          <TabsTrigger value="reporte" className="gap-1.5">
            <ClipboardList className="h-3.5 w-3.5" /> Crear Reporte
          </TabsTrigger>
          <TabsTrigger value="reportes">Listado Reportes</TabsTrigger>
          <TabsTrigger value="mapa">Mapa</TabsTrigger>
          <TabsTrigger value="organigrama">Organigrama</TabsTrigger>
          <TabsTrigger value="planificacion" className="gap-1.5">
            <FileText className="h-3.5 w-3.5" /> Planificación
          </TabsTrigger>
        </TabsList>

        <TabsContent value="lista">
          <DataTable
            data={tableData} searchKey="nombre" searchPlaceholder="Buscar grupo..."
            filterKey="tipo" filterPlaceholder="Tipo de grupo"
            filterOptions={[
              { value: "Casas de paz", label: "Casas de paz" }, { value: "Grupos encuentro", label: "Grupos encuentro" },
            ]}
            columns={[
              {
                key: "nombre", label: "Grupo",
                render: (g: any) => (
                  <div className="flex items-center gap-3 cursor-pointer" onClick={() => setSelectedGrupoId(g.id)}>
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm hover:underline">{g.nombre}</p>
                      <p className="text-xs text-muted-foreground">{g.tipo}</p>
                    </div>
                  </div>
                )
              },
              { key: "red", label: "Red", render: (g: any) => g.red || "—" },
              { key: "liderNombre", label: "Líder" },
              { key: "dia_reunion", label: "Día", render: (g: any) => `${g.dia_reunion || "—"} ${g.hora_reunion || ""}` },
              { key: "miembrosCount", label: "Miembros", render: (g: any) => (
                <Button variant="ghost" size="sm" className="gap-1 h-7 font-semibold" onClick={() => setSelectedGrupoId(g.id)}>
                  <Users className="h-3.5 w-3.5" /> {g.miembrosCount}
                </Button>
              )},
              { key: "estado", label: "Estado", render: (g: any) => <StatusBadge status={g.estado} /> },
              {
                key: "actions", label: "",
                render: (g: any) => (
                  <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditing({ ...g })}><Pencil className="h-4 w-4" /></Button>
                    <DeleteConfirmDialog onConfirm={() => handleDelete(g.id)} title="¿Eliminar grupo?" description={`Se eliminará el grupo "${g.nombre}" permanentemente.`} />
                  </div>
                )
              },
            ]}
          />
        </TabsContent>

        <TabsContent value="jerarquia">
          <GrupoHierarchyView onSelectGrupo={(id) => setSelectedGrupoId(id)} />
        </TabsContent>

        <TabsContent value="dashboard">
          <RedDashboard />
        </TabsContent>

        <TabsContent value="reporte">
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <ClipboardList className="h-16 w-16 text-muted-foreground/30" />
            <div className="text-center">
              <h3 className="text-lg font-semibold">Crear Reporte Semanal</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Registra la asistencia, personas nuevas y ofrenda de tu grupo.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Solo disponible el día de reunión configurado en cada grupo.
              </p>
            </div>
            <Button onClick={() => setShowReportForm(true)} className="gap-2">
              <Plus className="h-4 w-4" /> Iniciar Reporte
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="reportes">
          <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
            <ReportesGruposContent />
          </Suspense>
        </TabsContent>

        <TabsContent value="mapa">
          <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
            <MapaGruposContent />
          </Suspense>
        </TabsContent>

        <TabsContent value="organigrama">
          <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
            <GraficoMinisterioContent />
          </Suspense>
        </TabsContent>

        <TabsContent value="planificacion">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Hojas de Planeación</h3>
                <p className="text-sm text-muted-foreground">Planificación semanal de Casas de Paz</p>
              </div>
              <Button onClick={() => setShowPlanForm(true)} className="gap-2">
                <Plus className="h-4 w-4" /> Nueva Planificación
              </Button>
            </div>

            {planificaciones && planificaciones.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {planificaciones.map((p: any) => (
                  <div key={p.id} className="rounded-xl border bg-card p-4 space-y-2 cursor-pointer hover:border-primary/40 transition-colors" onClick={() => setViewingPlan(p)}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-sm">{p.lider_nombre}</p>
                        <p className="text-xs text-muted-foreground">Red: {p.red || "—"} · {p.casa_de_paz || "—"}</p>
                      </div>
                      <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setViewingPlan(p)}>
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <DeleteConfirmDialog
                          onConfirm={async () => { try { await deletePlan.mutateAsync(p.id); toast.success("Eliminada"); } catch { toast.error("Error"); } }}
                          trigger={<Button size="icon" variant="ghost" className="h-7 w-7 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>}
                        />
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</p>
                    <div className="text-xs space-y-0.5">
                      <p>Invitados: {p.personas_invitadas}</p>
                      <p>Ayuno: {p.fecha_ayuno || "—"}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>No hay planificaciones registradas.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <ReporteGrupoFormDialog open={showReportForm} onOpenChange={setShowReportForm} />
      <PlanificacionGrupoFormDialog open={showPlanForm} onOpenChange={setShowPlanForm} />
    </div>
  );
}

function RedDashboard() {
  const { data: stats, isLoading } = useRedStats();

  if (isLoading) return <Skeleton className="h-[400px] w-full" />;

  const data = stats || [];
  const totals = data.reduce(
    (acc, s) => ({
      casas: acc.casas + s.casasDePaz,
      miembros: acc.miembros + s.totalMiembros,
      ofrenda: acc.ofrenda + s.totalOfrenda,
      presentes: acc.presentes + s.totalPresentes,
      reportes: acc.reportes + s.reportes,
    }),
    { casas: 0, miembros: 0, ofrenda: 0, presentes: 0, reportes: 0 }
  );

  const chartData = data.map(s => ({
    red: s.red,
    "Casas de Paz": s.casasDePaz,
    "Miembros": s.totalMiembros,
    "Prom. Asistencia %": s.promedioAsistencia,
  }));

  const ofrendaChart = data.map(s => ({
    red: s.red,
    "Ofrenda Total": s.totalOfrenda,
  }));

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl border bg-card p-4 text-center">
          <Network className="h-6 w-6 text-info mx-auto mb-1" />
          <p className="text-2xl font-bold">{data.filter(s => s.casasDePaz > 0).length}</p>
          <p className="text-xs text-muted-foreground">Redes Activas</p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center">
          <Users className="h-6 w-6 text-primary mx-auto mb-1" />
          <p className="text-2xl font-bold">{totals.miembros}</p>
          <p className="text-xs text-muted-foreground">Total Miembros</p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center">
          <TrendingUp className="h-6 w-6 text-success mx-auto mb-1" />
          <p className="text-2xl font-bold">{totals.reportes}</p>
          <p className="text-xs text-muted-foreground">Reportes Aprobados</p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center">
          <DollarSign className="h-6 w-6 text-amber-500 mx-auto mb-1" />
          <p className="text-2xl font-bold">${totals.ofrenda.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Ofrenda Total</p>
        </div>
      </div>

      {/* Table per red */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Estadísticas por Red</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3 font-medium">Red</th>
                <th className="text-center p-3 font-medium">Casas de Paz</th>
                <th className="text-center p-3 font-medium">Miembros</th>
                <th className="text-center p-3 font-medium">Reportes</th>
                <th className="text-center p-3 font-medium">Prom. Asistencia</th>
                <th className="text-right p-3 font-medium">Ofrenda Total</th>
              </tr>
            </thead>
            <tbody>
              {data.map(s => (
                <tr key={s.red} className="border-b hover:bg-muted/30 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <Network className="h-4 w-4 text-info" />
                      <span className="font-medium">{s.red}</span>
                    </div>
                  </td>
                  <td className="text-center p-3">{s.casasDePaz}</td>
                  <td className="text-center p-3">{s.totalMiembros}</td>
                  <td className="text-center p-3">{s.reportes}</td>
                  <td className="text-center p-3">
                    <Badge variant={s.promedioAsistencia >= 70 ? "default" : "secondary"} className="text-xs">
                      {s.promedioAsistencia}%
                    </Badge>
                  </td>
                  <td className="text-right p-3 font-medium">${s.totalOfrenda.toLocaleString()}</td>
                </tr>
              ))}
              <tr className="bg-muted/50 font-semibold">
                <td className="p-3">Total</td>
                <td className="text-center p-3">{totals.casas}</td>
                <td className="text-center p-3">{totals.miembros}</td>
                <td className="text-center p-3">{totals.reportes}</td>
                <td className="text-center p-3">—</td>
                <td className="text-right p-3">${totals.ofrenda.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl border bg-card p-5">
          <h3 className="font-semibold mb-4">Miembros por Red</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="red" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip />
              <Legend />
              <Bar dataKey="Casas de Paz" fill="hsl(var(--info))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Miembros" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <h3 className="font-semibold mb-4">Ofrenda por Red</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={ofrendaChart}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="red" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip />
              <Bar dataKey="Ofrenda Total" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

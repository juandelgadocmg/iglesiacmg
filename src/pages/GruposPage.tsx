import { useState, lazy, Suspense } from "react";
import PageHeader from "@/components/shared/PageHeader";
import DataTable from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import GrupoFormDialog from "@/components/forms/GrupoFormDialog";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import ReporteGrupoFormDialog from "@/components/forms/ReporteGrupoFormDialog";
import GrupoPerfilView from "@/components/groups/GrupoPerfilView";
import GrupoHierarchyView from "@/components/groups/GrupoHierarchyView";
import { Users, Pencil, Plus, ClipboardList, ChevronLeft } from "lucide-react";
import { useGrupos, useDeleteGrupo } from "@/hooks/useDatabase";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import ExportDropdown from "@/components/shared/ExportDropdown";

const ReportesGruposContent = lazy(() => import("@/pages/ReportesGruposPage"));
const MapaGruposContent = lazy(() => import("@/pages/MapaGruposPage"));
const GraficoMinisterioContent = lazy(() => import("@/pages/GraficoMinisterioPage"));

export default function GruposPage() {
  const { data: grupos, isLoading } = useGrupos();
  const deleteGrupo = useDeleteGrupo();
  const [editing, setEditing] = useState<any>(null);
  const [showReportForm, setShowReportForm] = useState(false);
  const [selectedGrupoId, setSelectedGrupoId] = useState<string | null>(null);

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
          <TabsTrigger value="reporte" className="gap-1.5">
            <ClipboardList className="h-3.5 w-3.5" /> Crear Reporte
          </TabsTrigger>
          <TabsTrigger value="reportes">Listado Reportes</TabsTrigger>
          <TabsTrigger value="mapa">Mapa</TabsTrigger>
          <TabsTrigger value="organigrama">Organigrama</TabsTrigger>
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
          <GrupoHierarchyView />
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
                Solo disponible los días <strong>jueves</strong> hasta las 11:59 PM.
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
      </Tabs>

      <ReporteGrupoFormDialog open={showReportForm} onOpenChange={setShowReportForm} />
    </div>
  );
}

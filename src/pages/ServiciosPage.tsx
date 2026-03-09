import { useState } from "react";
import PageHeader from "@/components/shared/PageHeader";
import DataTable from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import ServicioFormDialog from "@/components/forms/ServicioFormDialog";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import { Church, Pencil } from "lucide-react";
import { useServicios, useDeleteServicio } from "@/hooks/useDatabase";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import ExportDropdown from "@/components/shared/ExportDropdown";

export default function ServiciosPage() {
  const { data: servicios, isLoading } = useServicios();
  const deleteServicio = useDeleteServicio();
  const [editing, setEditing] = useState<any>(null);

  if (isLoading) {
    return (
      <div className="animate-fade-in space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteServicio.mutateAsync(id);
      toast.success("Servicio eliminado");
    } catch { toast.error("Error al eliminar"); }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader title="Servicios" description="Gestión de cultos, reuniones y servicios de la iglesia">
        <ServicioFormDialog />
      </PageHeader>

      {editing && <ServicioFormDialog initialData={editing} onClose={() => setEditing(null)} />}

      <DataTable
        data={servicios || []}
        searchKey="nombre"
        searchPlaceholder="Buscar servicio..."
        filterKey="estado"
        filterPlaceholder="Estado"
        filterOptions={[
          { value: "Programado", label: "Programado" },
          { value: "Completado", label: "Completado" },
          { value: "Cancelado", label: "Cancelado" },
        ]}
        columns={[
          {
            key: "nombre", label: "Servicio",
            render: (s: any) => (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-info/10 flex items-center justify-center">
                  <Church className="h-4 w-4 text-info" />
                </div>
                <div>
                  <p className="font-medium text-sm">{s.nombre}</p>
                  <p className="text-xs text-muted-foreground">{s.tipo}</p>
                </div>
              </div>
            )
          },
          { key: "fecha", label: "Fecha", render: (s: any) => `${s.fecha} · ${s.hora || ""}` },
          { key: "predicador", label: "Predicador", render: (s: any) => s.predicador || "—" },
          { key: "estado", label: "Estado", render: (s: any) => <StatusBadge status={s.estado} /> },
          {
            key: "actions", label: "",
            render: (s: any) => (
              <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditing({ ...s })}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <DeleteConfirmDialog onConfirm={() => handleDelete(s.id)} title="¿Eliminar servicio?" description={`Se eliminará "${s.nombre}" permanentemente.`} />
              </div>
            )
          },
        ]}
      />
    </div>
  );
}

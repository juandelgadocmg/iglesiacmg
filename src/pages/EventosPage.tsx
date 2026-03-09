import { useState } from "react";
import PageHeader from "@/components/shared/PageHeader";
import DataTable from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import EventoFormDialog from "@/components/forms/EventoFormDialog";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import { CalendarDays, Pencil } from "lucide-react";
import { useEventos, useDeleteEvento } from "@/hooks/useDatabase";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import ExportDropdown from "@/components/shared/ExportDropdown";

export default function EventosPage() {
  const { data: eventos, isLoading } = useEventos();
  const deleteEvento = useDeleteEvento();
  const [editing, setEditing] = useState<any>(null);

  if (isLoading) {
    return (
      <div className="animate-fade-in space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  const tableData = (eventos || []).map(e => ({
    ...e,
    inscritosCount: (e as any).inscripciones?.[0]?.count || 0,
  }));

  const handleDelete = async (id: string) => {
    try {
      await deleteEvento.mutateAsync(id);
      toast.success("Evento eliminado");
    } catch { toast.error("Error al eliminar"); }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader title="Eventos" description="Gestión de actividades especiales de la iglesia">
        <EventoFormDialog />
      </PageHeader>

      {editing && <EventoFormDialog initialData={editing} onClose={() => setEditing(null)} />}

      <DataTable
        data={tableData}
        searchKey="nombre"
        searchPlaceholder="Buscar evento..."
        filterKey="estado"
        filterPlaceholder="Estado"
        filterOptions={[
          { value: "Próximo", label: "Próximo" },
          { value: "En curso", label: "En curso" },
          { value: "Finalizado", label: "Finalizado" },
        ]}
        columns={[
          {
            key: "nombre", label: "Evento",
            render: (e: any) => (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                  <CalendarDays className="h-4 w-4 text-accent" />
                </div>
                <div>
                  <p className="font-medium text-sm">{e.nombre}</p>
                  <p className="text-xs text-muted-foreground">{e.tipo || "—"}</p>
                </div>
              </div>
            )
          },
          { key: "fecha_inicio", label: "Fecha", render: (e: any) => `${e.fecha_inicio} — ${e.fecha_fin || ""}` },
          { key: "lugar", label: "Lugar", render: (e: any) => e.lugar || "—" },
          { key: "inscritosCount", label: "Inscritos", render: (e: any) => <span className="font-semibold">{e.inscritosCount}/{e.cupos || "∞"}</span> },
          { key: "estado", label: "Estado", render: (e: any) => <StatusBadge status={e.estado} /> },
          {
            key: "actions", label: "",
            render: (e: any) => (
              <div className="flex items-center gap-1" onClick={ev => ev.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditing({ ...e })}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <DeleteConfirmDialog onConfirm={() => handleDelete(e.id)} title="¿Eliminar evento?" description={`Se eliminará "${e.nombre}" permanentemente.`} />
              </div>
            )
          },
        ]}
      />
    </div>
  );
}

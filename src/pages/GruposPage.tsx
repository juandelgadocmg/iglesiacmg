import { useState } from "react";
import PageHeader from "@/components/shared/PageHeader";
import DataTable from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import GrupoFormDialog from "@/components/forms/GrupoFormDialog";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import { Users, Pencil } from "lucide-react";
import { useGrupos, useDeleteGrupo } from "@/hooks/useDatabase";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import ExportDropdown from "@/components/shared/ExportDropdown";

export default function GruposPage() {
  const { data: grupos, isLoading } = useGrupos();
  const deleteGrupo = useDeleteGrupo();
  const [editing, setEditing] = useState<any>(null);

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
    try {
      await deleteGrupo.mutateAsync(id);
      toast.success("Grupo eliminado");
    } catch { toast.error("Error al eliminar"); }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader title="Grupos" description="Administración de células, ministerios y grupos internos">
        <GrupoFormDialog />
      </PageHeader>

      {editing && <GrupoFormDialog initialData={editing} onClose={() => setEditing(null)} />}

      <DataTable
        data={tableData}
        searchKey="nombre"
        searchPlaceholder="Buscar grupo..."
        filterKey="tipo"
        filterPlaceholder="Tipo de grupo"
        filterOptions={[
          { value: "Células", label: "Células" },
          { value: "Jóvenes", label: "Jóvenes" },
          { value: "Mujeres", label: "Mujeres" },
          { value: "Hombres", label: "Hombres" },
          { value: "Alabanza", label: "Alabanza" },
          { value: "Ujieres", label: "Ujieres" },
          { value: "Liderazgo", label: "Liderazgo" },
        ]}
        columns={[
          {
            key: "nombre", label: "Grupo",
            render: (g: any) => (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">{g.nombre}</p>
                  <p className="text-xs text-muted-foreground">{g.tipo}</p>
                </div>
              </div>
            )
          },
          { key: "liderNombre", label: "Líder" },
          { key: "dia_reunion", label: "Día", render: (g: any) => `${g.dia_reunion || "—"} ${g.hora_reunion || ""}` },
          { key: "miembrosCount", label: "Miembros", render: (g: any) => <span className="font-semibold">{g.miembrosCount}</span> },
          { key: "estado", label: "Estado", render: (g: any) => <StatusBadge status={g.estado} /> },
          {
            key: "actions", label: "",
            render: (g: any) => (
              <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditing({ ...g })}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <DeleteConfirmDialog onConfirm={() => handleDelete(g.id)} title="¿Eliminar grupo?" description={`Se eliminará el grupo "${g.nombre}" permanentemente.`} />
              </div>
            )
          },
        ]}
      />
    </div>
  );
}

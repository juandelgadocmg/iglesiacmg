import PageHeader from "@/components/shared/PageHeader";
import DataTable from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";
import { useGrupos } from "@/hooks/useDatabase";
import { Skeleton } from "@/components/ui/skeleton";

export default function GruposPage() {
  const { data: grupos, isLoading } = useGrupos();

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

  return (
    <div className="animate-fade-in">
      <PageHeader title="Grupos" description="Administración de células, ministerios y grupos internos">
        <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Nuevo Grupo
        </Button>
      </PageHeader>

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
        ]}
      />
    </div>
  );
}

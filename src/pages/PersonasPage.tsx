import PageHeader from "@/components/shared/PageHeader";
import DataTable from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import PersonaFormDialog from "@/components/forms/PersonaFormDialog";
import { usePersonas } from "@/hooks/useDatabase";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

export default function PersonasPage() {
  const { data: personas, isLoading } = usePersonas();

  if (isLoading) {
    return (
      <div className="animate-fade-in space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  const tableData = (personas || []).map(p => ({
    ...p,
    grupoNombre: (p as any).grupos?.nombre || "",
  }));

  return (
    <div className="animate-fade-in">
      <PageHeader title="Personas" description="Gestión de miembros, visitantes, líderes y servidores">
        <PersonaFormDialog />
      </PageHeader>

      <DataTable
        data={tableData}
        searchKey="nombres"
        searchPlaceholder="Buscar por nombre..."
        filterKey="tipo_persona"
        filterPlaceholder="Tipo de persona"
        filterOptions={[
          { value: "Miembro", label: "Miembro" },
          { value: "Visitante", label: "Visitante" },
          { value: "Líder", label: "Líder" },
          { value: "Servidor", label: "Servidor" },
        ]}
        columns={[
          {
            key: "nombres", label: "Nombre",
            render: (p: any) => (
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">{p.nombres?.[0]}{p.apellidos?.[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">{p.nombres} {p.apellidos}</p>
                  <p className="text-xs text-muted-foreground">{p.email || "—"}</p>
                </div>
              </div>
            )
          },
          { key: "telefono", label: "Teléfono", render: (p: any) => p.telefono || "—" },
          { key: "tipo_persona", label: "Tipo", render: (p: any) => <StatusBadge status={p.tipo_persona} /> },
          { key: "grupoNombre", label: "Grupo", render: (p: any) => p.grupoNombre || <span className="text-muted-foreground">—</span> },
          { key: "estado_iglesia", label: "Estado", render: (p: any) => <StatusBadge status={p.estado_iglesia} /> },
        ]}
      />
    </div>
  );
}

import PageHeader from "@/components/shared/PageHeader";
import DataTable from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { personas } from "@/data/mockData";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function PersonasPage() {
  return (
    <div className="animate-fade-in">
      <PageHeader title="Personas" description="Gestión de miembros, visitantes, líderes y servidores">
        <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Nueva Persona
        </Button>
      </PageHeader>

      <DataTable
        data={personas}
        searchKey="nombres"
        searchPlaceholder="Buscar por nombre..."
        filterKey="tipoPersona"
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
            render: (p) => (
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">{p.nombres[0]}{p.apellidos[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">{p.nombres} {p.apellidos}</p>
                  <p className="text-xs text-muted-foreground">{p.email}</p>
                </div>
              </div>
            )
          },
          { key: "telefono", label: "Teléfono" },
          { key: "tipoPersona", label: "Tipo", render: (p) => <StatusBadge status={p.tipoPersona} /> },
          { key: "grupo", label: "Grupo", render: (p) => p.grupo || <span className="text-muted-foreground">—</span> },
          { key: "estadoIglesia", label: "Estado", render: (p) => <StatusBadge status={p.estadoIglesia} /> },
        ]}
      />
    </div>
  );
}

import PageHeader from "@/components/shared/PageHeader";
import DataTable from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";
import { grupos } from "@/data/mockData";

export default function GruposPage() {
  return (
    <div className="animate-fade-in">
      <PageHeader title="Grupos" description="Administración de células, ministerios y grupos internos">
        <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Nuevo Grupo
        </Button>
      </PageHeader>

      <DataTable
        data={grupos}
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
            render: (g) => (
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
          { key: "lider", label: "Líder" },
          { key: "diaReunion", label: "Día", render: (g) => `${g.diaReunion} ${g.horaReunion}` },
          { key: "miembros", label: "Miembros", render: (g) => <span className="font-semibold">{g.miembros}</span> },
          { key: "estado", label: "Estado", render: (g) => <StatusBadge status={g.estado} /> },
        ]}
      />
    </div>
  );
}

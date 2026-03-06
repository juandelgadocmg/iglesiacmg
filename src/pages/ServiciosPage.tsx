import PageHeader from "@/components/shared/PageHeader";
import DataTable from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Plus, Church } from "lucide-react";
import { servicios } from "@/data/mockData";

export default function ServiciosPage() {
  return (
    <div className="animate-fade-in">
      <PageHeader title="Servicios" description="Gestión de cultos, reuniones y servicios de la iglesia">
        <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Nuevo Servicio
        </Button>
      </PageHeader>

      <DataTable
        data={servicios}
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
            render: (s) => (
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
          { key: "fecha", label: "Fecha", render: (s) => `${s.fecha} · ${s.hora}` },
          { key: "predicador", label: "Predicador" },
          { key: "asistencia", label: "Asistencia", render: (s) => s.asistencia > 0 ? <span className="font-semibold">{s.asistencia}</span> : <span className="text-muted-foreground">—</span> },
          { key: "estado", label: "Estado", render: (s) => <StatusBadge status={s.estado} /> },
        ]}
      />
    </div>
  );
}

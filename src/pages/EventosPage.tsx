import PageHeader from "@/components/shared/PageHeader";
import DataTable from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Plus, CalendarDays } from "lucide-react";
import { eventos } from "@/data/mockData";

export default function EventosPage() {
  return (
    <div className="animate-fade-in">
      <PageHeader title="Eventos" description="Gestión de actividades especiales de la iglesia">
        <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Nuevo Evento
        </Button>
      </PageHeader>

      <DataTable
        data={eventos}
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
            render: (e) => (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                  <CalendarDays className="h-4 w-4 text-accent" />
                </div>
                <div>
                  <p className="font-medium text-sm">{e.nombre}</p>
                  <p className="text-xs text-muted-foreground">{e.tipo}</p>
                </div>
              </div>
            )
          },
          { key: "fechaInicio", label: "Fecha", render: (e) => `${e.fechaInicio} — ${e.fechaFin}` },
          { key: "lugar", label: "Lugar" },
          { key: "inscritos", label: "Inscritos", render: (e) => <span className="font-semibold">{e.inscritos}/{e.cupos}</span> },
          { key: "estado", label: "Estado", render: (e) => <StatusBadge status={e.estado} /> },
        ]}
      />
    </div>
  );
}

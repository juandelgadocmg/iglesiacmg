import PageHeader from "@/components/shared/PageHeader";
import DataTable from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Plus, Church } from "lucide-react";
import { useServicios } from "@/hooks/useDatabase";
import { Skeleton } from "@/components/ui/skeleton";

export default function ServiciosPage() {
  const { data: servicios, isLoading } = useServicios();

  if (isLoading) {
    return (
      <div className="animate-fade-in space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <PageHeader title="Servicios" description="Gestión de cultos, reuniones y servicios de la iglesia">
        <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Nuevo Servicio
        </Button>
      </PageHeader>

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
        ]}
      />
    </div>
  );
}

import { useState } from "react";
import PageHeader from "@/components/shared/PageHeader";
import EventoFormDialog from "@/components/forms/EventoFormDialog";
import EventCalendar from "@/components/events/EventCalendar";
import EventoDetailView from "@/components/events/EventoDetailView";
import { useEventos } from "@/hooks/useDatabase";
import { Skeleton } from "@/components/ui/skeleton";
import ExportDropdown from "@/components/shared/ExportDropdown";

export default function EventosPage() {
  const { data: eventos, isLoading } = useEventos();
  const [selectedEvento, setSelectedEvento] = useState<any>(null);
  const [showCreate, setShowCreate] = useState(false);

  if (isLoading) {
    return (
      <div className="animate-fade-in space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-[500px] w-full" />
      </div>
    );
  }

  // If viewing event detail
  if (selectedEvento) {
    return <EventoDetailView evento={selectedEvento} onBack={() => setSelectedEvento(null)} />;
  }

  const calendarEvents = (eventos || []).map(e => ({
    id: e.id,
    nombre: e.nombre,
    fecha_inicio: e.fecha_inicio,
    fecha_fin: e.fecha_fin,
    color: (e as any).color || "#3b82f6",
    tipo: e.tipo,
    estado: e.estado,
  }));

  const tableData = (eventos || []).map(e => ({
    ...e,
    inscritosCount: (e as any).inscripciones?.[0]?.count || 0,
  }));

  return (
    <div className="animate-fade-in">
      <PageHeader title="Actividades" description="Gestión de actividades y eventos de la iglesia">
        <ExportDropdown title="Eventos" filename="eventos" columns={[
          { header: "Nombre", key: "nombre" }, { header: "Tipo", key: "tipo" },
          { header: "Fecha Inicio", key: "fecha_inicio" }, { header: "Lugar", key: "lugar" },
          { header: "Estado", key: "estado" },
        ]} data={tableData} />
        <EventoFormDialog />
      </PageHeader>

      {/* Event Type Legend */}
      <div className="flex flex-wrap items-center gap-3 mb-4 bg-card rounded-lg border p-4">
        <span className="text-sm font-medium text-muted-foreground">Tipos de evento:</span>
        {[
          { label: "Evento Gratuito", color: "#22c55e" },
          { label: "Evento Cerrado", color: "#ef4444" },
          { label: "Evento Abierto", color: "#3b82f6" },
        ].map(t => (
          <span key={t.label} className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md border" style={{ borderColor: t.color, color: t.color }}>
            <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: t.color }} />
            {t.label}
          </span>
        ))}
      </div>

      <EventCalendar
        events={calendarEvents}
        onEventClick={(evt) => {
          const full = eventos?.find(e => e.id === evt.id);
          if (full) setSelectedEvento(full);
        }}
        onNewEvent={() => setShowCreate(true)}
      />

      {showCreate && <EventoFormDialog initialData={undefined} onClose={() => setShowCreate(false)} />}
    </div>
  );
}

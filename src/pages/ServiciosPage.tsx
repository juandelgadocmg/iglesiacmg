import { useState } from "react";
import PageHeader from "@/components/shared/PageHeader";
import DataTable from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import ServicioFormDialog from "@/components/forms/ServicioFormDialog";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import MetricCard from "@/components/shared/MetricCard";
import { Church, Pencil, ClipboardCheck, Check, X, Save, Search, TrendingUp } from "lucide-react";
import { useServicios, useDeleteServicio, usePersonas, useAsistencia, useUpsertAsistencia } from "@/hooks/useDatabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import ExportDropdown from "@/components/shared/ExportDropdown";

export default function ServiciosPage() {
  const { data: servicios, isLoading } = useServicios();
  const { data: personas, isLoading: loadingPersonas } = usePersonas();
  const deleteServicio = useDeleteServicio();
  const [editing, setEditing] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"servicios" | "asistencia">("servicios");

  // Asistencia state
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "present" | "absent">("all");
  const [localAttendance, setLocalAttendance] = useState<Record<string, boolean>>({});
  const [initialized, setInitialized] = useState<string | null>(null);

  const upsertAsistencia = useUpsertAsistencia();
  const effectiveService = selectedService || servicios?.[0]?.id || null;
  const { data: asistenciaData, isLoading: loadingAsistencia } = useAsistencia(effectiveService);

  if (effectiveService && asistenciaData && initialized !== effectiveService) {
    const map: Record<string, boolean> = {};
    asistenciaData.forEach(a => { map[a.persona_id] = a.presente; });
    setLocalAttendance(map);
    setInitialized(effectiveService);
  }

  if (isLoading || loadingPersonas) {
    return (
      <div className="animate-fade-in space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteServicio.mutateAsync(id);
      toast.success("Servicio eliminado");
    } catch { toast.error("Error al eliminar"); }
  };

  const personasList = personas || [];
  const serviciosList = servicios || [];
  const currentService = serviciosList.find(s => s.id === effectiveService);

  const toggleAttendance = (personId: string) => {
    setLocalAttendance(prev => ({ ...prev, [personId]: !prev[personId] }));
  };

  const markAll = (present: boolean) => {
    const updated: Record<string, boolean> = {};
    personasList.forEach(p => { updated[p.id] = present; });
    setLocalAttendance(updated);
  };

  const saveAttendance = async () => {
    if (!effectiveService) return;
    const records = personasList.map(p => ({
      servicio_id: effectiveService,
      persona_id: p.id,
      presente: !!localAttendance[p.id],
    }));
    try {
      await upsertAsistencia.mutateAsync(records);
      toast.success("Asistencia guardada correctamente", {
        description: `${currentService?.nombre} — ${Object.values(localAttendance).filter(Boolean).length} presentes`,
      });
    } catch (err: any) {
      toast.error("Error al guardar asistencia", { description: err.message });
    }
  };

  const handleServiceChange = (id: string) => {
    setSelectedService(id);
    setInitialized(null);
  };

  const filteredPersonas = personasList.filter(p => {
    const matchesSearch = `${p.nombres} ${p.apellidos}`.toLowerCase().includes(searchTerm.toLowerCase());
    if (filterStatus === "present") return matchesSearch && localAttendance[p.id];
    if (filterStatus === "absent") return matchesSearch && !localAttendance[p.id];
    return matchesSearch;
  });

  const totalPresent = Object.values(localAttendance).filter(Boolean).length;
  const totalAbsent = personasList.length - totalPresent;
  const attendanceRate = personasList.length > 0 ? Math.round((totalPresent / personasList.length) * 100) : 0;

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader title="Servicios" description="Gestión de cultos, reuniones y asistencia">
        <ExportDropdown
          title="Servicios"
          filename="servicios"
          columns={[
            { header: "Nombre", key: "nombre" },
            { header: "Tipo", key: "tipo" },
            { header: "Fecha", key: "fecha" },
            { header: "Hora", key: "hora" },
            { header: "Predicador", key: "predicador" },
            { header: "Estado", key: "estado" },
          ]}
          data={servicios || []}
        />
        <ServicioFormDialog />
      </PageHeader>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        <button onClick={() => setActiveTab("servicios")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === "servicios" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
          <Church className="h-4 w-4 inline mr-1.5" />Servicios
        </button>
        <button onClick={() => setActiveTab("asistencia")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === "asistencia" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
          <ClipboardCheck className="h-4 w-4 inline mr-1.5" />Asistencia
        </button>
      </div>

      {editing && <ServicioFormDialog initialData={editing} onClose={() => setEditing(null)} />}

      {activeTab === "servicios" && (
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
            {
              key: "actions", label: "",
              render: (s: any) => (
                <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditing({ ...s })}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <DeleteConfirmDialog onConfirm={() => handleDelete(s.id)} title="¿Eliminar servicio?" description={`Se eliminará "${s.nombre}" permanentemente.`} />
                </div>
              )
            },
          ]}
        />
      )}

      {activeTab === "asistencia" && (
        <div className="space-y-6">
          {/* Service selector */}
          <div className="bg-card rounded-lg border p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                <Church className="h-5 w-5 text-info" />
              </div>
              <div className="flex-1">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Servicio</label>
                <Select value={effectiveService || ""} onValueChange={handleServiceChange}>
                  <SelectTrigger className="mt-1 border-0 bg-muted/30 h-9">
                    <SelectValue placeholder="Seleccionar servicio" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviciosList.map(s => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.nombre} — {s.fecha}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => markAll(true)} className="text-xs gap-1.5">
                <Check className="h-3.5 w-3.5" /> Marcar todos
              </Button>
              <Button variant="outline" size="sm" onClick={() => markAll(false)} className="text-xs gap-1.5">
                <X className="h-3.5 w-3.5" /> Desmarcar todos
              </Button>
              <Button size="sm" onClick={saveAttendance} disabled={upsertAsistencia.isPending} className="text-xs gap-1.5 bg-primary text-primary-foreground">
                <Save className="h-3.5 w-3.5" /> {upsertAsistencia.isPending ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </div>

          {effectiveService && (
            <ExportDropdown
              title={`Asistencia - ${currentService?.nombre || ""}`}
              filename={`asistencia-${currentService?.nombre || "servicio"}`}
              columns={[
                { header: "Nombres", key: "nombres" },
                { header: "Apellidos", key: "apellidos" },
                { header: "Tipo", key: "tipo_persona" },
                { header: "Presente", key: "presente" },
              ]}
              data={filteredPersonas.map(p => ({
                nombres: p.nombres,
                apellidos: p.apellidos,
                tipo_persona: p.tipo_persona,
                presente: localAttendance[p.id] ? "Sí" : "No",
              }))}
            />
          )}

          {/* Metrics row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <MetricCard title="Presentes" value={totalPresent} icon={Check} variant="success" />
            <MetricCard title="Ausentes" value={totalAbsent} icon={X} variant="default" />
            <MetricCard title="Tasa de Asistencia" value={`${attendanceRate}%`} icon={TrendingUp} variant="accent" />
          </div>

          {/* Attendance list */}
          <div className="bg-card rounded-lg border">
            <div className="p-4 border-b flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar persona..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-9 h-9 bg-muted/30 border-0"
                />
              </div>
              <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as any)}>
                <SelectTrigger className="w-44 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="present">Presentes</SelectItem>
                  <SelectItem value="absent">Ausentes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loadingAsistencia ? (
              <div className="p-8 text-center text-muted-foreground">Cargando...</div>
            ) : (
              <div className="divide-y">
                {filteredPersonas.map(p => {
                  const isPresent = !!localAttendance[p.id];
                  return (
                    <div
                      key={p.id}
                      className="flex items-center justify-between px-4 py-3 hover:bg-muted/20 transition-colors cursor-pointer"
                      onClick={() => toggleAttendance(p.id)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                            {p.nombres[0]}{p.apellidos[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{p.nombres} {p.apellidos}</p>
                          <p className="text-xs text-muted-foreground">{p.tipo_persona}</p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleAttendance(p.id); }}
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 shrink-0",
                          isPresent
                            ? "bg-success text-success-foreground shadow-sm"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        )}
                      >
                        {isPresent ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
                      </button>
                    </div>
                  );
                })}
                {filteredPersonas.length === 0 && (
                  <div className="px-4 py-12 text-center text-muted-foreground text-sm">
                    No se encontraron personas
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

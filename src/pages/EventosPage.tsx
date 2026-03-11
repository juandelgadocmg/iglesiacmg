import { useState } from "react";
import PageHeader from "@/components/shared/PageHeader";
import DataTable from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import EventoFormDialog from "@/components/forms/EventoFormDialog";
import InscripcionFormDialog from "@/components/forms/InscripcionFormDialog";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import { CalendarDays, Pencil, FileText, CheckCircle, XCircle, Trash2 } from "lucide-react";
import { useEventos, useDeleteEvento, useInscripciones, useUpdateInscripcion, useDeleteInscripcion } from "@/hooks/useDatabase";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import ExportDropdown from "@/components/shared/ExportDropdown";

export default function EventosPage() {
  const { data: eventos, isLoading } = useEventos();
  const deleteEvento = useDeleteEvento();
  const [editing, setEditing] = useState<any>(null);
  const [selectedEvento, setSelectedEvento] = useState<string | null>(null);
  const { data: inscripciones, isLoading: loadingInsc } = useInscripciones(selectedEvento);
  const updateInscripcion = useUpdateInscripcion();
  const deleteInscripcion = useDeleteInscripcion();

  if (isLoading) {
    return (
      <div className="animate-fade-in space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  const tableData = (eventos || []).map(e => ({
    ...e,
    inscritosCount: (e as any).inscripciones?.[0]?.count || 0,
  }));

  const handleDelete = async (id: string) => {
    try { await deleteEvento.mutateAsync(id); toast.success("Evento eliminado"); }
    catch { toast.error("Error al eliminar"); }
  };

  const eventoActual = eventos?.find(e => e.id === selectedEvento);
  const totalInscritos = inscripciones?.length || 0;
  const confirmados = inscripciones?.filter(i => i.confirmado).length || 0;

  const handleConfirm = async (id: string, confirmado: boolean) => {
    try { await updateInscripcion.mutateAsync({ id, confirmado }); toast.success(confirmado ? "Confirmado" : "Confirmación removida"); }
    catch { toast.error("Error"); }
  };

  const handleDeleteInsc = async (id: string) => {
    try { await deleteInscripcion.mutateAsync(id); toast.success("Inscripción eliminada"); }
    catch { toast.error("Error"); }
  };

  const handlePago = async (id: string, estado: string) => {
    try { await updateInscripcion.mutateAsync({ id, estado_pago: estado }); toast.success("Estado actualizado"); }
    catch { toast.error("Error"); }
  };

  const inscTableData = (inscripciones || []).map(i => ({
    ...i,
    personaNombre: `${(i as any).personas?.nombres || ""} ${(i as any).personas?.apellidos || ""}`.trim(),
    eventoNombre: (i as any).eventos?.nombre || "",
  }));

  return (
    <div className="animate-fade-in">
      <PageHeader title="Eventos" description="Gestión de actividades especiales e inscripciones">
        <ExportDropdown title="Eventos" filename="eventos" columns={[
          { header: "Nombre", key: "nombre" }, { header: "Tipo", key: "tipo" },
          { header: "Fecha Inicio", key: "fecha_inicio" }, { header: "Lugar", key: "lugar" },
          { header: "Inscritos", key: "inscritosCount" }, { header: "Estado", key: "estado" },
        ]} data={tableData} />
        <EventoFormDialog />
      </PageHeader>

      {editing && <EventoFormDialog initialData={editing} onClose={() => setEditing(null)} />}

      <Tabs defaultValue="eventos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="eventos">Eventos</TabsTrigger>
          <TabsTrigger value="inscripciones">Inscripciones</TabsTrigger>
        </TabsList>

        <TabsContent value="eventos">
          <DataTable
            data={tableData} searchKey="nombre" searchPlaceholder="Buscar evento..."
            filterKey="estado" filterPlaceholder="Estado"
            filterOptions={[
              { value: "Próximo", label: "Próximo" },
              { value: "En curso", label: "En curso" },
              { value: "Finalizado", label: "Finalizado" },
            ]}
            columns={[
              {
                key: "nombre", label: "Evento",
                render: (e: any) => (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                      <CalendarDays className="h-4 w-4 text-accent" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{e.nombre}</p>
                      <p className="text-xs text-muted-foreground">{e.tipo || "—"}</p>
                    </div>
                  </div>
                )
              },
              { key: "fecha_inicio", label: "Fecha", render: (e: any) => `${e.fecha_inicio} — ${e.fecha_fin || ""}` },
              { key: "lugar", label: "Lugar", render: (e: any) => e.lugar || "—" },
              { key: "inscritosCount", label: "Inscritos", render: (e: any) => <span className="font-semibold">{e.inscritosCount}/{e.cupos || "∞"}</span> },
              { key: "estado", label: "Estado", render: (e: any) => <StatusBadge status={e.estado} /> },
              {
                key: "actions", label: "",
                render: (e: any) => (
                  <div className="flex items-center gap-1" onClick={ev => ev.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditing({ ...e })}><Pencil className="h-4 w-4" /></Button>
                    <DeleteConfirmDialog onConfirm={() => handleDelete(e.id)} title="¿Eliminar evento?" description={`Se eliminará "${e.nombre}" permanentemente.`} />
                  </div>
                )
              },
            ]}
          />
        </TabsContent>

        <TabsContent value="inscripciones">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-1 max-w-md">
                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Seleccionar evento</label>
                <Select value={selectedEvento || ""} onValueChange={v => setSelectedEvento(v)}>
                  <SelectTrigger><SelectValue placeholder="Elige un evento..." /></SelectTrigger>
                  <SelectContent>
                    {(eventos || []).map(e => (
                      <SelectItem key={e.id} value={e.id}>{e.nombre} — {e.fecha_inicio}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedEvento && eventoActual && (
                <div className="flex gap-3 mt-4 sm:mt-6">
                  <div className="bg-card border rounded-lg px-4 py-2 text-center">
                    <p className="text-xs text-muted-foreground">Inscritos</p>
                    <p className="text-lg font-bold text-foreground">{totalInscritos}{eventoActual.cupos ? `/${eventoActual.cupos}` : ""}</p>
                  </div>
                  <div className="bg-card border rounded-lg px-4 py-2 text-center">
                    <p className="text-xs text-muted-foreground">Confirmados</p>
                    <p className="text-lg font-bold text-primary">{confirmados}</p>
                  </div>
                </div>
              )}
              {selectedEvento && <div className="mt-4 sm:mt-6"><InscripcionFormDialog eventoId={selectedEvento} /></div>}
            </div>

            {!selectedEvento ? (
              <div className="bg-card rounded-lg border p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Selecciona un evento</h3>
                <p className="text-muted-foreground text-sm">Elige un evento para ver y gestionar sus inscripciones.</p>
              </div>
            ) : loadingInsc ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <DataTable
                data={inscTableData} searchKey="personaNombre" searchPlaceholder="Buscar persona..."
                filterKey="estado_pago" filterPlaceholder="Estado de pago"
                filterOptions={[
                  { value: "Pendiente", label: "Pendiente" },
                  { value: "Pagado", label: "Pagado" },
                  { value: "Exento", label: "Exento" },
                ]}
                columns={[
                  { key: "personaNombre", label: "Persona", render: (i: any) => <span className="font-medium text-sm">{i.personaNombre || "Sin nombre"}</span> },
                  { key: "created_at", label: "Fecha", render: (i: any) => new Date(i.created_at).toLocaleDateString("es") },
                  {
                    key: "confirmado", label: "Confirmado",
                    render: (i: any) => (
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleConfirm(i.id, !i.confirmado); }} className="gap-1.5">
                        {i.confirmado ? <><CheckCircle className="h-4 w-4 text-primary" /> Sí</> : <><XCircle className="h-4 w-4 text-muted-foreground" /> No</>}
                      </Button>
                    )
                  },
                  {
                    key: "estado_pago", label: "Pago",
                    render: (i: any) => (
                      <Select value={i.estado_pago || "Pendiente"} onValueChange={v => handlePago(i.id, v)}>
                        <SelectTrigger className="h-8 w-28 text-xs" onClick={e => e.stopPropagation()}><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pendiente">Pendiente</SelectItem>
                          <SelectItem value="Pagado">Pagado</SelectItem>
                          <SelectItem value="Exento">Exento</SelectItem>
                        </SelectContent>
                      </Select>
                    )
                  },
                  {
                    key: "actions", label: "",
                    render: (i: any) => (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={(e) => { e.stopPropagation(); handleDeleteInsc(i.id); }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )
                  },
                ]}
              />
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

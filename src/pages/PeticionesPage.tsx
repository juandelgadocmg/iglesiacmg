import { useState, useMemo } from "react";
import PageHeader from "@/components/shared/PageHeader";
import MetricCard from "@/components/shared/MetricCard";
import StatusBadge from "@/components/shared/StatusBadge";
import PeticionFormDialog from "@/components/forms/PeticionFormDialog";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import { usePeticiones, useDeletePeticion, useUpdatePeticion } from "@/hooks/usePeticiones";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  HandHeart, Search, Pencil, Clock, CheckCircle2,
  AlertTriangle, Archive, Heart, Users
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { toast } from "sonner";
import { format, parseISO, isPast } from "date-fns";
import { es } from "date-fns/locale";
import ExportDropdown from "@/components/shared/ExportDropdown";

const ESTADOS = ["Todos", "Pendiente", "En oración", "Respondida", "Archivada"];
const PIE_COLORS = ["hsl(var(--warning))", "hsl(var(--info))", "hsl(var(--success))", "hsl(var(--muted-foreground))"];

const prioridadColor: Record<string, string> = {
  Baja: "bg-muted text-muted-foreground",
  Normal: "bg-info/10 text-info",
  Alta: "bg-warning/10 text-warning",
  Urgente: "bg-destructive/10 text-destructive",
};

export default function PeticionesPage() {
  const { data: peticiones, isLoading } = usePeticiones();
  const deletePeticion = useDeletePeticion();
  const updatePeticion = useUpdatePeticion();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("Todos");
  const [editing, setEditing] = useState<any>(null);

  const filtered = useMemo(() => {
    if (!peticiones) return [];
    return peticiones.filter((p: any) => {
      if (tab !== "Todos" && p.estado !== tab) return false;
      if (search) {
        const q = search.toLowerCase();
        return p.titulo.toLowerCase().includes(q) ||
          p.personas?.nombres?.toLowerCase().includes(q) ||
          p.personas?.apellidos?.toLowerCase().includes(q);
      }
      return true;
    });
  }, [peticiones, tab, search]);

  const counts = useMemo(() => {
    if (!peticiones) return { pendiente: 0, enOracion: 0, respondida: 0, archivada: 0 };
    return {
      pendiente: peticiones.filter((p: any) => p.estado === "Pendiente").length,
      enOracion: peticiones.filter((p: any) => p.estado === "En oración").length,
      respondida: peticiones.filter((p: any) => p.estado === "Respondida").length,
      archivada: peticiones.filter((p: any) => p.estado === "Archivada").length,
    };
  }, [peticiones]);

  const pieData = [
    { name: "Pendiente", value: counts.pendiente },
    { name: "En oración", value: counts.enOracion },
    { name: "Respondida", value: counts.respondida },
    { name: "Archivada", value: counts.archivada },
  ].filter(d => d.value > 0);

  const handleDelete = async (id: string) => {
    await deletePeticion.mutateAsync(id);
    toast.success("Petición eliminada");
  };

  const handleMarkResponded = async (id: string) => {
    await updatePeticion.mutateAsync({ id, estado: "Respondida", fecha_respuesta: new Date().toISOString().split("T")[0] });
    toast.success("Petición marcada como respondida");
  };

  const exportData = (filtered as any[]).map(p => ({
    titulo: p.titulo,
    persona: p.personas ? `${p.personas.nombres} ${p.personas.apellidos}` : "Sin asignar",
    estado: p.estado,
    prioridad: p.prioridad,
    fecha_seguimiento: p.fecha_seguimiento || "",
    fecha: p.created_at ? format(parseISO(p.created_at), "dd/MM/yyyy") : "",
  }));

  if (isLoading) {
    return (
      <div className="animate-fade-in space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader title="Peticiones de Oración" description="Seguimiento y gestión de peticiones de oración de la congregación">
        <ExportDropdown
          title="Peticiones de Oración"
          filename="peticiones-oracion"
          columns={[
            { header: "Título", key: "titulo" },
            { header: "Persona", key: "persona" },
            { header: "Estado", key: "estado" },
            { header: "Prioridad", key: "prioridad" },
            { header: "Seguimiento", key: "fecha_seguimiento" },
            { header: "Fecha", key: "fecha" },
          ]}
          data={exportData}
        />
        <PeticionFormDialog />
      </PageHeader>

      {editing && <PeticionFormDialog initialData={editing} onClose={() => setEditing(null)} />}

      {/* Metrics + Chart */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard title="Pendientes" value={counts.pendiente} icon={Clock} variant="accent" />
        <MetricCard title="En Oración" value={counts.enOracion} icon={HandHeart} variant="info" />
        <MetricCard title="Respondidas" value={counts.respondida} icon={CheckCircle2} variant="success" />
        <MetricCard title="Archivadas" value={counts.archivada} icon={Archive} />
        <Card>
          <CardContent className="pt-4 pb-2">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={100}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={25} outerRadius={42} dataKey="value" strokeWidth={2} stroke="hsl(var(--card))">
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number, name: string) => [v, name]} contentStyle={{ borderRadius: 8, fontSize: 11, border: "1px solid hsl(var(--border))" }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[100px] flex items-center justify-center text-muted-foreground text-xs">Sin datos</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar petición o persona..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          {ESTADOS.map(e => <TabsTrigger key={e} value={e}>{e}</TabsTrigger>)}
        </TabsList>
      </Tabs>

      {/* Cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No se encontraron peticiones.</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p: any) => (
            <div key={p.id} className="rounded-xl border bg-card p-5 space-y-3 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate">{p.titulo}</h3>
                  {p.personas && (
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                      <Users className="h-3 w-3" /> {p.personas.nombres} {p.personas.apellidos}
                    </p>
                  )}
                </div>
                <StatusBadge status={p.estado} />
              </div>

              {p.descripcion && <p className="text-sm text-muted-foreground line-clamp-2">{p.descripcion}</p>}

              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={prioridadColor[p.prioridad] || ""} variant="secondary">{p.prioridad}</Badge>
                {p.fecha_seguimiento && (
                  <span className={`text-xs flex items-center gap-1 ${isPast(parseISO(p.fecha_seguimiento)) ? "text-destructive" : "text-muted-foreground"}`}>
                    <Clock className="h-3 w-3" />
                    {format(parseISO(p.fecha_seguimiento), "dd MMM yyyy", { locale: es })}
                  </span>
                )}
              </div>

              {p.notas_seguimiento && (
                <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-2 line-clamp-2">{p.notas_seguimiento}</p>
              )}

              <div className="flex items-center gap-1 pt-1">
                {p.estado !== "Respondida" && (
                  <Button size="sm" variant="outline" className="gap-1 text-success" onClick={() => handleMarkResponded(p.id)}>
                    <CheckCircle2 className="h-3.5 w-3.5" /> Respondida
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditing({ ...p })}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <DeleteConfirmDialog onConfirm={() => handleDelete(p.id)} title="¿Eliminar petición?" description={`Se eliminará "${p.titulo}" permanentemente.`} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

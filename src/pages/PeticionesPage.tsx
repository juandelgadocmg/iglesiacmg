import { useState, useMemo } from "react";
import PageHeader from "@/components/shared/PageHeader";
import MetricCard from "@/components/shared/MetricCard";
import StatusBadge from "@/components/shared/StatusBadge";
import PeticionFormDialog from "@/components/forms/PeticionFormDialog";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import { usePeticiones, useDeletePeticion, useUpdatePeticion } from "@/hooks/usePeticiones";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  HandHeart, Search, Pencil, Clock, CheckCircle2,
  Archive, Users, FileText, LayoutGrid, CalendarRange, X
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { toast } from "sonner";
import { format, parseISO, isPast, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { es } from "date-fns/locale";
import ExportDropdown from "@/components/shared/ExportDropdown";

const ESTADOS = ["Todos", "Pendiente", "En oración", "Respondida", "Archivada"];
const PIE_COLORS = ["hsl(var(--warning))", "hsl(var(--info))", "hsl(var(--success))", "hsl(var(--muted-foreground))"];

const TIPOS_PETICION = ["Financiera", "Familiar", "Sanidad", "Emocional", "Espiritual", "Otros"];

const estadoColor: Record<string, string> = {
  Pendiente: "bg-warning/10 text-warning border-warning/30",
  "En oración": "bg-info/10 text-info border-info/30",
  Respondida: "bg-success/10 text-success border-success/30",
  Archivada: "bg-muted text-muted-foreground border-border",
};

const prioridadColor: Record<string, string> = {
  Baja: "bg-muted text-muted-foreground",
  Normal: "bg-info/10 text-info",
  Alta: "bg-warning/10 text-warning",
  Urgente: "bg-destructive/10 text-destructive",
};

type ViewMode = "panel" | "gestionar";

export default function PeticionesPage() {
  const { data: peticiones, isLoading } = usePeticiones();
  const deletePeticion = useDeletePeticion();
  const updatePeticion = useUpdatePeticion();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("Todos");
  const [editing, setEditing] = useState<any>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("panel");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [tipoFilter, setTipoFilter] = useState("Todos");

  const hasDateFilter = !!fechaDesde || !!fechaHasta;

  const clearFilters = () => {
    setFechaDesde("");
    setFechaHasta("");
    setTipoFilter("Todos");
    setSearch("");
    setTab("Todos");
  };

  const filtered = useMemo(() => {
    if (!peticiones) return [];
    return peticiones.filter((p: any) => {
      if (tab !== "Todos" && p.estado !== tab) return false;
      if (tipoFilter !== "Todos" && p.tipo !== tipoFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!p.titulo.toLowerCase().includes(q) &&
          !p.personas?.nombres?.toLowerCase().includes(q) &&
          !p.personas?.apellidos?.toLowerCase().includes(q)) return false;
      }
      // Date filter on created_at
      if (fechaDesde || fechaHasta) {
        if (!p.created_at) return false;
        try {
          const date = parseISO(p.created_at);
          if (fechaDesde && date < startOfDay(parseISO(fechaDesde))) return false;
          if (fechaHasta && date > endOfDay(parseISO(fechaHasta))) return false;
        } catch { return false; }
      }
      return true;
    });
  }, [peticiones, tab, search, tipoFilter, fechaDesde, fechaHasta]);

  const counts = useMemo(() => {
    if (!peticiones) return { pendiente: 0, enOracion: 0, respondida: 0, archivada: 0, total: 0 };
    return {
      pendiente: peticiones.filter((p: any) => p.estado === "Pendiente").length,
      enOracion: peticiones.filter((p: any) => p.estado === "En oración").length,
      respondida: peticiones.filter((p: any) => p.estado === "Respondida").length,
      archivada: peticiones.filter((p: any) => p.estado === "Archivada").length,
      total: peticiones.length,
    };
  }, [peticiones]);

  const tipoCounts = useMemo(() => {
    if (!peticiones) return {};
    const map: Record<string, number> = {};
    peticiones.forEach((p: any) => {
      const tipo = p.tipo || "Sin tipo";
      map[tipo] = (map[tipo] || 0) + 1;
    });
    return map;
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
    tipo: p.tipo || "Sin tipo",
    estado: p.estado,
    prioridad: p.prioridad,
    descripcion: p.descripcion || "",
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
          title={`Peticiones de Oración${hasDateFilter ? ` (${fechaDesde || "inicio"} al ${fechaHasta || "hoy"})` : ""}`}
          filename={`peticiones-oracion${fechaDesde ? `-${fechaDesde}` : ""}${fechaHasta ? `-al-${fechaHasta}` : ""}`}
          columns={[
            { header: "Título", key: "titulo" },
            { header: "Persona", key: "persona" },
            { header: "Tipo", key: "tipo" },
            { header: "Estado", key: "estado" },
            { header: "Prioridad", key: "prioridad" },
            { header: "Descripción", key: "descripcion" },
            { header: "Seguimiento", key: "fecha_seguimiento" },
            { header: "Fecha", key: "fecha" },
          ]}
          data={exportData}
        />
        <PeticionFormDialog />
      </PageHeader>

      {editing && <PeticionFormDialog initialData={editing} onClose={() => setEditing(null)} />}

      {/* Date + tipo filters */}
      <div className="rounded-xl border bg-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium">
            <CalendarRange className="h-4 w-4 text-primary" />
            Filtrar por fecha de creación
          </div>
          {(hasDateFilter || tipoFilter !== "Todos") && (
            <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs text-destructive" onClick={clearFilters}>
              <X className="h-3 w-3" /> Limpiar filtros
            </Button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground font-medium">Desde</label>
            <Input type="date" value={fechaDesde} onChange={e => setFechaDesde(e.target.value)} className="h-9 text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground font-medium">Hasta</label>
            <Input type="date" value={fechaHasta} onChange={e => setFechaHasta(e.target.value)} className="h-9 text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground font-medium">Tipo de petición</label>
            <Select value={tipoFilter} onValueChange={setTipoFilter}>
              <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todos los tipos</SelectItem>
                {TIPOS_PETICION.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        {(hasDateFilter || tipoFilter !== "Todos") && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-primary/5 rounded-lg px-3 py-2">
            <span className="font-semibold text-primary">{filtered.length}</span>
            petición(es) encontradas con los filtros aplicados
            {hasDateFilter && <span>· {fechaDesde || "inicio"} → {fechaHasta || "hoy"}</span>}
            {tipoFilter !== "Todos" && <span>· Tipo: {tipoFilter}</span>}
          </div>
        )}
      </div>

      {/* View mode toggle */}
      <div className="flex items-center gap-2">
        <Button
          variant={viewMode === "panel" ? "default" : "outline"}
          size="sm"
          className="gap-1.5"
          onClick={() => setViewMode("panel")}
        >
          <FileText className="h-4 w-4" /> Panel
        </Button>
        <Button
          variant={viewMode === "gestionar" ? "default" : "outline"}
          size="sm"
          className="gap-1.5"
          onClick={() => setViewMode("gestionar")}
        >
          <LayoutGrid className="h-4 w-4" /> Gestionar
        </Button>
      </div>

      {viewMode === "panel" ? (
        <PanelView
          counts={counts}
          pieData={pieData}
          tipoCounts={tipoCounts}
          tab={tab}
          setTab={setTab}
          search={search}
          setSearch={setSearch}
          filtered={filtered}
        />
      ) : (
        <GestionarView
          filtered={filtered}
          tab={tab}
          setTab={setTab}
          search={search}
          setSearch={setSearch}
          onEdit={setEditing}
          onDelete={handleDelete}
          onMarkResponded={handleMarkResponded}
        />
      )}
    </div>
  );
}

// ============ PANEL VIEW ============
function PanelView({ counts, pieData, tipoCounts, tab, setTab, search, setSearch, filtered }: any) {
  return (
    <div className="space-y-6">
      {/* Status tabs with counts */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full justify-start">
          {ESTADOS.map(e => {
            const count = e === "Todos" ? counts.total :
              e === "Pendiente" ? counts.pendiente :
              e === "En oración" ? counts.enOracion :
              e === "Respondida" ? counts.respondida : counts.archivada;
            return (
              <TabsTrigger key={e} value={e} className="gap-1.5">
                {e}
                <Badge variant="secondary" className="h-5 min-w-5 text-[10px] px-1.5">{count}</Badge>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>

      {/* Metrics + Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="pt-4 pb-2">
              <h3 className="text-sm font-semibold mb-2 text-foreground">Gráfica General</h3>
              <div className="text-center mb-1">
                <span className="text-2xl font-bold text-foreground">{counts.total}</span>
                <p className="text-xs text-muted-foreground">Cantidad Peticiones</p>
              </div>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} dataKey="value" strokeWidth={2} stroke="hsl(var(--card))">
                      {pieData.map((_: any, i: number) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v: number, name: string) => [v, name]} contentStyle={{ borderRadius: 8, fontSize: 11, border: "1px solid hsl(var(--border))" }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[160px] flex items-center justify-center text-muted-foreground text-xs">Sin datos</div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardContent className="pt-4">
              <h3 className="text-sm font-semibold mb-3 text-foreground">Peticiones por Categoría</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Categoría</TableHead>
                    <TableHead className="text-right">Cantidad</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(tipoCounts).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center text-muted-foreground text-sm py-6">
                        No hay categorías registradas
                      </TableCell>
                    </TableRow>
                  ) : (
                    Object.entries(tipoCounts).map(([tipo, count]) => (
                      <TableRow key={tipo}>
                        <TableCell className="font-medium">{tipo}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant="secondary">{count as number}</Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar petición o persona..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      {/* Data table */}
      <div className="bg-card border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Persona</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Prioridad</TableHead>
              <TableHead>Fecha</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">No se encontraron peticiones</TableCell>
              </TableRow>
            ) : (
              filtered.map((p: any, i: number) => (
                <TableRow key={p.id}>
                  <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                  <TableCell className="font-medium">{p.titulo}</TableCell>
                  <TableCell>{p.personas ? `${p.personas.nombres} ${p.personas.apellidos}` : "—"}</TableCell>
                  <TableCell><Badge variant="outline" className="text-[10px]">{p.tipo || "Sin tipo"}</Badge></TableCell>
                  <TableCell><StatusBadge status={p.estado} /></TableCell>
                  <TableCell><Badge className={prioridadColor[p.prioridad] || ""} variant="secondary">{p.prioridad}</Badge></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{p.created_at ? format(parseISO(p.created_at), "dd/MM/yyyy") : "—"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-muted-foreground">{filtered.length} de {counts.total} peticiones</p>
    </div>
  );
}

// ============ GESTIONAR VIEW (Card Grid) ============
function GestionarView({ filtered, tab, setTab, search, setSearch, onEdit, onDelete, onMarkResponded }: any) {
  return (
    <div className="space-y-6">
      {/* Status tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          {ESTADOS.map(e => <TabsTrigger key={e} value={e}>{e}</TabsTrigger>)}
        </TabsList>
      </Tabs>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar petición o persona..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No se encontraron peticiones.</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p: any) => (
            <div key={p.id} className={`rounded-xl border-2 bg-card p-5 space-y-3 shadow-sm hover:shadow-md transition-shadow ${estadoColor[p.estado] || "border-border"}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate">{p.titulo}</h3>
                  {p.personas && (
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                      <Users className="h-3 w-3" /> {p.personas.nombres} {p.personas.apellidos}
                    </p>
                  )}
                  {p.tipo && (
                    <Badge variant="outline" className="mt-1 text-[10px]">{p.tipo}</Badge>
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
                {p.created_at && (
                  <span className="text-xs text-muted-foreground">
                    Inicio: {format(parseISO(p.created_at), "dd/MM/yyyy")}
                  </span>
                )}
              </div>

              {p.notas_seguimiento && (
                <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-2 line-clamp-2">
                  Petición: {p.notas_seguimiento}
                </p>
              )}

              {/* Respondida checkbox */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={p.estado === "Respondida"}
                  onChange={() => p.estado !== "Respondida" && onMarkResponded(p.id)}
                  className="rounded"
                  disabled={p.estado === "Respondida"}
                />
                <span className="text-xs text-muted-foreground">Petición</span>
              </div>

              <div className="flex items-center gap-1 pt-1">
                {p.estado !== "Respondida" && (
                  <Button size="sm" className="gap-1 text-xs bg-primary text-primary-foreground" onClick={() => onMarkResponded(p.id)}>
                    <CheckCircle2 className="h-3.5 w-3.5" /> Respondida
                  </Button>
                )}
                <DeleteConfirmDialog
                  onConfirm={() => onDelete(p.id)}
                  title="¿Eliminar petición?"
                  description={`Se eliminará la petición "${p.titulo}" permanentemente.`}
                />
                <Button variant="ghost" size="icon" className="h-8 w-8 ml-auto" onClick={() => onEdit({ ...p })}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground">1 – {filtered.length} de {filtered.length} registros.</p>
    </div>
  );
}

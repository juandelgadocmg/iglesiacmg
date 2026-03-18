import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "@/components/shared/PageHeader";
import StatusBadge from "@/components/shared/StatusBadge";
import PersonaFormDialog from "@/components/forms/PersonaFormDialog";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import MetricCard from "@/components/shared/MetricCard";
import { usePersonas, useDeletePersona } from "@/hooks/useDatabase";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Pencil, Users, UserPlus, Search, Phone, Mail, MapPin,
  Church, Calendar
} from "lucide-react";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import ExportDropdown from "@/components/shared/ExportDropdown";
import ImportPersonasDialog from "@/components/forms/ImportPersonasDialog";

const TIPOS = [
  "Todos", "Miembro", "Visitante", "Líder", "Servidor", "CDP",
  "Iglesia Virtual", "Estudiante Seminario", "Discípulo",
  "Maestro Seminario", "Miembro No Activo", "Líder Casa de Paz",
  "Líder de Red", "Mentor", "Pastor Principal",
];

const tipoColor: Record<string, string> = {
  Miembro: "bg-primary/10 text-primary",
  Visitante: "bg-info/10 text-info",
  Líder: "bg-accent/10 text-accent",
  Servidor: "bg-success/10 text-success",
  CDP: "bg-warning/10 text-warning",
  "Iglesia Virtual": "bg-muted text-muted-foreground",
  "Estudiante Seminario": "bg-info/10 text-info",
  "Discípulo": "bg-primary/10 text-primary",
  "Maestro Seminario": "bg-accent/10 text-accent",
  "Miembro No Activo": "bg-destructive/10 text-destructive",
  "Líder Casa de Paz": "bg-success/10 text-success",
  "Líder de Red": "bg-accent/10 text-accent",
  "Mentor": "bg-primary/10 text-primary",
  "Pastor Principal": "bg-accent/10 text-accent",
};

export default function PersonasPage() {
  const navigate = useNavigate();
  const { data: personas, isLoading } = usePersonas();
  const deletePersona = useDeletePersona();
  const [editing, setEditing] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [tipoFilter, setTipoFilter] = useState("Todos");
  const [estadoFilter, setEstadoFilter] = useState("all");

  const filtered = useMemo(() => {
    if (!personas) return [];
    return personas.filter((p: any) => {
      if (tipoFilter !== "Todos" && p.tipo_persona !== tipoFilter) return false;
      if (estadoFilter !== "all" && p.estado_iglesia !== estadoFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return `${p.nombres} ${p.apellidos}`.toLowerCase().includes(q) ||
          p.email?.toLowerCase().includes(q) ||
          p.telefono?.includes(q);
      }
      return true;
    });
  }, [personas, search, tipoFilter, estadoFilter]);

  const counts = useMemo(() => {
    if (!personas) return {} as Record<string, number>;
    const c: Record<string, number> = { total: personas.length };
    TIPOS.filter(t => t !== "Todos").forEach(t => {
      c[t] = personas.filter((p: any) => p.tipo_persona === t).length;
    });
    return c;
  }, [personas]);

  const handleDelete = async (id: string) => {
    try { await deletePersona.mutateAsync(id); toast.success("Persona eliminada"); }
    catch { toast.error("Error al eliminar"); }
  };

  const tableData = (personas || []).map(p => ({
    ...p,
    grupoNombre: (p as any).grupos?.nombre || "",
  }));

  if (isLoading) {
    return (
      <div className="animate-fade-in space-y-4">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader title="Personas" description="Gestión de miembros, visitantes, líderes y servidores">
        <ExportDropdown title="Personas" filename="personas" columns={[
          { header: "Nombres", key: "nombres" }, { header: "Apellidos", key: "apellidos" },
          { header: "Teléfono", key: "telefono" }, { header: "Email", key: "email" },
          { header: "Tipo", key: "tipo_persona" }, { header: "Grupo", key: "grupoNombre" },
          { header: "Estado", key: "estado_iglesia" },
        ]} data={tableData} />
        <ImportPersonasDialog />
        <PersonaFormDialog />
      </PageHeader>

      {editing && <PersonaFormDialog initialData={editing} onClose={() => setEditing(null)} />}

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard title="Total" value={counts.total || 0} icon={Users} />
        <MetricCard title="Miembros" value={counts["Miembro"] || 0} icon={Church} variant="default" />
        <MetricCard title="Visitantes" value={counts["Visitante"] || 0} icon={UserPlus} variant="info" />
        <MetricCard title="Líderes" value={counts["Líder"] || 0} icon={Users} variant="accent" />
        <MetricCard title="Servidores" value={counts["Servidor"] || 0} icon={Users} variant="success" />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por nombre, email o teléfono..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={estadoFilter} onValueChange={setEstadoFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Estado" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="Activo">Activo</SelectItem>
            <SelectItem value="Inactivo">Inactivo</SelectItem>
            <SelectItem value="En proceso">En proceso</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={tipoFilter} onValueChange={setTipoFilter}>
        <TabsList>
          {TIPOS.map(t => <TabsTrigger key={t} value={t}>{t} {t === "Todos" ? `(${counts.total})` : `(${counts[t.toLowerCase() === "miembro" ? "miembros" : t.toLowerCase() === "visitante" ? "visitantes" : t.toLowerCase() === "líder" ? "lideres" : "servidores"] || 0})`}</TabsTrigger>)}
        </TabsList>
      </Tabs>

      {/* Profile Cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No se encontraron personas.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((p: any) => (
            <Card key={p.id} className="overflow-hidden hover:shadow-md transition-shadow group cursor-pointer" onClick={() => navigate(`/personas/${p.id}`)}>
              <CardContent className="p-0">
                {/* Header stripe */}
                <div className={`h-2 ${tipoColor[p.tipo_persona]?.includes("primary") ? "bg-primary" : tipoColor[p.tipo_persona]?.includes("info") ? "bg-info" : tipoColor[p.tipo_persona]?.includes("accent") ? "bg-accent" : "bg-success"}`} />
                <div className="p-4 space-y-3">
                  {/* Avatar + Name */}
                  <div className="flex items-start gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className={`text-sm font-bold ${tipoColor[p.tipo_persona] || "bg-muted text-muted-foreground"}`}>
                        {p.nombres?.[0]}{p.apellidos?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">{p.nombres} {p.apellidos}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className={`text-[10px] ${tipoColor[p.tipo_persona] || ""}`}>{p.tipo_persona}</Badge>
                        <StatusBadge status={p.estado_iglesia} />
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    {p.telefono && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3" /> {p.telefono}
                      </div>
                    )}
                    {p.email && (
                      <div className="flex items-center gap-2 truncate">
                        <Mail className="h-3 w-3 shrink-0" /> <span className="truncate">{p.email}</span>
                      </div>
                    )}
                    {(p as any).grupos?.nombre && (
                      <div className="flex items-center gap-2">
                        <Users className="h-3 w-3" /> {(p as any).grupos.nombre}
                      </div>
                    )}
                    {p.direccion && (
                      <div className="flex items-center gap-2 truncate">
                        <MapPin className="h-3 w-3 shrink-0" /> <span className="truncate">{p.direccion}</span>
                      </div>
                    )}
                    {p.fecha_nacimiento && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" /> {format(parseISO(p.fecha_nacimiento), "dd MMM yyyy", { locale: es })}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 pt-1 border-t opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => setEditing({ ...p })}>
                      <Pencil className="h-3 w-3" /> Editar
                    </Button>
                    <div className="ml-auto">
                      <DeleteConfirmDialog onConfirm={() => handleDelete(p.id)} title="¿Eliminar persona?" description={`Se eliminará a ${p.nombres} ${p.apellidos} permanentemente.`} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

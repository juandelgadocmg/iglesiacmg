import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  useGrupoMiembros, useAddGrupoMiembro, useUpdateMiembroRol,
  useRemoveGrupoMiembro, useSearchPersonas, ROLES_GRUPO,
} from "@/hooks/useGrupoMembers";
import { Search, UserPlus, X, Users, Shield, Home, UserCheck } from "lucide-react";
import { toast } from "sonner";

interface Props {
  grupoId: string;
  grupoNombre: string;
}

const rolIcon = (rol: string) => {
  switch (rol) {
    case "lider": return <Shield className="h-3 w-3" />;
    case "sublider": return <UserCheck className="h-3 w-3" />;
    case "anfitrion": return <Home className="h-3 w-3" />;
    case "colaborador": return <UserCheck className="h-3 w-3" />;
    default: return null;
  }
};

const rolBadgeClass = (rol: string) => {
  switch (rol) {
    case "lider": return "bg-primary/10 text-primary border-primary/30";
    case "sublider": return "bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-950 dark:text-purple-400";
    case "anfitrion": return "bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-400";
    case "colaborador": return "bg-info/10 text-info border-info/30";
    default: return "";
  }
};

export default function GrupoMembersPanel({ grupoId, grupoNombre }: Props) {
  const { data: miembros, isLoading } = useGrupoMiembros(grupoId);
  const addMiembro = useAddGrupoMiembro();
  const updateRol = useUpdateMiembroRol();
  const removeMiembro = useRemoveGrupoMiembro();

  const [searchQuery, setSearchQuery] = useState("");
  const [addingRol, setAddingRol] = useState("asistente");
  const { data: searchResults } = useSearchPersonas(searchQuery);

  const existingIds = new Set((miembros || []).map(m => m.persona_id));

  const filteredSearch = (searchResults || []).filter(p => !existingIds.has(p.id));

  const handleAdd = async (personaId: string) => {
    try {
      await addMiembro.mutateAsync({ grupo_id: grupoId, persona_id: personaId, rol: addingRol });
      toast.success("Miembro agregado al grupo");
      setSearchQuery("");
    } catch (err: any) {
      toast.error(err.message || "Error al agregar miembro");
    }
  };

  const handleRolChange = async (miembroId: string, newRol: string) => {
    try {
      await updateRol.mutateAsync({ id: miembroId, grupo_id: grupoId, rol: newRol });
      toast.success("Rol actualizado");
    } catch {
      toast.error("Error al actualizar rol");
    }
  };

  const handleRemove = async (miembroId: string) => {
    try {
      await removeMiembro.mutateAsync({ id: miembroId, grupo_id: grupoId });
      toast.success("Miembro removido");
    } catch {
      toast.error("Error al remover miembro");
    }
  };

  // Separate equipo de trabajo from asistentes
  const equipo = (miembros || []).filter(m => m.rol !== "asistente");
  const asistentes = (miembros || []).filter(m => m.rol === "asistente");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Integrantes de {grupoNombre}
          </h3>
          <p className="text-sm text-muted-foreground">{(miembros || []).length} miembros</p>
        </div>
      </div>

      {/* Search and add */}
      <div className="rounded-xl border bg-card p-4 space-y-3">
        <p className="text-sm font-medium">Agregar integrante</p>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar persona por nombre o documento..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={addingRol} onValueChange={setAddingRol}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ROLES_GRUPO.map(r => (
                <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Search results */}
        {searchQuery.length >= 2 && filteredSearch.length > 0 && (
          <div className="border rounded-lg divide-y max-h-48 overflow-y-auto">
            {filteredSearch.map(p => (
              <div key={p.id} className="flex items-center gap-3 p-2.5 hover:bg-muted/50 transition-colors">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={p.foto_url || undefined} />
                  <AvatarFallback className="text-[10px]">{p.nombres[0]}{p.apellidos[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{p.nombres} {p.apellidos}</p>
                  <p className="text-xs text-muted-foreground">{p.tipo_persona}</p>
                </div>
                <Button size="sm" variant="outline" className="gap-1 h-7" onClick={() => handleAdd(p.id)} disabled={addMiembro.isPending}>
                  <UserPlus className="h-3.5 w-3.5" /> Agregar
                </Button>
              </div>
            ))}
          </div>
        )}
        {searchQuery.length >= 2 && filteredSearch.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-2">No se encontraron personas disponibles</p>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Cargando miembros...</div>
      ) : (miembros || []).length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-2 opacity-30" />
          <p>Este grupo no tiene integrantes</p>
          <p className="text-xs">Usa el buscador para agregar personas</p>
        </div>
      ) : (
        <>
          {/* Equipo de trabajo */}
          {equipo.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                Equipo de Trabajo ({equipo.length})
              </h4>
              <div className="space-y-1.5">
                {equipo.map(m => (
                  <MiembroRow key={m.id} miembro={m} onRolChange={handleRolChange} onRemove={handleRemove} />
                ))}
              </div>
            </div>
          )}

          {equipo.length > 0 && asistentes.length > 0 && <Separator />}

          {/* Asistentes */}
          {asistentes.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                Asistentes ({asistentes.length})
              </h4>
              <ScrollArea className="max-h-[400px]">
                <div className="space-y-1.5">
                  {asistentes.map(m => (
                    <MiembroRow key={m.id} miembro={m} onRolChange={handleRolChange} onRemove={handleRemove} />
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function MiembroRow({ miembro, onRolChange, onRemove }: {
  miembro: any;
  onRolChange: (id: string, rol: string) => void;
  onRemove: (id: string) => void;
}) {
  const p = miembro.persona;
  if (!p) return null;
  const initials = `${p.nombres?.[0] || ""}${p.apellidos?.[0] || ""}`.toUpperCase();
  const rol = miembro.rol || "asistente";
  const rolLabel = ROLES_GRUPO.find(r => r.value === rol)?.label || "Asistente";

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:shadow-sm transition-shadow">
      <Avatar className="h-9 w-9">
        <AvatarImage src={p.foto_url || undefined} />
        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium truncate">{p.nombres} {p.apellidos}</p>
          <Badge variant="outline" className={`text-[10px] h-5 gap-1 ${rolBadgeClass(rol)}`}>
            {rolIcon(rol)} {rolLabel}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">{p.tipo_persona}{p.telefono ? ` · ${p.telefono}` : ""}</p>
      </div>
      <Select value={rol} onValueChange={(v) => onRolChange(miembro.id, v)}>
        <SelectTrigger className="w-28 h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ROLES_GRUPO.map(r => (
            <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => onRemove(miembro.id)}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

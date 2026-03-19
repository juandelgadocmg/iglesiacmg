import { useMemo } from "react";
import { useGrupos } from "@/hooks/useDatabase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, ChevronRight, Network, Home, Crown } from "lucide-react";

interface HierarchyGroup {
  id: string;
  nombre: string;
  tipo: string;
  red: string | null;
  estado: string;
  lider?: { nombres: string; apellidos: string; foto_url?: string | null } | null;
  miembrosCount: number;
}

const REDES = ["Nissi", "Rohi", "Jireh", "Adonai", "Shaddai", "Elohim"];

export default function GrupoHierarchyView() {
  const { data: grupos, isLoading } = useGrupos();

  const hierarchy = useMemo(() => {
    if (!grupos) return { redes: [], sinRed: [] };

    const mapped: HierarchyGroup[] = grupos.map((g: any) => ({
      id: g.id,
      nombre: g.nombre,
      tipo: g.tipo,
      red: g.red,
      estado: g.estado,
      lider: g.personas ? { nombres: g.personas.nombres, apellidos: g.personas.apellidos, foto_url: null } : null,
      miembrosCount: g.grupo_miembros?.[0]?.count || 0,
    }));

    const redes = REDES.map(red => ({
      nombre: red,
      grupos: mapped.filter(g => g.red === red),
      totalMiembros: mapped.filter(g => g.red === red).reduce((s, g) => s + g.miembrosCount, 0),
    })).filter(r => r.grupos.length > 0);

    const sinRed = mapped.filter(g => !g.red || !REDES.includes(g.red));

    return { redes, sinRed };
  }, [grupos]);

  if (isLoading) {
    return <div className="text-center py-12 text-muted-foreground">Cargando estructura...</div>;
  }

  const totalGrupos = (grupos || []).length;
  const totalRedes = hierarchy.redes.length;

  return (
    <div className="space-y-6">
      {/* Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl border bg-card p-4 text-center">
          <Crown className="h-6 w-6 text-primary mx-auto mb-1" />
          <p className="text-2xl font-bold">1</p>
          <p className="text-xs text-muted-foreground">Equipo Ministerial</p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center">
          <Network className="h-6 w-6 text-info mx-auto mb-1" />
          <p className="text-2xl font-bold">{totalRedes}</p>
          <p className="text-xs text-muted-foreground">Redes</p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center">
          <Home className="h-6 w-6 text-amber-500 mx-auto mb-1" />
          <p className="text-2xl font-bold">{totalGrupos}</p>
          <p className="text-xs text-muted-foreground">Casas de Paz</p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center">
          <Users className="h-6 w-6 text-success mx-auto mb-1" />
          <p className="text-2xl font-bold">
            {(grupos || []).reduce((s: number, g: any) => s + (g.grupo_miembros?.[0]?.count || 0), 0)}
          </p>
          <p className="text-xs text-muted-foreground">Total Asistentes</p>
        </div>
      </div>

      {/* Hierarchy tree */}
      <div className="rounded-xl border bg-card overflow-hidden">
        {/* Equipo Ministerial header */}
        <div className="bg-primary/5 border-b p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Crown className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">Equipo Ministerial</h3>
              <p className="text-xs text-muted-foreground">{totalRedes} Redes · {totalGrupos} Casas de Paz</p>
            </div>
          </div>
        </div>

        <ScrollArea className="max-h-[600px]">
          <div className="p-2">
            {hierarchy.redes.map((red) => (
              <div key={red.nombre} className="mb-2">
                {/* Red header */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 mb-1">
                  <div className="w-2 h-8 rounded-full bg-info" />
                  <Network className="h-4 w-4 text-info" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold">Red {red.nombre}</p>
                    <p className="text-xs text-muted-foreground">{red.grupos.length} grupos · {red.totalMiembros} asistentes</p>
                  </div>
                  <Badge variant="outline" className="text-xs">{red.grupos.length}</Badge>
                </div>

                {/* Casas de Paz under this red */}
                <div className="ml-6 border-l-2 border-muted pl-4 space-y-1">
                  {red.grupos.map((g) => (
                    <div key={g.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/30 transition-colors">
                      <Home className="h-4 w-4 text-amber-500 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{g.nombre}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {g.lider && (
                            <span className="flex items-center gap-1">
                              <Avatar className="h-4 w-4">
                                <AvatarFallback className="text-[6px]">
                                  {g.lider.nombres[0]}{g.lider.apellidos[0]}
                                </AvatarFallback>
                              </Avatar>
                              {g.lider.nombres} {g.lider.apellidos}
                            </span>
                          )}
                          <span>· {g.miembrosCount} miembros</span>
                        </div>
                      </div>
                      <Badge variant={g.estado === "Activo" ? "default" : "secondary"} className="text-[10px] h-5">
                        {g.estado}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Groups without red */}
            {hierarchy.sinRed.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 mb-1">
                  <div className="w-2 h-8 rounded-full bg-muted-foreground/30" />
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-muted-foreground">Sin Red Asignada</p>
                    <p className="text-xs text-muted-foreground">{hierarchy.sinRed.length} grupos</p>
                  </div>
                </div>
                <div className="ml-6 border-l-2 border-muted pl-4 space-y-1">
                  {hierarchy.sinRed.map((g) => (
                    <div key={g.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/30 transition-colors">
                      <Home className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{g.nombre}</p>
                        <p className="text-xs text-muted-foreground">
                          {g.lider ? `${g.lider.nombres} ${g.lider.apellidos} · ` : ""}{g.miembrosCount} miembros
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

import { useState, useMemo } from "react";
import PageHeader from "@/components/shared/PageHeader";
import MetricCard from "@/components/shared/MetricCard";
import OrgChartTree from "@/components/charts/OrgChartTree";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMinistryHierarchy, HierarchyNode } from "@/hooks/useMinistryHierarchy";
import { GitBranch, Users, UserCheck, UserX, Search, Eye, X, Info } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

// Example data for when there is no real data
function getExampleTree(): HierarchyNode[] {
  return [
    {
      id: "example-pastor",
      nombre: "Carlos",
      apellidos: "Rodríguez",
      foto_url: null,
      tipo_persona: "Líder",
      ministerio: "Pastoral",
      rol_label: "Pastor Principal",
      children: [
        {
          id: "example-lider1",
          nombre: "María",
          apellidos: "González",
          foto_url: null,
          tipo_persona: "Líder",
          ministerio: "Células",
          rol_label: "Líder - Células Norte",
          children: [
            { id: "ex-m1", nombre: "Ana", apellidos: "López", foto_url: null, tipo_persona: "Miembro", ministerio: null, rol_label: "Miembro", children: [] },
            { id: "ex-m2", nombre: "Pedro", apellidos: "Martínez", foto_url: null, tipo_persona: "Servidor", ministerio: "Ujieres", rol_label: "Servidor", children: [] },
            { id: "ex-m3", nombre: "Laura", apellidos: "Díaz", foto_url: null, tipo_persona: "Miembro", ministerio: null, rol_label: "Miembro", children: [] },
          ],
        },
        {
          id: "example-lider2",
          nombre: "Juan",
          apellidos: "Hernández",
          foto_url: null,
          tipo_persona: "Líder",
          ministerio: "Jóvenes",
          rol_label: "Líder - Jóvenes",
          children: [
            { id: "ex-m4", nombre: "Sofía", apellidos: "Ramírez", foto_url: null, tipo_persona: "Miembro", ministerio: null, rol_label: "Miembro", children: [] },
            { id: "ex-m5", nombre: "Diego", apellidos: "Torres", foto_url: null, tipo_persona: "Servidor", ministerio: "Alabanza", rol_label: "Servidor", children: [] },
          ],
        },
        {
          id: "example-lider3",
          nombre: "Patricia",
          apellidos: "Vargas",
          foto_url: null,
          tipo_persona: "Líder",
          ministerio: "Mujeres",
          rol_label: "Líder - Mujeres",
          children: [
            { id: "ex-m6", nombre: "Carmen", apellidos: "Rojas", foto_url: null, tipo_persona: "Miembro", ministerio: null, rol_label: "Miembro", children: [] },
            { id: "ex-m7", nombre: "Lucía", apellidos: "Mendoza", foto_url: null, tipo_persona: "Miembro", ministerio: null, rol_label: "Miembro", children: [] },
            { id: "ex-m8", nombre: "Rosa", apellidos: "Castillo", foto_url: null, tipo_persona: "Servidor", ministerio: "Intercesión", rol_label: "Servidor", children: [] },
            { id: "ex-m9", nombre: "Elena", apellidos: "Morales", foto_url: null, tipo_persona: "Miembro", ministerio: null, rol_label: "Miembro", children: [] },
          ],
        },
        {
          id: "example-lider4",
          nombre: "Roberto",
          apellidos: "Silva",
          foto_url: null,
          tipo_persona: "Líder",
          ministerio: "Alabanza",
          rol_label: "Líder - Alabanza",
          children: [
            { id: "ex-m10", nombre: "Gabriel", apellidos: "Peña", foto_url: null, tipo_persona: "Servidor", ministerio: "Alabanza", rol_label: "Servidor", children: [] },
            { id: "ex-m11", nombre: "Valeria", apellidos: "Cruz", foto_url: null, tipo_persona: "Servidor", ministerio: "Alabanza", rol_label: "Servidor", children: [] },
          ],
        },
      ],
    },
  ];
}

function countNodes(nodes: HierarchyNode[]): number {
  return nodes.reduce((sum, n) => sum + 1 + countNodes(n.children), 0);
}

function filterTree(nodes: HierarchyNode[], query: string): HierarchyNode[] {
  if (!query) return nodes;
  const q = query.toLowerCase();
  return nodes
    .map((n) => {
      const childMatches = filterTree(n.children, query);
      const selfMatch =
        n.nombre.toLowerCase().includes(q) ||
        n.apellidos.toLowerCase().includes(q) ||
        n.rol_label.toLowerCase().includes(q);
      if (selfMatch || childMatches.length > 0) {
        return { ...n, children: selfMatch ? n.children : childMatches };
      }
      return null;
    })
    .filter(Boolean) as HierarchyNode[];
}

export default function GraficoMinisterioPage() {
  const { data, isLoading } = useMinistryHierarchy();
  const [search, setSearch] = useState("");
  const [showUnplaced, setShowUnplaced] = useState(false);

  const rawTree = data?.tree || [];
  const unplaced = data?.unplaced || [];

  // Use example data if no real data exists
  const isExample = rawTree.length === 0 && !isLoading;
  const tree = isExample ? getExampleTree() : rawTree;

  const filteredTree = useMemo(() => filterTree(tree, search), [tree, search]);
  const totalInTree = useMemo(() => countNodes(tree), [tree]);

  return (
    <div className="space-y-6">
      <PageHeader title="Gráfico del Ministerio" description="Estructura jerárquica interactiva del ministerio">
        {unplaced.length > 0 && (
          <Button variant="outline" className="gap-2" onClick={() => setShowUnplaced(!showUnplaced)}>
            <Eye className="h-4 w-4" />
            Ver No Ubicados ({unplaced.length})
          </Button>
        )}
      </PageHeader>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="En el Árbol" value={totalInTree} icon={GitBranch} />
        <MetricCard title="Total Personas" value={totalInTree + unplaced.length} icon={Users} />
        <MetricCard title="Ubicados" value={totalInTree} icon={UserCheck} variant="success" />
        <MetricCard title="Sin Ubicar" value={unplaced.length} icon={UserX} variant="accent" />
      </div>

      {isExample && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-info/30 bg-info/5 text-sm">
          <Info className="h-5 w-5 text-info shrink-0" />
          <div>
            <p className="font-medium text-foreground">Datos de ejemplo</p>
            <p className="text-muted-foreground text-xs">
              Este organigrama muestra datos de ejemplo. Agrega personas con tipo "Líder" y asígnalas como líderes de grupos para ver tu estructura real.
            </p>
          </div>
        </div>
      )}

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar persona, rol o grupo..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      <div className="rounded-xl border bg-card p-6 min-h-[400px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <div className="animate-pulse">Cargando jerarquía del ministerio...</div>
          </div>
        ) : (
          <OrgChartTree tree={filteredTree} />
        )}
      </div>

      <AnimatePresence>
        {showUnplaced && unplaced.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <UserX className="h-4 w-4 text-muted-foreground" />
                Asistentes No Ubicados ({unplaced.length})
              </h3>
              <Button size="sm" variant="ghost" onClick={() => setShowUnplaced(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <ScrollArea className="max-h-[300px]">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {unplaced.map((p) => {
                  const initials = `${p.nombres[0] || ""}${p.apellidos[0] || ""}`.toUpperCase();
                  return (
                    <div key={p.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/50">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={p.foto_url || undefined} />
                        <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{p.nombres} {p.apellidos}</p>
                        <p className="text-xs text-muted-foreground">{p.tipo_persona}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

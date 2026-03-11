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
import {
  GitBranch, Users, UserCheck, UserX, Search, Eye, X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

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

  const tree = data?.tree || [];
  const unplaced = data?.unplaced || [];

  const filteredTree = useMemo(() => filterTree(tree, search), [tree, search]);
  const totalInTree = useMemo(() => countNodes(tree), [tree]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gráfico del Ministerio"
        description="Estructura jerárquica interactiva del ministerio"
      >
        {unplaced.length > 0 && (
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setShowUnplaced(!showUnplaced)}
          >
            <Eye className="h-4 w-4" />
            Ver Asistentes No Dibujados ({unplaced.length})
          </Button>
        )}
      </PageHeader>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="En el Árbol" value={totalInTree} icon={GitBranch} />
        <MetricCard
          title="Total Personas"
          value={totalInTree + unplaced.length}
          icon={Users}
        />
        <MetricCard
          title="Ubicados"
          value={totalInTree}
          icon={UserCheck}
          variant="success"
        />
        <MetricCard
          title="Sin Ubicar"
          value={unplaced.length}
          icon={UserX}
          variant="accent"
        />
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar persona, rol o grupo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tree */}
      <div className="rounded-xl border bg-card p-6 min-h-[400px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <div className="animate-pulse">Cargando jerarquía del ministerio...</div>
          </div>
        ) : (
          <OrgChartTree tree={filteredTree} />
        )}
      </div>

      {/* Unplaced panel */}
      <AnimatePresence>
        {showUnplaced && unplaced.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="rounded-xl border bg-card p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <UserX className="h-4 w-4 text-muted-foreground" />
                Asistentes No Dibujados ({unplaced.length})
              </h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowUnplaced(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <ScrollArea className="max-h-[300px]">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {unplaced.map((p) => {
                  const initials = `${p.nombres[0] || ""}${p.apellidos[0] || ""}`.toUpperCase();
                  return (
                    <div
                      key={p.id}
                      className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/50"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={p.foto_url || undefined} />
                        <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">
                          {p.nombres} {p.apellidos}
                        </p>
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

import { useState, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HierarchyNode } from "@/hooks/useMinistryHierarchy";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ROLE_COLORS: Record<string, string> = {
  "Pastor Principal": "ring-primary bg-primary/10",
  "Líder": "ring-accent bg-accent/10",
  "Miembro": "ring-muted bg-muted/50",
  "Visitante": "ring-info bg-info/10",
  "Servidor": "ring-success bg-success/10",
};

function getRoleColor(rolLabel: string): string {
  if (rolLabel.includes("Pastor")) return ROLE_COLORS["Pastor Principal"];
  if (rolLabel.includes("Líder")) return ROLE_COLORS["Líder"];
  return ROLE_COLORS["Miembro"] || "ring-muted bg-muted/50";
}

interface OrgNodeProps {
  node: HierarchyNode;
  depth: number;
  isLast: boolean;
}

function OrgNode({ node, depth, isLast }: OrgNodeProps) {
  const [expanded, setExpanded] = useState(depth < 2);
  const hasChildren = node.children.length > 0;
  const initials = `${node.nombre[0] || ""}${node.apellidos[0] || ""}`.toUpperCase();
  const roleColor = getRoleColor(node.rol_label);

  return (
    <div className="relative">
      {/* Connector lines */}
      {depth > 0 && (
        <div className="absolute left-0 top-0 bottom-0 w-px bg-border -translate-x-6" />
      )}
      {depth > 0 && (
        <div className="absolute left-0 top-5 w-6 h-px bg-border -translate-x-6" />
      )}

      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2, delay: depth * 0.05 }}
        className={cn(
          "group flex items-center gap-3 p-2.5 rounded-xl border bg-card hover:shadow-md transition-all cursor-pointer mb-1",
          depth === 0 && "shadow-sm border-primary/30"
        )}
        onClick={() => hasChildren && setExpanded(!expanded)}
      >
        {/* Expand toggle */}
        <div className="w-5 h-5 flex items-center justify-center shrink-0">
          {hasChildren ? (
            expanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )
          ) : (
            <span className="w-1.5 h-1.5 rounded-full bg-border" />
          )}
        </div>

        {/* Avatar */}
        <Avatar className={cn("h-9 w-9 ring-2 shrink-0", roleColor)}>
          <AvatarImage src={node.foto_url || undefined} alt={node.nombre} />
          <AvatarFallback className="text-xs font-semibold">{initials}</AvatarFallback>
        </Avatar>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground truncate">
            {node.nombre} {node.apellidos}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {node.rol_label}
          </p>
        </div>

        {/* Children count badge */}
        {hasChildren && (
          <span className="text-[10px] font-medium bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full shrink-0">
            {node.children.length}
          </span>
        )}
      </motion.div>

      {/* Children */}
      <AnimatePresence>
        {expanded && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pl-12 relative">
              {node.children.map((child, i) => (
                <OrgNode
                  key={child.id}
                  node={child}
                  depth={depth + 1}
                  isLast={i === node.children.length - 1}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface OrgChartTreeProps {
  tree: HierarchyNode[];
}

export default function OrgChartTree({ tree }: OrgChartTreeProps) {
  if (tree.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <User className="h-12 w-12 mx-auto mb-3 opacity-40" />
        <p className="text-sm">No hay datos de jerarquía para mostrar.</p>
        <p className="text-xs mt-1">Asegúrate de tener personas y grupos configurados.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tree.map((node, i) => (
        <OrgNode key={node.id} node={node} depth={0} isLast={i === tree.length - 1} />
      ))}
    </div>
  );
}

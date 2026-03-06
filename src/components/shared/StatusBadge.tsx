import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusStyles: Record<string, string> = {
  "Activo": "bg-success/10 text-success border-success/20",
  "Inactivo": "bg-muted text-muted-foreground border-muted",
  "En proceso": "bg-info/10 text-info border-info/20",
  "Completado": "bg-success/10 text-success border-success/20",
  "Programado": "bg-info/10 text-info border-info/20",
  "Cancelado": "bg-destructive/10 text-destructive border-destructive/20",
  "Próximo": "bg-accent/10 text-accent border-accent/20",
  "En curso": "bg-info/10 text-info border-info/20",
  "Finalizado": "bg-muted text-muted-foreground border-muted",
  "Miembro": "bg-primary/10 text-primary border-primary/20",
  "Visitante": "bg-accent/10 text-accent border-accent/20",
  "Líder": "bg-success/10 text-success border-success/20",
  "Servidor": "bg-info/10 text-info border-info/20",
  "Ingreso": "bg-success/10 text-success border-success/20",
  "Gasto": "bg-destructive/10 text-destructive border-destructive/20",
};

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge variant="outline" className={cn("text-xs font-medium", statusStyles[status] || "", className)}>
      {status}
    </Badge>
  );
}

import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: string; positive: boolean };
  variant?: "default" | "accent" | "success" | "info";
}

const variants = {
  default: "border-l-primary",
  accent: "border-l-accent",
  success: "border-l-success",
  info: "border-l-info",
};

const iconVariants = {
  default: "bg-primary/10 text-primary",
  accent: "bg-accent/10 text-accent",
  success: "bg-success/10 text-success",
  info: "bg-info/10 text-info",
};

export default function MetricCard({ title, value, subtitle, icon: Icon, trend, variant = "default" }: MetricCardProps) {
  return (
    <div className={cn("metric-card border-l-4", variants[variant])}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold mt-1 text-foreground">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
          {trend && (
            <p className={cn("text-xs font-medium mt-1", trend.positive ? "text-success" : "text-destructive")}>
              {trend.positive ? "↑" : "↓"} {trend.value}
            </p>
          )}
        </div>
        <div className={cn("p-2.5 rounded-lg", iconVariants[variant])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

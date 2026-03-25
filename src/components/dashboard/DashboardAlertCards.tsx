import { useNavigate } from "react-router-dom";
import { AlertTriangle, Users, Church, FolderOpen } from "lucide-react";

interface Props {
  pendingReportes: number;
}

const alerts = [
  {
    icon: AlertTriangle,
    title: "Revisa tus nuevos reportes de grupo",
    subtitle: "Click aquí para ver la lista.",
    bg: "bg-warning",
    route: "/reportes-grupos",
    key: "reportes",
  },
  {
    icon: Users,
    title: "Revisa los asistentes inactivos en grupo",
    subtitle: "",
    bg: "bg-destructive",
    route: "/grupos",
    key: "inactivos-grupo",
  },
  {
    icon: Church,
    title: "Revisa los asistentes inactivos en reunión",
    subtitle: "",
    bg: "bg-destructive",
    route: "/servicios",
    key: "inactivos-reunion",
  },
  {
    icon: FolderOpen,
    title: "Revisa los grupos inactivos",
    subtitle: "",
    bg: "bg-destructive",
    route: "/grupos",
    key: "grupos-inactivos",
  },
];

export default function DashboardAlertCards({ pendingReportes }: Props) {
  const navigate = useNavigate();

  return (
    <div className="space-y-3">
      {alerts.map((alert) => {
        const Icon = alert.icon;
        return (
          <div
            key={alert.key}
            onClick={() => navigate(alert.route)}
            className="flex items-center gap-4 p-4 rounded-xl bg-card border shadow-sm cursor-pointer hover:shadow-md transition-shadow group"
          >
            <div className={`p-3 rounded-xl ${alert.bg} text-white shrink-0`}>
              <Icon className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                {alert.title}
                {alert.key === "reportes" && pendingReportes > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-[10px] font-bold rounded-full bg-warning/20 text-warning">
                    {pendingReportes}
                  </span>
                )}
              </p>
              {alert.subtitle && (
                <p className="text-xs text-muted-foreground mt-0.5">{alert.subtitle}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

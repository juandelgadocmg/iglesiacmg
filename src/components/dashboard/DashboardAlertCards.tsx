import { useNavigate } from "react-router-dom";
import { AlertTriangle, Users, Church, FolderOpen } from "lucide-react";

interface Props {
  pendingReportes: number;
}

export default function DashboardAlertCards({ pendingReportes }: Props) {
  const navigate = useNavigate();

  const alerts = [
    {
      icon: AlertTriangle,
      title: "Revisa tus nuevos reportes de grupo",
      subtitle: "Ver reportes pendientes de verificación.",
      bg: "bg-warning",
      action: () => navigate("/grupos", { state: { tab: "reportes", filterEstado: "No Verificado" } }),
      key: "reportes",
    },
    {
      icon: Users,
      title: "Revisa los asistentes inactivos en grupo",
      subtitle: "Personas con estado Inactivo en grupos.",
      bg: "bg-destructive",
      action: () => navigate("/personas", { state: { estadoFilter: "Inactivo" } }),
      key: "inactivos-grupo",
    },
    {
      icon: Church,
      title: "Revisa los asistentes inactivos en reunión",
      subtitle: "Personas que no asisten a las reuniones.",
      bg: "bg-destructive",
      action: () => navigate("/servicios", { state: { showInactivos: true } }),
      key: "inactivos-reunion",
    },
    {
      icon: FolderOpen,
      title: "Revisa los grupos inactivos",
      subtitle: "Grupos con estado Inactivo.",
      bg: "bg-destructive",
      action: () => navigate("/grupos", { state: { filterEstado: "Inactivo" } }),
      key: "grupos-inactivos",
    },
  ];

  return (
    <div className="space-y-3">
      {alerts.map((alert) => {
        const Icon = alert.icon;
        return (
          <div
            key={alert.key}
            onClick={alert.action}
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

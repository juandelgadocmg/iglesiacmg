import { Search, ChevronRight } from "lucide-react";
import { useLocation } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import NotificationDropdown from "@/components/layout/NotificationDropdown";

const breadcrumbMap: Record<string, string> = {
  dashboard: "Dashboard",
  personas: "Personas",
  grupos: "Grupos",
  servicios: "Servicios",
  asistencia: "Asistencia",
  finanzas: "Finanzas",
  donaciones: "Donaciones",
  eventos: "Eventos",
  inscripciones: "Inscripciones",
  academia: "Academia",
  certificados: "Certificados",
  reportes: "Reportes",
  usuarios: "Usuarios",
  configuracion: "Configuración",
  nuevo: "Nuevo",
};

export default function AppHeader() {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);
  const { user } = useAuth();
  const initials = user?.email?.slice(0, 2).toUpperCase() || "U";

  return (
    <header className="h-16 border-b bg-card flex items-center justify-between px-6 sticky top-0 z-20">
      <div className="flex items-center gap-1.5 text-sm">
        <span className="text-muted-foreground">CMG</span>
        {segments.map((seg, i) => (
          <span key={i} className="flex items-center gap-1.5">
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
            <span className={i === segments.length - 1 ? "font-medium text-foreground" : "text-muted-foreground"}>
              {breadcrumbMap[seg] || seg}
            </span>
          </span>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar..." className="pl-9 w-64 h-9 bg-muted/50 border-0 text-sm" />
        </div>

        <NotificationDropdown />

        <div className="flex items-center gap-2.5 pl-3 border-l">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">{initials}</AvatarFallback>
          </Avatar>
          <div className="hidden lg:block">
            <p className="text-sm font-medium leading-none">{user?.email?.split("@")[0] || "Usuario"}</p>
            <p className="text-[11px] text-muted-foreground">{user?.email}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

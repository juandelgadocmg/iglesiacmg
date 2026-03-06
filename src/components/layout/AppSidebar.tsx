import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.jpeg";
import {
  LayoutDashboard, Users, UsersRound, Church, ClipboardCheck,
  DollarSign, Heart, CalendarDays, FileText, GraduationCap,
  Award, BarChart3, Settings, UserCog, ChevronLeft, ChevronRight,
  LogOut
} from "lucide-react";

const menuItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Personas", icon: Users, path: "/personas" },
  { label: "Grupos", icon: UsersRound, path: "/grupos" },
  { label: "Servicios", icon: Church, path: "/servicios" },
  { label: "Asistencia", icon: ClipboardCheck, path: "/asistencia" },
  { label: "Finanzas", icon: DollarSign, path: "/finanzas" },
  { label: "Donaciones", icon: Heart, path: "/donaciones" },
  { label: "Eventos", icon: CalendarDays, path: "/eventos" },
  { label: "Inscripciones", icon: FileText, path: "/inscripciones" },
  { label: "Academia", icon: GraduationCap, path: "/academia" },
  { label: "Certificados", icon: Award, path: "/certificados" },
  { label: "Reportes", icon: BarChart3, path: "/reportes" },
  { label: "Usuarios", icon: UserCog, path: "/usuarios" },
  { label: "Configuración", icon: Settings, path: "/configuracion" },
];

export default function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside
      className={cn(
        "sidebar-gradient h-screen flex flex-col transition-all duration-300 sticky top-0 z-30",
        collapsed ? "w-[68px]" : "w-[250px]"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border">
        <img src={logo} alt="CMG" className="w-9 h-9 rounded-lg object-cover" />
        {!collapsed && (
          <div className="flex flex-col">
            <span className="text-sm font-bold text-sidebar-primary-foreground leading-tight">CMG Admin</span>
            <span className="text-[10px] text-sidebar-foreground opacity-60">Centro Mundial de Gloria</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {menuItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-[13px] font-medium transition-all duration-150",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className={cn("h-[18px] w-[18px] shrink-0", isActive && "text-sidebar-primary")} />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-md text-[13px] text-sidebar-foreground hover:bg-sidebar-accent w-full transition-colors"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          {!collapsed && <span>Colapsar</span>}
        </button>
        <button className="flex items-center gap-3 px-3 py-2.5 rounded-md text-[13px] text-sidebar-foreground hover:bg-sidebar-accent w-full transition-colors">
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Cerrar sesión</span>}
        </button>
      </div>
    </aside>
  );
}

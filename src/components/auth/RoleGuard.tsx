import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useUserRoles } from "@/hooks/useUserRoles";
import { canAccess } from "@/lib/permissions";
import { ShieldAlert } from "lucide-react";

interface RoleGuardProps {
  children: ReactNode;
}

export default function RoleGuard({ children }: RoleGuardProps) {
  const { roles, isLoading } = useUserRoles();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Verificando permisos...</div>
      </div>
    );
  }

  const path = "/" + location.pathname.split("/")[1]; // normalize to base path

  if (!canAccess(roles, path)) {
    return (
      <div className="animate-fade-in min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Acceso restringido</h2>
          <p className="text-muted-foreground text-sm mb-4">
            No tienes permisos para acceder a este módulo. Contacta al administrador para solicitar acceso.
          </p>
          <a href="/dashboard" className="text-primary text-sm hover:underline">
            Volver al Dashboard
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

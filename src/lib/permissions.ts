import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

export const ROUTE_PERMISSIONS: Record<string, AppRole[]> = {
  "/dashboard": [],
  "/personas": ["admin", "pastor", "secretaria", "lider"],
  "/grupos": ["admin", "pastor", "lider"],
  "/servicios": ["admin", "pastor", "lider"],
  "/asistencia": ["admin", "pastor", "lider", "secretaria"],
  "/finanzas": ["admin", "tesoreria"],
  "/eventos": ["admin", "pastor", "lider", "secretaria"],
  "/academia": ["admin", "pastor", "maestro"],
  "/certificados": ["admin", "pastor", "maestro"],
  "/reportes": ["admin", "pastor", "tesoreria"],
  "/peticiones": ["admin", "pastor", "lider", "secretaria"],
  "/usuarios": ["admin"],
  "/configuracion": ["admin"],
};

export function canAccess(userRoles: AppRole[], path: string): boolean {
  const allowed = ROUTE_PERMISSIONS[path];
  if (!allowed || allowed.length === 0) return true;
  return userRoles.some((role) => allowed.includes(role));
}

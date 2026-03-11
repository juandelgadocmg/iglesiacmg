import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

// Which roles can access each route path
export const ROUTE_PERMISSIONS: Record<string, AppRole[]> = {
  "/dashboard": [], // empty = all authenticated users
  "/personas": ["admin", "pastor", "secretaria", "lider"],
  "/grupos": ["admin", "pastor", "lider"],
  "/servicios": ["admin", "pastor", "lider"],
  "/asistencia": ["admin", "pastor", "lider", "secretaria"],
  "/finanzas": ["admin", "tesoreria"],
  "/donaciones": ["admin", "tesoreria"],
  "/eventos": ["admin", "pastor", "lider", "secretaria"],
  "/inscripciones": ["admin", "pastor", "secretaria"],
  "/academia": ["admin", "pastor", "maestro"],
  "/certificados": ["admin", "pastor", "maestro"],
  "/reportes": ["admin", "pastor", "tesoreria"],
  "/reportes-grupos": ["admin", "pastor", "lider"],
  "/mapa-grupos": ["admin", "pastor", "lider"],
  "/usuarios": ["admin"],
  "/configuracion": ["admin"],
};

/**
 * Check if a user with given roles can access a route.
 * Empty permissions array = accessible to all authenticated users.
 * Users with NO roles can only access routes with empty permissions (dashboard).
 */
export function canAccess(userRoles: AppRole[], path: string): boolean {
  const allowed = ROUTE_PERMISSIONS[path];
  if (!allowed || allowed.length === 0) return true; // open to all
  return userRoles.some((role) => allowed.includes(role));
}

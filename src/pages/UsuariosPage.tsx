import { useState } from "react";
import PageHeader from "@/components/shared/PageHeader";
import { useProfiles, useUserRoles, useAssignRole, useRemoveRole } from "@/hooks/useUsuarios";
import InviteUserDialog from "@/components/usuarios/InviteUserDialog";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, ShieldCheck, UserCog, Plus, X, Users } from "lucide-react";
import { toast } from "sonner";
import { Constants } from "@/integrations/supabase/types";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

const ROLE_LABELS: Record<AppRole, string> = {
  admin: "Usuario Principal",
  super_admin: "Super Administrador",
  pastor: "Pastor",
  lider: "Líder",
  secretaria: "Secretaria",
  tesoreria: "Tesorería",
  maestro: "Maestro",
  consolidador_lider: "Consolidador Líder",
  consolidador: "Consolidador",
  lider_intercesion: "Líder de Intercesión",
  lider_red: "Líder de Red",
  lider_casa_paz: "Líder Casa de Paz",
  consulta: "Consulta",
};

const ROLE_COLORS: Record<AppRole, string> = {
  admin: "bg-destructive/10 text-destructive border-destructive/20",
  super_admin: "bg-destructive/10 text-destructive border-destructive/20",
  pastor: "bg-primary/10 text-primary border-primary/20",
  lider: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  secretaria: "bg-chart-4/10 text-chart-4 border-chart-4/20",
  tesoreria: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  maestro: "bg-chart-5/10 text-chart-5 border-chart-5/20",
  consolidador_lider: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  consolidador: "bg-accent text-accent-foreground border-border",
  lider_intercesion: "bg-chart-4/10 text-chart-4 border-chart-4/20",
  lider_red: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  lider_casa_paz: "bg-chart-5/10 text-chart-5 border-chart-5/20",
  consulta: "bg-muted text-muted-foreground border-border",
};

export default function UsuariosPage() {
  const { data: profiles, isLoading: loadingProfiles } = useProfiles();
  const { data: roles, isLoading: loadingRoles } = useUserRoles();
  const assignRole = useAssignRole();
  const removeRole = useRemoveRole();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const handleInviteSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["profiles"] });
    queryClient.invalidateQueries({ queryKey: ["user_roles"] });
  };

  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<AppRole | "">("");

  const isLoading = loadingProfiles || loadingRoles;

  if (isLoading) {
    return (
      <div className="animate-fade-in space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  const getUserRoles = (userId: string) =>
    (roles || []).filter((r) => r.user_id === userId);

  const handleAssign = async () => {
    if (!selectedUser || !selectedRole) return;
    const existing = getUserRoles(selectedUser);
    if (existing.some((r) => r.role === selectedRole)) {
      toast.error("El usuario ya tiene ese rol");
      return;
    }
    try {
      await assignRole.mutateAsync({ user_id: selectedUser, role: selectedRole as AppRole });
      toast.success("Rol asignado correctamente");
      setSelectedRole("");
    } catch {
      toast.error("Error al asignar rol. Solo administradores pueden gestionar roles.");
    }
  };

  const handleRemove = async (roleId: string) => {
    try {
      await removeRole.mutateAsync(roleId);
      toast.success("Rol eliminado");
    } catch {
      toast.error("Error al eliminar rol");
    }
  };

  const totalUsers = profiles?.length || 0;
  const usersWithRoles = new Set((roles || []).map((r) => r.user_id)).size;

  return (
    <div className="animate-fade-in">
      <PageHeader title="Usuarios y Roles" description="Gestión de usuarios y permisos del sistema">
        <InviteUserDialog onSuccess={handleInviteSuccess} />
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="p-2.5 rounded-xl bg-primary/10"><Users className="h-5 w-5 text-primary" /></div>
            <div>
              <p className="text-2xl font-bold">{totalUsers}</p>
              <p className="text-xs text-muted-foreground">Usuarios registrados</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="p-2.5 rounded-xl bg-chart-2/10"><ShieldCheck className="h-5 w-5 text-chart-2" /></div>
            <div>
              <p className="text-2xl font-bold">{usersWithRoles}</p>
              <p className="text-xs text-muted-foreground">Con roles asignados</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="p-2.5 rounded-xl bg-chart-3/10"><Shield className="h-5 w-5 text-chart-3" /></div>
            <div>
              <p className="text-2xl font-bold">{Constants.public.Enums.app_role.length}</p>
              <p className="text-xs text-muted-foreground">Roles disponibles</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assign Role */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <UserCog className="h-4 w-4" /> Asignar Rol
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={selectedUser || ""} onValueChange={setSelectedUser}>
              <SelectTrigger className="sm:w-[280px]">
                <SelectValue placeholder="Seleccionar usuario" />
              </SelectTrigger>
              <SelectContent>
                {(profiles || []).map((p) => (
                  <SelectItem key={p.user_id} value={p.user_id}>
                    {p.display_name || p.user_id.slice(0, 8)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as AppRole)}>
              <SelectTrigger className="sm:w-[200px]">
                <SelectValue placeholder="Seleccionar rol" />
              </SelectTrigger>
              <SelectContent>
                {Constants.public.Enums.app_role.map((role) => (
                  <SelectItem key={role} value={role}>
                    {ROLE_LABELS[role]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleAssign} disabled={!selectedUser || !selectedRole || assignRole.isPending}>
              <Plus className="h-4 w-4 mr-1" /> Asignar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Usuarios del Sistema</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {(profiles || []).map((profile) => {
              const userRoles = getUserRoles(profile.user_id);
              const isCurrentUser = user?.id === profile.user_id;
              return (
                <div key={profile.id} className="flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                        {(profile.display_name || "U")[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">
                        {profile.display_name || "Sin nombre"}
                        {isCurrentUser && <span className="text-xs text-muted-foreground ml-2">(Tú)</span>}
                      </p>
                      <p className="text-xs text-muted-foreground">{profile.user_id.slice(0, 8)}...</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap justify-end">
                    {userRoles.length === 0 && (
                      <span className="text-xs text-muted-foreground italic">Sin roles</span>
                    )}
                    {userRoles.map((r) => (
                      <Badge
                        key={r.id}
                        variant="outline"
                        className={`${ROLE_COLORS[r.role]} text-xs gap-1 pr-1`}
                      >
                        {ROLE_LABELS[r.role]}
                        <button
                          onClick={() => handleRemove(r.id)}
                          className="ml-1 hover:bg-foreground/10 rounded-full p-0.5 transition-colors"
                          title="Eliminar rol"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              );
            })}
            {(!profiles || profiles.length === 0) && (
              <div className="px-6 py-12 text-center text-muted-foreground text-sm">
                No hay usuarios registrados
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

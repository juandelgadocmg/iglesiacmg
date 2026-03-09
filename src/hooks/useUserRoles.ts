import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

export function useUserRoles() {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ["my_roles", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user!.id);
      if (error) throw error;
      return (data || []).map((r) => r.role) as AppRole[];
    },
    staleTime: 5 * 60 * 1000, // cache 5 min
  });

  return {
    roles: query.data || [],
    isLoading: query.isLoading,
    hasRole: (role: AppRole) => (query.data || []).includes(role),
    isAdmin: (query.data || []).includes("admin"),
  };
}

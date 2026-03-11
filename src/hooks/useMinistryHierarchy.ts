import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface HierarchyNode {
  id: string;
  nombre: string;
  apellidos: string;
  foto_url: string | null;
  tipo_persona: string;
  ministerio: string | null;
  rol_label: string;
  children: HierarchyNode[];
  grupo_nombre?: string;
}

export function useMinistryHierarchy() {
  return useQuery({
    queryKey: ["ministry_hierarchy"],
    queryFn: async () => {
      // Fetch all active personas
      const { data: personas, error: pErr } = await supabase
        .from("personas")
        .select("id, nombres, apellidos, foto_url, tipo_persona, ministerio, lider_responsable, grupo_id")
        .eq("estado_iglesia", "Activo")
        .order("nombres");
      if (pErr) throw pErr;

      // Fetch all groups with leaders
      const { data: grupos, error: gErr } = await supabase
        .from("grupos")
        .select("id, nombre, tipo, lider_id")
        .eq("estado", "Activo");
      if (gErr) throw gErr;

      // Fetch grupo_miembros
      const { data: miembros, error: mErr } = await supabase
        .from("grupo_miembros")
        .select("grupo_id, persona_id");
      if (mErr) throw mErr;

      // Fetch church config for pastor principal
      const { data: config } = await supabase
        .from("configuracion_iglesia")
        .select("pastor_principal")
        .limit(1)
        .single();

      // Build lookup maps
      const personaMap = new Map(personas.map((p) => [p.id, p]));
      const gruposByLider = new Map<string, typeof grupos>();
      grupos.forEach((g) => {
        if (g.lider_id) {
          const existing = gruposByLider.get(g.lider_id) || [];
          existing.push(g);
          gruposByLider.set(g.lider_id, existing);
        }
      });

      // Members per group
      const membersByGroup = new Map<string, string[]>();
      miembros.forEach((m) => {
        const arr = membersByGroup.get(m.grupo_id) || [];
        arr.push(m.persona_id);
        membersByGroup.set(m.grupo_id, arr);
      });

      // Track which personas are placed in the tree
      const placed = new Set<string>();

      // Identify leaders (people who lead groups)
      const leaderIds = new Set(grupos.filter((g) => g.lider_id).map((g) => g.lider_id!));

      // Build member nodes for a group
      function buildGroupMembers(grupoId: string): HierarchyNode[] {
        const memberIds = membersByGroup.get(grupoId) || [];
        return memberIds
          .filter((mid) => !leaderIds.has(mid) && !placed.has(mid))
          .map((mid) => {
            placed.add(mid);
            const p = personaMap.get(mid);
            if (!p) return null;
            return {
              id: p.id,
              nombre: p.nombres,
              apellidos: p.apellidos,
              foto_url: p.foto_url,
              tipo_persona: p.tipo_persona,
              ministerio: p.ministerio,
              rol_label: p.tipo_persona,
              children: [],
            } as HierarchyNode;
          })
          .filter(Boolean) as HierarchyNode[];
      }

      // Build leader nodes with their groups' members as children
      function buildLeaderNode(liderId: string): HierarchyNode | null {
        const p = personaMap.get(liderId);
        if (!p || placed.has(liderId)) return null;
        placed.add(liderId);

        const liderGrupos = gruposByLider.get(liderId) || [];
        const children: HierarchyNode[] = [];

        liderGrupos.forEach((g) => {
          // Check for sub-leaders in this group
          const groupMemberIds = membersByGroup.get(g.id) || [];
          groupMemberIds.forEach((mid) => {
            if (leaderIds.has(mid) && mid !== liderId && !placed.has(mid)) {
              const subLeader = buildLeaderNode(mid);
              if (subLeader) {
                subLeader.grupo_nombre = undefined;
                children.push(subLeader);
              }
            }
          });

          // Regular members
          const members = buildGroupMembers(g.id);
          children.push(...members);
        });

        return {
          id: p.id,
          nombre: p.nombres,
          apellidos: p.apellidos,
          foto_url: p.foto_url,
          tipo_persona: p.tipo_persona,
          ministerio: p.ministerio,
          rol_label: liderGrupos.length > 0
            ? `Líder - ${liderGrupos.map((g) => g.nombre).join(", ")}`
            : "Líder",
          grupo_nombre: liderGrupos[0]?.nombre,
          children,
        };
      }

      // Find the pastor principal or top-level person
      let rootPerson = personas.find(
        (p) =>
          p.tipo_persona === "Líder" &&
          (p.ministerio?.toLowerCase().includes("pastor") ||
            p.nombres.toLowerCase().includes(config?.pastor_principal?.toLowerCase() || "___"))
      );

      // Build tree: start from top leaders (those not members of any group)
      const topLeaders: HierarchyNode[] = [];
      
      // First try leaders who are not members of any other group
      const memberedPersonas = new Set(miembros.map((m) => m.persona_id));
      const topLevelLeaderIds = [...leaderIds].filter(
        (lid) => !memberedPersonas.has(lid) || lid === rootPerson?.id
      );

      // Build root
      if (rootPerson) {
        placed.add(rootPerson.id);
        const rootChildren: HierarchyNode[] = [];

        // Add top leaders under root
        topLevelLeaderIds.forEach((lid) => {
          if (lid === rootPerson!.id) return;
          const node = buildLeaderNode(lid);
          if (node) rootChildren.push(node);
        });

        // Any remaining leaders
        [...leaderIds].forEach((lid) => {
          if (!placed.has(lid)) {
            const node = buildLeaderNode(lid);
            if (node) rootChildren.push(node);
          }
        });

        const rootGrupos = gruposByLider.get(rootPerson.id) || [];

        const root: HierarchyNode = {
          id: rootPerson.id,
          nombre: rootPerson.nombres,
          apellidos: rootPerson.apellidos,
          foto_url: rootPerson.foto_url,
          tipo_persona: rootPerson.tipo_persona,
          ministerio: rootPerson.ministerio,
          rol_label: "Pastor Principal",
          children: rootChildren,
        };

        topLeaders.push(root);
      } else {
        // No clear root - just list all leaders
        [...leaderIds].forEach((lid) => {
          if (!placed.has(lid)) {
            const node = buildLeaderNode(lid);
            if (node) topLeaders.push(node);
          }
        });
      }

      // Unplaced personas
      const unplaced = personas.filter((p) => !placed.has(p.id));

      return { tree: topLeaders, unplaced };
    },
  });
}

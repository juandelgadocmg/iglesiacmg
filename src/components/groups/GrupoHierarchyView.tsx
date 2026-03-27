import { useState, useMemo } from "react";
import { useGrupos, usePersonas, useUpdateGrupo } from "@/hooks/useDatabase";
import { useEquiposMinisteriales, useCreateEquipo, useUpdateEquipo, useDeleteEquipo } from "@/hooks/useEquiposMinisteriales";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import { Users, ChevronRight, ChevronDown, Network, Home, Crown, Plus, Pencil, Trash2, Search, ExternalLink } from "lucide-react";
import { toast } from "sonner";

const REDES = ["Nissi", "Rohi", "Jireh", "Adonai", "Shaddai", "Elohim"];

interface EquipoFormData {
  nombre: string;
  tipo: string;
  red: string;
  lider_id: string;
  lider2_id: string;
  parent_id: string;
  descripcion: string;
}

const emptyForm = (): EquipoFormData => ({
  nombre: "", tipo: "equipo", red: "", lider_id: "", lider2_id: "", parent_id: "", descripcion: "",
});

interface Props {
  onSelectGrupo?: (id: string) => void;
}

export default function GrupoHierarchyView({ onSelectGrupo }: Props) {
  const { data: grupos, isLoading: loadingGrupos } = useGrupos();
  const { data: equipos, isLoading: loadingEquipos } = useEquiposMinisteriales();
  const { data: personas } = usePersonas();
  const createEquipo = useCreateEquipo();
  const updateEquipo = useUpdateEquipo();
  const deleteEquipo = useDeleteEquipo();
  const updateGrupo = useUpdateGrupo();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EquipoFormData>(emptyForm());
  const [expandedRedes, setExpandedRedes] = useState<Set<string>>(new Set(REDES));

  // Assign casas de paz to a red
  const [assigningRed, setAssigningRed] = useState<string | null>(null);
  const [assignSearch, setAssignSearch] = useState("");

  const toggleRed = (red: string) => {
    setExpandedRedes(prev => {
      const next = new Set(prev);
      next.has(red) ? next.delete(red) : next.add(red);
      return next;
    });
  };

  const hierarchy = useMemo(() => {
    if (!grupos) return { redes: [] as any[], sinRed: [] as any[] };
    const mapped = (grupos as any[]).map((g: any) => ({
      id: g.id, nombre: g.nombre, tipo: g.tipo, red: g.red, estado: g.estado,
      dia_reunion: g.dia_reunion, hora_reunion: g.hora_reunion,
      lider: g.personas ? { nombres: g.personas.nombres, apellidos: g.personas.apellidos, foto_url: g.personas.foto_url } : null,
      miembrosCount: g.grupo_miembros?.[0]?.count || 0,
    }));
    const redes = REDES.map(red => ({
      nombre: red,
      grupos: mapped.filter(g => g.red === red),
      totalMiembros: mapped.filter(g => g.red === red).reduce((s, g) => s + g.miembrosCount, 0),
      liderRed: (equipos || []).find(e => e.tipo === "lider_red" && e.red === red),
    }));
    const sinRed = mapped.filter(g => !g.red || !REDES.includes(g.red));
    return { redes, sinRed };
  }, [grupos, equipos]);

  const equipoMinisterial = useMemo(() => {
    return (equipos || []).find(e => e.tipo === "equipo" && !e.parent_id);
  }, [equipos]);

  const totalGrupos = (grupos || []).length;
  const totalRedes = hierarchy.redes.filter(r => r.grupos.length > 0 || r.liderRed).length;

  const openCreate = (defaults?: Partial<EquipoFormData>) => {
    setEditingId(null);
    setForm({ ...emptyForm(), ...defaults });
    setShowForm(true);
  };

  const openEdit = (equipo: any) => {
    setEditingId(equipo.id);
    setForm({
      nombre: equipo.nombre,
      tipo: equipo.tipo,
      red: equipo.red || "",
      lider_id: equipo.lider_id || "",
      lider2_id: equipo.lider2_id || "",
      parent_id: equipo.parent_id || "",
      descripcion: equipo.descripcion || "",
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.nombre.trim()) { toast.error("El nombre es obligatorio"); return; }
    try {
      const payload: any = {
        nombre: form.nombre, tipo: form.tipo,
        red: form.red || null, lider_id: form.lider_id || null,
        lider2_id: (form.lider2_id && form.lider2_id !== "none") ? form.lider2_id : null,
        parent_id: form.parent_id || null, descripcion: form.descripcion || null,
      };
      if (editingId) {
        await updateEquipo.mutateAsync({ id: editingId, ...payload });
        toast.success("Actualizado correctamente");
      } else {
        await createEquipo.mutateAsync(payload);
        toast.success("Creado correctamente");
      }
      setShowForm(false);
      setForm(emptyForm());
    } catch (err: any) {
      toast.error(err.message || "Error");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteEquipo.mutateAsync(id);
      toast.success("Eliminado");
    } catch { toast.error("Error al eliminar"); }
  };

  // Assign/unassign a group to a red
  const handleAssignGrupo = async (grupoId: string, red: string | null) => {
    try {
      await updateGrupo.mutateAsync({ id: grupoId, red: red });
      toast.success(red ? `Asignado a Red ${red}` : "Removido de la red");
    } catch { toast.error("Error al asignar"); }
  };

  // Unassigned groups for the assign dialog
  const unassignedGrupos = useMemo(() => {
    if (!grupos) return [];
    return (grupos as any[]).filter(g => {
      if (assigningRed && g.red === assigningRed) return false;
      const q = assignSearch.toLowerCase();
      if (q && !g.nombre.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [grupos, assigningRed, assignSearch]);

  // Groups currently in the assigning red
  const currentRedGrupos = useMemo(() => {
    if (!grupos || !assigningRed) return [];
    return (grupos as any[]).filter(g => g.red === assigningRed);
  }, [grupos, assigningRed]);

  if (loadingGrupos || loadingEquipos) {
    return <div className="text-center py-12 text-muted-foreground">Cargando estructura...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Overview */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-lg font-semibold">Jerarquía Ministerial</h3>
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" variant="outline" onClick={() => openCreate({ tipo: "equipo" })} className="gap-1">
            <Plus className="h-3.5 w-3.5" /> Equipo Ministerial
          </Button>
          <Button size="sm" variant="outline" onClick={() => openCreate({ tipo: "lider_red" })} className="gap-1">
            <Plus className="h-3.5 w-3.5" /> Líder de Red
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl border bg-card p-4 text-center">
          <Crown className="h-6 w-6 text-primary mx-auto mb-1" />
          <p className="text-2xl font-bold">{(equipos || []).filter(e => e.tipo === "equipo").length || 1}</p>
          <p className="text-xs text-muted-foreground">Equipo Ministerial</p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center">
          <Network className="h-6 w-6 text-info mx-auto mb-1" />
          <p className="text-2xl font-bold">{totalRedes}</p>
          <p className="text-xs text-muted-foreground">Redes</p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center">
          <Home className="h-6 w-6 text-amber-500 mx-auto mb-1" />
          <p className="text-2xl font-bold">{totalGrupos}</p>
          <p className="text-xs text-muted-foreground">Casas de Paz</p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center">
          <Users className="h-6 w-6 text-success mx-auto mb-1" />
          <p className="text-2xl font-bold">
            {(grupos || []).reduce((s: number, g: any) => s + (g.grupo_miembros?.[0]?.count || 0), 0)}
          </p>
          <p className="text-xs text-muted-foreground">Total Asistentes</p>
        </div>
      </div>

      {/* Tree */}
      <div className="rounded-xl border bg-card overflow-hidden">
        {/* Equipo Ministerial header */}
        <div className="bg-primary/5 border-b p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Crown className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">{equipoMinisterial?.nombre || "Equipo Ministerial"}</h3>
                <p className="text-xs text-muted-foreground">
                  {equipoMinisterial?.lider ? `${equipoMinisterial.lider.nombres} ${equipoMinisterial.lider.apellidos} · ` : ""}
                  {totalRedes} Redes · {totalGrupos} Casas de Paz
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {equipoMinisterial && (
                <>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(equipoMinisterial)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <DeleteConfirmDialog
                    onConfirm={() => handleDelete(equipoMinisterial.id)}
                    title="¿Eliminar equipo ministerial?"
                    description="Se eliminará permanentemente."
                  />
                </>
              )}
            </div>
          </div>
        </div>

        <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 340px)', minHeight: '300px' }}>
          <div className="p-2">
            {hierarchy.redes.map((red) => {
              const hasContent = red.grupos.length > 0 || red.liderRed;
              return (
                <div key={red.nombre} className="mb-2">
                  <button
                    className="w-full flex items-center gap-3 p-3 rounded-lg bg-muted/50 mb-1 hover:bg-muted/70 transition-colors"
                    onClick={() => toggleRed(red.nombre)}
                  >
                    {expandedRedes.has(red.nombre) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    <div className="w-2 h-8 rounded-full bg-info" />
                    <Network className="h-4 w-4 text-info" />
                    <div className="flex-1 text-left">
                      <p className="text-sm font-semibold">Red {red.nombre}</p>
                      <p className="text-xs text-muted-foreground">
                        {red.liderRed?.lider ? `${red.liderRed.lider.nombres} ${red.liderRed.lider.apellidos}` : "Sin líder"}
                        {red.liderRed?.lider2 ? ` y ${red.liderRed.lider2.nombres} ${red.liderRed.lider2.apellidos}` : ""}
                        {` · ${red.grupos.length} casas de paz · ${red.totalMiembros} asistentes`}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">{red.grupos.length}</Badge>
                    <div className="flex items-center gap-0.5" onClick={e => e.stopPropagation()}>
                      {/* Assign casas de paz */}
                      <Button size="icon" variant="ghost" className="h-7 w-7" title="Asignar casas de paz" onClick={() => { setAssigningRed(red.nombre); setAssignSearch(""); }}>
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                      {red.liderRed ? (
                        <>
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(red.liderRed)}>
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <DeleteConfirmDialog
                            onConfirm={() => handleDelete(red.liderRed!.id)}
                            title={`¿Eliminar líder de Red ${red.nombre}?`}
                            description="Se eliminará el registro del líder de esta red."
                          />
                        </>
                      ) : (
                        <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={() => openCreate({ tipo: "lider_red", red: red.nombre, nombre: `Líder Red ${red.nombre}` })}>
                          <Crown className="h-3 w-3" /> Asignar Líder
                        </Button>
                      )}
                    </div>
                  </button>

                  {expandedRedes.has(red.nombre) && (
                    <div className="ml-6 border-l-2 border-muted pl-4 space-y-1">
                      {red.grupos.length === 0 && (
                        <p className="text-xs text-muted-foreground py-2 pl-2">No hay casas de paz asignadas a esta red</p>
                      )}
                      {red.grupos.map((g: any) => (
                        <div
                          key={g.id}
                          className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer group"
                          onClick={() => onSelectGrupo?.(g.id)}
                        >
                          <Home className="h-4 w-4 text-amber-500 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate group-hover:underline">{g.nombre}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              {g.lider && (
                                <span className="flex items-center gap-1">
                                  <Avatar className="h-4 w-4">
                                    <AvatarImage src={g.lider.foto_url || undefined} />
                                    <AvatarFallback className="text-[6px]">{g.lider.nombres[0]}{g.lider.apellidos[0]}</AvatarFallback>
                                  </Avatar>
                                  {g.lider.nombres} {g.lider.apellidos}
                                </span>
                              )}
                              <span>· {g.miembrosCount} miembros</span>
                              {g.dia_reunion && <span>· {g.dia_reunion} {g.hora_reunion || ""}</span>}
                            </div>
                          </div>
                          <Badge variant={g.estado === "Activo" ? "default" : "secondary"} className="text-[10px] h-5">{g.estado}</Badge>
                          <div onClick={e => e.stopPropagation()}>
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive opacity-0 group-hover:opacity-100 transition-opacity" title="Quitar de esta red" onClick={() => handleAssignGrupo(g.id, null)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {hierarchy.sinRed.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 mb-1">
                  <div className="w-2 h-8 rounded-full bg-muted-foreground/30" />
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-muted-foreground">Sin Red Asignada</p>
                    <p className="text-xs text-muted-foreground">{hierarchy.sinRed.length} grupos</p>
                  </div>
                </div>
                <div className="ml-6 border-l-2 border-muted pl-4 space-y-1">
                  {hierarchy.sinRed.map((g: any) => (
                    <div
                      key={g.id}
                      className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer group"
                      onClick={() => onSelectGrupo?.(g.id)}
                    >
                      <Home className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate group-hover:underline">{g.nombre}</p>
                        <p className="text-xs text-muted-foreground">{g.lider ? `${g.lider.nombres} ${g.lider.apellidos} · ` : ""}{g.miembrosCount} miembros</p>
                      </div>
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ====== Create/Edit Dialog ====== */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar" : "Crear"} {form.tipo === "equipo" ? "Equipo Ministerial" : "Líder de Red"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Nombre *</label>
              <Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Tipo</label>
              <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="equipo">Equipo Ministerial</SelectItem>
                  <SelectItem value="lider_red">Líder de Red</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {form.tipo === "lider_red" && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Red *</label>
                <Select value={form.red} onValueChange={(v) => setForm({ ...form, red: v })}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar red" /></SelectTrigger>
                  <SelectContent>
                    {REDES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Líder 1</label>
              <Select value={form.lider_id} onValueChange={(v) => setForm({ ...form, lider_id: v })}>
                <SelectTrigger><SelectValue placeholder="Seleccionar líder" /></SelectTrigger>
                <SelectContent>
                  {(personas || []).map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.nombres} {p.apellidos}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {form.tipo === "lider_red" && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Líder 2</label>
                <Select value={form.lider2_id} onValueChange={(v) => setForm({ ...form, lider2_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar segundo líder (opcional)" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">— Sin segundo líder —</SelectItem>
                    {(personas || []).filter(p => p.id !== form.lider_id).map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.nombres} {p.apellidos}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Descripción</label>
              <Textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} rows={2} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button onClick={handleSave} disabled={createEquipo.isPending || updateEquipo.isPending}>
                {editingId ? "Actualizar" : "Crear"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ====== Assign Casas de Paz Dialog ====== */}
      <Dialog open={!!assigningRed} onOpenChange={(open) => { if (!open) setAssigningRed(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Gestionar Casas de Paz — Red {assigningRed}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Currently assigned */}
            {currentRedGrupos.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Casas de paz en esta red ({currentRedGrupos.length})</p>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {currentRedGrupos.map((g: any) => (
                    <div key={g.id} className="flex items-center gap-3 p-2 rounded-lg border bg-muted/30">
                      <Home className="h-4 w-4 text-amber-500 shrink-0" />
                      <p className="text-sm flex-1 truncate">{g.nombre}</p>
                      <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive" onClick={() => handleAssignGrupo(g.id, null)}>
                        Quitar
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Search to add */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Agregar casas de paz</p>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar grupo..." value={assignSearch} onChange={e => setAssignSearch(e.target.value)} className="pl-10" />
              </div>
              <ScrollArea className="max-h-52">
                <div className="space-y-1">
                  {unassignedGrupos.slice(0, 30).map((g: any) => (
                    <div key={g.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30">
                      <Home className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{g.nombre}</p>
                        <p className="text-xs text-muted-foreground">{g.red ? `Red ${g.red}` : "Sin red"} · {g.tipo}</p>
                      </div>
                      <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => handleAssignGrupo(g.id, assigningRed!)}>
                        <Plus className="h-3 w-3" /> Asignar
                      </Button>
                    </div>
                  ))}
                  {unassignedGrupos.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">No hay grupos disponibles</p>
                  )}
                </div>
              </ScrollArea>
            </div>

            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setAssigningRed(null)}>Cerrar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

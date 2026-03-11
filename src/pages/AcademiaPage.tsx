import { useState, useMemo, useCallback } from "react";
import PageHeader from "@/components/shared/PageHeader";
import MetricCard from "@/components/shared/MetricCard";
import CursoFormDialog from "@/components/forms/CursoFormDialog";
import PeriodoFormDialog from "@/components/forms/PeriodoFormDialog";
import MateriaFormDialog from "@/components/forms/MateriaFormDialog";
import MatriculaFormDialog from "@/components/forms/MatriculaFormDialog";
import AulaFormDialog from "@/components/forms/AulaFormDialog";
import CorteFormDialog from "@/components/forms/CorteFormDialog";
import ItemCalificableFormDialog from "@/components/forms/ItemCalificableFormDialog";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import MateriaAttendanceTrendChart from "@/components/charts/MateriaAttendanceTrendChart";
import ExportDropdown from "@/components/shared/ExportDropdown";
import {
  useEscuelas, useAllMatriculas, useCertificados, usePeriodos,
  useMaterias, useMatriculas, useUpdateMatricula, useCreateCertificado,
  useUpdatePeriodo, useDeleteMateria, useAllPeriodos,
  useAulas, useUpdateAula, useDeleteAula,
  useCortes, useAllItemsByCorte, useDeleteCorte, useDeleteItemCalificable,
  useCalificacionesByMateriaCorte, useBulkUpsertCalificaciones,
  useAsistenciaMaterias, useUpsertAsistenciaMateria,
} from "@/hooks/useAcademia";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  GraduationCap, BookOpen, Award, Users, Clock, CalendarDays,
  Search, UserCheck, ChevronRight, FileText, Lock, Unlock,
  MoreVertical, Trash2, BookText, ArrowLeft, Building2,
  BarChart3, Eye, ClipboardCheck, CheckCircle2, XCircle,
  Save, Check, X,
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { exportToExcel } from "@/lib/exportUtils";
import { cn } from "@/lib/utils";

const ESTADO_PERIODO: Record<string, { icon: any; color: string }> = {
  Abierto: { icon: Unlock, color: "bg-success/10 text-success border-success/20" },
  Cerrado: { icon: Lock, color: "bg-destructive/10 text-destructive border-destructive/20" },
};

// ========== ESCUELAS VIEW ==========
function EscuelasView({ escuelas, allPeriodos, allMatriculas, search, setSearch, onSelectEscuela }: any) {
  const enriched = useMemo(() => {
    return (escuelas || []).map((e: any) => {
      const periodos = (allPeriodos || []).filter((p: any) => p.escuela_id === e.id);
      const periodosAbiertos = periodos.filter((p: any) => p.estado === "Abierto").length;
      const mats = (allMatriculas || []).filter((m: any) => m.curso_id === e.id);
      return { ...e, periodosCount: periodos.length, periodosAbiertos, estudiantesCount: new Set(mats.map((m: any) => m.persona_id)).size, matriculasCount: mats.length };
    });
  }, [escuelas, allPeriodos, allMatriculas]);

  const filtered = useMemo(() => {
    if (!search) return enriched;
    const q = search.toLowerCase();
    return enriched.filter((e: any) => e.nombre.toLowerCase().includes(q));
  }, [enriched, search]);

  return (
    <>
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar escuela..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>
      {filtered.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center text-muted-foreground">
          <GraduationCap className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No hay escuelas registradas.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((e: any) => (
            <div key={e.id} onClick={() => onSelectEscuela(e.id)} className="group rounded-xl border bg-card p-5 cursor-pointer hover:shadow-md transition-all hover:border-primary/30">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(ev) => ev.stopPropagation()}><MoreVertical className="h-4 w-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="text-destructive"><Trash2 className="h-4 w-4 mr-2" /> Eliminar</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">{e.nombre}</h3>
              {e.descripcion && <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{e.descripcion}</p>}
              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" /> {e.periodosCount} período(s)</span>
                {e.periodosAbiertos > 0 && (
                  <Badge variant="outline" className="text-[10px] bg-success/10 text-success border-success/20">{e.periodosAbiertos} abierto(s)</Badge>
                )}
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1 font-medium"><Users className="h-3 w-3" /> {e.estudiantesCount}</span>
                  <span className="flex items-center gap-1 text-muted-foreground"><GraduationCap className="h-3 w-3" /> {e.matriculasCount} mat.</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

// ========== PERIODOS VIEW ==========
function PeriodosView({ escuela, periodos, allMatriculas, onBack, onSelectPeriodo }: any) {
  const updatePeriodo = useUpdatePeriodo();
  const enriched = useMemo(() => {
    return (periodos || []).map((p: any) => {
      const mats = (allMatriculas || []).filter((m: any) => m.periodo_id === p.id);
      return { ...p, estudiantesActivos: mats.filter((m: any) => m.estado === "Activo").length, totalMatriculas: mats.length };
    });
  }, [periodos, allMatriculas]);

  const toggleEstado = async (p: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const nuevo = p.estado === "Abierto" ? "Cerrado" : "Abierto";
    try { await updatePeriodo.mutateAsync({ id: p.id, estado: nuevo }); toast.success(`Período ${nuevo.toLowerCase()}`); }
    catch { toast.error("Error al actualizar"); }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader title={escuela.nombre} description={escuela.descripcion || "Períodos académicos"}>
        <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft className="h-4 w-4 mr-1" /> Escuelas</Button>
        <PeriodoFormDialog escuelaId={escuela.id} />
      </PageHeader>
      <div className="grid grid-cols-3 gap-4">
        <MetricCard title="Todos" value={enriched.length} icon={CalendarDays} />
        <MetricCard title="Abiertos" value={enriched.filter((p: any) => p.estado === "Abierto").length} icon={Unlock} variant="success" />
        <MetricCard title="Cerrados" value={enriched.filter((p: any) => p.estado === "Cerrado").length} icon={Lock} variant="accent" />
      </div>
      {enriched.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center text-muted-foreground">
          <CalendarDays className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No hay períodos creados.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {enriched.map((p: any) => {
            const cfg = ESTADO_PERIODO[p.estado] || ESTADO_PERIODO.Abierto;
            const Icon = cfg.icon;
            return (
              <div key={p.id} onClick={() => onSelectPeriodo(p.id)} className="group rounded-xl border bg-card p-5 cursor-pointer hover:shadow-md transition-all hover:border-primary/30">
                <div className="text-center mb-3">
                  <h3 className="font-bold text-foreground uppercase text-sm group-hover:text-primary transition-colors">{p.nombre}</h3>
                  <Badge variant="outline" className={`mt-2 text-[10px] ${cfg.color}`} onClick={(e) => toggleEstado(p, e)}>
                    <Icon className="h-3 w-3 mr-1" /> {p.estado.toUpperCase()}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground space-y-1 mb-4">
                  <p className="flex items-center gap-1"><BookOpen className="h-3 w-3" /> {escuela.nombre}</p>
                  {p.fecha_inicio && <p className="flex items-center gap-1"><CalendarDays className="h-3 w-3" /> {format(parseISO(p.fecha_inicio), "yyyy-MM-dd")}{p.fecha_fin ? ` al ${format(parseISO(p.fecha_fin), "yyyy-MM-dd")}` : ""}</p>}
                  {p.fecha_matricula_inicio && <p className="flex items-center gap-1"><GraduationCap className="h-3 w-3" /> Mat: {format(parseISO(p.fecha_matricula_inicio), "yyyy-MM-dd")}{p.fecha_matricula_fin ? ` al ${format(parseISO(p.fecha_matricula_fin), "yyyy-MM-dd")}` : ""}</p>}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Estudiantes activos</span>
                    <Badge className="bg-primary text-primary-foreground"><Users className="h-3 w-3 mr-1" /> {p.estudiantesActivos}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Total matrículas</span>
                    <Badge className="bg-primary text-primary-foreground"><GraduationCap className="h-3 w-3 mr-1" /> {p.totalMatriculas}</Badge>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ========== GRADING GRID ==========
function GradingGrid({ cortes, materias, periodoId }: any) {
  const [selectedCorte, setSelectedCorte] = useState<string | null>(null);
  const [selectedMateria, setSelectedMateria] = useState<string | null>(null);
  const { data: items } = useAllItemsByCorte(selectedCorte);
  const { data: matriculas } = useMatriculas(periodoId);
  const { data: calificaciones } = useCalificacionesByMateriaCorte(selectedCorte, selectedMateria);
  const bulkUpsert = useBulkUpsertCalificaciones();
  const deleteItem = useDeleteItemCalificable();

  const materiaItems = useMemo(() => {
    if (!items || !selectedMateria) return [];
    return items.filter((i: any) => i.materia_id === selectedMateria);
  }, [items, selectedMateria]);

  const activeStudents = useMemo(() => {
    return (matriculas || []).filter((m: any) => m.estado === "Activo");
  }, [matriculas]);

  // Build a map: `${matricula_id}_${item_id}` -> nota
  const [localGrades, setLocalGrades] = useState<Record<string, string>>({});
  const [initialized, setInitialized] = useState<string | null>(null);

  const gradeKey = `${selectedCorte}_${selectedMateria}`;
  if (calificaciones && initialized !== gradeKey) {
    const map: Record<string, string> = {};
    calificaciones.forEach((c: any) => {
      map[`${c.matricula_id}_${c.item_id}`] = c.nota != null ? String(c.nota) : "";
    });
    setLocalGrades(map);
    setInitialized(gradeKey);
  }

  const handleGradeChange = (matriculaId: string, itemId: string, value: string) => {
    setLocalGrades(prev => ({ ...prev, [`${matriculaId}_${itemId}`]: value }));
  };

  const saveGrades = async () => {
    const records: { item_id: string; matricula_id: string; nota: number | null }[] = [];
    activeStudents.forEach((m: any) => {
      materiaItems.forEach((item: any) => {
        const val = localGrades[`${m.id}_${item.id}`];
        if (val !== undefined && val !== "") {
          records.push({ item_id: item.id, matricula_id: m.id, nota: parseFloat(val) });
        } else if (val === "") {
          records.push({ item_id: item.id, matricula_id: m.id, nota: null });
        }
      });
    });
    if (!records.length) return;
    try {
      await bulkUpsert.mutateAsync(records);
      toast.success("Calificaciones guardadas");
    } catch { toast.error("Error al guardar"); }
  };

  const exportGrades = () => {
    if (!materiaItems.length || !activeStudents.length) return;
    const columns = [
      { header: "Estudiante", key: "estudiante" },
      ...materiaItems.map((i: any) => ({ header: i.nombre, key: i.id })),
    ];
    const data = activeStudents.map((m: any) => {
      const row: any = { estudiante: `${m.personas?.nombres} ${m.personas?.apellidos}` };
      materiaItems.forEach((item: any) => {
        row[item.id] = localGrades[`${m.id}_${item.id}`] || "";
      });
      return row;
    });
    exportToExcel({ title: "Calificaciones", columns, data, filename: "calificaciones" });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(cortes || []).map((c: any) => (
          <Button key={c.id} size="sm" variant={selectedCorte === c.id ? "default" : "outline"}
            onClick={() => { setSelectedCorte(c.id); setSelectedMateria(null); setInitialized(null); }}>
            {c.nombre} ({c.porcentaje}%)
          </Button>
        ))}
        {!cortes?.length && <p className="text-sm text-muted-foreground">Configura cortes en la pestaña "Información general" primero.</p>}
      </div>

      {selectedCorte && (
        <div className="rounded-xl border bg-card p-4">
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Materia:</label>
          <Select value={selectedMateria || ""} onValueChange={(v) => { setSelectedMateria(v); setInitialized(null); }}>
            <SelectTrigger className="h-9"><SelectValue placeholder="Seleccionar materia" /></SelectTrigger>
            <SelectContent>
              {(materias || []).map((m: any) => (
                <SelectItem key={m.id} value={m.id}>{m.nombre}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {selectedCorte && selectedMateria && (
        <>
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <ItemCalificableFormDialog corteId={selectedCorte} materiaId={selectedMateria} />
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={exportGrades} disabled={!materiaItems.length}>
                Exportar Excel
              </Button>
              <Button size="sm" onClick={saveGrades} disabled={bulkUpsert.isPending} className="gap-1.5">
                <Save className="h-3.5 w-3.5" /> {bulkUpsert.isPending ? "Guardando..." : "Guardar notas"}
              </Button>
            </div>
          </div>

          {!materiaItems.length ? (
            <p className="text-xs text-muted-foreground text-center py-6">No hay ítems calificables. Agrega uno primero.</p>
          ) : !activeStudents.length ? (
            <p className="text-xs text-muted-foreground text-center py-6">No hay estudiantes activos matriculados.</p>
          ) : (
            <div className="rounded-xl border bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="text-left p-3 font-medium text-muted-foreground sticky left-0 bg-muted/30 min-w-[200px]">Estudiante</th>
                      {materiaItems.map((item: any) => (
                        <th key={item.id} className="text-center p-3 font-medium text-muted-foreground min-w-[100px]">
                          <div>{item.nombre}</div>
                          <div className="text-[10px] font-normal">{item.porcentaje != null ? `${item.porcentaje}%` : ""}</div>
                        </th>
                      ))}
                      <th className="text-center p-3 font-medium text-muted-foreground min-w-[80px]">Promedio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeStudents.map((m: any) => {
                      const initials = `${m.personas?.nombres?.[0] || ""}${m.personas?.apellidos?.[0] || ""}`.toUpperCase();
                      const grades = materiaItems.map((item: any) => {
                        const val = localGrades[`${m.id}_${item.id}`];
                        return val ? parseFloat(val) : null;
                      });
                      const validGrades = grades.filter((g): g is number => g !== null);
                      const avg = validGrades.length ? (validGrades.reduce((s, v) => s + v, 0) / validGrades.length).toFixed(1) : "—";
                      return (
                        <tr key={m.id} className="border-b last:border-0 hover:bg-muted/20">
                          <td className="p-3 sticky left-0 bg-card">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-7 w-7">
                                <AvatarImage src={m.personas?.foto_url || undefined} />
                                <AvatarFallback className="text-[10px] font-semibold">{initials}</AvatarFallback>
                              </Avatar>
                              <span className="text-sm font-medium truncate">{m.personas?.nombres} {m.personas?.apellidos}</span>
                            </div>
                          </td>
                          {materiaItems.map((item: any) => (
                            <td key={item.id} className="p-2 text-center">
                              <Input
                                type="number"
                                min={0}
                                max={5}
                                step={0.1}
                                className="h-8 w-20 mx-auto text-center text-sm"
                                value={localGrades[`${m.id}_${item.id}`] ?? ""}
                                onChange={(e) => handleGradeChange(m.id, item.id, e.target.value)}
                              />
                            </td>
                          ))}
                          <td className="p-3 text-center font-semibold">{avg}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ========== ASISTENCIA MATERIA TAB ==========
function AsistenciaMateriaTab({ materias, periodoId }: any) {
  const [selectedMateria, setSelectedMateria] = useState<string | null>(null);
  const [fecha, setFecha] = useState(format(new Date(), "yyyy-MM-dd"));
  const { data: matriculas } = useMatriculas(periodoId);
  const { data: asistenciaData } = useAsistenciaMaterias(selectedMateria, fecha);
  const upsertAsistencia = useUpsertAsistenciaMateria();
  const [localAtt, setLocalAtt] = useState<Record<string, boolean>>({});
  const [initialized, setInitialized] = useState<string | null>(null);

  const activeStudents = useMemo(() => (matriculas || []).filter((m: any) => m.estado === "Activo"), [matriculas]);

  const attKey = `${selectedMateria}_${fecha}`;
  if (asistenciaData && initialized !== attKey) {
    const map: Record<string, boolean> = {};
    asistenciaData.forEach((a: any) => { map[a.matricula_id] = a.presente; });
    setLocalAtt(map);
    setInitialized(attKey);
  }

  const toggleAtt = (id: string) => setLocalAtt(prev => ({ ...prev, [id]: !prev[id] }));
  const markAll = (v: boolean) => {
    const map: Record<string, boolean> = {};
    activeStudents.forEach((m: any) => { map[m.id] = v; });
    setLocalAtt(map);
  };

  const saveAtt = async () => {
    if (!selectedMateria) return;
    const records = activeStudents.map((m: any) => ({
      materia_id: selectedMateria,
      matricula_id: m.id,
      fecha,
      presente: !!localAtt[m.id],
    }));
    try {
      await upsertAsistencia.mutateAsync(records);
      toast.success("Asistencia guardada");
    } catch { toast.error("Error al guardar"); }
  };

  const totalPresent = Object.values(localAtt).filter(Boolean).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px]">
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Materia:</label>
          <Select value={selectedMateria || ""} onValueChange={(v) => { setSelectedMateria(v); setInitialized(null); }}>
            <SelectTrigger className="h-9"><SelectValue placeholder="Seleccionar materia" /></SelectTrigger>
            <SelectContent>
              {(materias || []).map((m: any) => (
                <SelectItem key={m.id} value={m.id}>{m.nombre}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Fecha:</label>
          <Input type="date" value={fecha} onChange={(e) => { setFecha(e.target.value); setInitialized(null); }} className="h-9 w-44" />
        </div>
      </div>

      {selectedMateria && (
        <>
          <div className="flex items-center gap-2 justify-between">
            <div className="flex gap-3 text-sm">
              <span className="text-success font-medium">Presentes: {totalPresent}</span>
              <span className="text-muted-foreground">Ausentes: {activeStudents.length - totalPresent}</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => markAll(true)} className="text-xs gap-1"><Check className="h-3.5 w-3.5" /> Todos</Button>
              <Button variant="outline" size="sm" onClick={() => markAll(false)} className="text-xs gap-1"><X className="h-3.5 w-3.5" /> Ninguno</Button>
              <Button size="sm" onClick={saveAtt} disabled={upsertAsistencia.isPending} className="gap-1.5">
                <Save className="h-3.5 w-3.5" /> Guardar
              </Button>
            </div>
          </div>

          <div className="rounded-xl border bg-card divide-y">
            {!activeStudents.length ? (
              <p className="text-xs text-muted-foreground text-center py-8">No hay estudiantes activos.</p>
            ) : (
              activeStudents.map((m: any) => {
                const isPresent = !!localAtt[m.id];
                const initials = `${m.personas?.nombres?.[0] || ""}${m.personas?.apellidos?.[0] || ""}`.toUpperCase();
                return (
                  <div key={m.id} className="flex items-center justify-between px-4 py-3 hover:bg-muted/20 cursor-pointer" onClick={() => toggleAtt(m.id)}>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={m.personas?.foto_url || undefined} />
                        <AvatarFallback className="text-xs font-semibold">{initials}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{m.personas?.nombres} {m.personas?.apellidos}</span>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleAtt(m.id); }}
                      className={cn(
                        "w-9 h-9 rounded-full flex items-center justify-center transition-all shrink-0",
                        isPresent ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"
                      )}
                    >
                      {isPresent ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ========== PERIODO DETAIL VIEW ==========
function PeriodoDetailView({ escuela, periodo, onBackToPeriodos }: any) {
  const { data: materias, isLoading: loadingMaterias } = useMaterias(periodo.id);
  const { data: matriculas } = useMatriculas(periodo.id);
  const { data: cortes } = useCortes(periodo.id);
  const updateMatricula = useUpdateMatricula();
  const createCertificado = useCreateCertificado();
  const deleteMateria = useDeleteMateria();
  const deleteCorte = useDeleteCorte();
  const [activeTab, setActiveTab] = useState<string>("info");

  const handleEstadoMatricula = async (id: string, estado: string) => {
    try { await updateMatricula.mutateAsync({ id, estado }); toast.success("Estado actualizado"); }
    catch { toast.error("Error al actualizar"); }
  };

  const handleEmitirCertificado = async (m: any) => {
    try { await createCertificado.mutateAsync({ matricula_id: m.id, persona_id: m.persona_id, curso_id: escuela.id }); toast.success("Certificado emitido"); }
    catch (err: any) { toast.error(err.message?.includes("duplicate") ? "Ya tiene certificado" : "Error al emitir"); }
  };

  const totalPorcentajeCortes = (cortes || []).reduce((sum: number, c: any) => sum + (Number(c.porcentaje) || 0), 0);

  const exportMatriculas = () => {
    if (!matriculas?.length) return;
    exportToExcel({
      title: "Matrículas",
      columns: [
        { header: "Nombres", key: "nombres" },
        { header: "Apellidos", key: "apellidos" },
        { header: "Fecha Matrícula", key: "fecha_matricula" },
        { header: "Estado", key: "estado" },
        { header: "Nota Final", key: "nota_final" },
        { header: "Materia", key: "materia" },
      ],
      data: matriculas.map((m: any) => ({
        nombres: m.personas?.nombres || "",
        apellidos: m.personas?.apellidos || "",
        fecha_matricula: m.fecha_matricula,
        estado: m.estado,
        nota_final: m.nota_final ?? "",
        materia: m.materias?.nombre || "",
      })),
      filename: `matriculas-${periodo.nombre}`,
    });
  };

  const tabs = [
    { id: "info", label: "Información general", icon: Eye },
    { id: "estudiantes", label: "Alumnos", icon: Users },
    { id: "calificaciones", label: "Calificaciones", icon: BarChart3 },
    { id: "asistencia", label: "Asistencia", icon: ClipboardCheck },
    { id: "materias", label: "Materias", icon: BookText },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader title={periodo.nombre} description={`${escuela.nombre} · Período académico`}>
        <Button variant="ghost" size="sm" onClick={onBackToPeriodos}><ArrowLeft className="h-4 w-4 mr-1" /> Períodos</Button>
        <MatriculaFormDialog cursoId={escuela.id} periodoId={periodo.id} />
      </PageHeader>

      {/* Tabs */}
      <div className="flex gap-1 border-b overflow-x-auto">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            <t.icon className="h-4 w-4 inline mr-1.5" />{t.label}
          </button>
        ))}
      </div>

      {/* INFO TAB */}
      {activeTab === "info" && (
        <div className="space-y-6">
          <div className="rounded-xl border bg-card p-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <CalendarDays className="h-7 w-7 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-lg font-bold text-foreground">{periodo.nombre}</h2>
                  <Badge variant="outline" className={ESTADO_PERIODO[periodo.estado]?.color}>{periodo.estado}</Badge>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" /> {escuela.nombre}</span>
                  {periodo.fecha_inicio && <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> {format(parseISO(periodo.fecha_inicio), "d MMM yyyy", { locale: es })}{periodo.fecha_fin ? ` — ${format(parseISO(periodo.fecha_fin), "d MMM yyyy", { locale: es })}` : ""}</span>}
                </div>
              </div>
              <div className="flex gap-3 shrink-0">
                <div className="text-center px-4 py-2 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold text-foreground">{matriculas?.length || 0}</p>
                  <p className="text-xs text-muted-foreground">Estudiantes</p>
                </div>
                <div className="text-center px-4 py-2 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold text-foreground">{materias?.length || 0}</p>
                  <p className="text-xs text-muted-foreground">Materias</p>
                </div>
              </div>
            </div>
          </div>

          {/* Cortes section */}
          <div className="rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4 text-primary" /> Configuración de cortes
              </h3>
              <CorteFormDialog periodoId={periodo.id} />
            </div>
            {!cortes?.length ? (
              <p className="text-xs text-muted-foreground text-center py-4">No hay cortes configurados.</p>
            ) : (
              <>
                <div className="space-y-2">
                  {cortes.map((c: any) => (
                    <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div>
                        <p className="text-sm font-semibold">{c.nombre}</p>
                        <p className="text-xs text-muted-foreground">
                          Porcentaje: {c.porcentaje}%
                          {c.fecha_inicio && <> · {format(parseISO(c.fecha_inicio), "yyyy-MM-dd")}{c.fecha_fin ? ` al ${format(parseISO(c.fecha_fin), "yyyy-MM-dd")}` : ""}</>}
                        </p>
                      </div>
                      <DeleteConfirmDialog title="Eliminar corte" description={`¿Eliminar "${c.nombre}"?`} onConfirm={() => deleteCorte.mutateAsync(c.id)} />
                    </div>
                  ))}
                </div>
                <p className={`text-xs mt-3 font-medium ${totalPorcentajeCortes === 100 ? "text-success" : "text-destructive"}`}>
                  {totalPorcentajeCortes === 100 ? <><CheckCircle2 className="h-3 w-3 inline mr-1" />Los porcentajes están completos (100%).</> : <><XCircle className="h-3 w-3 inline mr-1" />Porcentaje total: {totalPorcentajeCortes}% (debe ser 100%).</>}
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* ESTUDIANTES TAB */}
      {activeTab === "estudiantes" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm" variant="outline" onClick={exportMatriculas} disabled={!matriculas?.length}>
              Exportar Matrículas a Excel
            </Button>
          </div>
          <div className="space-y-2">
            {!matriculas?.length ? (
              <div className="rounded-xl border bg-card p-12 text-center text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-40" />
                <p className="text-sm">No hay estudiantes matriculados.</p>
              </div>
            ) : (
              matriculas.map((m: any) => {
                const initials = `${m.personas?.nombres?.[0] || ""}${m.personas?.apellidos?.[0] || ""}`.toUpperCase();
                return (
                  <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl border bg-card hover:shadow-sm transition-shadow">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={m.personas?.foto_url || undefined} />
                      <AvatarFallback className="text-xs font-semibold">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{m.personas?.nombres} {m.personas?.apellidos}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(parseISO(m.fecha_matricula), "d MMM yyyy", { locale: es })}
                        {m.materias?.nombre && <> · {m.materias.nombre}</>}
                        {m.nota_final != null && <> · Nota: <strong>{m.nota_final}</strong></>}
                      </p>
                    </div>
                    <Select value={m.estado} onValueChange={(v) => handleEstadoMatricula(m.id, v)}>
                      <SelectTrigger className="h-8 w-28 text-xs" onClick={(e) => e.stopPropagation()}><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Activo">Activo</SelectItem>
                        <SelectItem value="Completado">Completado</SelectItem>
                        <SelectItem value="Retirado">Retirado</SelectItem>
                      </SelectContent>
                    </Select>
                    {m.estado === "Completado" && (
                      <Button size="sm" variant="outline" className="gap-1 text-xs shrink-0" onClick={() => handleEmitirCertificado(m)}>
                        <Award className="h-3.5 w-3.5" /> Certificado
                      </Button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* CALIFICACIONES TAB - Grading Grid */}
      {activeTab === "calificaciones" && (
        <GradingGrid cortes={cortes} materias={materias} periodoId={periodo.id} />
      )}

      {/* ASISTENCIA TAB */}
      {activeTab === "asistencia" && (
        <AsistenciaMateriaTab materias={materias} periodoId={periodo.id} />
      )}

      {/* MATERIAS TAB */}
      {activeTab === "materias" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <MateriaFormDialog periodoId={periodo.id} />
          </div>
          {loadingMaterias ? <Skeleton className="h-32" /> : !materias?.length ? (
            <div className="rounded-xl border bg-card p-12 text-center text-muted-foreground">
              <BookText className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No hay materias.</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {materias.map((m: any) => (
                <div key={m.id} className="rounded-xl border bg-card p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-foreground text-sm">{m.nombre}</h4>
                    <DeleteConfirmDialog title="Eliminar materia" description={`¿Eliminar "${m.nombre}"?`} onConfirm={() => deleteMateria.mutateAsync(m.id)} />
                  </div>
                  {m.descripcion && <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{m.descripcion}</p>}
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    {(m.personas || m.maestro_nombre) && <span className="flex items-center gap-1"><UserCheck className="h-3 w-3" /> {m.personas ? `${m.personas.nombres} ${m.personas.apellidos}` : m.maestro_nombre}</span>}
                    {m.horario && <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {m.horario}</span>}
                    {(m.aulas || m.aula) && <span className="flex items-center gap-1"><Building2 className="h-3 w-3" /> {m.aulas?.nombre || m.aula}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ========== AULAS MANAGEMENT VIEW ==========
function AulasManagement() {
  const { data: aulas, isLoading } = useAulas();
  const updateAula = useUpdateAula();
  const deleteAula = useDeleteAula();

  return (
    <div className="rounded-xl border bg-card">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="text-sm font-semibold flex items-center gap-2"><Building2 className="h-4 w-4 text-primary" /> Gestionar Aulas</h3>
        <AulaFormDialog />
      </div>
      {isLoading ? <Skeleton className="h-24 m-4" /> : !aulas?.length ? (
        <p className="text-xs text-muted-foreground text-center py-8">No hay aulas registradas.</p>
      ) : (
        <div className="divide-y">
          {aulas.map((a) => (
            <div key={a.id} className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-medium">{a.nombre}</p>
                <p className="text-xs text-muted-foreground">
                  {a.direccion && <>Dirección: {a.direccion}</>}
                  {a.sede && <> · Sede: {a.sede}</>}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Switch checked={a.activo} onCheckedChange={(v) => updateAula.mutateAsync({ id: a.id, activo: v })} />
                  <span className={`text-xs font-medium ${a.activo ? "text-success" : "text-muted-foreground"}`}>{a.activo ? "Sí" : "No"}</span>
                </div>
                <DeleteConfirmDialog title="Eliminar aula" description={`¿Eliminar "${a.nombre}"?`} onConfirm={() => deleteAula.mutateAsync(a.id)} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ========== MAIN PAGE ==========
export default function AcademiaPage() {
  const { data: escuelas, isLoading } = useEscuelas();
  const { data: allMatriculas } = useAllMatriculas();
  const { data: allPeriodos } = useAllPeriodos();
  const { data: certificados } = useCertificados();

  const [selectedEscuela, setSelectedEscuela] = useState<string | null>(null);
  const [selectedPeriodo, setSelectedPeriodo] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [mainTab, setMainTab] = useState<"escuelas" | "aulas">("escuelas");

  const { data: periodos } = usePeriodos(selectedEscuela);

  const totalEscuelas = escuelas?.length || 0;
  const totalEstudiantes = new Set(allMatriculas?.map((m: any) => m.persona_id)).size;
  const totalCertificados = certificados?.length || 0;
  const periodosAbiertos = (allPeriodos || []).filter((p: any) => p.estado === "Abierto").length;

  if (isLoading) {
    return (
      <div className="animate-fade-in space-y-4">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-4 gap-4">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24" />)}</div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  const escuelaActual = escuelas?.find((e: any) => e.id === selectedEscuela);
  const periodoActual = periodos?.find((p: any) => p.id === selectedPeriodo);

  if (selectedEscuela && escuelaActual && selectedPeriodo && periodoActual) {
    return <PeriodoDetailView escuela={escuelaActual} periodo={periodoActual} onBackToPeriodos={() => setSelectedPeriodo(null)} />;
  }

  if (selectedEscuela && escuelaActual) {
    return <PeriodosView escuela={escuelaActual} periodos={periodos} allMatriculas={allMatriculas} onBack={() => setSelectedEscuela(null)} onSelectPeriodo={setSelectedPeriodo} />;
  }

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader title="Academia" description="Formación bíblica y escuelas de la iglesia">
        <CursoFormDialog />
      </PageHeader>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="Escuelas" value={totalEscuelas} icon={BookOpen} />
        <MetricCard title="Períodos Abiertos" value={periodosAbiertos} icon={Unlock} variant="success" />
        <MetricCard title="Estudiantes" value={totalEstudiantes} icon={Users} variant="info" />
        <MetricCard title="Certificados" value={totalCertificados} icon={Award} variant="accent" />
      </div>

      {/* Main tabs: Escuelas vs Aulas */}
      <div className="flex gap-1 border-b">
        <button onClick={() => setMainTab("escuelas")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${mainTab === "escuelas" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
          <BookOpen className="h-4 w-4 inline mr-1.5" />Escuelas
        </button>
        <button onClick={() => setMainTab("aulas")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${mainTab === "aulas" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
          <Building2 className="h-4 w-4 inline mr-1.5" />Gestionar Aulas
        </button>
      </div>

      {mainTab === "escuelas" && (
        <>
          <EscuelasView escuelas={escuelas} allPeriodos={allPeriodos} allMatriculas={allMatriculas} search={search} setSearch={setSearch} onSelectEscuela={setSelectedEscuela} />
          {(certificados?.length || 0) > 0 && (
            <div className="rounded-xl border bg-card p-5">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4"><Award className="h-4 w-4 text-accent" /> Últimos Certificados</h3>
              <div className="space-y-2">
                {certificados!.slice(0, 5).map((cert: any) => (
                  <div key={cert.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/50">
                    <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center"><FileText className="h-4 w-4 text-accent" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{cert.personas?.nombres} {cert.personas?.apellidos}</p>
                      <p className="text-xs text-muted-foreground">{cert.cursos?.nombre}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-mono text-muted-foreground">{cert.codigo}</p>
                      <p className="text-[10px] text-muted-foreground">{format(parseISO(cert.fecha_emision), "d MMM yyyy", { locale: es })}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {mainTab === "aulas" && <AulasManagement />}
    </div>
  );
}

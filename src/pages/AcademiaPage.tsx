import { useState, useMemo } from "react";
import PageHeader from "@/components/shared/PageHeader";
import MetricCard from "@/components/shared/MetricCard";
import CursoFormDialog from "@/components/forms/CursoFormDialog";
import PeriodoFormDialog from "@/components/forms/PeriodoFormDialog";
import MateriaFormDialog from "@/components/forms/MateriaFormDialog";
import MatriculaFormDialog from "@/components/forms/MatriculaFormDialog";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import {
  useEscuelas, useAllMatriculas, useCertificados, usePeriodos,
  useMaterias, useMatriculas, useUpdateMatricula, useCreateCertificado,
  useUpdatePeriodo, useDeletePeriodo, useDeleteMateria, useAllPeriodos,
} from "@/hooks/useAcademia";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  GraduationCap, BookOpen, Award, Users, Clock, CalendarDays,
  Search, UserCheck, ChevronRight, FileText, Lock, Unlock,
  MoreVertical, Trash2, BookText, ArrowLeft,
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

const ESTADO_PERIODO: Record<string, { icon: any; color: string }> = {
  Abierto: { icon: Unlock, color: "bg-success/10 text-success border-success/20" },
  Cerrado: { icon: Lock, color: "bg-destructive/10 text-destructive border-destructive/20" },
};

// ========== ESCUELAS VIEW ==========
function EscuelasView({
  escuelas,
  allPeriodos,
  allMatriculas,
  search,
  setSearch,
  onSelectEscuela,
}: any) {
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
            <div
              key={e.id}
              onClick={() => onSelectEscuela(e.id)}
              className="group rounded-xl border bg-card p-5 cursor-pointer hover:shadow-md transition-all hover:border-primary/30"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(ev) => ev.stopPropagation()}>
                      <MoreVertical className="h-4 w-4" />
                    </Button>
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
                  <Badge variant="outline" className="text-[10px] bg-success/10 text-success border-success/20">
                    {e.periodosAbiertos} abierto(s)
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1 font-medium"><Users className="h-3 w-3" /> {e.estudiantesCount} estudiantes</span>
                  <span className="flex items-center gap-1 text-muted-foreground"><GraduationCap className="h-3 w-3" /> {e.matriculasCount} matrículas</span>
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
function PeriodosView({
  escuela,
  periodos,
  allMatriculas,
  onBack,
  onSelectPeriodo,
}: any) {
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
    try {
      await updatePeriodo.mutateAsync({ id: p.id, estado: nuevo });
      toast.success(`Período ${nuevo.toLowerCase()}`);
    } catch { toast.error("Error al actualizar"); }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader title={escuela.nombre} description={escuela.descripcion || "Períodos académicos de la escuela"}>
        <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft className="h-4 w-4 mr-1" /> Escuelas</Button>
        <PeriodoFormDialog escuelaId={escuela.id} />
      </PageHeader>

      {/* Metric cards */}
      <div className="grid grid-cols-3 gap-4">
        <MetricCard title="Todos" value={enriched.length} icon={CalendarDays} />
        <MetricCard title="Abiertos" value={enriched.filter((p: any) => p.estado === "Abierto").length} icon={Unlock} variant="success" />
        <MetricCard title="Cerrados" value={enriched.filter((p: any) => p.estado === "Cerrado").length} icon={Lock} variant="accent" />
      </div>

      {enriched.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center text-muted-foreground">
          <CalendarDays className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No hay períodos creados.</p>
          <p className="text-xs mt-1">Crea un nuevo período con el botón arriba.</p>
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
                  <p className="flex items-center gap-1"><BookOpen className="h-3 w-3" /> Escuela: {escuela.nombre}</p>
                  {p.fecha_inicio && (
                    <p className="flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" /> Período: {format(parseISO(p.fecha_inicio), "yyyy-MM-dd")}
                      {p.fecha_fin ? ` al ${format(parseISO(p.fecha_fin), "yyyy-MM-dd")}` : ""}
                    </p>
                  )}
                  {p.fecha_matricula_inicio && (
                    <p className="flex items-center gap-1">
                      <GraduationCap className="h-3 w-3" /> Matrículas: {format(parseISO(p.fecha_matricula_inicio), "yyyy-MM-dd")}
                      {p.fecha_matricula_fin ? ` al ${format(parseISO(p.fecha_matricula_fin), "yyyy-MM-dd")}` : ""}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Estudiantes matriculados activos</span>
                    <Badge className="bg-primary text-primary-foreground"><Users className="h-3 w-3 mr-1" /> {p.estudiantesActivos}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Total matrículas activas</span>
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

// ========== PERIODO DETAIL VIEW ==========
function PeriodoDetailView({
  escuela,
  periodo,
  onBackToPeriodos,
}: any) {
  const { data: materias, isLoading: loadingMaterias } = useMaterias(periodo.id);
  const { data: matriculas } = useMatriculas(periodo.id);
  const updateMatricula = useUpdateMatricula();
  const createCertificado = useCreateCertificado();
  const deleteMateria = useDeleteMateria();
  const [activeTab, setActiveTab] = useState<"materias" | "estudiantes">("materias");

  const handleEstadoMatricula = async (id: string, estado: string) => {
    try {
      await updateMatricula.mutateAsync({ id, estado });
      toast.success("Estado actualizado");
    } catch { toast.error("Error al actualizar"); }
  };

  const handleEmitirCertificado = async (m: any) => {
    try {
      await createCertificado.mutateAsync({ matricula_id: m.id, persona_id: m.persona_id, curso_id: escuela.id });
      toast.success("Certificado emitido");
    } catch (err: any) {
      toast.error(err.message?.includes("duplicate") ? "Ya tiene certificado" : "Error al emitir");
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader title={periodo.nombre} description={`${escuela.nombre} · Período académico`}>
        <Button variant="ghost" size="sm" onClick={onBackToPeriodos}><ArrowLeft className="h-4 w-4 mr-1" /> Períodos</Button>
        <MatriculaFormDialog cursoId={escuela.id} periodoId={periodo.id} />
      </PageHeader>

      {/* Period info banner */}
      <div className="rounded-xl border bg-card p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <CalendarDays className="h-7 w-7 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-bold text-foreground">{periodo.nombre}</h2>
              <Badge variant="outline" className={ESTADO_PERIODO[periodo.estado]?.color}>
                {periodo.estado}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" /> {escuela.nombre}</span>
              {periodo.fecha_inicio && (
                <span className="flex items-center gap-1">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {format(parseISO(periodo.fecha_inicio), "d MMM yyyy", { locale: es })}
                  {periodo.fecha_fin ? ` — ${format(parseISO(periodo.fecha_fin), "d MMM yyyy", { locale: es })}` : ""}
                </span>
              )}
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

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        <button
          onClick={() => setActiveTab("materias")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === "materias" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
        >
          <BookText className="h-4 w-4 inline mr-1" /> Materias ({materias?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab("estudiantes")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === "estudiantes" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
        >
          <Users className="h-4 w-4 inline mr-1" /> Estudiantes ({matriculas?.length || 0})
        </button>
      </div>

      {/* Materias tab */}
      {activeTab === "materias" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <MateriaFormDialog periodoId={periodo.id} />
          </div>
          {loadingMaterias ? (
            <Skeleton className="h-32" />
          ) : !materias?.length ? (
            <div className="rounded-xl border bg-card p-12 text-center text-muted-foreground">
              <BookText className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No hay materias en este período.</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {materias.map((m: any) => (
                <div key={m.id} className="rounded-xl border bg-card p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-foreground text-sm">{m.nombre}</h4>
                    <DeleteConfirmDialog
                      title="Eliminar materia"
                      description={`¿Eliminar "${m.nombre}"?`}
                      onConfirm={() => deleteMateria.mutateAsync(m.id)}
                    />
                  </div>
                  {m.descripcion && <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{m.descripcion}</p>}
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    {m.maestro_nombre && <span className="flex items-center gap-1"><UserCheck className="h-3 w-3" /> {m.maestro_nombre}</span>}
                    {m.horario && <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {m.horario}</span>}
                    {m.aula && <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" /> {m.aula}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Estudiantes tab */}
      {activeTab === "estudiantes" && (
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
                    <p className="text-sm font-semibold text-foreground truncate">
                      {m.personas?.nombres} {m.personas?.apellidos}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Matriculado: {format(parseISO(m.fecha_matricula), "d MMM yyyy", { locale: es })}
                      {m.materias?.nombre && <> · {m.materias.nombre}</>}
                      {m.nota_final != null && <> · Nota: <strong>{m.nota_final}</strong></>}
                    </p>
                  </div>
                  <Select value={m.estado} onValueChange={(v) => handleEstadoMatricula(m.id, v)}>
                    <SelectTrigger className="h-8 w-28 text-xs" onClick={(e) => e.stopPropagation()}>
                      <SelectValue />
                    </SelectTrigger>
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

  const { data: periodos } = usePeriodos(selectedEscuela);

  // Computed metrics
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

  // Periodo detail view
  if (selectedEscuela && escuelaActual && selectedPeriodo && periodoActual) {
    return (
      <PeriodoDetailView
        escuela={escuelaActual}
        periodo={periodoActual}
        onBackToPeriodos={() => setSelectedPeriodo(null)}
      />
    );
  }

  // Periodos list view
  if (selectedEscuela && escuelaActual) {
    return (
      <PeriodosView
        escuela={escuelaActual}
        periodos={periodos}
        allMatriculas={allMatriculas}
        onBack={() => setSelectedEscuela(null)}
        onSelectPeriodo={setSelectedPeriodo}
      />
    );
  }

  // Main: Escuelas view
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

      <EscuelasView
        escuelas={escuelas}
        allPeriodos={allPeriodos}
        allMatriculas={allMatriculas}
        search={search}
        setSearch={setSearch}
        onSelectEscuela={setSelectedEscuela}
      />

      {/* Certificados section */}
      {(certificados?.length || 0) > 0 && (
        <div className="rounded-xl border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
            <Award className="h-4 w-4 text-accent" /> Últimos Certificados Emitidos
          </h3>
          <div className="space-y-2">
            {certificados!.slice(0, 5).map((cert: any) => (
              <div key={cert.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/50">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-accent" />
                </div>
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
    </div>
  );
}

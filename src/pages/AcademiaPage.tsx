import { useState, useMemo } from "react";
import PageHeader from "@/components/shared/PageHeader";
import MetricCard from "@/components/shared/MetricCard";
import DataTable from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import CursoFormDialog from "@/components/forms/CursoFormDialog";
import MatriculaFormDialog from "@/components/forms/MatriculaFormDialog";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import { useCursos, useAllMatriculas, useCertificados, useUpdateMatricula, useCreateCertificado } from "@/hooks/useAcademia";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  GraduationCap, BookOpen, Award, Users, Clock, CalendarDays,
  Search, UserCheck, ChevronRight, FileText, Pencil,
} from "lucide-react";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

const ESTADO_COLORS: Record<string, string> = {
  Activo: "bg-success/10 text-success border-success/20",
  Finalizado: "bg-primary/10 text-primary border-primary/20",
  Cancelado: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function AcademiaPage() {
  const { data: cursos, isLoading } = useCursos();
  const { data: allMatriculas, isLoading: loadingMat } = useAllMatriculas();
  const { data: certificados } = useCertificados();
  const updateMatricula = useUpdateMatricula();
  const createCertificado = useCreateCertificado();

  const [selectedCurso, setSelectedCurso] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Computed metrics
  const cursosActivos = cursos?.filter((c) => c.estado === "Activo").length || 0;
  const totalEstudiantes = new Set(allMatriculas?.map((m) => m.persona_id)).size;
  const totalCertificados = certificados?.length || 0;
  const totalMatriculas = allMatriculas?.length || 0;

  // Cursos with enriched data
  const cursosEnriched = useMemo(() => {
    return (cursos || []).map((c) => {
      const mats = (allMatriculas || []).filter((m) => m.curso_id === c.id);
      const completados = mats.filter((m) => m.estado === "Completado").length;
      return {
        ...c,
        alumnosCount: mats.length,
        completados,
        progreso: mats.length > 0 ? Math.round((completados / mats.length) * 100) : 0,
      };
    });
  }, [cursos, allMatriculas]);

  // Filtered cursos for card view
  const filteredCursos = useMemo(() => {
    if (!search) return cursosEnriched;
    const q = search.toLowerCase();
    return cursosEnriched.filter(
      (c) => c.nombre.toLowerCase().includes(q) || c.instructor?.toLowerCase().includes(q)
    );
  }, [cursosEnriched, search]);

  // Selected curso data
  const cursoActual = cursosEnriched.find((c) => c.id === selectedCurso);
  const cursoMatriculas = useMemo(() => {
    if (!selectedCurso) return [];
    return (allMatriculas || [])
      .filter((m) => m.curso_id === selectedCurso)
      .map((m: any) => ({
        ...m,
        personaNombre: `${m.personas?.nombres || ""} ${m.personas?.apellidos || ""}`.trim(),
        personaFoto: m.personas?.foto_url || null,
      }));
  }, [selectedCurso, allMatriculas]);

  const handleEstadoMatricula = async (id: string, estado: string) => {
    try {
      await updateMatricula.mutateAsync({ id, estado });
      toast.success("Estado actualizado");
    } catch {
      toast.error("Error al actualizar");
    }
  };

  const handleEmitirCertificado = async (matricula: any) => {
    try {
      await createCertificado.mutateAsync({
        matricula_id: matricula.id,
        persona_id: matricula.persona_id,
        curso_id: matricula.curso_id,
      });
      toast.success("Certificado emitido");
    } catch (err: any) {
      toast.error(err.message?.includes("duplicate") ? "Ya tiene certificado" : "Error al emitir");
    }
  };

  if (isLoading) {
    return (
      <div className="animate-fade-in space-y-4">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  // Detail view for a specific curso
  if (selectedCurso && cursoActual) {
    const completados = cursoMatriculas.filter((m) => m.estado === "Completado").length;
    const activos = cursoMatriculas.filter((m) => m.estado === "Activo").length;

    return (
      <div className="animate-fade-in space-y-6">
        <PageHeader title={cursoActual.nombre} description={cursoActual.descripcion || "Gestión de alumnos matriculados"}>
          <Button variant="ghost" size="sm" onClick={() => setSelectedCurso(null)}>
            ← Volver a escuelas
          </Button>
          <MatriculaFormDialog cursoId={selectedCurso} />
        </PageHeader>

        {/* Course info banner */}
        <div className="rounded-xl border bg-card p-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <BookOpen className="h-7 w-7 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg font-bold text-foreground">{cursoActual.nombre}</h2>
                <Badge variant="outline" className={ESTADO_COLORS[cursoActual.estado]}>
                  {cursoActual.estado}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                {cursoActual.instructor && (
                  <span className="flex items-center gap-1"><UserCheck className="h-3.5 w-3.5" /> {cursoActual.instructor}</span>
                )}
                <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {cursoActual.duracion_semanas} semanas</span>
                {cursoActual.fecha_inicio && (
                  <span className="flex items-center gap-1">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {format(parseISO(cursoActual.fecha_inicio), "d MMM yyyy", { locale: es })}
                    {cursoActual.fecha_fin ? ` — ${format(parseISO(cursoActual.fecha_fin), "d MMM yyyy", { locale: es })}` : ""}
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-3 shrink-0">
              <div className="text-center px-4 py-2 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-foreground">{cursoMatriculas.length}</p>
                <p className="text-xs text-muted-foreground">Estudiantes</p>
              </div>
              <div className="text-center px-4 py-2 rounded-lg bg-success/10">
                <p className="text-2xl font-bold text-success">{completados}</p>
                <p className="text-xs text-muted-foreground">Completados</p>
              </div>
            </div>
          </div>
          {cursoMatriculas.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Progreso del curso</span>
                <span>{cursoActual.progreso}%</span>
              </div>
              <Progress value={cursoActual.progreso} className="h-2" />
            </div>
          )}
        </div>

        {/* Students list */}
        {cursoMatriculas.length === 0 ? (
          <div className="rounded-xl border bg-card p-12 text-center text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No hay estudiantes matriculados aún.</p>
            <p className="text-xs mt-1">Usa el botón "Matricular" para agregar alumnos.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {cursoMatriculas.map((m: any) => {
              const initials = `${m.personas?.nombres?.[0] || ""}${m.personas?.apellidos?.[0] || ""}`.toUpperCase();
              return (
                <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl border bg-card hover:shadow-sm transition-shadow">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={m.personaFoto || undefined} />
                    <AvatarFallback className="text-xs font-semibold">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{m.personaNombre}</p>
                    <p className="text-xs text-muted-foreground">
                      Matriculado: {format(parseISO(m.fecha_matricula), "d MMM yyyy", { locale: es })}
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
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1 text-xs shrink-0"
                      onClick={() => handleEmitirCertificado(m)}
                    >
                      <Award className="h-3.5 w-3.5" /> Certificado
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Main view: School cards
  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader title="Academia" description="Formación bíblica y cursos de la iglesia">
        <CursoFormDialog />
      </PageHeader>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="Escuelas Activas" value={cursosActivos} icon={BookOpen} />
        <MetricCard title="Estudiantes" value={totalEstudiantes} icon={Users} variant="info" />
        <MetricCard title="Matrículas" value={totalMatriculas} icon={GraduationCap} variant="accent" />
        <MetricCard title="Certificados" value={totalCertificados} icon={Award} variant="success" />
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar escuela o instructor..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      {/* School cards */}
      {filteredCursos.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center text-muted-foreground">
          <GraduationCap className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No hay escuelas registradas.</p>
          <p className="text-xs mt-1">Crea tu primera escuela con el botón "Nuevo curso".</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCursos.map((c) => (
            <div
              key={c.id}
              onClick={() => setSelectedCurso(c.id)}
              className="group rounded-xl border bg-card p-5 cursor-pointer hover:shadow-md transition-all hover:border-primary/30"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <Badge variant="outline" className={ESTADO_COLORS[c.estado] || ""}>
                  {c.estado}
                </Badge>
              </div>

              <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                {c.nombre}
              </h3>

              {c.instructor && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                  <UserCheck className="h-3 w-3" /> {c.instructor}
                </p>
              )}

              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {c.duracion_semanas} sem.
                </span>
                {c.fecha_inicio && (
                  <span className="flex items-center gap-1">
                    <CalendarDays className="h-3 w-3" />
                    {format(parseISO(c.fecha_inicio), "MMM yyyy", { locale: es })}
                  </span>
                )}
              </div>

              {/* Progress */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>{c.alumnosCount} estudiantes{c.cupos ? ` / ${c.cupos} cupos` : ""}</span>
                  <span>{c.progreso}%</span>
                </div>
                <Progress value={c.progreso} className="h-1.5" />
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1 text-success font-medium">
                    <UserCheck className="h-3 w-3" /> {c.completados}
                  </span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Users className="h-3 w-3" /> {c.alumnosCount - c.completados} activos
                  </span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Certificados section */}
      {(certificados?.length || 0) > 0 && (
        <div className="rounded-xl border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
            <Award className="h-4 w-4 text-accent" />
            Últimos Certificados Emitidos
          </h3>
          <div className="space-y-2">
            {certificados!.slice(0, 5).map((cert: any) => (
              <div key={cert.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/50">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {cert.personas?.nombres} {cert.personas?.apellidos}
                  </p>
                  <p className="text-xs text-muted-foreground">{cert.cursos?.nombre}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-mono text-muted-foreground">{cert.codigo}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {format(parseISO(cert.fecha_emision), "d MMM yyyy", { locale: es })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

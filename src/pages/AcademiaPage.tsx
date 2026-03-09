import { useState } from "react";
import PageHeader from "@/components/shared/PageHeader";
import DataTable from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import CursoFormDialog from "@/components/forms/CursoFormDialog";
import MatriculaFormDialog from "@/components/forms/MatriculaFormDialog";
import { useCursos, useMatriculas, useUpdateMatricula, useUpdateCurso, useCreateCertificado } from "@/hooks/useAcademia";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { GraduationCap, BookOpen, Award, Users } from "lucide-react";
import { toast } from "sonner";

export default function AcademiaPage() {
  const { data: cursos, isLoading } = useCursos();
  const [selectedCurso, setSelectedCurso] = useState<string | null>(null);
  const { data: matriculas, isLoading: loadingMat } = useMatriculas(selectedCurso);
  const updateMatricula = useUpdateMatricula();
  const updateCurso = useUpdateCurso();
  const createCertificado = useCreateCertificado();

  if (isLoading) {
    return (
      <div className="animate-fade-in space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  const cursoActual = cursos?.find(c => c.id === selectedCurso);
  const totalAlumnos = matriculas?.length || 0;
  const completados = matriculas?.filter(m => m.estado === "Completado").length || 0;

  const handleEstadoMatricula = async (id: string, estado: string) => {
    try {
      await updateMatricula.mutateAsync({ id, estado });
      toast.success("Estado actualizado");
    } catch { toast.error("Error"); }
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

  // Vista de cursos (sin selección)
  if (!selectedCurso) {
    const cursosData = (cursos || []).map(c => ({
      ...c,
      alumnosCount: (c as any).matriculas?.[0]?.count || 0,
    }));

    return (
      <div className="animate-fade-in">
        <PageHeader title="Academia" description="Formación bíblica y cursos de la iglesia">
          <CursoFormDialog />
        </PageHeader>
        <DataTable
          data={cursosData}
          searchKey="nombre"
          searchPlaceholder="Buscar curso..."
          filterKey="estado"
          filterPlaceholder="Estado"
          filterOptions={[
            { value: "Activo", label: "Activo" },
            { value: "Finalizado", label: "Finalizado" },
            { value: "Cancelado", label: "Cancelado" },
          ]}
          onRowClick={(c: any) => setSelectedCurso(c.id)}
          columns={[
            {
              key: "nombre", label: "Curso",
              render: (c: any) => (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <BookOpen className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{c.nombre}</p>
                    <p className="text-xs text-muted-foreground">{c.instructor || "Sin instructor"}</p>
                  </div>
                </div>
              ),
            },
            { key: "duracion_semanas", label: "Duración", render: (c: any) => `${c.duracion_semanas} sem.` },
            { key: "fecha_inicio", label: "Inicio", render: (c: any) => c.fecha_inicio || "—" },
            { key: "alumnosCount", label: "Alumnos", render: (c: any) => <span className="font-semibold">{c.alumnosCount}{c.cupos ? `/${c.cupos}` : ""}</span> },
            { key: "estado", label: "Estado", render: (c: any) => <StatusBadge status={c.estado} /> },
          ]}
        />
      </div>
    );
  }

  // Vista de matrículas del curso seleccionado
  const matData = (matriculas || []).map(m => ({
    ...m,
    personaNombre: `${(m as any).personas?.nombres || ""} ${(m as any).personas?.apellidos || ""}`.trim(),
  }));

  return (
    <div className="animate-fade-in">
      <PageHeader title={cursoActual?.nombre || "Curso"} description="Gestión de alumnos matriculados">
        <Button variant="ghost" size="sm" onClick={() => setSelectedCurso(null)}>← Volver a cursos</Button>
        <MatriculaFormDialog cursoId={selectedCurso} />
      </PageHeader>

      <div className="flex gap-3 mb-6">
        <div className="bg-card border rounded-lg px-4 py-2 text-center">
          <p className="text-xs text-muted-foreground">Alumnos</p>
          <p className="text-lg font-bold text-foreground">{totalAlumnos}</p>
        </div>
        <div className="bg-card border rounded-lg px-4 py-2 text-center">
          <p className="text-xs text-muted-foreground">Completados</p>
          <p className="text-lg font-bold text-primary">{completados}</p>
        </div>
      </div>

      {loadingMat ? <Skeleton className="h-[300px] w-full" /> : (
        <DataTable
          data={matData}
          searchKey="personaNombre"
          searchPlaceholder="Buscar alumno..."
          filterKey="estado"
          filterPlaceholder="Estado"
          filterOptions={[
            { value: "Activo", label: "Activo" },
            { value: "Completado", label: "Completado" },
            { value: "Retirado", label: "Retirado" },
          ]}
          columns={[
            { key: "personaNombre", label: "Alumno", render: (m: any) => <span className="font-medium text-sm">{m.personaNombre}</span> },
            { key: "fecha_matricula", label: "Fecha matrícula" },
            {
              key: "estado", label: "Estado",
              render: (m: any) => (
                <Select value={m.estado} onValueChange={v => handleEstadoMatricula(m.id, v)}>
                  <SelectTrigger className="h-8 w-32 text-xs" onClick={e => e.stopPropagation()}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Activo">Activo</SelectItem>
                    <SelectItem value="Completado">Completado</SelectItem>
                    <SelectItem value="Retirado">Retirado</SelectItem>
                  </SelectContent>
                </Select>
              ),
            },
            {
              key: "actions", label: "",
              render: (m: any) => m.estado === "Completado" ? (
                <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={e => { e.stopPropagation(); handleEmitirCertificado(m); }}>
                  <Award className="h-3.5 w-3.5" /> Certificado
                </Button>
              ) : null,
            },
          ]}
        />
      )}
    </div>
  );
}

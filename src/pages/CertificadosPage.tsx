import PageHeader from "@/components/shared/PageHeader";
import DataTable from "@/components/shared/DataTable";
import { useCertificados } from "@/hooks/useAcademia";
import { Skeleton } from "@/components/ui/skeleton";
import { Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function CertificadosPage() {
  const { data: certificados, isLoading } = useCertificados();

  if (isLoading) {
    return (
      <div className="animate-fade-in space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  const tableData = (certificados || []).map(c => ({
    ...c,
    personaNombre: `${(c as any).personas?.nombres || ""} ${(c as any).personas?.apellidos || ""}`.trim(),
    cursoNombre: (c as any).cursos?.nombre || "",
  }));

  return (
    <div className="animate-fade-in">
      <PageHeader title="Certificados" description="Certificados emitidos por la academia" />

      <div className="bg-card border rounded-lg px-4 py-3 mb-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Award className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">{tableData.length}</p>
          <p className="text-xs text-muted-foreground">Certificados emitidos</p>
        </div>
      </div>

      <DataTable
        data={tableData}
        searchKey="personaNombre"
        searchPlaceholder="Buscar por persona..."
        columns={[
          {
            key: "codigo", label: "Código",
            render: (c: any) => <Badge variant="secondary" className="font-mono text-xs">{c.codigo}</Badge>,
          },
          { key: "personaNombre", label: "Persona", render: (c: any) => <span className="font-medium text-sm">{c.personaNombre}</span> },
          { key: "cursoNombre", label: "Curso", render: (c: any) => c.cursoNombre },
          { key: "fecha_emision", label: "Fecha emisión" },
        ]}
      />
    </div>
  );
}

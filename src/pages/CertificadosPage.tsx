import { useState } from "react";
import PageHeader from "@/components/shared/PageHeader";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import CertificadoIglesiaFormDialog from "@/components/forms/CertificadoIglesiaFormDialog";
import { useCertificadosIglesia, useDeleteCertificadoIglesia } from "@/hooks/useCertificadosIglesia";
import { useConfiguracion } from "@/hooks/useConfiguracion";
import { Skeleton } from "@/components/ui/skeleton";
import { Award, Download, Search, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import ExportDropdown from "@/components/shared/ExportDropdown";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import jsPDF from "jspdf";

const tipoBadgeColor: Record<string, string> = {
  Membresía: "bg-primary/10 text-primary",
  Bautismo: "bg-info/10 text-info",
  Confirmación: "bg-success/10 text-success",
  Matrimonio: "bg-warning/10 text-warning",
  "Presentación de niños": "bg-accent/20 text-accent-foreground",
  Donación: "bg-muted text-muted-foreground",
  "Carta de transferencia": "bg-destructive/10 text-destructive",
  Curso: "bg-secondary text-secondary-foreground",
};

function generateCertificatePDF(cert: any, config: any) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "letter" });
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();

  // Border
  doc.setDrawColor(59, 130, 246);
  doc.setLineWidth(2);
  doc.rect(10, 10, w - 20, h - 20);
  doc.setLineWidth(0.5);
  doc.rect(14, 14, w - 28, h - 28);

  // Title
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(59, 130, 246);
  doc.text("CERTIFICADO", w / 2, 40, { align: "center" });

  // Subtitle
  doc.setFontSize(16);
  doc.setTextColor(100, 100, 100);
  doc.text(`de ${cert.tipo}`, w / 2, 52, { align: "center" });

  // Church name
  doc.setFontSize(12);
  doc.setTextColor(80, 80, 80);
  const churchName = config?.nombre_iglesia || "Iglesia";
  doc.text(churchName, w / 2, 65, { align: "center" });

  // "Otorgado a"
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text("Se otorga el presente certificado a:", w / 2, 82, { align: "center" });

  // Person name
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 30, 30);
  doc.text(cert.personaNombre, w / 2, 96, { align: "center" });

  // Line
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(w / 2 - 60, 100, w / 2 + 60, 100);

  // Date
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  const fechaStr = cert.fecha_emision ? format(parseISO(cert.fecha_emision), "dd/MM/yyyy") : "";
  doc.text(`Fecha de expedición: ${fechaStr}`, w / 2, 112, { align: "center" });

  // Code
  doc.setFontSize(9);
  doc.text(`Código: ${cert.codigo}`, w / 2, 120, { align: "center" });

  // Pastor
  if (config?.pastor_principal) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    doc.line(w / 2 - 40, 145, w / 2 + 40, 145);
    doc.text(config.pastor_principal, w / 2, 152, { align: "center" });
    doc.setFontSize(9);
    doc.text("Pastor Principal", w / 2, 158, { align: "center" });
  }

  doc.save(`Certificado_${cert.personaNombre.replace(/\s/g, "_")}_${cert.tipo}.pdf`);
}

export default function CertificadosPage() {
  const { data: certificados, isLoading } = useCertificadosIglesia();
  const { data: config } = useConfiguracion();
  const deleteCert = useDeleteCertificadoIglesia();
  const [search, setSearch] = useState("");

  if (isLoading) {
    return (
      <div className="animate-fade-in space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  const certs = (certificados || []).map(c => ({
    ...c,
    personaNombre: `${(c as any).personas?.nombres || ""} ${(c as any).personas?.apellidos || ""}`.trim(),
    tipo: (c as any).tipo_certificado || "Curso",
  }));

  const filtered = certs.filter(c =>
    c.personaNombre.toLowerCase().includes(search.toLowerCase()) ||
    c.tipo.toLowerCase().includes(search.toLowerCase()) ||
    c.codigo.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    await deleteCert.mutateAsync(id);
    toast.success("Certificado eliminado");
  };

  const handleDownload = (cert: any) => {
    generateCertificatePDF(cert, config);
    toast.success("Certificado descargado");
  };

  const exportData = filtered.map(c => ({
    miembro: c.personaNombre,
    tipo: c.tipo,
    fecha: c.fecha_emision,
    codigo: c.codigo,
  }));

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader title="Certificados" description="Emisión de certificados de la iglesia">
        <ExportDropdown
          title="Certificados"
          filename="certificados"
          columns={[
            { header: "Miembro", key: "miembro" },
            { header: "Tipo", key: "tipo" },
            { header: "Fecha expedición", key: "fecha" },
            { header: "Código", key: "codigo" },
          ]}
          data={exportData}
        />
        <CertificadoIglesiaFormDialog />
      </PageHeader>

      {/* Search */}
      <div className="bg-card border rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2 bg-primary/10 rounded-lg px-4 py-2">
            <Award className="h-5 w-5 text-primary" />
            <span className="text-lg font-bold text-primary">{certs.length}</span>
            <span className="text-xs text-muted-foreground">certificados</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Miembro</TableHead>
              <TableHead>Tipo de certificado</TableHead>
              <TableHead>Fecha expedición</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                  No se encontraron certificados
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((c, i) => (
                <TableRow key={c.id}>
                  <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                  <TableCell className="font-medium">{c.personaNombre}</TableCell>
                  <TableCell>
                    <Badge className={tipoBadgeColor[c.tipo] || ""} variant="secondary">
                      {c.tipo}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {c.fecha_emision ? format(parseISO(c.fecha_emision), "dd/MM/yyyy") : "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => handleDownload(c)}>
                        <Download className="h-3.5 w-3.5" /> Descargar
                      </Button>
                      <DeleteConfirmDialog
                        onConfirm={() => handleDelete(c.id)}
                        title="¿Eliminar certificado?"
                        description={`Se eliminará el certificado de "${c.personaNombre}" permanentemente.`}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

interface ExportColumn {
  header: string;
  key: string;
}

interface ExportOptions {
  title: string;
  columns: ExportColumn[];
  data: Record<string, any>[];
  filename: string;
}

export function exportToPDF({ title, columns, data, filename }: ExportOptions) {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(16);
  doc.text(title, 14, 20);

  // Date
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(`Generado: ${new Date().toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric" })}`, 14, 28);

  // Table
  autoTable(doc, {
    startY: 34,
    head: [columns.map((c) => c.header)],
    body: data.map((row) => columns.map((c) => String(row[c.key] ?? ""))),
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [30, 41, 59], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [245, 247, 250] },
  });

  doc.save(`${filename}.pdf`);
}

export function exportToExcel({ title, columns, data, filename }: ExportOptions) {
  const wsData = [
    columns.map((c) => c.header),
    ...data.map((row) => columns.map((c) => row[c.key] ?? "")),
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Set column widths
  ws["!cols"] = columns.map(() => ({ wch: 20 }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, title.slice(0, 31));
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

export function exportFinancialSummaryPDF(stats: {
  ingresosMes: number;
  gastosMes: number;
  totalPersonas: number;
  nuevosEsteMes: number;
  certificadosTotal: number;
  cursosActivos: number;
  alumnosMatriculados: number;
  proximosEventos: number;
}) {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Reporte General de la Iglesia", 14, 20);

  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(`Generado: ${new Date().toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric" })}`, 14, 28);

  doc.setTextColor(0);
  doc.setFontSize(13);
  doc.text("Resumen Financiero del Mes", 14, 42);

  autoTable(doc, {
    startY: 48,
    head: [["Concepto", "Valor"]],
    body: [
      ["Ingresos del mes", `$${stats.ingresosMes.toLocaleString()}`],
      ["Gastos del mes", `$${stats.gastosMes.toLocaleString()}`],
      ["Balance", `$${(stats.ingresosMes - stats.gastosMes).toLocaleString()}`],
    ],
    styles: { fontSize: 10, cellPadding: 4 },
    headStyles: { fillColor: [30, 41, 59], textColor: 255 },
  });

  const y = (doc as any).lastAutoTable.finalY + 14;
  doc.setFontSize(13);
  doc.text("Indicadores Generales", 14, y);

  autoTable(doc, {
    startY: y + 6,
    head: [["Indicador", "Valor"]],
    body: [
      ["Total de personas", String(stats.totalPersonas)],
      ["Nuevos este mes", String(stats.nuevosEsteMes)],
      ["Certificados emitidos", String(stats.certificadosTotal)],
      ["Cursos activos", String(stats.cursosActivos)],
      ["Alumnos matriculados", String(stats.alumnosMatriculados)],
      ["Próximos eventos", String(stats.proximosEventos)],
    ],
    styles: { fontSize: 10, cellPadding: 4 },
    headStyles: { fillColor: [30, 41, 59], textColor: 255 },
  });

  doc.save("reporte-general.pdf");
}

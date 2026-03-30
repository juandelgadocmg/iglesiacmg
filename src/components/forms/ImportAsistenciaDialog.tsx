import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, FileSpreadsheet, AlertTriangle, CheckCircle2, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as XLSX from "xlsx";

interface Props {
  servicioId: string;
  servicioNombre: string;
}

export default function ImportAsistenciaDialog({ servicioId, servicioNombre }: Props) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ ok: number; errors: string[] } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const qc = useQueryClient();

  const reset = () => {
    setFile(null);
    setPreview([]);
    setProgress(0);
    setResult(null);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setResult(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const wb = XLSX.read(ev.target?.result, { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      setPreview(rows.slice(0, 5));
    };
    reader.readAsArrayBuffer(f);
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ["documento", "nombres", "apellidos", "presente"],
      ["1234567890", "Juan", "Pérez", "Sí"],
      ["0987654321", "María", "López", "No"],
    ]);
    ws["!cols"] = [{ wch: 18 }, { wch: 20 }, { wch: 20 }, { wch: 12 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Asistencia");
    XLSX.writeFile(wb, "plantilla_asistencia.xlsx");
  };

  const doImport = async () => {
    if (!file) return;
    setImporting(true);
    setProgress(0);
    const errors: string[] = [];
    let ok = 0;

    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const wb = XLSX.read(ev.target?.result, { type: "array" });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

        if (rows.length === 0) {
          errors.push("El archivo está vacío");
          setResult({ ok, errors });
          setImporting(false);
          return;
        }

        // Fetch all personas to match
        const { data: personas } = await supabase.from("personas").select("id, nombres, apellidos, documento");
        const personaMap = new Map<string, string>();
        const nameMap = new Map<string, string>();
        (personas || []).forEach((p) => {
          if (p.documento) personaMap.set(p.documento.trim().toLowerCase(), p.id);
          nameMap.set(`${p.nombres} ${p.apellidos}`.trim().toLowerCase(), p.id);
        });

        const records: { servicio_id: string; persona_id: string; presente: boolean }[] = [];

        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          const rowNum = i + 2;
          const doc = String(row.documento || "").trim();
          const nombres = String(row.nombres || "").trim();
          const apellidos = String(row.apellidos || "").trim();
          const presenteRaw = String(row.presente || "").trim().toLowerCase();
          const presente = ["sí", "si", "yes", "1", "true", "x"].includes(presenteRaw);

          let personaId: string | undefined;
          if (doc) personaId = personaMap.get(doc.toLowerCase());
          if (!personaId && nombres && apellidos) {
            personaId = nameMap.get(`${nombres} ${apellidos}`.toLowerCase());
          }

          if (!personaId) {
            errors.push(`Fila ${rowNum}: No se encontró persona "${nombres} ${apellidos}" (doc: ${doc || "vacío"})`);
            continue;
          }

          records.push({ servicio_id: servicioId, persona_id: personaId, presente });
        }

        // Upsert in chunks
        const CHUNK = 200;
        for (let i = 0; i < records.length; i += CHUNK) {
          const chunk = records.slice(i, i + CHUNK);
          const { error } = await supabase
            .from("asistencia")
            .upsert(chunk, { onConflict: "servicio_id,persona_id" });
          if (error) {
            errors.push(`Error al guardar lote ${Math.floor(i / CHUNK) + 1}: ${error.message}`);
          } else {
            ok += chunk.length;
          }
          setProgress(Math.round(((i + chunk.length) / records.length) * 100));
        }

        setResult({ ok, errors });
        if (ok > 0) {
          qc.invalidateQueries({ queryKey: ["asistencia"] });
          toast.success(`${ok} registros de asistencia importados`);
        }
      } catch (err: any) {
        errors.push(`Error general: ${err.message}`);
        setResult({ ok, errors });
      } finally {
        setImporting(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-xs gap-1.5">
          <Upload className="h-3.5 w-3.5" /> Importar Excel
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            Importar Asistencia — {servicioNombre}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Button variant="outline" size="sm" onClick={downloadTemplate} className="gap-1.5 text-xs">
            <Download className="h-3.5 w-3.5" /> Descargar plantilla
          </Button>

          <div
            className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              {file ? file.name : "Haz clic o arrastra un archivo Excel"}
            </p>
            <input ref={inputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFile} />
          </div>

          {preview.length > 0 && (
            <div className="text-xs">
              <p className="font-medium mb-1">Vista previa (primeras 5 filas):</p>
              <div className="overflow-x-auto border rounded max-h-32">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-muted/50">
                      {Object.keys(preview[0]).map((k) => (
                        <th key={k} className="px-2 py-1 text-left">{k}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, i) => (
                      <tr key={i} className="border-t">
                        {Object.values(row).map((v, j) => (
                          <td key={j} className="px-2 py-1">{String(v)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {importing && <Progress value={progress} className="h-2" />}

          {result && (
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-success">
                <CheckCircle2 className="h-4 w-4" /> {result.ok} registros importados
              </div>
              {result.errors.length > 0 && (
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {result.errors.map((e, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-destructive text-xs">
                      <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" /> {e}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cerrar</Button>
          <Button onClick={doImport} disabled={!file || importing}>
            {importing ? "Importando..." : "Importar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

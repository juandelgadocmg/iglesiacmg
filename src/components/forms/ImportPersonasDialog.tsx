import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, FileSpreadsheet, AlertTriangle, CheckCircle2, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as XLSX from "xlsx";

const PROCESOS_MAP: Record<string, string> = {
  "Ingreso a la Iglesia": "533cfe37-15fa-42ce-8b5c-23e9dd685d99",
  "Llamada de Consolidación 1": "f61eb6d6-059c-49c4-8a50-02f3fb2fd382",
  "Mensaje 1": "beb09fb3-d9ec-4766-a104-973afd0774b9",
  "Llamada de Consolidación 2": "987cf897-c292-4a5c-a46a-ab6166f2a0eb",
  "Mensaje 2": "98976585-2920-4317-8c94-97201d121131",
  "Llamada de Consolidación 3": "184e1f0e-de0c-49f8-8dad-a5a76669f378",
  "Mensaje 3": "235b788e-ccb2-48a4-9753-4b4c212bc43f",
  "Mensaje 4": "dc200a35-6369-472b-9e2b-be673bc46431",
  "Mensaje 5": "94d5b9eb-99ed-4b63-94b6-79011066bcea",
  "Mensaje 6": "9e95eee6-ccbb-48d8-ac9f-48cee65cb39f",
  "Visita": "dfe05ecf-9eae-42a0-ad57-251dca1cb630",
  "Consejería": "3e1ff265-f694-4c67-8b70-c9c045ad1904",
  "Fiesta de Bienvenida": "67056560-78cc-41f0-aae3-9879a34fdc80",
  "Nací para Triunfar Día 1": "18db1d26-851a-47be-b695-8ae7ead452a0",
  "Semana de Poder 1": "923c9bf3-feb5-4112-a758-0e75a44cb46b",
  "Una Nueva Vida y Un Nuevo Comienzo": "9a57b58b-65ac-49a0-8978-81d7d8e14102",
  "Retiro de Sanidad Interior y Liberación": "151a2ea1-de4d-448d-a391-ea04478647a6",
  "Bautismo": "b0dc7eda-a0cd-4874-a792-63b0ed6b49c5",
  "Discipulado de Nuevos Creyentes": "a87d0740-7088-40d4-80a8-302ec1963fdd",
  "Escuela de Evangelismo Sobrenatural": "66361384-4cd0-4f8c-acae-45c9af7d816c",
  "Escuela de Líderes de Casa de Paz": "1fc50b12-1dfe-4b2e-a9c8-4421a0e718de",
  "Retiro de Líderes de Casas de Paz": "3f3c864b-321a-4a27-b9b4-a0b67e48890d",
  "Escuela de Mentores": "3a4fc9cf-52ce-484e-9d32-239f16711c97",
  "Retiro de Mentores": "74f955b6-2e61-4638-989f-c8836edccf79",
  "Escuela del Ministerio Quíntuple": "aaa2e732-5f8e-4b5d-a042-37904d3fb27a",
};

const PROCESO_NAMES = Object.keys(PROCESOS_MAP);

const VALID_TIPOS_PERSONA = [
  "Miembro", "Visitante", "Líder", "Servidor", "CDP", "Iglesia Virtual",
  "Estudiante Seminario", "Discípulo", "Maestro Seminario", "Miembro No Activo",
  "Líder Casa de Paz", "Líder de Red", "Mentor", "Pastor Principal",
];
const VALID_ESTADOS = ["Activo", "Inactivo", "En proceso"];
const VALID_PROC_ESTADOS = ["No realizado", "En Curso", "Realizado"];

function parseExcelDate(val: any): string | null {
  if (!val) return null;
  if (typeof val === "number") {
    const d = XLSX.SSF.parse_date_code(val);
    if (d) return `${d.y}-${String(d.m).padStart(2, "0")}-${String(d.d).padStart(2, "0")}`;
  }
  const s = String(val).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  return null;
}

function str(val: any): string | null {
  if (val === undefined || val === null || String(val).trim() === "") return null;
  return String(val).trim();
}

interface ImportResult {
  total: number;
  success: number;
  errors: { row: number; message: string }[];
}

const downloadTemplate = () => {
  const personalCols = [
    "nombres*", "apellidos*", "tipo_documento", "documento", "sexo",
    "fecha_nacimiento", "nacionalidad", "telefono", "whatsapp", "email",
    "direccion", "estado_civil", "ocupacion", "tipo_persona", "estado_iglesia",
    "vinculacion", "ministerio", "grupo_id", "fecha_ingreso",
    "fecha_conversion", "fecha_bautismo", "invitado_por",
    "seguimiento_por", "lider_responsable", "observaciones",
  ];
  const procesoCols: string[] = [];
  for (const pName of PROCESO_NAMES) {
    procesoCols.push(`${pName} (Estado)`, `${pName} (Fecha)`, `${pName} (Observación)`);
  }
  const headers = [...personalCols, ...procesoCols];
  const exampleRow: Record<string, string> = {
    "nombres*": "Juan",
    "apellidos*": "Pérez",
    "tipo_persona": "Miembro",
    "estado_iglesia": "Activo",
    "Ingreso a la Iglesia (Estado)": "Realizado",
    "Ingreso a la Iglesia (Fecha)": "2024-01-15",
    "Ingreso a la Iglesia (Observación)": "Llegó invitado por un familiar",
  };
  const ws = XLSX.utils.json_to_sheet([exampleRow], { header: headers });
  ws["!cols"] = headers.map(() => ({ wch: 22 }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Personas");
  XLSX.writeFile(wb, "plantilla_importacion_personas.xlsx");
  toast.success("Plantilla descargada");
};

export default function ImportPersonasDialog() {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const qc = useQueryClient();

  const reset = () => {
    setFile(null);
    setImporting(false);
    setProgress(0);
    setResult(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) { setFile(f); setResult(null); }
  };

  const doImport = async () => {
    if (!file) return;
    setImporting(true);
    setProgress(0);
    const errors: { row: number; message: string }[] = [];

    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(ws, { defval: "" });

      if (rows.length === 0) {
        toast.error("El archivo está vacío");
        setImporting(false);
        return;
      }

      let success = 0;
      for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        const rowNum = i + 2; // excel row (1=header)
        setProgress(Math.round(((i + 1) / rows.length) * 100));

        const nombres = str(r["nombres*"]);
        const apellidos = str(r["apellidos*"]);
        if (!nombres || !apellidos) {
          errors.push({ row: rowNum, message: "Nombres y apellidos son obligatorios" });
          continue;
        }

        const tipoPers = str(r["tipo_persona"]) || "Miembro";
        if (!VALID_TIPOS_PERSONA.includes(tipoPers)) {
          errors.push({ row: rowNum, message: `Tipo persona inválido: ${tipoPers}` });
          continue;
        }

        const estadoIg = str(r["estado_iglesia"]) || "Activo";
        if (!VALID_ESTADOS.includes(estadoIg)) {
          errors.push({ row: rowNum, message: `Estado iglesia inválido: ${estadoIg}` });
          continue;
        }

        const persona: Record<string, any> = {
          nombres,
          apellidos,
          tipo_documento: str(r["tipo_documento"]),
          documento: str(r["documento"]),
          sexo: str(r["sexo"]),
          fecha_nacimiento: parseExcelDate(r["fecha_nacimiento"]),
          nacionalidad: str(r["nacionalidad"]),
          telefono: str(r["telefono"]),
          whatsapp: str(r["whatsapp"]),
          email: str(r["email"]),
          direccion: str(r["direccion"]),
          estado_civil: str(r["estado_civil"]),
          ocupacion: str(r["ocupacion"]),
          tipo_persona: tipoPers,
          estado_iglesia: estadoIg,
          vinculacion: str(r["vinculacion"]),
          ministerio: str(r["ministerio"]),
          grupo_id: str(r["grupo_id"]) || null,
          fecha_ingreso: parseExcelDate(r["fecha_ingreso"]),
          fecha_conversion: parseExcelDate(r["fecha_conversion"]),
          fecha_bautismo: parseExcelDate(r["fecha_bautismo"]),
          invitado_por: str(r["invitado_por"]),
          seguimiento_por: str(r["seguimiento_por"]),
          lider_responsable: str(r["lider_responsable"]),
          observaciones: str(r["observaciones"]),
        };

        // Remove null values
        Object.keys(persona).forEach(k => { if (persona[k] === null) delete persona[k]; });

        const { data: created, error: pErr } = await supabase
          .from("personas")
          .insert(persona as any)
          .select("id")
          .single();

        if (pErr || !created) {
          errors.push({ row: rowNum, message: pErr?.message || "Error al crear persona" });
          continue;
        }

        // Process growth steps
        const procRecords: any[] = [];
        for (const pName of PROCESO_NAMES) {
          const estadoCol = `${pName} (Estado)`;
          const fechaCol = `${pName} (Fecha)`;
          const obsCol = `${pName} (Observación)`;
          const estado = str(r[estadoCol]);
          if (!estado) continue;
          if (!VALID_PROC_ESTADOS.includes(estado)) continue;
          if (estado === "No realizado") continue; // Don't insert "No realizado" records

          procRecords.push({
            persona_id: created.id,
            proceso_id: PROCESOS_MAP[pName],
            estado,
            fecha_completado: parseExcelDate(r[fechaCol]),
            observacion: str(r[obsCol]),
          });
        }

        if (procRecords.length > 0) {
          const { error: procErr } = await supabase.from("persona_procesos").insert(procRecords);
          if (procErr) {
            errors.push({ row: rowNum, message: `Persona creada pero error en procesos: ${procErr.message}` });
          }
        }

        success++;
      }

      setResult({ total: rows.length, success, errors });
      if (success > 0) {
        qc.invalidateQueries({ queryKey: ["personas"] });
        toast.success(`${success} personas importadas exitosamente`);
      }
    } catch (err: any) {
      toast.error("Error al leer el archivo: " + (err?.message || ""));
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Upload className="h-4 w-4" /> Importar Excel
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            Importación Masiva de Personas
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!result ? (
            <>
              <div className="border-2 border-dashed rounded-lg p-6 text-center space-y-3">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Selecciona el archivo Excel con la plantilla de personas
                </p>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFile}
                  className="block mx-auto text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
                />
                {file && (
                  <p className="text-sm font-medium text-foreground">{file.name}</p>
                )}
                <Button variant="link" size="sm" className="gap-1 text-xs" onClick={downloadTemplate}>
                  <Download className="h-3 w-3" /> Descargar plantilla con procesos de crecimiento
                </Button>
              </div>

              {importing && (
                <div className="space-y-2">
                  <Progress value={progress} className="h-2" />
                  <p className="text-xs text-muted-foreground text-center">Importando... {progress}%</p>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                <CheckCircle2 className="h-5 w-5 text-success" />
                <div>
                  <p className="font-semibold">{result.success} de {result.total} personas importadas</p>
                  {result.errors.length > 0 && (
                    <p className="text-sm text-destructive">{result.errors.length} errores</p>
                  )}
                </div>
              </div>

              {result.errors.length > 0 && (
                <div className="max-h-48 overflow-y-auto space-y-1 text-xs">
                  {result.errors.map((e, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 bg-destructive/10 rounded">
                      <AlertTriangle className="h-3 w-3 text-destructive mt-0.5 shrink-0" />
                      <span><strong>Fila {e.row}:</strong> {e.message}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          {result ? (
            <Button onClick={() => { reset(); setOpen(false); }}>Cerrar</Button>
          ) : (
            <Button onClick={doImport} disabled={!file || importing}>
              {importing ? "Importando..." : "Iniciar Importación"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

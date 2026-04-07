import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileSpreadsheet, AlertTriangle, CheckCircle2, Download, Users, BarChart3, ClipboardCheck, DatabaseBackup } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as XLSX from "xlsx";

type ImportType = "migracion" | "matriculas" | "calificaciones" | "asistencia";

interface MigracionRow {
  estudiante: string;
  asistencia: number;
  nota: number;
  aprobadoAsistencia: boolean;
  aprobadaMateria: boolean;
  aula: string;
  maestros: string;
}

interface MigracionData {
  materia: string;
  sede: string;
  rows: MigracionRow[];
}

function parseMigracionFile(wb: XLSX.WorkBook): MigracionData | null {
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const raw: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });

  let materia = "";
  let sede = "";
  let headerRowIdx = -1;

  for (let i = 0; i < Math.min(20, raw.length); i++) {
    const cell = String(raw[i]?.[0] || "").trim();
    if (cell.toLowerCase().startsWith("materia:")) {
      materia = cell.replace(/^materia:\s*/i, "").trim();
    }
    if (cell.includes("Principal") || cell.includes("Sede")) {
      sede = cell.replace(/\n/g, "").trim();
    }
    if (cell === "ESTUDIANTE") {
      headerRowIdx = i;
      break;
    }
  }

  if (headerRowIdx < 0) return null;

  const rows: MigracionRow[] = [];
  for (let i = headerRowIdx + 1; i < raw.length; i++) {
    const r = raw[i];
    const name = String(r[0] || "").trim();
    if (!name) continue;

    const asistencia = Number(r[1]) || 0;
    let notaStr = String(r[2] || "0").replace(/\s+/g, "").replace(",", ".");
    // Handle cases like "0,0 0" -> "0.00"
    if (notaStr.includes(" ")) notaStr = notaStr.split(" ")[0];
    const nota = parseFloat(notaStr) || 0;
    const aprobadoAsistencia = String(r[3] || "").trim().toUpperCase() === "SI";
    const aprobadaMateria = String(r[4] || "").trim().toUpperCase() === "SI";
    const aula = String(r[5] || "").trim();
    const maestros = String(r[6] || "").replace(/\n/g, " ").replace(/\/\s*$/, "").trim();

    rows.push({ estudiante: name, asistencia, nota, aprobadoAsistencia, aprobadaMateria, aula, maestros });
  }

  return { materia, sede, rows };
}

function splitName(fullName: string): { nombres: string; apellidos: string } {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length <= 2) {
    return { apellidos: parts[0] || "", nombres: parts.slice(1).join(" ") || parts[0] || "" };
  }
  // Heuristic: last words are first names for "Apellido1 Apellido2 Nombre" pattern
  // But actually the format seems "Apellido1 Apellido2 Nombre" or "Apellido Nombre"
  // We'll try to match by full name against the DB
  return { nombres: parts.slice(-1).join(" "), apellidos: parts.slice(0, -1).join(" ") };
}

export default function ImportAcademiaDialog() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<ImportType>("migracion");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ ok: number; errors: string[] } | null>(null);
  const [migracionData, setMigracionData] = useState<MigracionData | null>(null);
  const [selectedEscuelaId, setSelectedEscuelaId] = useState<string>("");
  const [selectedPeriodoId, setSelectedPeriodoId] = useState<string>("");
  const [escuelas, setEscuelas] = useState<any[]>([]);
  const [periodos, setPeriodos] = useState<any[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const qc = useQueryClient();

  useEffect(() => {
    if (open) {
      supabase.from("cursos").select("id, nombre").order("nombre").then(({ data }) => setEscuelas(data || []));
    }
  }, [open]);

  useEffect(() => {
    if (selectedEscuelaId) {
      supabase.from("periodos_academicos").select("id, nombre").eq("escuela_id", selectedEscuelaId).order("nombre").then(({ data }) => setPeriodos(data || []));
    } else {
      setPeriodos([]);
    }
    setSelectedPeriodoId("");
  }, [selectedEscuelaId]);

  const reset = () => {
    setFile(null);
    setPreview([]);
    setProgress(0);
    setResult(null);
    setMigracionData(null);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setResult(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const wb = XLSX.read(ev.target?.result, { type: "array" });

      if (tab === "migracion") {
        const data = parseMigracionFile(wb);
        setMigracionData(data);
        if (data) {
          setPreview(data.rows.slice(0, 5).map((r) => ({
            Estudiante: r.estudiante,
            Asistencia: r.asistencia,
            Nota: r.nota,
            "Aprobó": r.aprobadaMateria ? "Sí" : "No",
          })));
        }
      } else {
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });
        setPreview(rows.slice(0, 5));
      }
    };
    reader.readAsArrayBuffer(f);
  };

  const downloadTemplate = () => {
    let headers: string[][];
    if (tab === "matriculas") {
      headers = [
        ["documento", "nombres", "apellidos", "escuela", "periodo", "materia", "estado", "nota_final"],
        ["1234567890", "Juan", "Pérez", "Seminario Bíblico", "Período 2025-1", "Hermenéutica", "Activo", ""],
      ];
    } else if (tab === "calificaciones") {
      headers = [
        ["documento_estudiante", "nombres_estudiante", "apellidos_estudiante", "materia", "item_calificable", "nota", "observacion"],
        ["1234567890", "Juan", "Pérez", "Hermenéutica", "Examen parcial", "4.5", "Buen desempeño"],
      ];
    } else {
      headers = [
        ["documento_estudiante", "nombres_estudiante", "apellidos_estudiante", "materia", "fecha", "presente"],
        ["1234567890", "Juan", "Pérez", "Hermenéutica", "2025-03-15", "Sí"],
      ];
    }
    const ws = XLSX.utils.aoa_to_sheet(headers);
    ws["!cols"] = headers[0].map(() => ({ wch: 22 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, tab.charAt(0).toUpperCase() + tab.slice(1));
    XLSX.writeFile(wb, `plantilla_${tab}.xlsx`);
  };

  const findPersona = (personas: any[], doc: string, nombres: string, apellidos: string): string | undefined => {
    if (doc) {
      const found = personas.find((p) => p.documento?.trim().toLowerCase() === doc.toLowerCase());
      if (found) return found.id;
    }
    if (nombres && apellidos) {
      const fullName = `${nombres} ${apellidos}`.toLowerCase();
      const found = personas.find((p) => `${p.nombres} ${p.apellidos}`.toLowerCase() === fullName);
      if (found) return found.id;
    }
    return undefined;
  };

  const findPersonaByFullName = (personas: any[], fullName: string): string | undefined => {
    const normalized = fullName.toLowerCase().trim();
    // Try exact match: "Apellido1 Apellido2 Nombre" vs "nombres apellidos"
    let found = personas.find((p) => {
      const dbFull = `${p.apellidos} ${p.nombres}`.toLowerCase().trim();
      return dbFull === normalized;
    });
    if (found) return found.id;

    // Try reversed: "Nombres Apellidos"
    found = personas.find((p) => {
      const dbFull = `${p.nombres} ${p.apellidos}`.toLowerCase().trim();
      return dbFull === normalized;
    });
    if (found) return found.id;

    // Fuzzy: check if all words from the file appear in the DB record
    const fileWords = normalized.split(/\s+/).filter(Boolean);
    found = personas.find((p) => {
      const dbWords = `${p.nombres} ${p.apellidos}`.toLowerCase().split(/\s+/).filter(Boolean);
      return fileWords.length >= 2 && fileWords.every((w) => dbWords.includes(w));
    });
    if (found) return found.id;

    // Reverse fuzzy
    found = personas.find((p) => {
      const dbWords = `${p.nombres} ${p.apellidos}`.toLowerCase().split(/\s+/).filter(Boolean);
      return dbWords.length >= 2 && dbWords.every((w) => fileWords.includes(w));
    });
    if (found) return found.id;

    return undefined;
  };

  const doImportMigracion = async () => {
    if (!migracionData || !selectedEscuelaId || !selectedPeriodoId) return;
    setImporting(true);
    setProgress(0);
    const errors: string[] = [];
    let ok = 0;

    try {
      const [{ data: personas }, { data: materias }, { data: existingMatriculas }] = await Promise.all([
        supabase.from("personas").select("id, nombres, apellidos, documento"),
        supabase.from("materias").select("id, nombre, periodo_id"),
        supabase.from("matriculas").select("id, persona_id, curso_id, periodo_id, materia_id"),
      ]);

      // Find or identify materia
      const materia = (materias || []).find(
        (m) => m.nombre.toLowerCase() === migracionData.materia.toLowerCase() && m.periodo_id === selectedPeriodoId
      );

      if (!materia) {
        errors.push(`Materia "${migracionData.materia}" no encontrada en el período seleccionado. Por favor, cree la materia primero.`);
        setResult({ ok, errors });
        setImporting(false);
        return;
      }

      const records: { persona_id: string; curso_id: string; periodo_id: string; materia_id: string; estado: string; nota_final: number | null }[] = [];
      const notFoundNames: string[] = [];

      for (const row of migracionData.rows) {
        const personaId = findPersonaByFullName(personas || [], row.estudiante);
        if (!personaId) {
          notFoundNames.push(row.estudiante);
          errors.push(`Persona no encontrada: "${row.estudiante}"`);
          continue;
        }

        // Check duplicate
        const exists = (existingMatriculas || []).find(
          (m) => m.persona_id === personaId && m.curso_id === selectedEscuelaId && m.periodo_id === selectedPeriodoId && m.materia_id === materia.id
        );
        if (exists) {
          errors.push(`Matrícula duplicada: "${row.estudiante}"`);
          continue;
        }

        records.push({
          persona_id: personaId,
          curso_id: selectedEscuelaId,
          periodo_id: selectedPeriodoId,
          materia_id: materia.id,
          estado: row.aprobadaMateria ? "Completado" : "Activo",
          nota_final: row.nota,
        });
      }

      const CHUNK = 200;
      for (let i = 0; i < records.length; i += CHUNK) {
        const chunk = records.slice(i, i + CHUNK);
        const { error } = await supabase.from("matriculas").insert(chunk);
        if (error) errors.push(`Error lote ${Math.floor(i / CHUNK) + 1}: ${error.message}`);
        else ok += chunk.length;
        setProgress(Math.round(((i + chunk.length) / records.length) * 100));
      }

      setResult({ ok, errors });
      if (ok > 0) {
        qc.invalidateQueries({ queryKey: ["matriculas"] });
        qc.invalidateQueries({ queryKey: ["matriculas-all"] });
        toast.success(`${ok} matrículas importadas desde el sistema anterior`);
      }
    } catch (err: any) {
      errors.push(`Error general: ${err.message}`);
      setResult({ ok, errors });
    } finally {
      setImporting(false);
    }
  };

  const doImport = async () => {
    if (tab === "migracion") {
      return doImportMigracion();
    }

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

        if (!rows.length) {
          errors.push("El archivo está vacío");
          setResult({ ok, errors });
          setImporting(false);
          return;
        }

        // Recursive load to bypass 1000 row limit
        const loadAllPersonas = async () => {
          const all: any[] = [];
          let from = 0;
          const PAGE = 1000;
          while (true) {
            const { data } = await supabase.from("personas").select("id, nombres, apellidos, documento").range(from, from + PAGE - 1);
            if (!data || data.length === 0) break;
            all.push(...data);
            if (data.length < PAGE) break;
            from += PAGE;
          }
          return all;
        };

        const [personas, { data: cursos }, { data: periodos }, { data: materias }, { data: matriculas }, { data: items }] = await Promise.all([
          loadAllPersonas(),
          supabase.from("cursos").select("id, nombre"),
          supabase.from("periodos_academicos").select("id, nombre, escuela_id"),
          supabase.from("materias").select("id, nombre, periodo_id"),
          supabase.from("matriculas").select("id, persona_id, curso_id, periodo_id, materia_id"),
          supabase.from("items_calificables").select("id, nombre, materia_id"),
        ]);

        if (tab === "matriculas") {
          const records: any[] = [];
          for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const rowNum = i + 2;
            // Support flexible column names
            const doc = String(row.documento_estudiante || row.documento || row.Documento || "").trim();
            const nombres = String(row.nombres_estudiante || row.nombres || row.Nombres || "").trim();
            const apellidos = String(row.apellidos_estudiante || row.apellidos || row.Apellidos || "").trim();

            // Try findPersona first, then fuzzy full-name match
            let personaId = findPersona(personas || [], doc, nombres, apellidos);
            if (!personaId && (nombres || apellidos)) {
              personaId = findPersonaByFullName(personas || [], `${nombres} ${apellidos}`);
            }
            if (!personaId && (nombres || apellidos)) {
              personaId = findPersonaByFullName(personas || [], `${apellidos} ${nombres}`);
            }
            if (!personaId) { errors.push(`Fila ${rowNum}: Persona no encontrada "${nombres} ${apellidos}"`); continue; }

            const escuelaNombre = String(row.escuela || row.Escuela || "").trim().toLowerCase();
            const periodoNombre = String(row.periodo || row.Periodo || "").trim().toLowerCase();
            const materiaNombre = String(row.materia || row.Materia || "").trim().toLowerCase();
            const estado = String(row.estado || row.Estado || "Activo").trim();
            const notaFinal = row.nota_final !== "" && row.nota_final != null ? Number(row.nota_final) : (row.Nota_Final || row["Nota Final"]) !== "" && (row.Nota_Final || row["Nota Final"]) != null ? Number(row.Nota_Final || row["Nota Final"]) : null;

            const escuela = (cursos || []).find((c) => c.nombre.toLowerCase() === escuelaNombre);
            if (!escuela) { errors.push(`Fila ${rowNum}: Escuela no encontrada "${row.escuela || row.Escuela}"`); continue; }

            const periodo = (periodos || []).find((p) => p.nombre.toLowerCase() === periodoNombre && p.escuela_id === escuela.id);
            if (!periodo) { errors.push(`Fila ${rowNum}: Período no encontrado "${row.periodo || row.Periodo}"`); continue; }

            let materiaId: string | null = null;
            if (materiaNombre) {
              const mat = (materias || []).find((m) => m.nombre.toLowerCase() === materiaNombre && m.periodo_id === periodo.id);
              if (!mat) { errors.push(`Fila ${rowNum}: Materia no encontrada "${row.materia || row.Materia}"`); continue; }
              materiaId = mat.id;
            }

            const exists = (matriculas || []).find((m) =>
              m.persona_id === personaId && m.curso_id === escuela.id && m.periodo_id === periodo.id &&
              (materiaId ? m.materia_id === materiaId : true)
            );
            if (exists) { errors.push(`Fila ${rowNum}: Matrícula duplicada para "${nombres} ${apellidos}"`); continue; }

            records.push({
              persona_id: personaId,
              curso_id: escuela.id,
              periodo_id: periodo.id,
              materia_id: materiaId,
              estado: ["Activo", "Completado", "Retirado"].includes(estado) ? estado : "Activo",
              nota_final: notaFinal,
            });
          }

          const CHUNK = 200;
          for (let i = 0; i < records.length; i += CHUNK) {
            const chunk = records.slice(i, i + CHUNK);
            const { error } = await supabase.from("matriculas").insert(chunk);
            if (error) errors.push(`Error lote ${Math.floor(i / CHUNK) + 1}: ${error.message}`);
            else ok += chunk.length;
            setProgress(Math.round(((i + chunk.length) / records.length) * 100));
          }
        }

        if (tab === "calificaciones") {
          const { data: allMats } = await supabase.from("matriculas").select("id, persona_id, materia_id");
          const records: any[] = [];

          for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const rowNum = i + 2;
            const doc = String(row.documento_estudiante || row.documento || row.Documento || "").trim();
            const nombres = String(row.nombres_estudiante || row.nombres || row.Nombres || "").trim();
            const apellidos = String(row.apellidos_estudiante || row.apellidos || row.Apellidos || "").trim();
            const materiaNombre = String(row.materia || row.Materia || "").trim().toLowerCase();
            const itemNombre = String(row.item_calificable || row.Item_Calificable || row["Item Calificable"] || "").trim().toLowerCase();
            const nota = row.nota !== "" && row.nota != null ? Number(row.nota) : null;
            const observacion = String(row.observacion || row.Observacion || "").trim() || null;

            let personaId = findPersona(personas || [], doc, nombres, apellidos);
            if (!personaId && (nombres || apellidos)) personaId = findPersonaByFullName(personas || [], `${nombres} ${apellidos}`);
            if (!personaId && (nombres || apellidos)) personaId = findPersonaByFullName(personas || [], `${apellidos} ${nombres}`);
            if (!personaId) { errors.push(`Fila ${rowNum}: Persona no encontrada "${nombres} ${apellidos}"`); continue; }

            const materia = (materias || []).find((m) => m.nombre.toLowerCase() === materiaNombre);
            if (!materia) { errors.push(`Fila ${rowNum}: Materia no encontrada "${row.materia}"`); continue; }

            const item = (items || []).find((it) => it.nombre.toLowerCase() === itemNombre && it.materia_id === materia.id);
            if (!item) { errors.push(`Fila ${rowNum}: Ítem calificable no encontrado "${row.item_calificable}"`); continue; }

            const matricula = (allMats || []).find((m) => m.persona_id === personaId && m.materia_id === materia.id);
            if (!matricula) { errors.push(`Fila ${rowNum}: Matrícula no encontrada para "${nombres} ${apellidos}" en "${row.materia}"`); continue; }

            records.push({ item_id: item.id, matricula_id: matricula.id, nota, observacion });
          }

          const CHUNK = 200;
          for (let i = 0; i < records.length; i += CHUNK) {
            const chunk = records.slice(i, i + CHUNK);
            const { error } = await supabase.from("calificaciones").insert(chunk);
            if (error) errors.push(`Error lote ${Math.floor(i / CHUNK) + 1}: ${error.message}`);
            else ok += chunk.length;
            setProgress(Math.round(((i + chunk.length) / records.length) * 100));
          }
        }

        if (tab === "asistencia") {
          const { data: allMats } = await supabase.from("matriculas").select("id, persona_id, materia_id");
          const records: any[] = [];

          for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const rowNum = i + 2;
            const doc = String(row.documento_estudiante || row.documento || row.Documento || "").trim();
            const nombres = String(row.nombres_estudiante || row.nombres || row.Nombres || "").trim();
            const apellidos = String(row.apellidos_estudiante || row.apellidos || row.Apellidos || "").trim();
            const materiaNombre = String(row.materia || row.Materia || "").trim().toLowerCase();
            const fecha = String(row.fecha || row.Fecha || "").trim();
            const presenteRaw = String(row.presente || row.Presente || "").trim().toLowerCase();
            const presente = ["sí", "si", "yes", "1", "true", "x"].includes(presenteRaw);

            let personaId = findPersona(personas || [], doc, nombres, apellidos);
            if (!personaId && (nombres || apellidos)) personaId = findPersonaByFullName(personas || [], `${nombres} ${apellidos}`);
            if (!personaId && (nombres || apellidos)) personaId = findPersonaByFullName(personas || [], `${apellidos} ${nombres}`);
            if (!personaId) { errors.push(`Fila ${rowNum}: Persona no encontrada "${nombres} ${apellidos}"`); continue; }

            const materia = (materias || []).find((m) => m.nombre.toLowerCase() === materiaNombre);
            if (!materia) { errors.push(`Fila ${rowNum}: Materia no encontrada "${row.materia}"`); continue; }

            const matricula = (allMats || []).find((m) => m.persona_id === personaId && m.materia_id === materia.id);
            if (!matricula) { errors.push(`Fila ${rowNum}: Matrícula no encontrada para "${nombres} ${apellidos}" en "${row.materia}"`); continue; }

            if (!fecha || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
              errors.push(`Fila ${rowNum}: Fecha inválida "${row.fecha}" (usar YYYY-MM-DD)`);
              continue;
            }

            records.push({ materia_id: materia.id, matricula_id: matricula.id, fecha, presente });
          }

          const CHUNK = 200;
          for (let i = 0; i < records.length; i += CHUNK) {
            const chunk = records.slice(i, i + CHUNK);
            const { error } = await supabase.from("asistencia_materias").insert(chunk);
            if (error) errors.push(`Error lote ${Math.floor(i / CHUNK) + 1}: ${error.message}`);
            else ok += chunk.length;
            setProgress(Math.round(((i + chunk.length) / records.length) * 100));
          }
        }

        setResult({ ok, errors });
        if (ok > 0) {
          qc.invalidateQueries({ queryKey: ["matriculas"] });
          qc.invalidateQueries({ queryKey: ["matriculas-all"] });
          qc.invalidateQueries({ queryKey: ["calificaciones"] });
          qc.invalidateQueries({ queryKey: ["asistencia-materias"] });
          toast.success(`${ok} registros importados correctamente`);
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

  const tabLabels: Record<ImportType, { label: string; icon: any }> = {
    migracion: { label: "Migración", icon: DatabaseBackup },
    matriculas: { label: "Matrículas", icon: Users },
    calificaciones: { label: "Calificaciones", icon: BarChart3 },
    asistencia: { label: "Asistencia", icon: ClipboardCheck },
  };

  const canImport = tab === "migracion"
    ? !!file && !!migracionData && !!selectedEscuelaId && !!selectedPeriodoId && !importing
    : !!file && !importing;

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
          <Upload className="h-3.5 w-3.5" /> Importar Excel
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            Importar datos de Academia
          </DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => { setTab(v as ImportType); reset(); }}>
          <TabsList className="grid grid-cols-4 w-full">
            {(Object.keys(tabLabels) as ImportType[]).map((key) => {
              const { label, icon: Icon } = tabLabels[key];
              return (
                <TabsTrigger key={key} value={key} className="text-xs gap-1">
                  <Icon className="h-3.5 w-3.5" /> {label}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>

        <div className="space-y-4">
          {tab === "migracion" ? (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Sube el archivo Excel exportado del sistema anterior. Se detectará automáticamente la materia, los estudiantes, las notas y el estado de aprobación.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium mb-1 block">Escuela *</label>
                  <Select value={selectedEscuelaId} onValueChange={setSelectedEscuelaId}>
                    <SelectTrigger className="text-xs h-8">
                      <SelectValue placeholder="Seleccionar escuela" />
                    </SelectTrigger>
                    <SelectContent>
                      {escuelas.map((e) => (
                        <SelectItem key={e.id} value={e.id} className="text-xs">{e.nombre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">Período *</label>
                  <Select value={selectedPeriodoId} onValueChange={setSelectedPeriodoId} disabled={!selectedEscuelaId}>
                    <SelectTrigger className="text-xs h-8">
                      <SelectValue placeholder="Seleccionar período" />
                    </SelectTrigger>
                    <SelectContent>
                      {periodos.map((p) => (
                        <SelectItem key={p.id} value={p.id} className="text-xs">{p.nombre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {migracionData && (
                <div className="bg-muted/50 rounded-md p-3 text-xs space-y-1">
                  <p><strong>Materia detectada:</strong> {migracionData.materia || "No detectada"}</p>
                  <p><strong>Sede:</strong> {migracionData.sede || "No detectada"}</p>
                  <p><strong>Estudiantes encontrados:</strong> {migracionData.rows.length}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={downloadTemplate} className="gap-1.5 text-xs">
                <Download className="h-3.5 w-3.5" /> Descargar plantilla
              </Button>
              <p className="text-xs text-muted-foreground">
                {tab === "matriculas" && "Columnas: documento, nombres, apellidos, escuela, periodo, materia, estado, nota_final"}
                {tab === "calificaciones" && "Columnas: documento, nombres, apellidos, materia, item_calificable, nota, observación"}
                {tab === "asistencia" && "Columnas: documento, nombres, apellidos, materia, fecha (YYYY-MM-DD), presente (Sí/No)"}
              </p>
            </div>
          )}

          <div
            className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              {file ? file.name : "Haz clic o arrastra un archivo Excel (.xls, .xlsx)"}
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
                        <th key={k} className="px-2 py-1 text-left whitespace-nowrap">{k}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, i) => (
                      <tr key={i} className="border-t">
                        {Object.values(row).map((v, j) => (
                          <td key={j} className="px-2 py-1 whitespace-nowrap">{String(v)}</td>
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
              <div className="flex items-center gap-2 text-primary">
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
          <Button onClick={doImport} disabled={!canImport}>
            {importing ? "Importando..." : "Importar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

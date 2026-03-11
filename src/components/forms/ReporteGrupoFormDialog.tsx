import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  CalendarIcon, ChevronRight, ChevronLeft, Users, UserPlus,
  CheckCircle2, XCircle, ClipboardList, DollarSign, Send,
} from "lucide-react";
import { useGrupos } from "@/hooks/useDatabase";
import { useCreateReporteGrupo, useGrupoMiembrosForReport } from "@/hooks/useReportesGrupos";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AttendanceRecord {
  persona_id: string;
  nombres: string;
  apellidos: string;
  foto_url: string | null;
  tipo_persona: string;
  presente: boolean;
  es_nuevo: boolean;
  motivo_ausencia: string;
}

interface NuevaPersona {
  nombres: string;
  apellidos: string;
  telefono: string;
  tipo_persona: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STEPS = ["Grupo", "Personas Nuevas", "Asistencia", "Finanzas"];

export default function ReporteGrupoFormDialog({ open, onOpenChange }: Props) {
  const [step, setStep] = useState(0);
  const [grupoId, setGrupoId] = useState("");
  const [fecha, setFecha] = useState<Date>(new Date());
  const [mensaje, setMensaje] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [ofrendaCasaPaz, setOfrendaCasaPaz] = useState("");
  const [totalReportado, setTotalReportado] = useState("");
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [nuevasPersonas, setNuevasPersonas] = useState<NuevaPersona[]>([]);
  const [newForm, setNewForm] = useState<NuevaPersona>({ nombres: "", apellidos: "", telefono: "", tipo_persona: "Visitante" });

  const { data: grupos } = useGrupos();
  const { data: miembros, isLoading: loadingMiembros } = useGrupoMiembrosForReport(grupoId || null);
  const createReporte = useCreateReporteGrupo();

  // Initialize attendance when members load
  const selectedGrupo = grupos?.find((g) => g.id === grupoId);

  useMemo(() => {
    if (miembros && miembros.length > 0 && grupoId) {
      setAttendance(
        miembros.map((m) => ({
          persona_id: m.id,
          nombres: m.nombres,
          apellidos: m.apellidos,
          foto_url: m.foto_url,
          tipo_persona: m.tipo_persona,
          presente: true,
          es_nuevo: false,
          motivo_ausencia: "",
        }))
      );
    }
  }, [miembros, grupoId]);

  const togglePresente = (personaId: string) => {
    setAttendance((prev) =>
      prev.map((a) => (a.persona_id === personaId ? { ...a, presente: !a.presente, motivo_ausencia: a.presente ? "" : a.motivo_ausencia } : a))
    );
  };

  const setMotivo = (personaId: string, motivo: string) => {
    setAttendance((prev) =>
      prev.map((a) => (a.persona_id === personaId ? { ...a, motivo_ausencia: motivo } : a))
    );
  };

  const addNuevaPersona = () => {
    if (!newForm.nombres || !newForm.apellidos) {
      toast.error("Nombre y apellido son obligatorios.");
      return;
    }
    setNuevasPersonas((prev) => [...prev, { ...newForm }]);
    setNewForm({ nombres: "", apellidos: "", telefono: "", tipo_persona: "Visitante" });
  };

  const removeNuevaPersona = (index: number) => {
    setNuevasPersonas((prev) => prev.filter((_, i) => i !== index));
  };

  const presentesCount = attendance.filter((a) => a.presente).length;
  const ausentesCount = attendance.filter((a) => !a.presente).length;

  const handleSubmit = async () => {
    if (!grupoId || !mensaje) {
      toast.error("Complete los datos obligatorios.");
      return;
    }

    try {
      // First, create any new personas and add to grupo
      const newPersonaIds: string[] = [];
      for (const np of nuevasPersonas) {
        const { data: persona, error: pErr } = await supabase
          .from("personas")
          .insert({
            nombres: np.nombres,
            apellidos: np.apellidos,
            telefono: np.telefono || null,
            tipo_persona: np.tipo_persona as any,
            grupo_id: grupoId,
          })
          .select("id")
          .single();
        if (pErr) throw pErr;
        newPersonaIds.push(persona.id);

        // Add to grupo_miembros
        await supabase.from("grupo_miembros").insert({
          grupo_id: grupoId,
          persona_id: persona.id,
        });
      }

      // Build attendance list (existing + new people marked as present and nuevo)
      const allAttendance = [
        ...attendance.map((a) => ({
          persona_id: a.persona_id,
          presente: a.presente,
          es_nuevo: false,
          motivo_ausencia: a.motivo_ausencia || undefined,
        })),
        ...newPersonaIds.map((pid) => ({
          persona_id: pid,
          presente: true,
          es_nuevo: true,
        })),
      ];

      await createReporte.mutateAsync({
        grupo_id: grupoId,
        fecha: format(fecha, "yyyy-MM-dd"),
        mensaje,
        observaciones: observaciones || undefined,
        ofrenda_casa_paz: parseFloat(ofrendaCasaPaz) || 0,
        total_reportado: parseFloat(totalReportado) || 0,
        asistencia: allAttendance,
      });

      toast.success("Reporte creado exitosamente.");
      resetForm();
      onOpenChange(false);
    } catch (err: any) {
      toast.error("Error al crear el reporte: " + (err.message || ""));
    }
  };

  const resetForm = () => {
    setStep(0);
    setGrupoId("");
    setMensaje("");
    setObservaciones("");
    setFecha(new Date());
    setOfrendaCasaPaz("");
    setTotalReportado("");
    setAttendance([]);
    setNuevasPersonas([]);
  };

  const canNext = () => {
    if (step === 0) return !!grupoId && !!mensaje;
    return true;
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) resetForm(); onOpenChange(o); }}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Crear Reporte Semanal
          </DialogTitle>
        </DialogHeader>

        {/* Step indicators */}
        <div className="flex items-center gap-1 pb-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-1 flex-1">
              <div
                className={cn(
                  "flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold shrink-0 transition-colors",
                  i <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}
              >
                {i + 1}
              </div>
              <span className={cn("text-xs truncate hidden sm:block", i <= step ? "text-foreground font-medium" : "text-muted-foreground")}>
                {s}
              </span>
              {i < STEPS.length - 1 && <div className={cn("h-px flex-1 mx-1", i < step ? "bg-primary" : "bg-border")} />}
            </div>
          ))}
        </div>

        <Separator />

        <ScrollArea className="flex-1 pr-2">
          <div className="space-y-4 py-2">
            {/* Step 0: Group selection */}
            {step === 0 && (
              <>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Grupo *</label>
                  <Select value={grupoId} onValueChange={setGrupoId}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar grupo..." /></SelectTrigger>
                    <SelectContent>
                      {grupos?.map((g) => (
                        <SelectItem key={g.id} value={g.id}>{g.nombre} — {g.tipo}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Fecha</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(fecha, "PPP", { locale: es })}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={fecha} onSelect={(d) => d && setFecha(d)} className="p-3 pointer-events-auto" />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Mensaje / Tema *</label>
                  <Input value={mensaje} onChange={(e) => setMensaje(e.target.value)} placeholder="Tema del mensaje..." />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Observaciones</label>
                  <Textarea value={observaciones} onChange={(e) => setObservaciones(e.target.value)} placeholder="Observaciones..." rows={3} />
                </div>
                {selectedGrupo && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>Grupo seleccionado: <strong>{selectedGrupo.nombre}</strong></span>
                  </div>
                )}
              </>
            )}

            {/* Step 1: New people */}
            {step === 1 && (
              <>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-info/10 border border-info/20 text-sm">
                  <UserPlus className="h-5 w-5 text-info shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">¿Tienes personas nuevas?</p>
                    <p className="text-muted-foreground text-xs">Agrega visitantes o personas nuevas que llegaron esta semana. Se crearán automáticamente en el sistema.</p>
                  </div>
                </div>

                {/* New person form */}
                <div className="grid grid-cols-2 gap-3">
                  <Input placeholder="Nombres *" value={newForm.nombres} onChange={(e) => setNewForm({ ...newForm, nombres: e.target.value })} />
                  <Input placeholder="Apellidos *" value={newForm.apellidos} onChange={(e) => setNewForm({ ...newForm, apellidos: e.target.value })} />
                  <Input placeholder="Teléfono" value={newForm.telefono} onChange={(e) => setNewForm({ ...newForm, telefono: e.target.value })} />
                  <Select value={newForm.tipo_persona} onValueChange={(v) => setNewForm({ ...newForm, tipo_persona: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Visitante">Visitante</SelectItem>
                      <SelectItem value="Miembro">Miembro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline" className="gap-2 w-full" onClick={addNuevaPersona}>
                  <UserPlus className="h-4 w-4" /> Agregar persona
                </Button>

                {/* List of added people */}
                {nuevasPersonas.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Personas nuevas agregadas ({nuevasPersonas.length})</p>
                    {nuevasPersonas.map((np, i) => (
                      <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-[10px]">{np.nombres[0]}{np.apellidos[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{np.nombres} {np.apellidos}</p>
                            <p className="text-xs text-muted-foreground">{np.tipo_persona}{np.telefono ? ` · ${np.telefono}` : ""}</p>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost" className="text-destructive h-7" onClick={() => removeNuevaPersona(i)}>
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {nuevasPersonas.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No hay personas nuevas. Puedes continuar al siguiente paso.
                  </p>
                )}
              </>
            )}

            {/* Step 2: Attendance */}
            {step === 2 && (
              <>
                <div className="flex items-center gap-4 mb-2">
                  <Badge variant="outline" className="gap-1.5 border-success text-success">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Presentes: {presentesCount}
                  </Badge>
                  <Badge variant="outline" className="gap-1.5 border-destructive text-destructive">
                    <XCircle className="h-3.5 w-3.5" /> Ausentes: {ausentesCount}
                  </Badge>
                  {nuevasPersonas.length > 0 && (
                    <Badge variant="outline" className="gap-1.5 border-info text-info">
                      <UserPlus className="h-3.5 w-3.5" /> Nuevos: {nuevasPersonas.length}
                    </Badge>
                  )}
                </div>

                {loadingMiembros ? (
                  <p className="text-sm text-muted-foreground text-center py-8">Cargando miembros...</p>
                ) : attendance.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Este grupo no tiene miembros registrados. Agrega personas nuevas en el paso anterior.
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {attendance.map((a) => {
                      const initials = `${a.nombres[0] || ""}${a.apellidos[0] || ""}`.toUpperCase();
                      return (
                        <div
                          key={a.persona_id}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                            a.presente ? "bg-success/5 border-success/20" : "bg-destructive/5 border-destructive/20"
                          )}
                        >
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={a.foto_url || undefined} />
                            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{a.nombres} {a.apellidos}</p>
                            {!a.presente && (
                              <Input
                                placeholder="Motivo de ausencia..."
                                value={a.motivo_ausencia}
                                onChange={(e) => setMotivo(a.persona_id, e.target.value)}
                                className="mt-1 h-7 text-xs"
                              />
                            )}
                          </div>
                          <Switch checked={a.presente} onCheckedChange={() => togglePresente(a.persona_id)} />
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Show new people as automatic present */}
                {nuevasPersonas.length > 0 && (
                  <>
                    <Separator />
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Personas nuevas (presentes automáticamente)</p>
                    {nuevasPersonas.map((np, i) => (
                      <div key={`new-${i}`} className="flex items-center gap-3 p-3 rounded-lg bg-info/5 border border-info/20">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="text-xs">{np.nombres[0]}{np.apellidos[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{np.nombres} {np.apellidos}</p>
                          <p className="text-xs text-info">Nuevo</p>
                        </div>
                        <CheckCircle2 className="h-5 w-5 text-success" />
                      </div>
                    ))}
                  </>
                )}
              </>
            )}

            {/* Step 3: Finances */}
            {step === 3 && (
              <>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-accent/10 border border-accent/20 text-sm">
                  <DollarSign className="h-5 w-5 text-accent shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">Resumen financiero</p>
                    <p className="text-muted-foreground text-xs">Registra la ofrenda y el total recaudado en la reunión.</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Ofrenda Casa de Paz</label>
                    <Input type="number" step="0.01" min="0" value={ofrendaCasaPaz} onChange={(e) => setOfrendaCasaPaz(e.target.value)} placeholder="0.00" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Total Reportado</label>
                    <Input type="number" step="0.01" min="0" value={totalReportado} onChange={(e) => setTotalReportado(e.target.value)} placeholder="0.00" />
                  </div>
                </div>

                {/* Summary */}
                <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                  <p className="text-sm font-semibold">Resumen del Reporte</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-muted-foreground">Grupo:</span>
                    <span className="font-medium">{selectedGrupo?.nombre}</span>
                    <span className="text-muted-foreground">Fecha:</span>
                    <span className="font-medium">{format(fecha, "PPP", { locale: es })}</span>
                    <span className="text-muted-foreground">Mensaje:</span>
                    <span className="font-medium truncate">{mensaje}</span>
                    <span className="text-muted-foreground">Presentes:</span>
                    <span className="font-medium text-success">{presentesCount + nuevasPersonas.length}</span>
                    <span className="text-muted-foreground">Ausentes:</span>
                    <span className="font-medium text-destructive">{ausentesCount}</span>
                    <span className="text-muted-foreground">Personas nuevas:</span>
                    <span className="font-medium text-info">{nuevasPersonas.length}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>

        <Separator />

        {/* Navigation */}
        <div className="flex justify-between pt-2">
          <Button variant="outline" onClick={() => step > 0 ? setStep(step - 1) : onOpenChange(false)} className="gap-1">
            <ChevronLeft className="h-4 w-4" />
            {step === 0 ? "Cancelar" : "Anterior"}
          </Button>

          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep(step + 1)} disabled={!canNext()} className="gap-1">
              Siguiente <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={createReporte.isPending} className="gap-1">
              <Send className="h-4 w-4" />
              {createReporte.isPending ? "Enviando..." : "Enviar Reporte"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

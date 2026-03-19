import { useState, useMemo, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { format, getDay } from "date-fns";
import { es } from "date-fns/locale";
import {
  ChevronRight, ChevronLeft, Users, UserPlus,
  CheckCircle2, XCircle, ClipboardList, DollarSign, Send,
  AlertTriangle, Ban, FileCheck,
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
  aceptaTerminos: boolean;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editReporteId?: string | null;
}

const STEPS = ["Grupo", "Personas Nuevas", "Asistencia", "Finanzas"];

function isThursday(): boolean {
  return getDay(new Date()) === 4; // 0=Sunday, 4=Thursday
}

export default function ReporteGrupoFormDialog({ open, onOpenChange, editReporteId }: Props) {
  const [step, setStep] = useState(0);
  const [grupoId, setGrupoId] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [noRealizado, setNoRealizado] = useState(false);
  const [ofrendaCasaPaz, setOfrendaCasaPaz] = useState("");
  const [totalReportado, setTotalReportado] = useState("");
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [nuevasPersonas, setNuevasPersonas] = useState<NuevaPersona[]>([]);
  const [newForm, setNewForm] = useState<NuevaPersona>({ nombres: "", apellidos: "", telefono: "", aceptaTerminos: false });
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);

  const { data: grupos } = useGrupos();
  const { data: miembros, isLoading: loadingMiembros } = useGrupoMiembrosForReport(grupoId || null);
  const createReporte = useCreateReporteGrupo();

  const selectedGrupo = grupos?.find((g) => g.id === grupoId);
  const thursdayAllowed = isThursday();

  // Also fetch leader from the grupo to include in attendance
  useEffect(() => {
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

  // If grupo has a leader not in miembros list, add them
  useEffect(() => {
    if (selectedGrupo && (selectedGrupo as any).personas && miembros) {
      const leader = (selectedGrupo as any).personas;
      const leaderInList = attendance.some(a => a.persona_id === leader.id);
      if (!leaderInList && leader.id) {
        setAttendance(prev => [{
          persona_id: leader.id,
          nombres: leader.nombres,
          apellidos: leader.apellidos,
          foto_url: leader.foto_url || null,
          tipo_persona: leader.tipo_persona || "Líder",
          presente: true,
          es_nuevo: false,
          motivo_ausencia: "",
        }, ...prev]);
      }
    }
  }, [selectedGrupo, miembros]);

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
    if (!newForm.aceptaTerminos) {
      toast.error("Debe aceptar los términos y condiciones.");
      return;
    }
    setNuevasPersonas((prev) => [...prev, { ...newForm }]);
    setNewForm({ nombres: "", apellidos: "", telefono: "", aceptaTerminos: false });
  };

  const removeNuevaPersona = (index: number) => {
    setNuevasPersonas((prev) => prev.filter((_, i) => i !== index));
  };

  const presentesCount = attendance.filter((a) => a.presente).length;
  const ausentesCount = attendance.filter((a) => !a.presente).length;

  // Validate attendance: all absent members must have motivo
  const attendanceValid = useMemo(() => {
    if (noRealizado) return true;
    const absentWithoutMotivo = attendance.filter(a => !a.presente && !a.motivo_ausencia.trim());
    return absentWithoutMotivo.length === 0;
  }, [attendance, noRealizado]);

  const handleSubmit = async () => {
    if (!grupoId || !mensaje) {
      toast.error("Complete los datos obligatorios.");
      return;
    }

    if (!noRealizado && !attendanceValid) {
      toast.error("Debe indicar el motivo de ausencia para todos los ausentes.");
      return;
    }

    try {
      const newPersonaIds: string[] = [];
      if (!noRealizado) {
        for (const np of nuevasPersonas) {
          const { data: persona, error: pErr } = await supabase
            .from("personas")
            .insert({
              nombres: np.nombres,
              apellidos: np.apellidos,
              telefono: np.telefono || null,
              tipo_persona: "CDP" as any,
              grupo_id: grupoId,
            })
            .select("id")
            .single();
          if (pErr) throw pErr;
          newPersonaIds.push(persona.id);

          await supabase.from("grupo_miembros").insert({
            grupo_id: grupoId,
            persona_id: persona.id,
          } as any);
        }
      }

      const allAttendance = noRealizado ? [] : [
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
        fecha: format(new Date(), "yyyy-MM-dd"),
        mensaje,
        observaciones: observaciones || undefined,
        ofrenda_casa_paz: parseFloat(ofrendaCasaPaz) || 0,
        total_reportado: parseFloat(totalReportado) || 0,
        no_realizado: noRealizado,
        asistencia: allAttendance,
      });

      // Show receipt instead of closing
      setReceiptData({
        grupo: selectedGrupo?.nombre,
        fecha: format(new Date(), "PPP", { locale: es }),
        mensaje,
        noRealizado,
        presentes: presentesCount + newPersonaIds.length,
        ausentes: ausentesCount,
        nuevos: nuevasPersonas.length,
        ofrenda: parseFloat(ofrendaCasaPaz) || 0,
        total: parseFloat(totalReportado) || 0,
      });
      setShowReceipt(true);
      toast.success("Reporte enviado exitosamente.");
    } catch (err: any) {
      toast.error("Error al crear el reporte: " + (err.message || ""));
    }
  };

  const resetForm = () => {
    setStep(0);
    setGrupoId("");
    setMensaje("");
    setObservaciones("");
    setNoRealizado(false);
    setOfrendaCasaPaz("");
    setTotalReportado("");
    setAttendance([]);
    setNuevasPersonas([]);
    setShowReceipt(false);
    setReceiptData(null);
  };

  const canNext = () => {
    if (step === 0) return !!grupoId && !!mensaje;
    if (step === 2 && !noRealizado && !attendanceValid) return false;
    return true;
  };

  // If not Thursday, show restriction message
  if (open && !thursdayAllowed && !editReporteId) {
    return (
      <Dialog open={open} onOpenChange={(o) => { if (!o) resetForm(); onOpenChange(o); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ban className="h-5 w-5 text-destructive" />
              Reporte no disponible
            </DialogTitle>
          </DialogHeader>
          <div className="py-6 text-center space-y-4">
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto" />
            <div>
              <p className="font-semibold text-lg">Solo disponible los jueves</p>
              <p className="text-sm text-muted-foreground mt-2">
                Los reportes de grupo solo pueden realizarse el día <strong>jueves</strong> hasta las <strong>11:59 PM</strong>.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Hoy es {format(new Date(), "EEEE", { locale: es })}. Vuelve el próximo jueves.
              </p>
            </div>
          </div>
          <Button onClick={() => onOpenChange(false)} className="w-full">Entendido</Button>
        </DialogContent>
      </Dialog>
    );
  }

  // Receipt view
  if (showReceipt && receiptData) {
    return (
      <Dialog open={open} onOpenChange={(o) => { if (!o) resetForm(); onOpenChange(o); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-success" />
              Reporte Enviado
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="rounded-xl border-2 border-success/30 bg-success/5 p-5 space-y-4">
              <div className="text-center">
                <CheckCircle2 className="h-10 w-10 text-success mx-auto mb-2" />
                <p className="font-bold text-lg">¡Reporte enviado con éxito!</p>
              </div>
              <Separator />
              {receiptData.noRealizado ? (
                <div className="text-center py-2">
                  <Badge variant="secondary" className="text-sm">Grupo NO se realizó</Badge>
                </div>
              ) : null}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-muted-foreground">Grupo:</span>
                <span className="font-medium">{receiptData.grupo}</span>
                <span className="text-muted-foreground">Fecha:</span>
                <span className="font-medium">{receiptData.fecha}</span>
                <span className="text-muted-foreground">Mensaje:</span>
                <span className="font-medium">{receiptData.mensaje}</span>
                {!receiptData.noRealizado && (
                  <>
                    <span className="text-muted-foreground">Presentes:</span>
                    <span className="font-medium text-success">{receiptData.presentes}</span>
                    <span className="text-muted-foreground">Ausentes:</span>
                    <span className="font-medium text-destructive">{receiptData.ausentes}</span>
                    <span className="text-muted-foreground">Nuevos:</span>
                    <span className="font-medium text-info">{receiptData.nuevos}</span>
                  </>
                )}
                <span className="text-muted-foreground">Ofrenda:</span>
                <span className="font-medium">${receiptData.ofrenda.toFixed(2)}</span>
                <span className="text-muted-foreground">Total:</span>
                <span className="font-bold">${receiptData.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
          <Button onClick={() => { resetForm(); onOpenChange(false); }} className="w-full">Cerrar</Button>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) resetForm(); onOpenChange(o); }}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            {editReporteId ? "Editar Reporte" : "Crear Reporte Semanal"}
          </DialogTitle>
        </DialogHeader>

        {/* Step indicators */}
        <div className="flex items-center gap-1 pb-2">
          {STEPS.map((s, i) => {
            // If noRealizado, skip steps 1 and 2
            if (noRealizado && (i === 1 || i === 2)) {
              return (
                <div key={s} className="flex items-center gap-1 flex-1 opacity-30">
                  <div className="flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold shrink-0 bg-muted text-muted-foreground line-through">
                    {i + 1}
                  </div>
                  <span className="text-xs truncate hidden sm:block text-muted-foreground line-through">{s}</span>
                  {i < STEPS.length - 1 && <div className="h-px flex-1 mx-1 bg-border" />}
                </div>
              );
            }
            return (
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
            );
          })}
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

                {/* No realizado checkbox */}
                <div className="flex items-center gap-3 p-3 rounded-lg border border-amber-300/50 bg-amber-50/50 dark:bg-amber-950/20">
                  <Checkbox
                    id="no-realizado"
                    checked={noRealizado}
                    onCheckedChange={(v) => setNoRealizado(!!v)}
                  />
                  <label htmlFor="no-realizado" className="text-sm font-medium cursor-pointer flex items-center gap-2">
                    <Ban className="h-4 w-4 text-amber-600" />
                    El grupo NO se realizó esta semana
                  </label>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Mensaje / Tema *</label>
                  <Input value={mensaje} onChange={(e) => setMensaje(e.target.value)} placeholder={noRealizado ? "Motivo por el que no se realizó..." : "Tema del mensaje..."} />
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
            {step === 1 && !noRealizado && (
              <>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-info/10 border border-info/20 text-sm">
                  <UserPlus className="h-5 w-5 text-info shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">¿Tienes personas nuevas?</p>
                    <p className="text-muted-foreground text-xs">Agrega personas nuevas que llegaron. Se guardarán automáticamente como <strong>CDP</strong> (Casa de Paz).</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Input placeholder="Nombres *" value={newForm.nombres} onChange={(e) => setNewForm({ ...newForm, nombres: e.target.value })} />
                  <Input placeholder="Apellidos *" value={newForm.apellidos} onChange={(e) => setNewForm({ ...newForm, apellidos: e.target.value })} />
                  <Input placeholder="Teléfono" value={newForm.telefono} onChange={(e) => setNewForm({ ...newForm, telefono: e.target.value })} className="col-span-2" />
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg border">
                  <Checkbox
                    id="terminos-nueva"
                    checked={newForm.aceptaTerminos}
                    onCheckedChange={(v) => setNewForm({ ...newForm, aceptaTerminos: !!v })}
                  />
                  <label htmlFor="terminos-nueva" className="text-xs cursor-pointer">
                    Acepto la política de tratamiento de datos personales conforme a la Ley 1581 de 2012.
                  </label>
                </div>
                <Button variant="outline" className="gap-2 w-full" onClick={addNuevaPersona}>
                  <UserPlus className="h-4 w-4" /> Agregar persona
                </Button>

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
                            <p className="text-xs text-muted-foreground">CDP{np.telefono ? ` · ${np.telefono}` : ""}</p>
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
            {step === 2 && !noRealizado && (
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

                {!attendanceValid && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    Debe indicar el motivo de ausencia para todos los miembros ausentes.
                  </div>
                )}

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
                      const isAbsentNoMotivo = !a.presente && !a.motivo_ausencia.trim();
                      return (
                        <div
                          key={a.persona_id}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                            a.presente ? "bg-success/5 border-success/20" : "bg-destructive/5 border-destructive/20",
                            isAbsentNoMotivo && "ring-2 ring-destructive/50"
                          )}
                        >
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={a.foto_url || undefined} />
                            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium truncate">{a.nombres} {a.apellidos}</p>
                              <Badge variant="outline" className="text-[10px] h-4">{a.tipo_persona}</Badge>
                            </div>
                            {!a.presente && (
                              <Input
                                placeholder="Motivo de ausencia (obligatorio) *"
                                value={a.motivo_ausencia}
                                onChange={(e) => setMotivo(a.persona_id, e.target.value)}
                                className={cn("mt-1 h-7 text-xs", isAbsentNoMotivo && "border-destructive")}
                              />
                            )}
                          </div>
                          <Switch checked={a.presente} onCheckedChange={() => togglePresente(a.persona_id)} />
                        </div>
                      );
                    })}
                  </div>
                )}

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
                          <p className="text-xs text-info">CDP · Nuevo</p>
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
                    <span className="font-medium">{format(new Date(), "PPP", { locale: es })}</span>
                    <span className="text-muted-foreground">Mensaje:</span>
                    <span className="font-medium truncate">{mensaje}</span>
                    {noRealizado ? (
                      <>
                        <span className="text-muted-foreground">Estado:</span>
                        <Badge variant="secondary">No se realizó</Badge>
                      </>
                    ) : (
                      <>
                        <span className="text-muted-foreground">Presentes:</span>
                        <span className="font-medium text-success">{presentesCount + nuevasPersonas.length}</span>
                        <span className="text-muted-foreground">Ausentes:</span>
                        <span className="font-medium text-destructive">{ausentesCount}</span>
                        <span className="text-muted-foreground">Personas nuevas:</span>
                        <span className="font-medium text-info">{nuevasPersonas.length}</span>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>

        <Separator />

        {/* Navigation */}
        <div className="flex justify-between pt-2">
          <Button variant="outline" onClick={() => step > 0 ? setStep(noRealizado && step === 3 ? 0 : step - 1) : onOpenChange(false)} className="gap-1">
            <ChevronLeft className="h-4 w-4" />
            {step === 0 ? "Cancelar" : "Anterior"}
          </Button>

          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep(noRealizado && step === 0 ? 3 : step + 1)} disabled={!canNext()} className="gap-1">
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

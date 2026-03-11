import { useParams, useNavigate } from "react-router-dom";
import { usePersonaDetalle, useProcesos, usePersonaProcesos, useToggleProceso, usePersonaAsistencia, usePersonaGrupoMiembros, useRelacionesFamiliares, useCreateRelacion, useDeleteRelacion } from "@/hooks/usePersonaPerfil";
import { usePersonas } from "@/hooks/useDatabase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatusBadge from "@/components/shared/StatusBadge";
import PersonaFormDialog from "@/components/forms/PersonaFormDialog";
import {
  ArrowLeft, Phone, Mail, MapPin, Calendar, Church, Users, Briefcase,
  Heart, BookOpen, CheckCircle2, XCircle, Clock, User, FileText,
  GraduationCap, Shield, Pencil, UserPlus, Trash2, Baby, HeartHandshake,
} from "lucide-react";
import { format, parseISO, differenceInYears } from "date-fns";
import { es } from "date-fns/locale";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const tipoColor: Record<string, string> = {
  Miembro: "bg-primary text-primary-foreground",
  Visitante: "bg-info text-info-foreground",
  Líder: "bg-accent text-accent-foreground",
  Servidor: "bg-success text-success-foreground",
};

// Group processes by category prefix
function groupProcesses(procesos: any[]) {
  const groups: Record<string, any[]> = {};
  procesos.forEach((p) => {
    // Try to extract category from name pattern like "1. Consolidación" -> just group sequentially
    const match = p.nombre.match(/^(\d+)\.\s*/);
    const category = match ? `Paso ${match[1]}` : "General";
    if (!groups[category]) groups[category] = [];
    groups[category].push(p);
  });
  // If all in one group, return flat
  if (Object.keys(groups).length <= 1) return null;
  return groups;
}

export default function PersonaPerfilPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: persona, isLoading } = usePersonaDetalle(id);
  const { data: procesos } = useProcesos();
  const { data: personaProcesos } = usePersonaProcesos(id);
  const { data: asistencias } = usePersonaAsistencia(id);
  const { data: grupoMiembros } = usePersonaGrupoMiembros(id);
  const toggleProceso = useToggleProceso();
  const [editing, setEditing] = useState(false);

  const procesosMap = useMemo(() =>
    new Map((personaProcesos || []).map((pp) => [pp.proceso_id, pp])),
    [personaProcesos]
  );

  const completedCount = personaProcesos?.filter((pp) => pp.estado === "Realizado").length || 0;
  const totalProcesos = procesos?.length || 0;
  const progressPercent = totalProcesos > 0 ? Math.round((completedCount / totalProcesos) * 100) : 0;

  const asistenciasPresente = asistencias?.filter((a) => a.presente).length || 0;
  const totalAsistencias = asistencias?.length || 0;
  const asistenciaPercent = totalAsistencias > 0 ? Math.round((asistenciasPresente / totalAsistencias) * 100) : 0;

  if (isLoading) {
    return (
      <div className="animate-fade-in space-y-4">
        <Skeleton className="h-52 w-full rounded-xl" />
        <div className="grid md:grid-cols-3 gap-4">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (!persona) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Persona no encontrada</p>
        <Button variant="ghost" onClick={() => navigate("/personas")} className="mt-4">← Volver</Button>
      </div>
    );
  }

  const age = persona.fecha_nacimiento
    ? differenceInYears(new Date(), parseISO(persona.fecha_nacimiento))
    : null;

  const handleToggle = (procesoId: string, current: boolean) => {
    toggleProceso.mutate(
      { personaId: persona.id, procesoId, realizado: !current },
      { onError: () => toast.error("Error al actualizar") }
    );
  };

  return (
    <div className="animate-fade-in space-y-6">
      {editing && <PersonaFormDialog initialData={persona} onClose={() => setEditing(false)} />}

      {/* Banner */}
      <div className="relative rounded-xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/85 to-primary/60" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />

        <div className="relative p-6 md:p-8">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 left-4 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
            onClick={() => navigate("/personas")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 ml-10 md:ml-8">
            <Avatar className="h-24 w-24 md:h-28 md:w-28 border-4 border-primary-foreground/30 shadow-xl ring-4 ring-primary-foreground/10">
              <AvatarImage src={persona.foto_url || undefined} />
              <AvatarFallback className="text-2xl font-bold bg-primary-foreground/20 text-primary-foreground">
                {persona.nombres?.[0]}{persona.apellidos?.[0]}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 text-primary-foreground">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                {persona.nombres} {persona.apellidos}
              </h1>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge className={cn("shadow-sm", tipoColor[persona.tipo_persona] || "bg-muted")}>
                  <Church className="h-3 w-3 mr-1" /> {persona.tipo_persona}
                </Badge>
                <StatusBadge status={persona.estado_iglesia} />
                {age !== null && (
                  <Badge variant="outline" className="border-primary-foreground/30 text-primary-foreground/90 bg-primary-foreground/10">
                    {age} años
                  </Badge>
                )}
                {persona.sexo && (
                  <Badge variant="outline" className="border-primary-foreground/30 text-primary-foreground/90 bg-primary-foreground/10">
                    {persona.sexo}
                  </Badge>
                )}
              </div>

              {/* Quick stats */}
              <div className="flex items-center gap-4 mt-4">
                <div className="text-center px-3 py-1.5 rounded-lg bg-primary-foreground/10">
                  <p className="text-lg font-bold">{progressPercent}%</p>
                  <p className="text-[10px] text-primary-foreground/70 uppercase tracking-wider">Crecimiento</p>
                </div>
                <div className="text-center px-3 py-1.5 rounded-lg bg-primary-foreground/10">
                  <p className="text-lg font-bold">{asistenciaPercent}%</p>
                  <p className="text-[10px] text-primary-foreground/70 uppercase tracking-wider">Asistencia</p>
                </div>
                <div className="text-center px-3 py-1.5 rounded-lg bg-primary-foreground/10">
                  <p className="text-lg font-bold">{grupoMiembros?.length || 0}</p>
                  <p className="text-[10px] text-primary-foreground/70 uppercase tracking-wider">Grupos</p>
                </div>
              </div>
            </div>

            <Button variant="secondary" size="sm" className="gap-1.5 shrink-0" onClick={() => setEditing(true)}>
              <Pencil className="h-3.5 w-3.5" /> Editar
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="info" className="space-y-6">
        <TabsList>
          <TabsTrigger value="info" className="gap-1.5"><User className="h-3.5 w-3.5" /> Información</TabsTrigger>
          <TabsTrigger value="procesos" className="gap-1.5"><Heart className="h-3.5 w-3.5" /> Crecimiento</TabsTrigger>
          <TabsTrigger value="asistencia" className="gap-1.5"><Clock className="h-3.5 w-3.5" /> Asistencia</TabsTrigger>
        </TabsList>

        {/* Info tab */}
        <TabsContent value="info">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Personal */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
                  <User className="h-4 w-4" /> Datos Personales
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5 text-sm">
                <InfoRow label="Fecha nacimiento" value={persona.fecha_nacimiento ? format(parseISO(persona.fecha_nacimiento), "dd MMM yyyy", { locale: es }) : "—"} />
                <InfoRow label="Edad" value={age !== null ? `${age} años` : "—"} />
                <InfoRow label="Sexo" value={persona.sexo || "—"} />
                <InfoRow label="Estado civil" value={persona.estado_civil || "—"} />
                <InfoRow label="Documento" value={persona.documento || "—"} />
                <InfoRow label="Ocupación" value={persona.ocupacion || "—"} />
              </CardContent>
            </Card>

            {/* Contact */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
                  <Phone className="h-4 w-4" /> Contacto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5 text-sm">
                <InfoRow label="Teléfono" value={persona.telefono || "—"} icon={<Phone className="h-3.5 w-3.5" />} />
                <InfoRow label="Email" value={persona.email || "—"} icon={<Mail className="h-3.5 w-3.5" />} />
                <InfoRow label="Dirección" value={persona.direccion || "—"} icon={<MapPin className="h-3.5 w-3.5" />} />
              </CardContent>
            </Card>

            {/* Ministry */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
                  <Church className="h-4 w-4" /> Ministerial
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5 text-sm">
                <InfoRow label="Grupo" value={(persona as any).grupos?.nombre || "Sin grupo"} />
                <InfoRow label="Ministerio" value={persona.ministerio || "—"} />
                <InfoRow label="Líder" value={persona.lider_responsable || "—"} />
                <InfoRow label="Ingreso" value={persona.fecha_ingreso ? format(parseISO(persona.fecha_ingreso), "dd MMM yyyy", { locale: es }) : "—"} />
                <InfoRow label="Conversión" value={persona.fecha_conversion ? format(parseISO(persona.fecha_conversion), "dd MMM yyyy", { locale: es }) : "—"} />
                <InfoRow label="Bautismo" value={persona.fecha_bautismo ? format(parseISO(persona.fecha_bautismo), "dd MMM yyyy", { locale: es }) : "—"} />
              </CardContent>
            </Card>

            {/* Groups */}
            <Card className="md:col-span-2 lg:col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
                  <Users className="h-4 w-4" /> Grupos ({grupoMiembros?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {grupoMiembros && grupoMiembros.length > 0 ? (
                  <div className="space-y-2">
                    {grupoMiembros.map((gm: any) => (
                      <div key={gm.id} className="flex items-center justify-between p-2.5 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Users className="h-4 w-4 text-primary" />
                          </div>
                          <span className="text-sm font-medium">{gm.grupos?.nombre}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">{gm.grupos?.tipo}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No pertenece a ningún grupo</p>
                )}
              </CardContent>
            </Card>

            {/* Observations */}
            {persona.observaciones && (
              <Card className="md:col-span-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
                    <FileText className="h-4 w-4" /> Observaciones
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{persona.observaciones}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Growth processes tab */}
        <TabsContent value="procesos">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Heart className="h-4 w-4 text-primary" /> Procesos de Crecimiento
                </CardTitle>
                <Badge variant="outline" className="gap-1">
                  <GraduationCap className="h-3 w-3" />
                  {completedCount}/{totalProcesos}
                </Badge>
              </div>
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                  <span>Progreso general</span>
                  <span className="font-semibold text-foreground">{progressPercent}%</span>
                </div>
                <Progress value={progressPercent} className="h-2.5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-2">
                {(procesos || []).map((p: any) => {
                  const pp = procesosMap.get(p.id);
                  const done = pp?.estado === "Realizado";
                  return (
                    <div
                      key={p.id}
                      onClick={() => handleToggle(p.id, done)}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm",
                        done
                          ? "bg-success/5 border-success/20 hover:bg-success/10"
                          : "bg-card border-border hover:bg-muted/50"
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                        done ? "bg-success/20" : "bg-muted"
                      )}>
                        {done ? (
                          <CheckCircle2 className="h-4 w-4 text-success" />
                        ) : (
                          <XCircle className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm font-medium truncate", done ? "text-foreground" : "text-muted-foreground")}>
                          {p.nombre}
                        </p>
                        {done && pp?.fecha_completado && (
                          <p className="text-[10px] text-success">
                            Completado: {format(parseISO(pp.fecha_completado), "dd MMM yyyy", { locale: es })}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attendance tab */}
        <TabsContent value="asistencia">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" /> Historial de Asistencia
                </CardTitle>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="gap-1 border-success/30 text-success">
                    <CheckCircle2 className="h-3 w-3" /> {asistenciasPresente}
                  </Badge>
                  <Badge variant="outline" className="gap-1 border-destructive/30 text-destructive">
                    <XCircle className="h-3 w-3" /> {totalAsistencias - asistenciasPresente}
                  </Badge>
                </div>
              </div>
              {totalAsistencias > 0 && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                    <span>Porcentaje de asistencia</span>
                    <span className="font-semibold text-foreground">{asistenciaPercent}%</span>
                  </div>
                  <Progress value={asistenciaPercent} className="h-2" />
                </div>
              )}
            </CardHeader>
            <CardContent>
              {totalAsistencias > 0 ? (
                <div className="space-y-1.5">
                  {(asistencias || []).slice(0, 15).map((a: any) => (
                    <div key={a.id} className={cn(
                      "flex items-center justify-between p-3 rounded-lg border",
                      a.presente ? "bg-success/5 border-success/10" : "bg-destructive/5 border-destructive/10"
                    )}>
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center",
                          a.presente ? "bg-success/20" : "bg-destructive/20"
                        )}>
                          {a.presente ? (
                            <CheckCircle2 className="h-4 w-4 text-success" />
                          ) : (
                            <XCircle className="h-4 w-4 text-destructive" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{a.servicios?.nombre || "Servicio"}</p>
                          <p className="text-xs text-muted-foreground">
                            {a.servicios?.fecha ? format(parseISO(a.servicios.fecha), "dd MMM yyyy", { locale: es }) : ""}
                            {a.servicios?.tipo ? ` · ${a.servicios.tipo}` : ""}
                          </p>
                        </div>
                      </div>
                      <Badge variant={a.presente ? "default" : "destructive"} className={cn("text-xs", a.presente && "bg-success text-success-foreground")}>
                        {a.presente ? "Presente" : "Ausente"}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Sin registros de asistencia</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function InfoRow({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5 border-b border-border/50 last:border-0">
      <span className="text-muted-foreground flex items-center gap-1.5 shrink-0 text-xs uppercase tracking-wider">
        {icon}{label}
      </span>
      <span className="text-foreground text-right font-medium text-sm truncate">{value}</span>
    </div>
  );
}

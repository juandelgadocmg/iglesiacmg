import { useParams, useNavigate } from "react-router-dom";
import { usePersonaDetalle, useProcesos, usePersonaProcesos, useToggleProceso, usePersonaAsistencia, usePersonaGrupoMiembros } from "@/hooks/usePersonaPerfil";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import StatusBadge from "@/components/shared/StatusBadge";
import PersonaFormDialog from "@/components/forms/PersonaFormDialog";
import {
  ArrowLeft, Phone, Mail, MapPin, Calendar, Church, Users, Briefcase,
  Heart, BookOpen, CheckCircle2, XCircle, Clock
} from "lucide-react";
import { format, parseISO, differenceInYears } from "date-fns";
import { es } from "date-fns/locale";
import { useState } from "react";
import { toast } from "sonner";

const tipoColor: Record<string, string> = {
  Miembro: "bg-primary text-primary-foreground",
  Visitante: "bg-info text-info-foreground",
  Líder: "bg-accent text-accent-foreground",
  Servidor: "bg-success text-success-foreground",
};

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

  if (isLoading) {
    return (
      <div className="animate-fade-in space-y-4">
        <Skeleton className="h-48 w-full rounded-xl" />
        <div className="grid md:grid-cols-2 gap-4">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
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

  const procesosMap = new Map(
    (personaProcesos || []).map(pp => [pp.proceso_id, pp])
  );

  const completedCount = personaProcesos?.filter(pp => pp.estado === "Realizado").length || 0;
  const totalProcesos = procesos?.length || 0;

  const handleToggle = (procesoId: string, current: boolean) => {
    toggleProceso.mutate(
      { personaId: persona.id, procesoId, realizado: !current },
      { onError: () => toast.error("Error al actualizar") }
    );
  };

  const asistenciasPresente = asistencias?.filter(a => a.presente).length || 0;
  const totalAsistencias = asistencias?.length || 0;

  return (
    <div className="animate-fade-in space-y-6">
      {editing && <PersonaFormDialog initialData={persona} onClose={() => setEditing(false)} />}

      {/* Header Banner */}
      <div className="relative rounded-xl overflow-hidden bg-gradient-to-r from-primary to-primary/70 p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <Button variant="ghost" size="icon" className="absolute top-4 left-4 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10" onClick={() => navigate("/personas")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <Avatar className="h-24 w-24 md:h-28 md:w-28 border-4 border-primary-foreground/30 shadow-lg ml-10 md:ml-8">
            <AvatarFallback className="text-2xl font-bold bg-primary-foreground/20 text-primary-foreground">
              {persona.nombres?.[0]}{persona.apellidos?.[0]}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 text-primary-foreground">
            <h1 className="text-2xl md:text-3xl font-bold">{persona.nombres} {persona.apellidos}</h1>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <Badge className={tipoColor[persona.tipo_persona] || "bg-muted"}>
                <Church className="h-3 w-3 mr-1" /> {persona.tipo_persona}
              </Badge>
              {age !== null && (
                <span className="text-sm text-primary-foreground/80">
                  <Calendar className="h-3 w-3 inline mr-1" /> {age} Años
                </span>
              )}
              <StatusBadge status={persona.estado_iglesia} />
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>Editar</Button>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Información básica */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" /> Información básica
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <InfoRow label="Fecha de nacimiento" value={persona.fecha_nacimiento ? format(parseISO(persona.fecha_nacimiento), "dd 'de' MMMM yyyy", { locale: es }) : "—"} />
            <InfoRow label="Edad" value={age !== null ? `${age} Años` : "—"} />
            <InfoRow label="Sexo" value={persona.sexo || "—"} />
            <InfoRow label="Estado civil" value={persona.estado_civil || "—"} />
            <InfoRow label="Documento" value={persona.documento || "—"} />
            <InfoRow label="Ocupación" value={persona.ocupacion || "—"} />
          </CardContent>
        </Card>

        {/* Información de contacto */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary" /> Información de contacto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <InfoRow label="Dirección" value={persona.direccion || "—"} icon={<MapPin className="h-3.5 w-3.5 text-muted-foreground" />} />
            <InfoRow label="Teléfono" value={persona.telefono || "—"} icon={<Phone className="h-3.5 w-3.5 text-muted-foreground" />} />
            <InfoRow label="Email" value={persona.email || "—"} icon={<Mail className="h-3.5 w-3.5 text-muted-foreground" />} />
          </CardContent>
        </Card>

        {/* Información ministerial */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Church className="h-4 w-4 text-primary" /> Información ministerial
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <InfoRow label="Grupo" value={(persona as any).grupos?.nombre || "Sin grupo"} />
            <InfoRow label="Ministerio" value={persona.ministerio || "—"} />
            <InfoRow label="Líder responsable" value={persona.lider_responsable || "—"} />
            <InfoRow label="Fecha de ingreso" value={persona.fecha_ingreso ? format(parseISO(persona.fecha_ingreso), "dd MMM yyyy", { locale: es }) : "—"} />
            <InfoRow label="Fecha de conversión" value={persona.fecha_conversion ? format(parseISO(persona.fecha_conversion), "dd MMM yyyy", { locale: es }) : "—"} />
            <InfoRow label="Fecha de bautismo" value={persona.fecha_bautismo ? format(parseISO(persona.fecha_bautismo), "dd MMM yyyy", { locale: es }) : "—"} />
          </CardContent>
        </Card>

        {/* Grupos a los que pertenece */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" /> Grupos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {grupoMiembros && grupoMiembros.length > 0 ? (
              <div className="space-y-2">
                {grupoMiembros.map((gm: any) => (
                  <div key={gm.id} className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium">{gm.grupos?.nombre}</span>
                    <Badge variant="outline" className="text-xs">{gm.grupos?.tipo}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No pertenece a ningún grupo</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Procesos de crecimiento */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Heart className="h-4 w-4 text-primary" /> Procesos de crecimiento de la persona
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              {completedCount}/{totalProcesos} completados
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {(procesos || []).map((p: any) => {
              const pp = procesosMap.get(p.id);
              const done = pp?.estado === "Realizado";
              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                  onClick={() => handleToggle(p.id, done)}
                >
                  <span className={`text-sm ${done ? "text-foreground" : "text-muted-foreground"}`}>
                    {p.nombre}
                  </span>
                  <Badge
                    variant={done ? "default" : "destructive"}
                    className={`text-xs ${done ? "bg-success hover:bg-success/90 text-success-foreground" : ""}`}
                  >
                    {done ? (
                      <><CheckCircle2 className="h-3 w-3 mr-1" /> Realizado</>
                    ) : (
                      <><XCircle className="h-3 w-3 mr-1" /> No realizado</>
                    )}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Asistencia */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" /> Información de asistencia a reuniones
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              {asistenciasPresente}/{totalAsistencias} presentes
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {totalAsistencias > 0 ? (
            <div className="space-y-1">
              {(asistencias || []).slice(0, 10).map((a: any) => (
                <div key={a.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30">
                  <div className="text-sm">
                    <span className="font-medium">{(a as any).servicios?.nombre || "Servicio"}</span>
                    <span className="text-muted-foreground ml-2">
                      {(a as any).servicios?.fecha ? format(parseISO((a as any).servicios.fecha), "dd MMM yyyy", { locale: es }) : ""}
                    </span>
                  </div>
                  <Badge variant={a.presente ? "default" : "destructive"} className={`text-xs ${a.presente ? "bg-success text-success-foreground" : ""}`}>
                    {a.presente ? "Presente" : "Ausente"}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Sin registros de asistencia</p>
          )}
        </CardContent>
      </Card>

      {/* Observaciones */}
      {persona.observaciones && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Observaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{persona.observaciones}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function InfoRow({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-center gap-2 text-muted-foreground shrink-0">
        {icon}
        <span>{label}</span>
      </div>
      <span className="text-foreground text-right font-medium">{value}</span>
    </div>
  );
}

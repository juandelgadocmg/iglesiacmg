import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Phone, Mail, MapPin, CheckCircle2, Circle, Loader2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { useProcesos, usePersonaProcesos } from "@/hooks/usePersonaPerfil";

interface Props {
  persona: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const estadoColors: Record<string, string> = {
  "Realizado": "text-green-600 dark:text-green-400",
  "En Curso": "text-blue-600 dark:text-blue-400",
  "No realizado": "text-muted-foreground",
};

export default function PersonaDetailDialog({ persona, open, onOpenChange }: Props) {
  const { data: procesos, isLoading: loadingProcesos } = useProcesos();
  const { data: personaProcesos, isLoading: loadingPP } = usePersonaProcesos(persona?.id);

  const procesoMap = new Map((personaProcesos || []).map(pp => [pp.proceso_id, pp]));

  const totalProcesos = (procesos || []).length;
  const realizados = (procesos || []).filter(p => {
    const pp = procesoMap.get(p.id);
    return pp?.estado === "Realizado";
  }).length;
  const progressPct = totalProcesos > 0 ? Math.round((realizados / totalProcesos) * 100) : 0;

  if (!persona) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Información del Integrante</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={persona.foto_url || undefined} />
              <AvatarFallback className="text-lg">{persona.nombres?.[0]}{persona.apellidos?.[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-lg font-semibold">{persona.nombres} {persona.apellidos}</p>
              <div className="flex gap-2 mt-1">
                <Badge variant="outline" className="text-xs">{persona.tipo_persona}</Badge>
                <Badge variant="secondary" className="text-xs">{persona.estado_iglesia}</Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Contact & personal info */}
          <div className="grid grid-cols-1 gap-2.5 text-sm">
            {persona.telefono && (
              <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /><span>{persona.telefono}</span></div>
            )}
            {persona.email && (
              <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /><span>{persona.email}</span></div>
            )}
            {persona.direccion && (
              <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /><span>{persona.direccion}</span></div>
            )}
            {persona.sexo && (
              <div><span className="text-muted-foreground">Sexo:</span> {persona.sexo}</div>
            )}
            {persona.estado_civil && (
              <div><span className="text-muted-foreground">Estado civil:</span> {persona.estado_civil}</div>
            )}
            {persona.fecha_nacimiento && (
              <div><span className="text-muted-foreground">Fecha de nacimiento:</span> {format(parseISO(persona.fecha_nacimiento), "d 'de' MMMM 'de' yyyy", { locale: es })}</div>
            )}
            {persona.ocupacion && (
              <div><span className="text-muted-foreground">Ocupación:</span> {persona.ocupacion}</div>
            )}
            {persona.whatsapp && (
              <div><span className="text-muted-foreground">WhatsApp:</span> {persona.whatsapp}</div>
            )}
            {persona.ministerio && (
              <div><span className="text-muted-foreground">Ministerio:</span> {persona.ministerio}</div>
            )}
            {persona.observaciones && (
              <div><span className="text-muted-foreground">Observaciones:</span> {persona.observaciones}</div>
            )}
          </div>

          {/* Growth / Crecimiento */}
          <Separator />
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">Crecimiento Espiritual</h4>
              <span className="text-xs text-muted-foreground">{realizados}/{totalProcesos} completados</span>
            </div>
            <Progress value={progressPct} className="h-2" />

            {(loadingProcesos || loadingPP) ? (
              <div className="flex items-center justify-center py-4 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin mr-2" /> Cargando...
              </div>
            ) : (procesos || []).length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-2">No hay procesos de crecimiento configurados</p>
            ) : (
              <div className="grid grid-cols-1 gap-1.5 max-h-[250px] overflow-y-auto pr-1">
                {(procesos || []).map((proc) => {
                  const pp = procesoMap.get(proc.id);
                  const estado = pp?.estado || "No realizado";
                  const fecha = pp?.fecha_completado;
                  return (
                    <div key={proc.id} className="flex items-center gap-2.5 py-1.5 px-2 rounded-md hover:bg-muted/50 text-sm">
                      {estado === "Realizado" ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
                      ) : (
                        <Circle className={`h-4 w-4 shrink-0 ${estado === "En Curso" ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground/40"}`} />
                      )}
                      <span className={`flex-1 ${estado === "Realizado" ? "line-through text-muted-foreground" : ""}`}>
                        {proc.nombre}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-[10px] h-5 ${estadoColors[estado] || ""}`}
                      >
                        {estado}
                      </Badge>
                      {fecha && (
                        <span className="text-[10px] text-muted-foreground">
                          {format(parseISO(fecha), "dd/MM/yy")}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useGrupos } from "@/hooks/useDatabase";
import { useCreateReporteGrupo } from "@/hooks/useReportesGrupos";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ReporteGrupoFormDialog({ open, onOpenChange }: Props) {
  const [grupoId, setGrupoId] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [fecha, setFecha] = useState<Date>(new Date());
  const [ofrendaCasaPaz, setOfrendaCasaPaz] = useState("");
  const [totalReportado, setTotalReportado] = useState("");

  const { data: grupos } = useGrupos();
  const createReporte = useCreateReporteGrupo();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grupoId || !mensaje) {
      toast.error("Seleccione un grupo e ingrese el tema del mensaje.");
      return;
    }
    try {
      await createReporte.mutateAsync({
        grupo_id: grupoId,
        fecha: format(fecha, "yyyy-MM-dd"),
        mensaje,
        observaciones: observaciones || undefined,
        ofrenda_casa_paz: parseFloat(ofrendaCasaPaz) || 0,
        total_reportado: parseFloat(totalReportado) || 0,
      });
      toast.success("Reporte creado exitosamente.");
      resetForm();
      onOpenChange(false);
    } catch {
      toast.error("Error al crear el reporte.");
    }
  };

  const resetForm = () => {
    setGrupoId("");
    setMensaje("");
    setObservaciones("");
    setFecha(new Date());
    setOfrendaCasaPaz("");
    setTotalReportado("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Crear Reporte de Grupo</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Grupo</label>
            <Select value={grupoId} onValueChange={setGrupoId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar grupo..." />
              </SelectTrigger>
              <SelectContent>
                {grupos?.map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    {g.nombre} — {g.tipo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Mensaje / Tema</label>
            <Input
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              placeholder="Tema del mensaje..."
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Observaciones</label>
            <Textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Observaciones adicionales..."
              rows={3}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Fecha</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !fecha && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {fecha ? format(fecha, "PPP", { locale: es }) : "Seleccionar fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={fecha}
                  onSelect={(d) => d && setFecha(d)}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Ofrenda Casa de Paz</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={ofrendaCasaPaz}
                onChange={(e) => setOfrendaCasaPaz(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Total Reportado</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={totalReportado}
                onChange={(e) => setTotalReportado(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createReporte.isPending}>
              {createReporte.isPending ? "Creando..." : "Crear reporte"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

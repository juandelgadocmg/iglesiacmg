import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus } from "lucide-react";
import { useCreateServicio, useUpdateServicio } from "@/hooks/useDatabase";
import { toast } from "sonner";

interface Props { initialData?: any; onClose?: () => void; }

export default function ServicioFormDialog({ initialData, onClose }: Props) {
  const isEdit = !!initialData;
  const [open, setOpen] = useState(false);
  const [habilitadoReserva, setHabilitadoReserva] = useState(initialData?.habilitado_reserva || false);
  const createServicio = useCreateServicio();
  const updateServicio = useUpdateServicio();

  useEffect(() => { if (initialData) setOpen(true); }, [initialData]);
  const handleClose = () => { setOpen(false); onClose?.(); };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const nombre = (fd.get("nombre") as string)?.trim();
    const fecha = (fd.get("fecha") as string);
    if (!nombre || !fecha) { toast.error("Nombre y fecha son obligatorios"); return; }

    const payload: any = {
      nombre, fecha,
      tipo: (fd.get("tipo") as any),
      hora: (fd.get("hora") as string) || null,
      lugar: (fd.get("lugar") as string) || null,
      predicador: (fd.get("predicador") as string) || null,
      descripcion: (fd.get("descripcion") as string) || null,
      sede: (fd.get("sede") as string) || "Principal",
      dia_reunion: (fd.get("dia_reunion") as string) || null,
      aforo: fd.get("aforo") ? parseInt(fd.get("aforo") as string) : null,
      habilitado_reserva: habilitadoReserva,
    };

    try {
      if (isEdit) {
        await updateServicio.mutateAsync({ id: initialData.id, ...payload });
        toast.success("Reunión actualizada");
      } else {
        await createServicio.mutateAsync(payload);
        toast.success("Reunión creada exitosamente");
      }
      handleClose();
    } catch (err: any) {
      toast.error("Error", { description: err.message });
    }
  };

  const isPending = createServicio.isPending || updateServicio.isPending;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); else setOpen(true); }}>
      {!isEdit && (
        <DialogTrigger asChild>
          <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4" /> Nueva Reunión
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{isEdit ? "Editar Reunión" : "Programar Nueva Reunión"}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre de la reunión *</Label>
            <Input id="nombre" name="nombre" required maxLength={100} defaultValue={initialData?.nombre || ""} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo *</Label>
              <Select name="tipo" defaultValue={initialData?.tipo || "Culto general"}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Culto general","Oración","Reunión de líderes","Escuela bíblica","Vigilia","Servicio especial"].map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fecha">Fecha *</Label>
              <Input id="fecha" name="fecha" type="date" required defaultValue={initialData?.fecha || ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hora">Hora</Label>
              <Input id="hora" name="hora" type="time" defaultValue={initialData?.hora || ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sede">Sede</Label>
              <Select name="sede" defaultValue={initialData?.sede || "Principal"}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Principal">Principal</SelectItem>
                  <SelectItem value="Norte">Norte</SelectItem>
                  <SelectItem value="Sur">Sur</SelectItem>
                  <SelectItem value="Virtual">Virtual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dia_reunion">Día de reunión</Label>
              <Select name="dia_reunion" defaultValue={initialData?.dia_reunion || ""}>
                <SelectTrigger><SelectValue placeholder="Seleccionar día" /></SelectTrigger>
                <SelectContent>
                  {["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"].map(d => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="aforo">Aforo máximo</Label>
              <Input id="aforo" name="aforo" type="number" min={0} defaultValue={initialData?.aforo || ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lugar">Lugar</Label>
              <Input id="lugar" name="lugar" maxLength={255} defaultValue={initialData?.lugar || ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="predicador">Predicador</Label>
              <Input id="predicador" name="predicador" maxLength={100} defaultValue={initialData?.predicador || ""} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={habilitadoReserva} onCheckedChange={setHabilitadoReserva} />
            <Label>Habilitada para reservar</Label>
          </div>
          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea id="descripcion" name="descripcion" maxLength={500} rows={3} defaultValue={initialData?.descripcion || ""} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={handleClose}>Cancelar</Button>
            <Button type="submit" disabled={isPending}>{isPending ? "Guardando..." : isEdit ? "Actualizar" : "Guardar Reunión"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

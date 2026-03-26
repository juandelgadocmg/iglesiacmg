import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { useCreateEvento, useUpdateEvento } from "@/hooks/useDatabase";
import { toast } from "sonner";

interface Props { initialData?: any; onClose?: () => void; }

export default function EventoFormDialog({ initialData, onClose }: Props) {
  const isEdit = !!initialData;
  const [open, setOpen] = useState(false);
  const createEvento = useCreateEvento();
  const updateEvento = useUpdateEvento();

  useEffect(() => { if (initialData) setOpen(true); }, [initialData]);
  const handleClose = () => { setOpen(false); onClose?.(); };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const nombre = (fd.get("nombre") as string)?.trim();
    const fecha_inicio = fd.get("fecha_inicio") as string;
    if (!nombre || !fecha_inicio) { toast.error("Nombre y fecha de inicio son obligatorios"); return; }

    const payload = {
      nombre, fecha_inicio,
      fecha_fin: (fd.get("fecha_fin") as string) || null,
      tipo: (fd.get("tipo") as string) || null,
      lugar: (fd.get("lugar") as string) || null,
      cupos: fd.get("cupos") ? parseInt(fd.get("cupos") as string) : null,
      descripcion: (fd.get("descripcion") as string) || null,
      estado: (fd.get("estado") as string) || "Próximo",
    };

    try {
      if (isEdit) {
        await updateEvento.mutateAsync({ id: initialData.id, ...payload });
        toast.success("Evento actualizado");
      } else {
        await createEvento.mutateAsync(payload);
        toast.success("Evento creado exitosamente");
      }
      handleClose();
    } catch (err: any) {
      toast.error("Error", { description: err.message });
    }
  };

  const isPending = createEvento.isPending || updateEvento.isPending;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); else setOpen(true); }}>
      {!isEdit && (
        <DialogTrigger asChild>
          <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4" /> Nuevo Evento
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{isEdit ? "Editar Evento" : "Crear Nuevo Evento"}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre del evento *</Label>
            <Input id="nombre" name="nombre" required maxLength={100} defaultValue={initialData?.nombre || ""} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo</Label>
              <Select name="tipo" defaultValue={initialData?.tipo || ""}>
                <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Evento Gratuito">Evento Gratuito</SelectItem>
                  <SelectItem value="Evento Cerrado">Evento Cerrado</SelectItem>
                  <SelectItem value="Evento Abierto">Evento Abierto</SelectItem>
                  <SelectItem value="Conferencia">Conferencia</SelectItem>
                  <SelectItem value="Retiro">Retiro</SelectItem>
                  <SelectItem value="Campamento">Campamento</SelectItem>
                  <SelectItem value="Taller">Taller</SelectItem>
                  <SelectItem value="Concierto">Concierto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Select name="estado" defaultValue={initialData?.estado || "Próximo"}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Próximo">Próximo</SelectItem>
                  <SelectItem value="En curso">En curso</SelectItem>
                  <SelectItem value="Finalizado">Finalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cupos">Cupos</Label>
              <Input id="cupos" name="cupos" type="number" min="1" defaultValue={initialData?.cupos || ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fecha_inicio">Fecha inicio *</Label>
              <Input id="fecha_inicio" name="fecha_inicio" type="date" required defaultValue={initialData?.fecha_inicio || ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fecha_fin">Fecha fin</Label>
              <Input id="fecha_fin" name="fecha_fin" type="date" defaultValue={initialData?.fecha_fin || ""} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="lugar">Lugar</Label>
            <Input id="lugar" name="lugar" maxLength={255} defaultValue={initialData?.lugar || ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea id="descripcion" name="descripcion" maxLength={500} rows={3} defaultValue={initialData?.descripcion || ""} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={handleClose}>Cancelar</Button>
            <Button type="submit" disabled={isPending}>{isPending ? "Guardando..." : isEdit ? "Actualizar" : "Guardar Evento"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

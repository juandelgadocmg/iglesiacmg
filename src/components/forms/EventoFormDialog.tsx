import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { useCreateEvento } from "@/hooks/useDatabase";
import { toast } from "sonner";

export default function EventoFormDialog() {
  const [open, setOpen] = useState(false);
  const createEvento = useCreateEvento();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const nombre = (fd.get("nombre") as string)?.trim();
    const fecha_inicio = fd.get("fecha_inicio") as string;
    if (!nombre || !fecha_inicio) { toast.error("Nombre y fecha de inicio son obligatorios"); return; }

    try {
      await createEvento.mutateAsync({
        nombre,
        fecha_inicio,
        fecha_fin: (fd.get("fecha_fin") as string) || null,
        tipo: (fd.get("tipo") as string) || null,
        lugar: (fd.get("lugar") as string) || null,
        cupos: fd.get("cupos") ? parseInt(fd.get("cupos") as string) : null,
        descripcion: (fd.get("descripcion") as string) || null,
      });
      toast.success("Evento creado exitosamente");
      setOpen(false);
    } catch (err: any) {
      toast.error("Error al crear evento", { description: err.message });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Nuevo Evento
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Evento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre del evento *</Label>
            <Input id="nombre" name="nombre" required maxLength={100} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo</Label>
              <Select name="tipo">
                <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Conferencia">Conferencia</SelectItem>
                  <SelectItem value="Retiro">Retiro</SelectItem>
                  <SelectItem value="Campamento">Campamento</SelectItem>
                  <SelectItem value="Taller">Taller</SelectItem>
                  <SelectItem value="Concierto">Concierto</SelectItem>
                  <SelectItem value="Otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cupos">Cupos</Label>
              <Input id="cupos" name="cupos" type="number" min="1" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fecha_inicio">Fecha inicio *</Label>
              <Input id="fecha_inicio" name="fecha_inicio" type="date" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fecha_fin">Fecha fin</Label>
              <Input id="fecha_fin" name="fecha_fin" type="date" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="lugar">Lugar</Label>
            <Input id="lugar" name="lugar" maxLength={255} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea id="descripcion" name="descripcion" maxLength={500} rows={3} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={createEvento.isPending}>
              {createEvento.isPending ? "Guardando..." : "Guardar Evento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

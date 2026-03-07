import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { useCreateServicio } from "@/hooks/useDatabase";
import { toast } from "sonner";

export default function ServicioFormDialog() {
  const [open, setOpen] = useState(false);
  const createServicio = useCreateServicio();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const nombre = (fd.get("nombre") as string)?.trim();
    const fecha = (fd.get("fecha") as string);
    if (!nombre || !fecha) { toast.error("Nombre y fecha son obligatorios"); return; }

    try {
      await createServicio.mutateAsync({
        nombre,
        fecha,
        tipo: (fd.get("tipo") as any),
        hora: (fd.get("hora") as string) || null,
        lugar: (fd.get("lugar") as string) || null,
        predicador: (fd.get("predicador") as string) || null,
        descripcion: (fd.get("descripcion") as string) || null,
      });
      toast.success("Servicio creado exitosamente");
      setOpen(false);
    } catch (err: any) {
      toast.error("Error al crear servicio", { description: err.message });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Nuevo Servicio
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Programar Nuevo Servicio</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre del servicio *</Label>
            <Input id="nombre" name="nombre" required maxLength={100} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo *</Label>
              <Select name="tipo" defaultValue="Culto general">
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
              <Input id="fecha" name="fecha" type="date" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hora">Hora</Label>
              <Input id="hora" name="hora" type="time" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lugar">Lugar</Label>
              <Input id="lugar" name="lugar" maxLength={255} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="predicador">Predicador</Label>
            <Input id="predicador" name="predicador" maxLength={100} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea id="descripcion" name="descripcion" maxLength={500} rows={3} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={createServicio.isPending}>
              {createServicio.isPending ? "Guardando..." : "Guardar Servicio"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

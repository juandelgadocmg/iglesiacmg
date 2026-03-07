import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { useCreateDonacion, usePersonas } from "@/hooks/useDatabase";
import { toast } from "sonner";

export default function DonacionFormDialog() {
  const [open, setOpen] = useState(false);
  const createDonacion = useCreateDonacion();
  const { data: personas } = usePersonas();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const monto = parseFloat(fd.get("monto") as string);
    if (!monto) { toast.error("El monto es obligatorio"); return; }

    try {
      await createDonacion.mutateAsync({
        monto,
        fecha: (fd.get("fecha") as string) || new Date().toISOString().split("T")[0],
        persona_id: (fd.get("persona_id") as string) || null,
        tipo: (fd.get("tipo") as string) || null,
        metodo_pago: (fd.get("metodo_pago") as string) || null,
        descripcion: (fd.get("descripcion") as string) || null,
      });
      toast.success("Donación registrada exitosamente");
      setOpen(false);
    } catch (err: any) {
      toast.error("Error al registrar donación", { description: err.message });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Nueva Donación
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar Donación</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="monto">Monto *</Label>
              <Input id="monto" name="monto" type="number" step="0.01" min="0" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fecha">Fecha *</Label>
              <Input id="fecha" name="fecha" type="date" required defaultValue={new Date().toISOString().split("T")[0]} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="persona_id">Donante</Label>
              <Select name="persona_id">
                <SelectTrigger><SelectValue placeholder="Anónimo" /></SelectTrigger>
                <SelectContent>
                  {(personas || []).map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.nombres} {p.apellidos}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo</Label>
              <Select name="tipo">
                <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Única">Única</SelectItem>
                  <SelectItem value="Diezmo">Diezmo</SelectItem>
                  <SelectItem value="Ofrenda">Ofrenda</SelectItem>
                  <SelectItem value="Especial">Especial</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="metodo_pago">Método de pago</Label>
              <Select name="metodo_pago">
                <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Efectivo">Efectivo</SelectItem>
                  <SelectItem value="Transferencia">Transferencia</SelectItem>
                  <SelectItem value="Tarjeta">Tarjeta</SelectItem>
                  <SelectItem value="Otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea id="descripcion" name="descripcion" maxLength={500} rows={3} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={createDonacion.isPending}>
              {createDonacion.isPending ? "Guardando..." : "Guardar Donación"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

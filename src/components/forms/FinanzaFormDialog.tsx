import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { useCreateFinanza } from "@/hooks/useDatabase";
import { toast } from "sonner";

export default function FinanzaFormDialog() {
  const [open, setOpen] = useState(false);
  const createFinanza = useCreateFinanza();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const monto = parseFloat(fd.get("monto") as string);
    const fecha = fd.get("fecha") as string;
    const tipo = fd.get("tipo") as any;
    if (!monto || !fecha || !tipo) { toast.error("Tipo, monto y fecha son obligatorios"); return; }

    try {
      await createFinanza.mutateAsync({
        tipo,
        monto,
        fecha,
        categoria_nombre: (fd.get("categoria_nombre") as string) || null,
        descripcion: (fd.get("descripcion") as string) || null,
        metodo_pago: (fd.get("metodo_pago") as string) || null,
      });
      toast.success("Registro financiero creado exitosamente");
      setOpen(false);
    } catch (err: any) {
      toast.error("Error al crear registro", { description: err.message });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Nuevo Registro
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nuevo Registro Financiero</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo *</Label>
              <Select name="tipo" defaultValue="Ingreso">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ingreso">Ingreso</SelectItem>
                  <SelectItem value="Gasto">Gasto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="monto">Monto *</Label>
              <Input id="monto" name="monto" type="number" step="0.01" min="0" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fecha">Fecha *</Label>
              <Input id="fecha" name="fecha" type="date" required defaultValue={new Date().toISOString().split("T")[0]} />
            </div>
            <div className="space-y-2">
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
            <Label htmlFor="categoria_nombre">Categoría</Label>
            <Input id="categoria_nombre" name="categoria_nombre" maxLength={100} placeholder="Ej: Diezmos, Ofrendas, Arriendo..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea id="descripcion" name="descripcion" maxLength={500} rows={3} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={createFinanza.isPending}>
              {createFinanza.isPending ? "Guardando..." : "Guardar Registro"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

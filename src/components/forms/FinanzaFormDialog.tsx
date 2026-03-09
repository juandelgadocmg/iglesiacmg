import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { useCreateFinanza, useUpdateFinanza } from "@/hooks/useDatabase";
import { toast } from "sonner";

interface Props { initialData?: any; onClose?: () => void; }

export default function FinanzaFormDialog({ initialData, onClose }: Props) {
  const isEdit = !!initialData;
  const [open, setOpen] = useState(false);
  const createFinanza = useCreateFinanza();
  const updateFinanza = useUpdateFinanza();

  useEffect(() => { if (initialData) setOpen(true); }, [initialData]);
  const handleClose = () => { setOpen(false); onClose?.(); };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const monto = parseFloat(fd.get("monto") as string);
    const fecha = fd.get("fecha") as string;
    const tipo = fd.get("tipo") as any;
    if (!monto || !fecha || !tipo) { toast.error("Tipo, monto y fecha son obligatorios"); return; }

    const payload = {
      tipo, monto, fecha,
      categoria_nombre: (fd.get("categoria_nombre") as string) || null,
      descripcion: (fd.get("descripcion") as string) || null,
      metodo_pago: (fd.get("metodo_pago") as string) || null,
    };

    try {
      if (isEdit) {
        await updateFinanza.mutateAsync({ id: initialData.id, ...payload });
        toast.success("Registro actualizado");
      } else {
        await createFinanza.mutateAsync(payload);
        toast.success("Registro financiero creado exitosamente");
      }
      handleClose();
    } catch (err: any) {
      toast.error("Error", { description: err.message });
    }
  };

  const isPending = createFinanza.isPending || updateFinanza.isPending;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); else setOpen(true); }}>
      {!isEdit && (
        <DialogTrigger asChild>
          <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4" /> Nuevo Registro
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{isEdit ? "Editar Registro" : "Nuevo Registro Financiero"}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo *</Label>
              <Select name="tipo" defaultValue={initialData?.tipo || "Ingreso"}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ingreso">Ingreso</SelectItem>
                  <SelectItem value="Gasto">Gasto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="monto">Monto *</Label>
              <Input id="monto" name="monto" type="number" step="0.01" min="0" required defaultValue={initialData?.monto || ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fecha">Fecha *</Label>
              <Input id="fecha" name="fecha" type="date" required defaultValue={initialData?.fecha || new Date().toISOString().split("T")[0]} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="metodo_pago">Método de pago</Label>
              <Select name="metodo_pago" defaultValue={initialData?.metodo_pago || ""}>
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
            <Input id="categoria_nombre" name="categoria_nombre" maxLength={100} placeholder="Ej: Diezmos, Ofrendas, Arriendo..." defaultValue={initialData?.categoria_nombre || ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea id="descripcion" name="descripcion" maxLength={500} rows={3} defaultValue={initialData?.descripcion || ""} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={handleClose}>Cancelar</Button>
            <Button type="submit" disabled={isPending}>{isPending ? "Guardando..." : isEdit ? "Actualizar" : "Guardar Registro"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

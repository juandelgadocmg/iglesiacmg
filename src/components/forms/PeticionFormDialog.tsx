import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil } from "lucide-react";
import { usePersonas } from "@/hooks/useDatabase";
import { useCreatePeticion, useUpdatePeticion } from "@/hooks/usePeticiones";
import { toast } from "sonner";

interface Props {
  initialData?: any;
  onClose?: () => void;
}

export default function PeticionFormDialog({ initialData, onClose }: Props) {
  const [open, setOpen] = useState(!!initialData);
  const { data: personas } = usePersonas();
  const createPeticion = useCreatePeticion();
  const updatePeticion = useUpdatePeticion();
  const isEdit = !!initialData;

  const handleClose = () => {
    setOpen(false);
    onClose?.();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      titulo: fd.get("titulo") as string,
      descripcion: (fd.get("descripcion") as string) || null,
      persona_id: (fd.get("persona_id") as string) || null,
      estado: (fd.get("estado") as string) || "Pendiente",
      prioridad: (fd.get("prioridad") as string) || "Normal",
      fecha_seguimiento: (fd.get("fecha_seguimiento") as string) || null,
      notas_seguimiento: (fd.get("notas_seguimiento") as string) || null,
    };
    if (!payload.titulo) { toast.error("El título es obligatorio"); return; }

    try {
      if (isEdit) {
        await updatePeticion.mutateAsync({ id: initialData.id, ...payload });
        toast.success("Petición actualizada");
      } else {
        await createPeticion.mutateAsync(payload);
        toast.success("Petición creada");
      }
      handleClose();
    } catch (err: any) {
      toast.error(err.message || "Error");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); else setOpen(true); }}>
      {!isEdit && (
        <DialogTrigger asChild>
          <Button className="gap-2"><Plus className="h-4 w-4" /> Nueva Petición</Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Petición" : "Nueva Petición de Oración"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="titulo">Título *</Label>
            <Input id="titulo" name="titulo" required defaultValue={initialData?.titulo} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea id="descripcion" name="descripcion" rows={3} defaultValue={initialData?.descripcion} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Persona</Label>
              <Select name="persona_id" defaultValue={initialData?.persona_id || ""}>
                <SelectTrigger><SelectValue placeholder="Sin asignar" /></SelectTrigger>
                <SelectContent>
                  {(personas || []).map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.nombres} {p.apellidos}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Prioridad</Label>
              <Select name="prioridad" defaultValue={initialData?.prioridad || "Normal"}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Baja">Baja</SelectItem>
                  <SelectItem value="Normal">Normal</SelectItem>
                  <SelectItem value="Alta">Alta</SelectItem>
                  <SelectItem value="Urgente">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select name="estado" defaultValue={initialData?.estado || "Pendiente"}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pendiente">Pendiente</SelectItem>
                  <SelectItem value="En oración">En oración</SelectItem>
                  <SelectItem value="Respondida">Respondida</SelectItem>
                  <SelectItem value="Archivada">Archivada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fecha_seguimiento">Fecha seguimiento</Label>
              <Input id="fecha_seguimiento" name="fecha_seguimiento" type="date" defaultValue={initialData?.fecha_seguimiento} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notas_seguimiento">Notas de seguimiento</Label>
            <Textarea id="notas_seguimiento" name="notas_seguimiento" rows={2} defaultValue={initialData?.notas_seguimiento} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={handleClose}>Cancelar</Button>
            <Button type="submit" disabled={createPeticion.isPending || updatePeticion.isPending}>
              {(createPeticion.isPending || updatePeticion.isPending) ? "Guardando..." : isEdit ? "Actualizar" : "Crear Petición"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

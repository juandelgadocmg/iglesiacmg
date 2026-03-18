import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { useCreateGrupo, useUpdateGrupo, usePersonas } from "@/hooks/useDatabase";
import { toast } from "sonner";

interface Props { initialData?: any; onClose?: () => void; }

export default function GrupoFormDialog({ initialData, onClose }: Props) {
  const isEdit = !!initialData;
  const [open, setOpen] = useState(false);
  const createGrupo = useCreateGrupo();
  const updateGrupo = useUpdateGrupo();
  const { data: personas } = usePersonas();

  useEffect(() => { if (initialData) setOpen(true); }, [initialData]);
  const handleClose = () => { setOpen(false); onClose?.(); };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const nombre = (fd.get("nombre") as string)?.trim();
    if (!nombre) { toast.error("El nombre es obligatorio"); return; }

    const payload = {
      nombre,
      tipo: (fd.get("tipo") as any),
      descripcion: (fd.get("descripcion") as string) || null,
      lider_id: (fd.get("lider_id") as string) || null,
      dia_reunion: (fd.get("dia_reunion") as string) || null,
      hora_reunion: (fd.get("hora_reunion") as string) || null,
      ubicacion: (fd.get("ubicacion") as string) || null,
    };

    try {
      if (isEdit) {
        await updateGrupo.mutateAsync({ id: initialData.id, ...payload });
        toast.success("Grupo actualizado");
      } else {
        await createGrupo.mutateAsync(payload);
        toast.success("Grupo creado exitosamente");
      }
      handleClose();
    } catch (err: any) {
      toast.error("Error", { description: err.message });
    }
  };

  const isPending = createGrupo.isPending || updateGrupo.isPending;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); else setOpen(true); }}>
      {!isEdit && (
        <DialogTrigger asChild>
          <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4" /> Nuevo Grupo
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{isEdit ? "Editar Grupo" : "Crear Nuevo Grupo"}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre del grupo *</Label>
            <Input id="nombre" name="nombre" required maxLength={100} defaultValue={initialData?.nombre || ""} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo *</Label>
              <Select name="tipo" defaultValue={initialData?.tipo || "Casas de paz"}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Casas de paz","Grupos encuentro","Células","Jóvenes","Mujeres","Hombres","Niños","Alabanza","Ujieres","Liderazgo","Discipulado"].map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lider_id">Líder</Label>
              <Select name="lider_id" defaultValue={initialData?.lider_id || ""}>
                <SelectTrigger><SelectValue placeholder="Seleccionar líder" /></SelectTrigger>
                <SelectContent>
                  {(personas || []).map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.nombres} {p.apellidos}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dia_reunion">Día de reunión</Label>
              <Select name="dia_reunion" defaultValue={initialData?.dia_reunion || ""}>
                <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                <SelectContent>
                  {["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"].map(d => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="hora_reunion">Hora</Label>
              <Input id="hora_reunion" name="hora_reunion" type="time" defaultValue={initialData?.hora_reunion || ""} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ubicacion">Ubicación</Label>
              <Input id="ubicacion" name="ubicacion" maxLength={255} defaultValue={initialData?.ubicacion || ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="red">Red</Label>
              <Input id="red" name="red" maxLength={100} placeholder="Ej: Red Norte, Red Sur..." defaultValue={initialData?.red || ""} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea id="descripcion" name="descripcion" maxLength={500} rows={3} defaultValue={initialData?.descripcion || ""} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={handleClose}>Cancelar</Button>
            <Button type="submit" disabled={isPending}>{isPending ? "Guardando..." : isEdit ? "Actualizar" : "Guardar Grupo"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

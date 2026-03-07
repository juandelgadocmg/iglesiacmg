import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { useCreateGrupo, usePersonas } from "@/hooks/useDatabase";
import { toast } from "sonner";

export default function GrupoFormDialog() {
  const [open, setOpen] = useState(false);
  const createGrupo = useCreateGrupo();
  const { data: personas } = usePersonas();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const nombre = (fd.get("nombre") as string)?.trim();
    if (!nombre) { toast.error("El nombre es obligatorio"); return; }

    try {
      await createGrupo.mutateAsync({
        nombre,
        tipo: (fd.get("tipo") as any),
        descripcion: (fd.get("descripcion") as string) || null,
        lider_id: (fd.get("lider_id") as string) || null,
        dia_reunion: (fd.get("dia_reunion") as string) || null,
        hora_reunion: (fd.get("hora_reunion") as string) || null,
        ubicacion: (fd.get("ubicacion") as string) || null,
      });
      toast.success("Grupo creado exitosamente");
      setOpen(false);
    } catch (err: any) {
      toast.error("Error al crear grupo", { description: err.message });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Nuevo Grupo
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Grupo</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre del grupo *</Label>
            <Input id="nombre" name="nombre" required maxLength={100} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo *</Label>
              <Select name="tipo" defaultValue="Células">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Células","Jóvenes","Mujeres","Hombres","Niños","Alabanza","Ujieres","Liderazgo","Discipulado"].map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lider_id">Líder</Label>
              <Select name="lider_id">
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
              <Select name="dia_reunion">
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
              <Input id="hora_reunion" name="hora_reunion" type="time" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ubicacion">Ubicación</Label>
            <Input id="ubicacion" name="ubicacion" maxLength={255} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea id="descripcion" name="descripcion" maxLength={500} rows={3} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={createGrupo.isPending}>
              {createGrupo.isPending ? "Guardando..." : "Guardar Grupo"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

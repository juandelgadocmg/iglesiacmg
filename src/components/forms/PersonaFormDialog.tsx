import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { useCreatePersona } from "@/hooks/useDatabase";
import { useGrupos } from "@/hooks/useDatabase";
import { toast } from "sonner";

export default function PersonaFormDialog() {
  const [open, setOpen] = useState(false);
  const createPersona = useCreatePersona();
  const { data: grupos } = useGrupos();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const nombres = (fd.get("nombres") as string)?.trim();
    const apellidos = (fd.get("apellidos") as string)?.trim();
    if (!nombres || !apellidos) { toast.error("Nombres y apellidos son obligatorios"); return; }

    try {
      await createPersona.mutateAsync({
        nombres,
        apellidos,
        telefono: (fd.get("telefono") as string) || null,
        email: (fd.get("email") as string) || null,
        direccion: (fd.get("direccion") as string) || null,
        sexo: (fd.get("sexo") as string) || null,
        fecha_nacimiento: (fd.get("fecha_nacimiento") as string) || null,
        tipo_persona: (fd.get("tipo_persona") as any) || "Miembro",
        estado_iglesia: (fd.get("estado_iglesia") as any) || "Activo",
        grupo_id: (fd.get("grupo_id") as string) || null,
        estado_civil: (fd.get("estado_civil") as string) || null,
        ocupacion: (fd.get("ocupacion") as string) || null,
        observaciones: (fd.get("observaciones") as string) || null,
      });
      toast.success("Persona creada exitosamente");
      setOpen(false);
    } catch (err: any) {
      toast.error("Error al crear persona", { description: err.message });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Nueva Persona
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar Nueva Persona</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombres">Nombres *</Label>
              <Input id="nombres" name="nombres" required maxLength={100} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apellidos">Apellidos *</Label>
              <Input id="apellidos" name="apellidos" required maxLength={100} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input id="telefono" name="telefono" maxLength={20} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" maxLength={255} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sexo">Sexo</Label>
              <Select name="sexo">
                <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Masculino">Masculino</SelectItem>
                  <SelectItem value="Femenino">Femenino</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fecha_nacimiento">Fecha de nacimiento</Label>
              <Input id="fecha_nacimiento" name="fecha_nacimiento" type="date" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tipo_persona">Tipo de persona</Label>
              <Select name="tipo_persona" defaultValue="Miembro">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Miembro">Miembro</SelectItem>
                  <SelectItem value="Visitante">Visitante</SelectItem>
                  <SelectItem value="Líder">Líder</SelectItem>
                  <SelectItem value="Servidor">Servidor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="estado_iglesia">Estado</Label>
              <Select name="estado_iglesia" defaultValue="Activo">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Activo">Activo</SelectItem>
                  <SelectItem value="Inactivo">Inactivo</SelectItem>
                  <SelectItem value="En proceso">En proceso</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="estado_civil">Estado civil</Label>
              <Select name="estado_civil">
                <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Soltero/a">Soltero/a</SelectItem>
                  <SelectItem value="Casado/a">Casado/a</SelectItem>
                  <SelectItem value="Viudo/a">Viudo/a</SelectItem>
                  <SelectItem value="Divorciado/a">Divorciado/a</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="grupo_id">Grupo</Label>
              <Select name="grupo_id">
                <SelectTrigger><SelectValue placeholder="Sin grupo" /></SelectTrigger>
                <SelectContent>
                  {(grupos || []).map(g => (
                    <SelectItem key={g.id} value={g.id}>{g.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ocupacion">Ocupación</Label>
              <Input id="ocupacion" name="ocupacion" maxLength={100} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="direccion">Dirección</Label>
              <Input id="direccion" name="direccion" maxLength={255} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="observaciones">Observaciones</Label>
            <Textarea id="observaciones" name="observaciones" maxLength={500} rows={3} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={createPersona.isPending}>
              {createPersona.isPending ? "Guardando..." : "Guardar Persona"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

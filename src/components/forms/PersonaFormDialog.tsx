import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { useCreatePersona, useUpdatePersona, useGrupos, usePersonas } from "@/hooks/useDatabase";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  initialData?: any;
  onClose?: () => void;
}

const TIPOS_PETICION = ["Financiera", "Familiar", "Sanidad", "Emocional", "Otros"];

export default function PersonaFormDialog({ initialData, onClose }: Props) {
  const isEdit = !!initialData;
  const [open, setOpen] = useState(false);
  const createPersona = useCreatePersona();
  const updatePersona = useUpdatePersona();
  const { data: grupos } = useGrupos();
  const { data: personas } = usePersonas();

  // Petición state
  const [tipoPeticion, setTipoPeticion] = useState("");
  const [descripcionPeticion, setDescripcionPeticion] = useState("");

  useEffect(() => {
    if (initialData) setOpen(true);
  }, [initialData]);

  const handleClose = () => {
    setOpen(false);
    setTipoPeticion("");
    setDescripcionPeticion("");
    onClose?.();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const nombres = (fd.get("nombres") as string)?.trim();
    const apellidos = (fd.get("apellidos") as string)?.trim();
    if (!nombres || !apellidos) { toast.error("Nombres y apellidos son obligatorios"); return; }

    const sexoVal = fd.get("sexo") as string;

    const payload: any = {
      nombres,
      apellidos,
      telefono: (fd.get("telefono") as string) || null,
      email: (fd.get("email") as string) || null,
      direccion: (fd.get("direccion") as string) || null,
      sexo: sexoVal && sexoVal !== "none" ? sexoVal : null,
      fecha_nacimiento: (fd.get("fecha_nacimiento") as string) || null,
      tipo_persona: (fd.get("tipo_persona") as any) || "Miembro",
      estado_iglesia: (fd.get("estado_iglesia") as any) || "Activo",
      grupo_id: (fd.get("grupo_id") as string) || null,
      estado_civil: (fd.get("estado_civil") as string) || null,
      ocupacion: (fd.get("ocupacion") as string) || null,
      observaciones: (fd.get("observaciones") as string) || null,
      invitado_por: (fd.get("invitado_por") as string) || null,
      seguimiento_por: (fd.get("seguimiento_por") as string) || null,
    };

    // Clean empty selects
    if (payload.estado_civil === "none") payload.estado_civil = null;
    if (payload.grupo_id === "none") payload.grupo_id = null;

    try {
      let personaId: string | undefined;
      if (isEdit) {
        await updatePersona.mutateAsync({ id: initialData.id, ...payload });
        personaId = initialData.id;
        toast.success("Persona actualizada");
      } else {
        const result = await createPersona.mutateAsync(payload);
        personaId = (result as any)?.id;
        toast.success("Persona creada exitosamente");
      }

      // Create prayer request if provided
      if (tipoPeticion && personaId) {
        const { error } = await supabase.from("peticiones_oracion").insert({
          persona_id: personaId,
          titulo: `${tipoPeticion} - ${nombres} ${apellidos}`,
          descripcion: descripcionPeticion || null,
          tipo: tipoPeticion,
          estado: "Pendiente",
          prioridad: "Normal",
        } as any);
        if (error) console.error("Error creating petition:", error);
      }

      handleClose();
    } catch (err: any) {
      toast.error(isEdit ? "Error al actualizar" : "Error al crear persona", { description: err.message });
    }
  };

  const isPending = createPersona.isPending || updatePersona.isPending;

  // Filter personas for "invitado por" and "seguimiento" selectors
  const personasList = (personas || []).map((p: any) => ({
    id: p.id,
    label: `${p.nombres} ${p.apellidos}`,
  }));

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); else setOpen(true); }}>
      {!isEdit && (
        <DialogTrigger asChild>
          <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4" /> Nueva Persona
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Persona" : "Registrar Nueva Persona"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* === DATOS PERSONALES === */}
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Datos personales</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombres">Nombres *</Label>
              <Input id="nombres" name="nombres" required maxLength={100} defaultValue={initialData?.nombres || ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apellidos">Apellidos *</Label>
              <Input id="apellidos" name="apellidos" required maxLength={100} defaultValue={initialData?.apellidos || ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input id="telefono" name="telefono" maxLength={20} defaultValue={initialData?.telefono || ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" maxLength={255} defaultValue={initialData?.email || ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sexo">Sexo</Label>
              <Select name="sexo" defaultValue={initialData?.sexo || "none"}>
                <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin especificar</SelectItem>
                  <SelectItem value="Masculino">Masculino</SelectItem>
                  <SelectItem value="Femenino">Femenino</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fecha_nacimiento">Fecha de nacimiento</Label>
              <Input id="fecha_nacimiento" name="fecha_nacimiento" type="date" defaultValue={initialData?.fecha_nacimiento || ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tipo_persona">Tipo de persona</Label>
              <Select name="tipo_persona" defaultValue={initialData?.tipo_persona || "Miembro"}>
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
              <Select name="estado_iglesia" defaultValue={initialData?.estado_iglesia || "Activo"}>
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
              <Select name="estado_civil" defaultValue={initialData?.estado_civil || "none"}>
                <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin especificar</SelectItem>
                  <SelectItem value="Soltero/a">Soltero/a</SelectItem>
                  <SelectItem value="Casado/a">Casado/a</SelectItem>
                  <SelectItem value="Viudo/a">Viudo/a</SelectItem>
                  <SelectItem value="Divorciado/a">Divorciado/a</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="grupo_id">Grupo</Label>
              <Select name="grupo_id" defaultValue={initialData?.grupo_id || "none"}>
                <SelectTrigger><SelectValue placeholder="Sin grupo" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin grupo</SelectItem>
                  {(grupos || []).map(g => (
                    <SelectItem key={g.id} value={g.id}>{g.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ocupacion">Ocupación</Label>
              <Input id="ocupacion" name="ocupacion" maxLength={100} defaultValue={initialData?.ocupacion || ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="direccion">Dirección</Label>
              <Input id="direccion" name="direccion" maxLength={255} defaultValue={initialData?.direccion || ""} />
            </div>
          </div>

          {/* === SEGUIMIENTO PASTORAL === */}
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide pt-2">Seguimiento pastoral</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="invitado_por">¿Quién lo invitó a la iglesia?</Label>
              <Input id="invitado_por" name="invitado_por" maxLength={200} placeholder="Nombre de quien lo invitó" defaultValue={initialData?.invitado_por || ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seguimiento_por">Persona encargada del seguimiento</Label>
              <Input id="seguimiento_por" name="seguimiento_por" maxLength={200} placeholder="Nombre del encargado" defaultValue={initialData?.seguimiento_por || ""} />
            </div>
          </div>

          {/* === PETICIÓN DE ORACIÓN === */}
          {!isEdit && (
            <>
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide pt-2">Petición de oración (opcional)</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo de petición</Label>
                  <Select value={tipoPeticion} onValueChange={setTipoPeticion}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar tipo" /></SelectTrigger>
                    <SelectContent>
                      {TIPOS_PETICION.map(t => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Descripción de la petición</Label>
                  <Textarea value={descripcionPeticion} onChange={e => setDescripcionPeticion(e.target.value)} maxLength={500} rows={2} placeholder="Describa brevemente la petición..." />
                </div>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="observaciones">Observaciones</Label>
            <Textarea id="observaciones" name="observaciones" maxLength={500} rows={3} defaultValue={initialData?.observaciones || ""} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={handleClose}>Cancelar</Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Guardando..." : isEdit ? "Actualizar" : "Guardar Persona"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

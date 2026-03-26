import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useCreateMateria, useAulas } from "@/hooks/useAcademia";
import { usePersonas } from "@/hooks/useDatabase";
import { toast } from "sonner";

const schema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  codigo: z.string().optional(),
  descripcion: z.string().optional(),
  horario: z.string().optional(),
  maestro_id: z.string().optional(),
  aula_id: z.string().optional(),
  cupos: z.string().optional(),
  hab_calificaciones: z.boolean(),
  hab_asistencia: z.boolean(),
  hab_auto_matricula: z.boolean(),
  asistencias_minimas: z.string().optional(),
  alerta_inasistencias: z.boolean(),
  cantidad_inasistencias_alerta: z.string().optional(),
});

export default function MateriaFormDialog({ periodoId }: { periodoId: string }) {
  const [open, setOpen] = useState(false);
  const createMateria = useCreateMateria();
  const { data: personas } = usePersonas();
  const { data: aulas } = useAulas();

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      nombre: "", codigo: "", descripcion: "", horario: "",
      maestro_id: "", aula_id: "", cupos: "",
      hab_calificaciones: true, hab_asistencia: true, hab_auto_matricula: false,
      asistencias_minimas: "0", alerta_inasistencias: false, cantidad_inasistencias_alerta: "0",
    },
  });

  const onSubmit = async (values: z.infer<typeof schema>) => {
    try {
      const maestro = personas?.find(p => p.id === values.maestro_id);
      const aula = aulas?.find(a => a.id === values.aula_id);
      await createMateria.mutateAsync({
        periodo_id: periodoId,
        nombre: values.nombre,
        codigo: values.codigo || undefined,
        descripcion: values.descripcion || undefined,
        horario: values.horario || undefined,
        maestro_id: values.maestro_id || undefined,
        maestro_nombre: maestro ? `${maestro.nombres} ${maestro.apellidos}` : undefined,
        aula_id: values.aula_id || undefined,
        aula: aula?.nombre || undefined,
        cupos: values.cupos ? parseInt(values.cupos) : undefined,
        hab_calificaciones: values.hab_calificaciones,
        hab_asistencia: values.hab_asistencia,
        hab_auto_matricula: values.hab_auto_matricula,
        asistencias_minimas: parseInt(values.asistencias_minimas || "0"),
        alerta_inasistencias: values.alerta_inasistencias,
        cantidad_inasistencias_alerta: parseInt(values.cantidad_inasistencias_alerta || "0"),
      });
      toast.success("Materia creada");
      form.reset();
      setOpen(false);
    } catch {
      toast.error("Error al crear la materia");
    }
  };

  const maestros = (personas || []).filter((p: any) =>
    p.tipo_persona === "Maestro Seminario" || p.tipo_persona === "Maestro"
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline"><Plus className="h-4 w-4 mr-1" /> Nueva materia</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Nueva Materia</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="nombre" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre *</FormLabel>
                  <FormControl><Input placeholder="Ej: Evangelismo Sobrenatural" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="codigo" render={({ field }) => (
                <FormItem>
                  <FormLabel>Código</FormLabel>
                  <FormControl><Input placeholder="Ej: MAT-01" {...field} /></FormControl>
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="descripcion" render={({ field }) => (
              <FormItem>
                <FormLabel>Descripción</FormLabel>
                <FormControl><Textarea placeholder="Descripción de la materia..." {...field} rows={2} /></FormControl>
              </FormItem>
            )} />

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="maestro_id" render={({ field }) => (
                <FormItem>
                  <FormLabel>Maestro</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Seleccionar maestro" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {maestros.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.nombres} {p.apellidos}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )} />
              <FormField control={form.control} name="aula_id" render={({ field }) => (
                <FormItem>
                  <FormLabel>Aula</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Seleccionar aula" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {(aulas || []).filter(a => a.activo).map(a => (
                        <SelectItem key={a.id} value={a.id}>{a.nombre} {a.sede ? `(${a.sede})` : ""}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="horario" render={({ field }) => (
                <FormItem>
                  <FormLabel>Horario</FormLabel>
                  <FormControl><Input placeholder="Ej: 7:00 pm a 9:00 pm" {...field} /></FormControl>
                </FormItem>
              )} />
              <FormField control={form.control} name="cupos" render={({ field }) => (
                <FormItem>
                  <FormLabel>Cupos</FormLabel>
                  <FormControl><Input type="number" min={0} placeholder="Sin límite" {...field} /></FormControl>
                </FormItem>
              )} />
            </div>

            {/* Habilitaciones */}
            <div className="rounded-lg border p-4 space-y-3">
              <p className="text-sm font-semibold text-foreground">Habilitaciones</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <FormField control={form.control} name="hab_calificaciones" render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <FormLabel className="text-xs">Calificaciones</FormLabel>
                      <FormDescription className="text-[10px]">Habilitar notas</FormDescription>
                    </div>
                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="hab_asistencia" render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <FormLabel className="text-xs">Asistencia</FormLabel>
                      <FormDescription className="text-[10px]">Controlar asistencia</FormDescription>
                    </div>
                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="hab_auto_matricula" render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <FormLabel className="text-xs">Auto matrícula</FormLabel>
                      <FormDescription className="text-[10px]">Permitir auto inscripción</FormDescription>
                    </div>
                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                  </FormItem>
                )} />
              </div>
            </div>

            {/* Asistencia config */}
            <div className="rounded-lg border p-4 space-y-3">
              <p className="text-sm font-semibold text-foreground">Control de asistencia</p>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="asistencias_minimas" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Asistencias mínimas</FormLabel>
                    <FormControl><Input type="number" min={0} {...field} /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="cantidad_inasistencias_alerta" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Cant. inasistencias (alerta)</FormLabel>
                    <FormControl><Input type="number" min={0} {...field} /></FormControl>
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="alerta_inasistencias" render={({ field }) => (
                <FormItem className="flex items-center gap-3">
                  <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                  <FormLabel className="text-xs !mt-0">Habilitar alerta de inasistencias</FormLabel>
                </FormItem>
              )} />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={createMateria.isPending}>
                {createMateria.isPending ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

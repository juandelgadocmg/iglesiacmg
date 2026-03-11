import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useCreateMateria, useAulas } from "@/hooks/useAcademia";
import { usePersonas } from "@/hooks/useDatabase";
import { toast } from "sonner";

const schema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  descripcion: z.string().optional(),
  horario: z.string().optional(),
  maestro_id: z.string().optional(),
  aula_id: z.string().optional(),
});

export default function MateriaFormDialog({ periodoId }: { periodoId: string }) {
  const [open, setOpen] = useState(false);
  const createMateria = useCreateMateria();
  const { data: personas } = usePersonas();
  const { data: aulas } = useAulas();

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { nombre: "", descripcion: "", horario: "", maestro_id: "", aula_id: "" },
  });

  const onSubmit = async (values: { nombre: string; descripcion?: string; horario?: string; maestro_id?: string; aula_id?: string }) => {
    try {
      const maestro = personas?.find(p => p.id === values.maestro_id);
      const aula = aulas?.find(a => a.id === values.aula_id);
      await createMateria.mutateAsync({
        periodo_id: periodoId,
        nombre: values.nombre,
        descripcion: values.descripcion || undefined,
        horario: values.horario || undefined,
        maestro_id: values.maestro_id || undefined,
        maestro_nombre: maestro ? `${maestro.nombres} ${maestro.apellidos}` : undefined,
        aula_id: values.aula_id || undefined,
        aula: aula?.nombre || undefined,
      });
      toast.success("Materia creada");
      form.reset();
      setOpen(false);
    } catch {
      toast.error("Error al crear la materia");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline"><Plus className="h-4 w-4 mr-1" /> Nueva materia</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Nueva Materia</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="nombre" render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl><Input placeholder="Ej: Evangelismo Sobrenatural" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
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
                      {(personas || []).map(p => (
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
            <FormField control={form.control} name="horario" render={({ field }) => (
              <FormItem>
                <FormLabel>Horario</FormLabel>
                <FormControl><Input placeholder="Ej: 7:00 pm" {...field} /></FormControl>
              </FormItem>
            )} />
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

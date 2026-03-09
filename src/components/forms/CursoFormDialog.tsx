import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Plus } from "lucide-react";
import { useCreateCurso } from "@/hooks/useAcademia";
import { toast } from "sonner";

const schema = z.object({
  nombre: z.string().min(1, "Requerido"),
  descripcion: z.string().optional(),
  instructor: z.string().optional(),
  duracion_semanas: z.coerce.number().min(1).default(1),
  fecha_inicio: z.string().optional(),
  fecha_fin: z.string().optional(),
  cupos: z.coerce.number().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function CursoFormDialog() {
  const [open, setOpen] = useState(false);
  const createCurso = useCreateCurso();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { nombre: "", descripcion: "", instructor: "", duracion_semanas: 1 },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await createCurso.mutateAsync({
        nombre: values.nombre,
        descripcion: values.descripcion || undefined,
        instructor: values.instructor || undefined,
        duracion_semanas: values.duracion_semanas,
        fecha_inicio: values.fecha_inicio || undefined,
        fecha_fin: values.fecha_fin || undefined,
        cupos: values.cupos || undefined,
      });
      toast.success("Curso creado exitosamente");
      form.reset();
      setOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Error al crear curso");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Nuevo curso</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Crear curso</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="nombre" render={({ field }) => (
              <FormItem><FormLabel>Nombre del curso</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="descripcion" render={({ field }) => (
              <FormItem><FormLabel>Descripción</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>
            )} />
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="instructor" render={({ field }) => (
                <FormItem><FormLabel>Instructor</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="duracion_semanas" render={({ field }) => (
                <FormItem><FormLabel>Duración (semanas)</FormLabel><FormControl><Input type="number" min={1} {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="fecha_inicio" render={({ field }) => (
                <FormItem><FormLabel>Fecha inicio</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="fecha_fin" render={({ field }) => (
                <FormItem><FormLabel>Fecha fin</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <FormField control={form.control} name="cupos" render={({ field }) => (
              <FormItem><FormLabel>Cupos (opcional)</FormLabel><FormControl><Input type="number" min={1} {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={createCurso.isPending}>{createCurso.isPending ? "Guardando..." : "Crear curso"}</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

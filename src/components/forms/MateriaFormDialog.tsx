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
import { useCreateMateria } from "@/hooks/useAcademia";
import { toast } from "sonner";

const schema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  descripcion: z.string().optional(),
  horario: z.string().optional(),
  maestro_nombre: z.string().optional(),
  aula: z.string().optional(),
});

export default function MateriaFormDialog({ periodoId }: { periodoId: string }) {
  const [open, setOpen] = useState(false);
  const createMateria = useCreateMateria();
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { nombre: "", descripcion: "", horario: "", maestro_nombre: "", aula: "" },
  });

  const onSubmit = async (values: z.infer<typeof schema>) => {
    try {
      await createMateria.mutateAsync({
        periodo_id: periodoId,
        nombre: values.nombre,
        descripcion: values.descripcion || undefined,
        horario: values.horario || undefined,
        maestro_nombre: values.maestro_nombre || undefined,
        aula: values.aula || undefined,
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
      <DialogContent className="max-w-md">
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
                <FormControl><Textarea placeholder="Descripción de la materia..." {...field} /></FormControl>
              </FormItem>
            )} />
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="horario" render={({ field }) => (
                <FormItem>
                  <FormLabel>Horario</FormLabel>
                  <FormControl><Input placeholder="Ej: 7:00 pm" {...field} /></FormControl>
                </FormItem>
              )} />
              <FormField control={form.control} name="aula" render={({ field }) => (
                <FormItem>
                  <FormLabel>Aula</FormLabel>
                  <FormControl><Input placeholder="Ej: Aula Principal" {...field} /></FormControl>
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="maestro_nombre" render={({ field }) => (
              <FormItem>
                <FormLabel>Maestro</FormLabel>
                <FormControl><Input placeholder="Nombre del maestro" {...field} /></FormControl>
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

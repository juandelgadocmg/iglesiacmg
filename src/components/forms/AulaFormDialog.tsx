import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Plus } from "lucide-react";
import { useCreateAula } from "@/hooks/useAcademia";
import { toast } from "sonner";

const schema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  direccion: z.string().optional(),
  sede: z.string().optional(),
});

export default function AulaFormDialog() {
  const [open, setOpen] = useState(false);
  const createAula = useCreateAula();
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { nombre: "", direccion: "", sede: "Principal" },
  });

  const onSubmit = async (values: { nombre: string; direccion?: string; sede?: string }) => {
    try {
      await createAula.mutateAsync(values);
      toast.success("Aula creada");
      form.reset();
      setOpen(false);
    } catch {
      toast.error("Error al crear el aula");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Crear aula</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Nueva Aula</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="nombre" render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl><Input placeholder="Ej: Aula Principal" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="direccion" render={({ field }) => (
              <FormItem>
                <FormLabel>Dirección</FormLabel>
                <FormControl><Input placeholder="Ej: Auditorio Principal" {...field} /></FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="sede" render={({ field }) => (
              <FormItem>
                <FormLabel>Sede</FormLabel>
                <FormControl><Input placeholder="Ej: Principal" {...field} /></FormControl>
              </FormItem>
            )} />
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={createAula.isPending}>
                {createAula.isPending ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

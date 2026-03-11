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
import { useCreateEscuela } from "@/hooks/useAcademia";
import { toast } from "sonner";

const schema = z.object({
  nombre: z.string().min(1, "Requerido"),
  descripcion: z.string().optional(),
});

export default function CursoFormDialog() {
  const [open, setOpen] = useState(false);
  const createEscuela = useCreateEscuela();

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { nombre: "", descripcion: "" },
  });

  const onSubmit = async (values: { nombre: string; descripcion?: string }) => {
    try {
      await createEscuela.mutateAsync(values);
      toast.success("Escuela creada exitosamente");
      form.reset();
      setOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Error al crear escuela");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Nueva escuela</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Nueva Escuela</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="nombre" render={({ field }) => (
              <FormItem><FormLabel>Nombre</FormLabel><FormControl><Input placeholder="Ej: Discipulado Naciones" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="descripcion" render={({ field }) => (
              <FormItem><FormLabel>Descripción</FormLabel><FormControl><Textarea placeholder="Descripción de la escuela..." {...field} rows={2} /></FormControl></FormItem>
            )} />
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={createEscuela.isPending}>{createEscuela.isPending ? "Guardando..." : "Guardar"}</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

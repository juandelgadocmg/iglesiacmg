import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Plus } from "lucide-react";
import { useCreateCorte } from "@/hooks/useAcademia";
import { toast } from "sonner";

const schema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  numero: z.coerce.number().min(1).default(1),
  porcentaje: z.coerce.number().min(0).max(100).default(100),
  fecha_inicio: z.string().optional(),
  fecha_fin: z.string().optional(),
});

export default function CorteFormDialog({ periodoId }: { periodoId: string }) {
  const [open, setOpen] = useState(false);
  const createCorte = useCreateCorte();
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { nombre: "", numero: 1, porcentaje: 100, fecha_inicio: "", fecha_fin: "" },
  });

  const onSubmit = async (values: { nombre: string; numero: number; porcentaje: number; fecha_inicio?: string; fecha_fin?: string }) => {
    try {
      await createCorte.mutateAsync({
        periodo_id: periodoId,
        nombre: values.nombre,
        numero: values.numero,
        porcentaje: values.porcentaje,
        fecha_inicio: values.fecha_inicio || undefined,
        fecha_fin: values.fecha_fin || undefined,
      });
      toast.success("Corte creado");
      form.reset();
      setOpen(false);
    } catch {
      toast.error("Error al crear el corte");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline"><Plus className="h-4 w-4 mr-1" /> Añadir corte</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Nuevo Corte</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="nombre" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl><Input placeholder="Ej: Corte N° 1" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="numero" render={({ field }) => (
                <FormItem>
                  <FormLabel>Número</FormLabel>
                  <FormControl><Input type="number" min={1} {...field} /></FormControl>
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="porcentaje" render={({ field }) => (
              <FormItem>
                <FormLabel>Porcentaje del corte (%)</FormLabel>
                <FormControl><Input type="number" min={0} max={100} {...field} /></FormControl>
              </FormItem>
            )} />
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="fecha_inicio" render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha inicio</FormLabel>
                  <FormControl><Input type="date" {...field} /></FormControl>
                </FormItem>
              )} />
              <FormField control={form.control} name="fecha_fin" render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha fin</FormLabel>
                  <FormControl><Input type="date" {...field} /></FormControl>
                </FormItem>
              )} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={createCorte.isPending}>
                {createCorte.isPending ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

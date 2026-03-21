import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus } from "lucide-react";
import { useCreateItemCalificable } from "@/hooks/useAcademia";
import { toast } from "sonner";

const schema = z.object({
  nombre: z.string().min(1, "Requerido"),
  tipo: z.string().default("Clase"),
  porcentaje: z.coerce.number().min(0).max(100).optional(),
  fecha_inicio: z.string().optional(),
  fecha_fin: z.string().optional(),
  es_calificable: z.boolean().default(true),
  visible_estudiante: z.boolean().default(true),
});

interface Props {
  corteId: string;
  materiaId: string;
}

export default function ItemCalificableFormDialog({ corteId, materiaId }: Props) {
  const [open, setOpen] = useState(false);
  const createItem = useCreateItemCalificable();
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      nombre: "",
      tipo: "Clase",
      porcentaje: undefined as number | undefined,
      fecha_inicio: "",
      fecha_fin: "",
      es_calificable: true,
      visible_estudiante: true,
    },
  });

  const onSubmit = async (values: z.infer<typeof schema>) => {
    try {
      await createItem.mutateAsync({
        corte_id: corteId,
        materia_id: materiaId,
        nombre: values.nombre,
        tipo: values.tipo,
        porcentaje: values.es_calificable ? values.porcentaje : undefined,
        fecha_inicio: values.fecha_inicio || undefined,
        fecha_fin: values.fecha_fin || undefined,
        es_calificable: values.es_calificable,
        visible_estudiante: values.visible_estudiante,
      });
      toast.success("Ítem creado");
      form.reset();
      setOpen(false);
    } catch {
      toast.error("Error al crear el ítem");
    }
  };

  const esCalificable = form.watch("es_calificable");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost" className="h-7 text-xs"><Plus className="h-3 w-3 mr-1" /> Ítem</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Nuevo Ítem</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="nombre" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl><Input placeholder="Ej: Asistencia" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="tipo" render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="Clase">Clase</SelectItem>
                      <SelectItem value="Video">Video</SelectItem>
                      <SelectItem value="Actividad">Actividad</SelectItem>
                      <SelectItem value="Practica">Práctica</SelectItem>
                      <SelectItem value="Examen">Examen</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="es_calificable" render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <FormLabel className="text-sm">¿Calificable?</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )} />
              <FormField control={form.control} name="visible_estudiante" render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <FormLabel className="text-sm">¿Visible?</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )} />
            </div>

            {esCalificable && (
              <FormField control={form.control} name="porcentaje" render={({ field }) => (
                <FormItem>
                  <FormLabel>Porcentaje (%)</FormLabel>
                  <FormControl><Input type="number" min={0} max={100} placeholder="Ej: 50" {...field} /></FormControl>
                </FormItem>
              )} />
            )}

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
              <Button type="submit" disabled={createItem.isPending}>
                {createItem.isPending ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

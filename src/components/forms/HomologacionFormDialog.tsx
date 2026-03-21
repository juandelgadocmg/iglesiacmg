import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { usePersonas } from "@/hooks/useDatabase";
import { useCreateHomologacion } from "@/hooks/useAcademiaExtras";
import { toast } from "sonner";

const schema = z.object({
  persona_id: z.string().min(1, "Selecciona una persona"),
  materia_nombre: z.string().min(1, "Nombre de materia requerido"),
  institucion_origen: z.string().min(1, "Institución requerida"),
  calificacion_obtenida: z.coerce.number().optional(),
  observaciones: z.string().optional(),
});

export default function HomologacionFormDialog() {
  const [open, setOpen] = useState(false);
  const { data: personas } = usePersonas();
  const create = useCreateHomologacion();
  const form = useForm({ resolver: zodResolver(schema), defaultValues: { persona_id: "", materia_nombre: "", institucion_origen: "", calificacion_obtenida: undefined, observaciones: "" } });

  const onSubmit = async (values: z.infer<typeof schema>) => {
    try {
      await create.mutateAsync({
        persona_id: values.persona_id,
        materia_nombre: values.materia_nombre,
        institucion_origen: values.institucion_origen,
        calificacion_obtenida: values.calificacion_obtenida,
        observaciones: values.observaciones,
      });
      toast.success("Homologación registrada");
      form.reset();
      setOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Error");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline"><Plus className="h-4 w-4 mr-1" /> Nueva homologación</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Registrar homologación</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="persona_id" render={({ field }) => (
              <FormItem>
                <FormLabel>Persona</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Seleccionar persona" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {(personas || []).map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.nombres} {p.apellidos}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="materia_nombre" render={({ field }) => (
              <FormItem>
                <FormLabel>Materia homologada</FormLabel>
                <FormControl><Input placeholder="Nombre de la materia" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="institucion_origen" render={({ field }) => (
              <FormItem>
                <FormLabel>Institución de origen</FormLabel>
                <FormControl><Input placeholder="Nombre de la institución" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="calificacion_obtenida" render={({ field }) => (
              <FormItem>
                <FormLabel>Calificación obtenida (opcional)</FormLabel>
                <FormControl><Input type="number" step="0.1" placeholder="Ej: 4.5" {...field} /></FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="observaciones" render={({ field }) => (
              <FormItem>
                <FormLabel>Observaciones (opcional)</FormLabel>
                <FormControl><Textarea placeholder="Notas adicionales..." rows={2} {...field} /></FormControl>
              </FormItem>
            )} />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={create.isPending}>{create.isPending ? "Guardando..." : "Registrar"}</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { usePersonas, useCreateInscripcion } from "@/hooks/useDatabase";
import { toast } from "sonner";

const schema = z.object({
  persona_id: z.string().min(1, "Selecciona una persona"),
  estado_pago: z.string().default("Pendiente"),
});

type FormValues = z.infer<typeof schema>;

export default function InscripcionFormDialog({ eventoId }: { eventoId: string }) {
  const [open, setOpen] = useState(false);
  const { data: personas } = usePersonas();
  const createInscripcion = useCreateInscripcion();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { persona_id: "", estado_pago: "Pendiente" },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await createInscripcion.mutateAsync({
        evento_id: eventoId,
        persona_id: values.persona_id,
        estado_pago: values.estado_pago,
      });
      toast.success("Inscripción registrada");
      form.reset();
      setOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Error al registrar inscripción");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Inscribir persona</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nueva inscripción</DialogTitle>
        </DialogHeader>
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

            <FormField control={form.control} name="estado_pago" render={({ field }) => (
              <FormItem>
                <FormLabel>Estado de pago</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="Pendiente">Pendiente</SelectItem>
                    <SelectItem value="Pagado">Pagado</SelectItem>
                    <SelectItem value="Exento">Exento</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={createInscripcion.isPending}>
                {createInscripcion.isPending ? "Guardando..." : "Inscribir"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

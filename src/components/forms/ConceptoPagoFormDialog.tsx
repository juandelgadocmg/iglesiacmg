import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useCreateConceptoPago } from "@/hooks/useAcademiaExtras";
import { toast } from "sonner";

const schema = z.object({
  nombre: z.string().min(1, "Nombre requerido"),
  monto: z.coerce.number().min(0, "Monto inválido"),
});

export default function ConceptoPagoFormDialog({ cursoId }: { cursoId: string }) {
  const [open, setOpen] = useState(false);
  const create = useCreateConceptoPago();
  const form = useForm({ resolver: zodResolver(schema), defaultValues: { nombre: "", monto: 0 } });

  const onSubmit = async (values: z.infer<typeof schema>) => {
    try {
      await create.mutateAsync({ ...values, curso_id: cursoId });
      toast.success("Concepto creado");
      form.reset();
      setOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Error");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline"><Plus className="h-4 w-4 mr-1" /> Concepto de pago</Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Nuevo concepto de pago</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="nombre" render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl><Input placeholder="Ej: Matrícula, Material..." {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="monto" render={({ field }) => (
              <FormItem>
                <FormLabel>Monto</FormLabel>
                <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={create.isPending}>{create.isPending ? "Guardando..." : "Crear"}</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

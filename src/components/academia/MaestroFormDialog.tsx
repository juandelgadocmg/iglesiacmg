import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const schema = z.object({
  nombres: z.string().min(1, "Requerido"),
  apellidos: z.string().min(1, "Requerido"),
  documento: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  telefono: z.string().optional(),
  tipo_persona: z.string().default("Maestro Seminario"),
});

export default function MaestroFormDialog() {
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      nombres: "",
      apellidos: "",
      documento: "",
      email: "",
      telefono: "",
      tipo_persona: "Maestro Seminario",
    },
  });

  const onSubmit = async (values: z.infer<typeof schema>) => {
    try {
      const { error } = await supabase.from("personas").insert({
        nombres: values.nombres,
        apellidos: values.apellidos,
        documento: values.documento || null,
        email: values.email || null,
        telefono: values.telefono || null,
        tipo_persona: values.tipo_persona as any,
      });
      if (error) throw error;
      toast.success("Maestro creado exitosamente");
      qc.invalidateQueries({ queryKey: ["personas"] });
      form.reset();
      setOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Error al crear maestro");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm"><UserPlus className="h-4 w-4 mr-1" /> Crear Maestro</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Nuevo Maestro</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="nombres" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombres</FormLabel>
                  <FormControl><Input placeholder="Nombres" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="apellidos" render={({ field }) => (
                <FormItem>
                  <FormLabel>Apellidos</FormLabel>
                  <FormControl><Input placeholder="Apellidos" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="documento" render={({ field }) => (
              <FormItem>
                <FormLabel>Documento (opcional)</FormLabel>
                <FormControl><Input placeholder="Cédula o documento" {...field} /></FormControl>
              </FormItem>
            )} />
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email (opcional)</FormLabel>
                  <FormControl><Input placeholder="email@ejemplo.com" {...field} /></FormControl>
                </FormItem>
              )} />
              <FormField control={form.control} name="telefono" render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono (opcional)</FormLabel>
                  <FormControl><Input placeholder="300 000 0000" {...field} /></FormControl>
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="tipo_persona" render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="Maestro Seminario">Maestro Seminario</SelectItem>
                    <SelectItem value="Mentor">Mentor</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )} />
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit">Guardar</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

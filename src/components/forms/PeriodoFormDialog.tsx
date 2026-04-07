import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useCreatePeriodo } from "@/hooks/useAcademia";
import { toast } from "sonner";

const schema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  estado: z.string().default("Abierto"),
  fecha_inicio: z.string().optional(),
  fecha_fin: z.string().optional(),
  fecha_matricula_inicio: z.string().optional(),
  fecha_matricula_fin: z.string().optional(),
});

export default function PeriodoFormDialog({ escuelaId }: { escuelaId: string }) {
  const [open, setOpen] = useState(false);
  const createPeriodo = useCreatePeriodo();
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      nombre: "",
      estado: "Abierto",
      fecha_inicio: "",
      fecha_fin: "",
      fecha_matricula_inicio: "",
      fecha_matricula_fin: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof schema>) => {
    try {
      await createPeriodo.mutateAsync({
        escuela_id: escuelaId,
        nombre: values.nombre,
        estado: values.estado,
        fecha_inicio: values.fecha_inicio || undefined,
        fecha_fin: values.fecha_fin || undefined,
        fecha_matricula_inicio: values.fecha_matricula_inicio || undefined,
        fecha_matricula_fin: values.fecha_matricula_fin || undefined,
      });
      toast.success("Período creado");
      form.reset();
      setOpen(false);
    } catch {
      toast.error("Error al crear el período");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Nuevo período</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nuevo Período</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

            <FormField control={form.control} name="nombre" render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre del período *</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Discipulando Naciones 2025 I" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Estado — permite crear períodos históricos como Cerrado */}
            <FormField control={form.control} name="estado" render={({ field }) => (
              <FormItem>
                <FormLabel>Estado del período</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Abierto">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                        Abierto — período activo o en curso
                      </span>
                    </SelectItem>
                    <SelectItem value="Cerrado">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-gray-400 inline-block" />
                        Cerrado — período histórico o finalizado
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Para migrar datos anteriores selecciona <strong>Cerrado</strong>.
                </p>
              </FormItem>
            )} />

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="fecha_inicio" render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha inicio período</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                </FormItem>
              )} />
              <FormField control={form.control} name="fecha_fin" render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha fin período</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="fecha_matricula_inicio" render={({ field }) => (
                <FormItem>
                  <FormLabel>Inicio matrículas</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                </FormItem>
              )} />
              <FormField control={form.control} name="fecha_matricula_fin" render={({ field }) => (
                <FormItem>
                  <FormLabel>Fin matrículas</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                </FormItem>
              )} />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={createPeriodo.isPending}>
                {createPeriodo.isPending ? "Guardando..." : "Guardar período"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

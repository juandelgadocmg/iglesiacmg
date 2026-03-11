import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus } from "lucide-react";
import { usePersonas } from "@/hooks/useDatabase";
import { useCreateMatricula } from "@/hooks/useAcademia";
import { toast } from "sonner";

const schema = z.object({
  persona_id: z.string().min(1, "Selecciona una persona"),
});

interface Props {
  cursoId: string;
  periodoId?: string;
  materiaId?: string;
}

export default function MatriculaFormDialog({ cursoId, periodoId, materiaId }: Props) {
  const [open, setOpen] = useState(false);
  const { data: personas } = usePersonas();
  const createMatricula = useCreateMatricula();

  const form = useForm({ resolver: zodResolver(schema), defaultValues: { persona_id: "" } });

  const onSubmit = async (values: z.infer<typeof schema>) => {
    try {
      await createMatricula.mutateAsync({
        curso_id: cursoId,
        persona_id: values.persona_id,
        periodo_id: periodoId,
        materia_id: materiaId,
      });
      toast.success("Alumno matriculado");
      form.reset();
      setOpen(false);
    } catch (err: any) {
      toast.error(err.message?.includes("duplicate") ? "Esta persona ya está matriculada" : err.message || "Error");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline"><UserPlus className="h-4 w-4 mr-1" /> Matricular</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Matricular alumno</DialogTitle></DialogHeader>
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
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={createMatricula.isPending}>{createMatricula.isPending ? "Guardando..." : "Matricular"}</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

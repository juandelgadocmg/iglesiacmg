import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus } from "lucide-react";
import { usePersonas } from "@/hooks/useDatabase";
import { useCreateMatricula, useEscuelas, useAllPeriodos, useMaterias, useAulas } from "@/hooks/useAcademia";
import { useConceptosPago, useCreatePagosForMatricula } from "@/hooks/useAcademiaExtras";
import { toast } from "sonner";

const schema = z.object({
  persona_id: z.string().min(1, "Selecciona una persona"),
  curso_id: z.string().min(1, "Selecciona una escuela"),
  periodo_id: z.string().min(1, "Selecciona un período"),
  materia_id: z.string().optional(),
  sede: z.string().optional(),
});

interface Props {
  cursoId?: string;
  periodoId?: string;
  materiaId?: string;
}

export default function MatriculaFormDialog({ cursoId, periodoId, materiaId }: Props) {
  const [open, setOpen] = useState(false);
  const { data: personas } = usePersonas();
  const { data: escuelas } = useEscuelas();
  const { data: allPeriodos } = useAllPeriodos();
  const { data: aulas } = useAulas();
  const createMatricula = useCreateMatricula();
  const createPagos = useCreatePagosForMatricula();

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      persona_id: "",
      curso_id: cursoId || "",
      periodo_id: periodoId || "",
      materia_id: materiaId || "",
      sede: "",
    },
  });

  const watchCursoId = form.watch("curso_id");
  const watchPeriodoId = form.watch("periodo_id");

  const periodosFiltered = useMemo(() => {
    if (!watchCursoId) return [];
    return (allPeriodos || []).filter((p: any) => p.escuela_id === watchCursoId);
  }, [allPeriodos, watchCursoId]);

  const { data: materias } = useMaterias(watchPeriodoId || null);
  const { data: conceptos } = useConceptosPago(watchCursoId || null);

  const sedes = useMemo(() => {
    const set = new Set<string>();
    (aulas || []).forEach((a: any) => { if (a.sede) set.add(a.sede); });
    return Array.from(set);
  }, [aulas]);

  const onSubmit = async (values: z.infer<typeof schema>) => {
    try {
      const selectedMateriaId = values.materia_id || materiaId;
      
      // Require materia if materias exist in the period
      if (!selectedMateriaId && materias && materias.length > 0) {
        toast.error("Debe seleccionar una materia");
        return;
      }

      const result = await createMatricula.mutateAsync({
        curso_id: values.curso_id,
        persona_id: values.persona_id,
        periodo_id: values.periodo_id || undefined,
        materia_id: selectedMateriaId || undefined,
      });
      if (conceptos?.length) {
        await createPagos.mutateAsync({
          matriculaId: result.id,
          conceptoIds: conceptos.map((c: any) => c.id),
        });
      }
      toast.success("Alumno matriculado");
      form.reset();
      setOpen(false);
    } catch (err: any) {
      toast.error(err.message?.includes("duplicate") ? "Esta persona ya está matriculada en esta materia" : err.message || "Error");
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

            {!cursoId && (
              <FormField control={form.control} name="curso_id" render={({ field }) => (
                <FormItem>
                  <FormLabel>Escuela</FormLabel>
                  <Select onValueChange={(v) => { field.onChange(v); form.setValue("periodo_id", ""); form.setValue("materia_id", ""); }} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Seleccionar escuela" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {(escuelas || []).map((e: any) => (
                        <SelectItem key={e.id} value={e.id}>{e.nombre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            )}

            {sedes.length > 0 && (
              <FormField control={form.control} name="sede" render={({ field }) => (
                <FormItem>
                  <FormLabel>Sede</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Seleccionar sede (opcional)" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {sedes.map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )} />
            )}

            {!periodoId && (
              <FormField control={form.control} name="periodo_id" render={({ field }) => (
                <FormItem>
                  <FormLabel>Período</FormLabel>
                  <Select onValueChange={(v) => { field.onChange(v); form.setValue("materia_id", ""); }} value={field.value} disabled={!watchCursoId}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Seleccionar período" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {periodosFiltered.map((p: any) => (
                        <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            )}

            {!materiaId && materias && materias.length > 0 && (
              <FormField control={form.control} name="materia_id" render={({ field }) => (
                <FormItem>
                  <FormLabel>Materia <span className="text-destructive">*</span></FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={!watchPeriodoId}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Seleccionar materia" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {(materias || []).map((m: any) => (
                        <SelectItem key={m.id} value={m.id}>{m.nombre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )} />
            )}

            {conceptos && conceptos.length > 0 && (
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-xs font-medium text-muted-foreground mb-2">Conceptos de pago que se crearán:</p>
                <div className="space-y-1">
                  {conceptos.map((c: any) => (
                    <div key={c.id} className="flex justify-between text-xs">
                      <span>{c.nombre}</span>
                      <span className="font-medium">${c.monto}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

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

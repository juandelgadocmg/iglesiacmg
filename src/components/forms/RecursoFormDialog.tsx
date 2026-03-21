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
import { Plus, Upload } from "lucide-react";
import { useCreateRecurso } from "@/hooks/useAcademiaExtras";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const schema = z.object({
  titulo: z.string().min(1, "Título requerido"),
  descripcion: z.string().optional(),
  tipo: z.string().min(1),
  url: z.string().optional(),
});

interface Props {
  materiaId: string;
  maestroId?: string;
}

export default function RecursoFormDialog({ materiaId, maestroId }: Props) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const create = useCreateRecurso();
  const form = useForm({ resolver: zodResolver(schema), defaultValues: { titulo: "", descripcion: "", tipo: "enlace", url: "" } });

  const watchTipo = form.watch("tipo");

  const onSubmit = async (values: z.infer<typeof schema>) => {
    try {
      let archivo_url: string | undefined;
      let archivo_nombre: string | undefined;

      if (values.tipo === "archivo" && file) {
        setUploading(true);
        const ext = file.name.split(".").pop();
        const path = `${materiaId}/${Date.now()}.${ext}`;
        const { error: uploadErr } = await supabase.storage.from("recursos-academicos").upload(path, file);
        if (uploadErr) throw uploadErr;
        const { data: urlData } = supabase.storage.from("recursos-academicos").getPublicUrl(path);
        archivo_url = urlData.publicUrl;
        archivo_nombre = file.name;
        setUploading(false);
      }

      await create.mutateAsync({
        materia_id: materiaId,
        maestro_id: maestroId,
        titulo: values.titulo,
        descripcion: values.descripcion,
        tipo: values.tipo,
        url: values.tipo === "enlace" ? values.url : undefined,
        archivo_url,
        archivo_nombre,
      });
      toast.success("Recurso creado");
      form.reset();
      setFile(null);
      setOpen(false);
    } catch (err: any) {
      setUploading(false);
      toast.error(err.message || "Error");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline"><Plus className="h-4 w-4 mr-1" /> Recurso</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Nuevo recurso</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="titulo" render={({ field }) => (
              <FormItem>
                <FormLabel>Título</FormLabel>
                <FormControl><Input placeholder="Nombre del recurso" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="descripcion" render={({ field }) => (
              <FormItem>
                <FormLabel>Descripción (opcional)</FormLabel>
                <FormControl><Textarea placeholder="Descripción..." rows={2} {...field} /></FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="tipo" render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="enlace">Enlace externo</SelectItem>
                    <SelectItem value="archivo">Subir archivo</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )} />

            {watchTipo === "enlace" && (
              <FormField control={form.control} name="url" render={({ field }) => (
                <FormItem>
                  <FormLabel>URL</FormLabel>
                  <FormControl><Input placeholder="https://..." {...field} /></FormControl>
                </FormItem>
              )} />
            )}

            {watchTipo === "archivo" && (
              <div>
                <label className="text-sm font-medium">Archivo</label>
                <div className="mt-1">
                  <label className="flex items-center gap-2 cursor-pointer border rounded-lg p-3 hover:bg-muted/50 transition-colors">
                    <Upload className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{file ? file.name : "Seleccionar archivo..."}</span>
                    <input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                  </label>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={create.isPending || uploading}>
                {uploading ? "Subiendo..." : create.isPending ? "Guardando..." : "Crear"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, AlertTriangle } from "lucide-react";
import { usePersonas } from "@/hooks/useDatabase";
import { useConfiguracion } from "@/hooks/useConfiguracion";
import { useCreateCertificadoIglesia, TIPOS_CERTIFICADO } from "@/hooks/useCertificadosIglesia";
import { toast } from "sonner";

export default function CertificadoIglesiaFormDialog() {
  const [open, setOpen] = useState(false);
  const [tipo, setTipo] = useState("");
  const [personaId, setPersonaId] = useState("");
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const { data: personas } = usePersonas();
  const { data: config } = useConfiguracion();
  const createCert = useCreateCertificadoIglesia();

  const pastorPrincipal = config?.pastor_principal;

  const handleSubmit = async () => {
    if (!tipo || !personaId) {
      toast.error("Selecciona tipo de certificado y miembro");
      return;
    }
    try {
      await createCert.mutateAsync({
        persona_id: personaId,
        tipo_certificado: tipo,
        fecha_emision: fecha,
      });
      toast.success("Certificado creado");
      setOpen(false);
      setTipo("");
      setPersonaId("");
    } catch (err: any) {
      toast.error(err.message || "Error al crear certificado");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2"><Plus className="h-4 w-4" /> Nuevo certificado</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Agregar certificado</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Tipo de certificado</Label>
            <Select value={tipo} onValueChange={setTipo}>
              <SelectTrigger><SelectValue placeholder="— Seleccionar —" /></SelectTrigger>
              <SelectContent>
                {TIPOS_CERTIFICADO.map(t => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Miembro</Label>
            <Select value={personaId} onValueChange={setPersonaId}>
              <SelectTrigger><SelectValue placeholder="Selecciona una persona" /></SelectTrigger>
              <SelectContent>
                {(personas || []).map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.nombres} {p.apellidos}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Pastor</Label>
            {!pastorPrincipal ? (
              <Alert variant="destructive" className="py-2">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Aún no tienes definido un pastor principal. Te recomendamos que vayas a Configuración y asignes un pastor principal para que el certificado cuente con este dato.
                </AlertDescription>
              </Alert>
            ) : (
              <p className="text-sm text-foreground bg-muted/50 rounded-md p-2">{pastorPrincipal}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Fecha de expedición</Label>
            <Input type="date" value={fecha} onChange={e => setFecha(e.target.value)} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={createCert.isPending}>
              {createCert.isPending ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { useState, useEffect } from "react";
import PageHeader from "@/components/shared/PageHeader";
import { useConfiguracion, useUpdateConfiguracion } from "@/hooks/useConfiguracion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Video, Save } from "lucide-react";
import { toast } from "sonner";

function getYoutubeEmbedUrl(url: string) {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    const v = u.searchParams.get("v");
    if (v) return `https://www.youtube.com/embed/${v}`;
    if (u.pathname.includes("/embed/")) return url;
  } catch {}
  return url;
}

export default function SenalEnVivoPage() {
  const { data: config, isLoading } = useConfiguracion();
  const updateConfig = useUpdateConfiguracion();
  const [url, setUrl] = useState("");
  const [activa, setActiva] = useState(false);

  useEffect(() => {
    if (config) {
      setUrl(config.senal_en_vivo_url || "");
      setActiva(config.senal_en_vivo_activa || false);
    }
  }, [config]);

  const handleSave = async () => {
    try {
      await updateConfig.mutateAsync({ senal_en_vivo_url: url, senal_en_vivo_activa: activa });
      toast.success("Señal en vivo actualizada");
    } catch { toast.error("Error al guardar"); }
  };

  if (isLoading) return <div className="space-y-4 animate-fade-in"><Skeleton className="h-10 w-48" /><Skeleton className="h-64 w-full" /></div>;

  return (
    <div className="animate-fade-in">
      <PageHeader title="Señal En Vivo" description="Configura la señal en vivo para la transmisión">
        <Button onClick={handleSave} disabled={updateConfig.isPending}>
          <Save className="h-4 w-4 mr-2" /> {updateConfig.isPending ? "Guardando..." : "Guardar"}
        </Button>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Video className="h-4 w-4" /> Configuración de Señal en Vivo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Switch checked={activa} onCheckedChange={setActiva} />
            <Label>Habilitar señal en vivo</Label>
          </div>
          <div className="space-y-2">
            <Label>URL de YouTube (transmisión en vivo)</Label>
            <Input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." />
          </div>
          {url && activa && (
            <div className="aspect-video bg-muted rounded-lg overflow-hidden max-w-2xl">
              <iframe src={getYoutubeEmbedUrl(url)} title="Señal en vivo" className="w-full h-full" allowFullScreen />
            </div>
          )}
          {!url && (
            <div className="text-center py-8 text-muted-foreground">
              <Video className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p>No hay ningún video agregado.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

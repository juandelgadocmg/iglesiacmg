import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { QrCode, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  eventoId: string;
  onAsistenciaMarked: () => void;
}

export default function QrEventoScanner({ eventoId, onAsistenciaMarked }: Props) {
  const [open, setOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [count, setCount] = useState(0);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannedRef = useRef<Set<string>>(new Set());

  const startScanner = async () => {
    const scanner = new Html5Qrcode("qr-evento-reader");
    scannerRef.current = scanner;
    setScanning(true);

    try {
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          if (scannedRef.current.has(decodedText)) return;
          scannedRef.current.add(decodedText);

          // Look up persona by qr_code
          const { data: persona, error: pErr } = await supabase
            .from("personas")
            .select("id, nombres, apellidos")
            .eq("qr_code", decodedText)
            .maybeSingle();

          if (pErr || !persona) {
            toast.error("Código QR no reconocido");
            setTimeout(() => scannedRef.current.delete(decodedText), 2000);
            return;
          }

          // Find their inscription for this event
          const { data: insc, error: iErr } = await supabase
            .from("inscripciones")
            .select("id, confirmado")
            .eq("evento_id", eventoId)
            .eq("persona_id", persona.id)
            .maybeSingle();

          if (iErr || !insc) {
            toast.error(`${persona.nombres} ${persona.apellidos} no está inscrito/a en este evento`);
            setTimeout(() => scannedRef.current.delete(decodedText), 2000);
            return;
          }

          if (insc.confirmado) {
            toast.info(`${persona.nombres} ${persona.apellidos} ya tiene asistencia registrada`);
            return;
          }

          // Mark as present
          const { error: uErr } = await supabase
            .from("inscripciones")
            .update({ confirmado: true })
            .eq("id", insc.id);

          if (uErr) {
            toast.error("Error al registrar asistencia");
            setTimeout(() => scannedRef.current.delete(decodedText), 2000);
            return;
          }

          const nombre = `${persona.nombres} ${persona.apellidos}`;
          setCount(c => c + 1);
          onAsistenciaMarked();
          toast.success(`✓ ${nombre}`, { description: "Asistencia registrada" });
        },
        () => {}
      );
    } catch (err: any) {
      toast.error("No se pudo acceder a la cámara", { description: err.message });
      setScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current?.isScanning) {
      await scannerRef.current.stop();
    }
    scannerRef.current = null;
    setScanning(false);
  };

  useEffect(() => {
    if (open) {
      setTimeout(startScanner, 300);
    }
    return () => { stopScanner(); };
  }, [open]);

  const handleClose = () => {
    stopScanner();
    setOpen(false);
    scannedRef.current.clear();
    setCount(0);
  };

  return (
    <>
      <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => setOpen(true)}>
        <QrCode className="h-3.5 w-3.5" /> Lector QR
      </Button>
      <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" /> Escanear QR de Asistencia
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Apunta la cámara al código QR de la persona para registrar su asistencia automáticamente.
            </p>
            <div id="qr-evento-reader" className="w-full rounded-lg overflow-hidden" />
            {scanning && (
              <p className="text-xs text-center text-muted-foreground animate-pulse">
                Escaneando... ({count} registrados)
              </p>
            )}
            <Button variant="outline" className="w-full" onClick={handleClose}>
              <X className="h-4 w-4 mr-1.5" /> Cerrar escáner
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

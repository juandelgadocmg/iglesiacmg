import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { QrCode, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  servicioId: string;
  onPersonaScanned: (personaId: string, nombre: string) => void;
}

export default function QrAttendanceScanner({ servicioId, onPersonaScanned }: Props) {
  const [open, setOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannedRef = useRef<Set<string>>(new Set());

  const startScanner = async () => {
    const scanner = new Html5Qrcode("qr-reader");
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
          const { data, error } = await supabase
            .from("personas")
            .select("id, nombres, apellidos")
            .eq("qr_code", decodedText)
            .maybeSingle();

          if (error || !data) {
            toast.error("Código QR no reconocido");
            // Allow re-scan after 2s
            setTimeout(() => scannedRef.current.delete(decodedText), 2000);
            return;
          }

          const nombre = `${data.nombres} ${data.apellidos}`;
          onPersonaScanned(data.id, nombre);
          toast.success(`✓ ${nombre}`, { description: "Check-in registrado" });
        },
        () => {} // ignore errors
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
    scannedRef.current.clear();
  };

  useEffect(() => {
    if (open) {
      // Small delay to ensure DOM is ready
      setTimeout(startScanner, 300);
    }
    return () => { stopScanner(); };
  }, [open]);

  const handleClose = () => {
    stopScanner();
    setOpen(false);
  };

  return (
    <>
      <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => setOpen(true)}>
        <QrCode className="h-3.5 w-3.5" /> Escanear QR
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
            <div id="qr-reader" className="w-full rounded-lg overflow-hidden" />
            {scanning && (
              <p className="text-xs text-center text-muted-foreground animate-pulse">
                Escaneando... ({scannedRef.current.size} registrados)
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

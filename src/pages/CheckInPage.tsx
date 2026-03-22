import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Church, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";

export default function CheckInPage() {
  const { servicioId } = useParams<{ servicioId: string }>();
  const [servicio, setServicio] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<"idle" | "checking" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!servicioId) return;
    supabase.from("servicios").select("*").eq("id", servicioId).single().then(({ data }) => {
      setServicio(data);
      setLoading(false);
    });
  }, [servicioId]);

  // Check if user is already signed in and auto-check-in
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user?.email && servicioId) {
        await doCheckIn(session.user.email);
      }
    });
  }, [servicioId]);

  const doCheckIn = async (email: string) => {
    setStatus("checking");
    // Find persona by email
    const { data: persona } = await supabase
      .from("personas")
      .select("id, nombres, apellidos")
      .eq("email", email)
      .maybeSingle();

    if (!persona) {
      setStatus("error");
      setMessage("No se encontró un miembro registrado con este correo electrónico. Contacta al administrador de la iglesia.");
      return;
    }

    // Upsert attendance
    const { error } = await supabase
      .from("asistencia")
      .upsert(
        { servicio_id: servicioId!, persona_id: persona.id, presente: true },
        { onConflict: "servicio_id,persona_id" }
      );

    if (error) {
      setStatus("error");
      setMessage("Error al registrar asistencia. Intenta de nuevo.");
      return;
    }

    setStatus("success");
    setMessage(`¡Bienvenido/a, ${persona.nombres} ${persona.apellidos}! Tu asistencia ha sido registrada.`);
  };

  const handleGoogleCheckIn = async () => {
    setStatus("checking");
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.href,
    });
    if (result.error) {
      setStatus("error");
      setMessage("Error al iniciar sesión con Google.");
    }
    // After redirect, the useEffect will handle check-in
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!servicio) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="py-12 text-center">
            <AlertTriangle className="h-12 w-12 text-warning mx-auto mb-4" />
            <p className="text-foreground font-semibold">Servicio no encontrado</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/20 p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Church className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-xl">{servicio.nombre}</CardTitle>
          <p className="text-sm text-muted-foreground">{servicio.fecha} · {servicio.hora || ""}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "idle" && (
            <>
              <p className="text-sm text-center text-muted-foreground">
                Registra tu asistencia iniciando sesión con tu cuenta de Google.
              </p>
              <Button className="w-full gap-2" size="lg" onClick={handleGoogleCheckIn}>
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Registrar con Google
              </Button>
            </>
          )}

          {status === "checking" && (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">Verificando...</p>
            </div>
          )}

          {status === "success" && (
            <div className="text-center py-8">
              <CheckCircle2 className="h-16 w-16 text-success mx-auto mb-4" />
              <p className="text-foreground font-semibold">{message}</p>
            </div>
          )}

          {status === "error" && (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <p className="text-sm text-foreground">{message}</p>
              <Button variant="outline" className="mt-4" onClick={() => setStatus("idle")}>
                Intentar de nuevo
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

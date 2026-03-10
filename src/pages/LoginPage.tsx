import logo from "@/assets/logo.jpeg";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Mail, Lock, ArrowRight, KeyRound, ArrowLeft, UserPlus, LogIn } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { lovable } from "@/integrations/lovable/index";
import { Separator } from "@/components/ui/separator";

type ViewMode = "login" | "signup" | "forgot";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<ViewMode>("login");
  const navigate = useNavigate();
  const { session } = useAuth();

  if (session) return <Navigate to="/dashboard" replace />;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (view === "forgot") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Se envió un enlace de recuperación a su correo.");
      }
      setLoading(false);
      return;
    }

    if (view === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Cuenta creada. Revise su correo para confirmar.");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast.error("Credenciales incorrectas");
      } else {
        navigate("/dashboard");
      }
    }
    setLoading(false);
  };

  const titles: Record<ViewMode, string> = {
    login: "Bienvenido de vuelta",
    signup: "Crear Cuenta",
    forgot: "Recuperar Contraseña",
  };

  const subtitles: Record<ViewMode, string> = {
    login: "Ingrese sus credenciales para acceder al sistema",
    signup: "Complete los datos para registrarse",
    forgot: "Ingrese su correo y le enviaremos un enlace para restablecer su contraseña",
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel — decorative */}
      <div className="hidden lg:flex flex-1 sidebar-gradient items-center justify-center p-12 relative overflow-hidden">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--sidebar-primary)) 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center relative z-10"
        >
          <div className="relative inline-block mb-8">
            <div className="absolute -inset-3 rounded-3xl gold-gradient opacity-20 blur-xl" />
            <img src={logo} alt="CMG" className="w-28 h-28 rounded-2xl relative shadow-2xl" />
          </div>
          <h1 className="text-4xl font-bold text-sidebar-primary-foreground mb-3 tracking-tight">
            CMG Admin
          </h1>
          <p className="text-sidebar-foreground/60 text-sm max-w-xs leading-relaxed">
            Sistema de administración integral del Centro Mundial de Gloria
          </p>
          <div className="mt-10 flex items-center gap-3 justify-center text-sidebar-foreground/40 text-xs">
            <span className="w-8 h-px bg-sidebar-foreground/20" />
            Gestión · Finanzas · Ministerios
            <span className="w-8 h-px bg-sidebar-foreground/20" />
          </div>
        </motion.div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 bg-background">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="relative">
              <div className="absolute -inset-2 rounded-2xl gold-gradient opacity-20 blur-lg" />
              <img src={logo} alt="CMG" className="w-16 h-16 rounded-xl relative" />
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <h2 className="text-2xl font-bold mb-1 text-foreground tracking-tight">
                {titles[view]}
              </h2>
              <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
                {subtitles[view]}
              </p>

              <form onSubmit={handleLogin} className="space-y-4">
                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Correo electrónico</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="admin@cmg.church"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="pl-10 h-11"
                      required
                    />
                  </div>
                </div>

                {/* Password (hidden on forgot) */}
                {view !== "forgot" && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-foreground">Contraseña</label>
                      {view === "login" && (
                        <button
                          type="button"
                          onClick={() => setView("forgot")}
                          className="text-xs text-accent hover:underline font-medium"
                        >
                          ¿Olvidó su contraseña?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="pl-10 h-11"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Procesando…
                    </span>
                  ) : view === "login" ? (
                    <>Ingresar <LogIn className="h-4 w-4" /></>
                  ) : view === "signup" ? (
                    <>Registrarse <UserPlus className="h-4 w-4" /></>
                  ) : (
                    <>Enviar enlace <ArrowRight className="h-4 w-4" /></>
                  )}
                </Button>
              </form>

              {/* Footer links */}
              <div className="mt-6 text-center text-sm text-muted-foreground">
                {view === "login" && (
                  <p>
                    ¿No tiene cuenta?{" "}
                    <button onClick={() => setView("signup")} className="text-accent hover:underline font-medium">
                      Registrarse
                    </button>
                  </p>
                )}
                {view === "signup" && (
                  <p>
                    ¿Ya tiene cuenta?{" "}
                    <button onClick={() => setView("login")} className="text-accent hover:underline font-medium">
                      Iniciar sesión
                    </button>
                  </p>
                )}
                {view === "forgot" && (
                  <button
                    onClick={() => setView("login")}
                    className="inline-flex items-center gap-1 text-accent hover:underline font-medium"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Volver a iniciar sesión
                  </button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          <p className="text-center text-xs text-muted-foreground mt-10">
            © 2026 Centro Mundial de Gloria · CMG Admin
          </p>
        </motion.div>
      </div>
    </div>
  );
}

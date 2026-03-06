import logo from "@/assets/logo.jpeg";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Navigate } from "react-router-dom";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const { session } = useAuth();

  if (session) return <Navigate to="/dashboard" replace />;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isSignUp) {
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

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-1 sidebar-gradient items-center justify-center p-12">
        <div className="text-center">
          <img src={logo} alt="CMG" className="w-24 h-24 rounded-2xl mx-auto mb-6 shadow-xl" />
          <h1 className="text-3xl font-bold text-sidebar-primary-foreground mb-2">CMG Admin</h1>
          <p className="text-sidebar-foreground/70 text-sm max-w-xs">
            Sistema de administración integral del Centro Mundial de Gloria
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex justify-center mb-8">
            <img src={logo} alt="CMG" className="w-16 h-16 rounded-xl" />
          </div>
          <h2 className="text-2xl font-bold mb-1 text-foreground">
            {isSignUp ? "Crear Cuenta" : "Iniciar Sesión"}
          </h2>
          <p className="text-sm text-muted-foreground mb-8">
            {isSignUp ? "Complete los datos para registrarse" : "Ingrese sus credenciales para acceder al sistema"}
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Correo electrónico</label>
              <Input
                type="email"
                placeholder="admin@cmg.church"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="mt-1.5"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Contraseña</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="mt-1.5"
                required
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={loading}>
              {loading ? "Procesando..." : isSignUp ? "Registrarse" : "Ingresar"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {isSignUp ? "¿Ya tiene cuenta?" : "¿No tiene cuenta?"}{" "}
            <button onClick={() => setIsSignUp(!isSignUp)} className="text-accent hover:underline font-medium">
              {isSignUp ? "Iniciar sesión" : "Registrarse"}
            </button>
          </p>

          <p className="text-center text-xs text-muted-foreground mt-8">
            © 2026 Centro Mundial de Gloria · CMG Admin
          </p>
        </div>
      </div>
    </div>
  );
}

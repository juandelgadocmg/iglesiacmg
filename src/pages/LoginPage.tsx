import logo from "@/assets/logo.jpeg";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/dashboard");
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
          <h2 className="text-2xl font-bold mb-1 text-foreground">Iniciar Sesión</h2>
          <p className="text-sm text-muted-foreground mb-8">Ingrese sus credenciales para acceder al sistema</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Correo electrónico</label>
              <Input
                type="email"
                placeholder="admin@cmg.church"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="mt-1.5"
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
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-muted-foreground">
                <input type="checkbox" className="rounded" /> Recordarme
              </label>
              <a href="#" className="text-accent hover:underline font-medium">¿Olvidó su contraseña?</a>
            </div>
            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              Ingresar
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-8">
            © 2026 Centro Mundial de Gloria · CMG Admin
          </p>
        </div>
      </div>
    </div>
  );
}

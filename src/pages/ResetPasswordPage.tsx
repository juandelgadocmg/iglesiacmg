import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock, KeyRound, Check } from "lucide-react";
import { motion } from "framer-motion";
import logo from "@/assets/logo.jpeg";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for recovery token in URL hash
    const hash = window.location.hash;
    if (!hash.includes("type=recovery")) {
      toast.error("Enlace de recuperación inválido.");
      navigate("/login");
    }
  }, [navigate]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Las contraseñas no coinciden.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      toast.error(error.message);
    } else {
      setSuccess(true);
      toast.success("Contraseña actualizada exitosamente.");
      setTimeout(() => navigate("/dashboard"), 2000);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute -inset-2 rounded-2xl gold-gradient opacity-20 blur-lg" />
            <img src={logo} alt="CMG" className="w-16 h-16 rounded-xl relative" />
          </div>
        </div>

        {success ? (
          <div className="text-center space-y-4">
            <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Check className="h-7 w-7 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground">¡Contraseña actualizada!</h2>
            <p className="text-sm text-muted-foreground">Redirigiendo al sistema…</p>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <div className="mx-auto w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                <KeyRound className="h-6 w-6 text-accent" />
              </div>
              <h2 className="text-2xl font-bold text-foreground tracking-tight">Nueva contraseña</h2>
              <p className="text-sm text-muted-foreground mt-1">Ingrese su nueva contraseña</p>
            </div>

            <form onSubmit={handleReset} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Nueva contraseña</label>
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
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Confirmar contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    className="pl-10 h-11"
                    required
                    minLength={6}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full h-11 font-semibold" disabled={loading}>
                {loading ? "Actualizando…" : "Actualizar contraseña"}
              </Button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}

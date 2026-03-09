import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";
import LoginPage from "@/pages/LoginPage";
import Dashboard from "@/pages/Dashboard";
import PersonasPage from "@/pages/PersonasPage";
import GruposPage from "@/pages/GruposPage";
import ServiciosPage from "@/pages/ServiciosPage";
import FinanzasPage from "@/pages/FinanzasPage";
import EventosPage from "@/pages/EventosPage";
import AsistenciaPage from "@/pages/AsistenciaPage";
import DonacionesPage from "@/pages/DonacionesPage";
import InscripcionesPage from "@/pages/InscripcionesPage";
import AcademiaPage from "@/pages/AcademiaPage";
import CertificadosPage from "@/pages/CertificadosPage";
import ReportesPage from "@/pages/ReportesPage";
import {
  UsuariosPage, ConfiguracionPage
} from "@/pages/PlaceholderPages";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/personas" element={<PersonasPage />} />
              <Route path="/grupos" element={<GruposPage />} />
              <Route path="/servicios" element={<ServiciosPage />} />
              <Route path="/asistencia" element={<AsistenciaPage />} />
              <Route path="/finanzas" element={<FinanzasPage />} />
              <Route path="/donaciones" element={<DonacionesPage />} />
              <Route path="/eventos" element={<EventosPage />} />
              <Route path="/inscripciones" element={<InscripcionesPage />} />
              <Route path="/academia" element={<AcademiaPage />} />
              <Route path="/certificados" element={<CertificadosPage />} />
              <Route path="/reportes" element={<ReportesPage />} />
              <Route path="/usuarios" element={<UsuariosPage />} />
              <Route path="/configuracion" element={<ConfiguracionPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

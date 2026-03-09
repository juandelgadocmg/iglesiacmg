import PageHeader from "@/components/shared/PageHeader";
import { UserCog, Settings } from "lucide-react";

interface PlaceholderPageProps {
  title: string;
  description: string;
  icon: React.ElementType;
}

function PlaceholderContent({ title, description, icon: Icon }: PlaceholderPageProps) {
  return (
    <div className="animate-fade-in">
      <PageHeader title={title} description={description} />
      <div className="bg-card rounded-lg border p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Icon className="h-8 w-8 text-primary" />
        </div>
        <h3 className="font-semibold text-lg mb-2">Módulo en desarrollo</h3>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Este módulo está preparado para ser implementado.
        </p>
      </div>
    </div>
  );
}

export function UsuariosPage() {
  return <PlaceholderContent title="Usuarios y Roles" description="Gestión de usuarios y permisos del sistema" icon={UserCog} />;
}

export function ConfiguracionPage() {
  return <PlaceholderContent title="Configuración" description="Datos generales y configuración del sistema" icon={Settings} />;
}

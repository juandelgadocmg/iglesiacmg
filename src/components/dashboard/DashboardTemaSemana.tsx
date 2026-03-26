import { BookOpen, ExternalLink, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Props {
  titulo?: string | null;
  descripcion?: string | null;
  url?: string | null;
}

export default function DashboardTemaSemana({ titulo, descripcion, url }: Props) {
  const navigate = useNavigate();

  if (!titulo && !descripcion) return null;

  return (
    <div className="rounded-xl overflow-hidden border shadow-sm">
      <div className="bg-warning text-warning-foreground px-6 py-5 text-center">
        <BookOpen className="h-8 w-8 mx-auto mb-2" />
        <h3 className="font-bold text-lg">Tema de la semana</h3>
        <p className="text-sm mt-1 uppercase tracking-wide font-medium opacity-90">{descripcion || titulo}</p>
        <div className="flex items-center justify-center gap-2 mt-3">
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Abrir link
            </a>
          )}
          <button
            onClick={() => navigate("/configuracion")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
          >
            <Pencil className="h-3.5 w-3.5" /> Editar
          </button>
        </div>
      </div>
    </div>
  );
}

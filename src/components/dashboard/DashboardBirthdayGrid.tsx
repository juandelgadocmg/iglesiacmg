import { Cake } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface BirthdayPerson {
  nombre: string;
  fecha: string;
  initials: string;
  sexo?: string | null;
  foto_url?: string | null;
}

interface Props {
  birthdays: BirthdayPerson[];
}

const MONTHS_ES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

export default function DashboardBirthdayGrid({ birthdays }: Props) {
  const currentMonth = MONTHS_ES[new Date().getMonth()];

  return (
    <div className="rounded-xl overflow-hidden border shadow-sm">
      {/* Header */}
      <div className="bg-accent text-accent-foreground px-6 py-4 flex items-center gap-3">
        <div className="p-2 bg-white/20 rounded-lg">
          <Cake className="h-6 w-6" />
        </div>
        <div>
          <h3 className="font-bold text-lg uppercase tracking-wide">Próximos Cumpleaños de {currentMonth}</h3>
        </div>
      </div>

      {/* Grid */}
      <div className="bg-card p-4">
        {birthdays.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
            {birthdays.map((b, i) => {
              const isFemale = b.sexo === "Femenino" || b.sexo === "F";
              const ringColor = isFemale
                ? "ring-pink-500"
                : "ring-[hsl(var(--info))]";
              const bgColor = isFemale
                ? "bg-pink-500"
                : "bg-[hsl(var(--info))]";

              return (
                <div key={i} className="flex flex-col items-center text-center gap-1.5">
                  <div className={`rounded-full p-[3px] ${bgColor}`}>
                    <Avatar className="h-16 w-16 border-2 border-white">
                      {b.foto_url ? (
                        <AvatarImage src={b.foto_url} alt={b.nombre} />
                      ) : null}
                      <AvatarFallback className="bg-muted text-foreground text-sm font-bold">
                        {b.initials}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground leading-tight uppercase">
                      {b.nombre.split(" ").slice(0, 2).join(" ")}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{b.fecha}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">Sin cumpleaños este mes</p>
        )}
      </div>
    </div>
  );
}

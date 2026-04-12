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

export default function DashboardBirthdayGrid({ birthdays }: Props) {
  const hoy = format(new Date(), "EEEE d 'de' MMMM", { locale: es });

  return (
    <div className="rounded-xl overflow-hidden border shadow-sm">
      <div className="bg-accent text-accent-foreground px-6 py-4 flex items-center gap-3">
        <div className="p-2 bg-white/20 rounded-lg">
          <Cake className="h-6 w-6" />
        </div>
        <div>
          <h3 className="font-bold text-lg uppercase tracking-wide">🎂 Cumpleaños hoy</h3>
          <p className="text-sm opacity-80 capitalize">{hoy}</p>
        </div>
      </div>

      <div className="bg-card p-4">
        {birthdays.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
            {birthdays.map((b, i) => {
              const isFemale = b.sexo === "Femenino" || b.sexo === "F";
              const bgColor = isFemale ? "bg-pink-500" : "bg-[hsl(var(--info))]";
              return (
                <div key={i} className="flex flex-col items-center text-center gap-1.5">
                  <div className={`rounded-full p-[3px] ${bgColor}`}>
                    <Avatar className="h-16 w-16 border-2 border-white">
                      {b.foto_url ? <AvatarImage src={b.foto_url} alt={b.nombre} /> : null}
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
          <div className="text-center py-8 space-y-1">
            <Cake className="h-10 w-10 mx-auto text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">Sin cumpleaños hoy</p>
            <p className="text-xs text-muted-foreground capitalize">{hoy}</p>
          </div>
        )}
      </div>
    </div>
  );
}

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

export default function DashboardBirthdayGrid({ birthdays }: Props) {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });     // Sunday
  const rangeLabel = `${format(weekStart, "d", { locale: es })} – ${format(weekEnd, "d 'de' MMMM", { locale: es })}`;

  return (
    <div className="rounded-xl overflow-hidden border shadow-sm">
      {/* Header */}
      <div className="bg-accent text-accent-foreground px-6 py-4 flex items-center gap-3">
        <div className="p-2 bg-white/20 rounded-lg">
          <Cake className="h-6 w-6" />
        </div>
        <div>
          <h3 className="font-bold text-lg uppercase tracking-wide">Cumpleaños esta semana</h3>
          <p className="text-sm opacity-80">{rangeLabel}</p>
        </div>
      </div>

      {/* Grid */}
      <div className="bg-card p-4">
        {birthdays.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
            {birthdays.map((b, i) => {
              const isFemale = b.sexo === "Femenino" || b.sexo === "F";
              const bgColor = isFemale ? "bg-pink-500" : "bg-[hsl(var(--info))]";

              return (
                <div key={i} className="flex flex-col items-center text-center gap-1.5">
                  <div className={`rounded-full p-[3px] ${bgColor}`}>
                    <Avatar className="h-16 w-16 border-2 border-white">
                      {b.foto_url ? <AvatarImage src={b.foto_url} alt={b.nombre} /> : null}
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
          <div className="text-center py-8 space-y-1">
            <Cake className="h-10 w-10 mx-auto text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">Sin cumpleaños esta semana</p>
            <p className="text-xs text-muted-foreground">{rangeLabel}</p>
          </div>
        )}
      </div>
    </div>
  );
}

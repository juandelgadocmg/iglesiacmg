import MetricCard from "@/components/shared/MetricCard";
import StatusBadge from "@/components/shared/StatusBadge";
import { Users, Church, DollarSign, UserPlus, CalendarDays, Cake } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from "recharts";
import { useDashboardStats } from "@/hooks/useDatabase";
import { asistenciaSemanal, ingresosMensuales, cumpleanos } from "@/data/mockData";

export default function Dashboard() {
  const { data: stats, isLoading } = useDashboardStats();

  const totalMiembros = stats?.totalPersonas || 0;
  const nuevos = stats?.nuevosEsteMes || 0;
  const ingresos = stats?.ingresosMes || 0;
  const fmt = (n: number) => n >= 1000000 ? `$${(n / 1000000).toFixed(1)}M` : `$${(n / 1000).toFixed(0)}K`;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Bienvenido al panel de administración de CMG</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Miembros" value={isLoading ? "..." : totalMiembros} icon={Users} variant="default" />
        <MetricCard title="Diezmos y Ofrendas" value={isLoading ? "..." : fmt(ingresos)} icon={DollarSign} variant="success" />
        <MetricCard title="Nuevos Miembros" value={isLoading ? "..." : nuevos} icon={UserPlus} variant="accent" subtitle="Este mes" />
        <MetricCard title="Gastos del Mes" value={isLoading ? "..." : fmt(stats?.gastosMes || 0)} icon={Church} variant="info" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-lg border p-5">
          <h3 className="font-semibold text-sm mb-4">Asistencia Semanal</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={asistenciaSemanal}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 20% 90%)" />
              <XAxis dataKey="semana" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="asistencia" fill="hsl(215 50% 23%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-lg border p-5">
          <h3 className="font-semibold text-sm mb-4">Ingresos vs Gastos Mensuales</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={ingresosMensuales}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 20% 90%)" />
              <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `${(v / 1000000).toFixed(0)}M`} />
              <Tooltip formatter={(v: number) => `$${(v / 1000000).toFixed(1)}M`} />
              <Legend />
              <Line type="monotone" dataKey="ingresos" stroke="hsl(152 60% 40%)" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="gastos" stroke="hsl(0 72% 51%)" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-card rounded-lg border p-5">
          <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
            <Church className="h-4 w-4 text-primary" /> Próximos Servicios
          </h3>
          <div className="space-y-3">
            {(stats?.servicios || []).filter(s => s.estado === 'Programado').slice(0, 3).map(s => (
              <div key={s.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="text-sm font-medium">{s.nombre}</p>
                  <p className="text-xs text-muted-foreground">{s.fecha} · {s.hora}</p>
                </div>
                <StatusBadge status={s.estado} />
              </div>
            ))}
            {(stats?.servicios || []).filter(s => s.estado === 'Programado').length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">Sin servicios programados</p>
            )}
          </div>
        </div>

        <div className="bg-card rounded-lg border p-5">
          <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-accent" /> Próximos Eventos
          </h3>
          <div className="space-y-3">
            {(stats?.eventos || []).slice(0, 3).map(e => (
              <div key={e.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="text-sm font-medium">{e.nombre}</p>
                  <p className="text-xs text-muted-foreground">{e.fecha_inicio}</p>
                </div>
                <StatusBadge status={e.estado} />
              </div>
            ))}
            {(stats?.eventos || []).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">Sin eventos próximos</p>
            )}
          </div>
        </div>

        <div className="bg-card rounded-lg border p-5">
          <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
            <Cake className="h-4 w-4 text-warning" /> Cumpleaños del Mes
          </h3>
          <div className="space-y-3">
            {cumpleanos.map((c, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b last:border-0">
                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-xs font-semibold text-accent">
                  {c.nombre.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium">{c.nombre}</p>
                  <p className="text-xs text-muted-foreground">{c.fecha}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

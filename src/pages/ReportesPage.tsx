import { useMemo } from "react";
import PageHeader from "@/components/shared/PageHeader";
import MetricCard from "@/components/shared/MetricCard";
import { useDashboardStats } from "@/hooks/useDatabase";
import { useCursos, useCertificados, useAllMatriculas } from "@/hooks/useAcademia";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, DollarSign, TrendingUp, TrendingDown, GraduationCap, Award, CalendarDays, Heart } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--muted-foreground))", "hsl(142 76% 36%)", "hsl(38 92% 50%)"];

export default function ReportesPage() {
  const { data: stats, isLoading: loadingStats } = useDashboardStats();
  const { data: cursos } = useCursos();
  const { data: certificados } = useCertificados();
  const { data: matriculas } = useAllMatriculas();

  const finanzasChart = useMemo(() => {
    if (!stats) return [];
    return [
      { name: "Ingresos", valor: stats.ingresosMes },
      { name: "Gastos", valor: stats.gastosMes },
    ];
  }, [stats]);

  const academiaChart = useMemo(() => {
    if (!cursos) return [];
    return (cursos || []).slice(0, 6).map(c => ({
      nombre: c.nombre.length > 15 ? c.nombre.slice(0, 15) + "…" : c.nombre,
      alumnos: (c as any).matriculas?.[0]?.count || 0,
    }));
  }, [cursos]);

  const matriculasEstado = useMemo(() => {
    if (!matriculas) return [];
    const counts: Record<string, number> = {};
    matriculas.forEach(m => { counts[m.estado] = (counts[m.estado] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [matriculas]);

  if (loadingStats) {
    return (
      <div className="animate-fade-in space-y-4">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
        <Skeleton className="h-[300px]" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <PageHeader title="Reportes" description="Resumen y estadísticas de la iglesia" />

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <MetricCard title="Total Personas" value={stats?.totalPersonas || 0} icon={Users} subtitle={`+${stats?.nuevosEsteMes || 0} este mes`} />
        <MetricCard title="Ingresos del mes" value={`$${(stats?.ingresosMes || 0).toLocaleString()}`} icon={TrendingUp} subtitle="Total ingresos" variant="success" />
        <MetricCard title="Gastos del mes" value={`$${(stats?.gastosMes || 0).toLocaleString()}`} icon={TrendingDown} subtitle="Total gastos" variant="accent" />
        <MetricCard title="Certificados" value={certificados?.length || 0} icon={Award} subtitle="Emitidos total" variant="info" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Finanzas del mes */}
        <div className="bg-card border rounded-lg p-6">
          <h3 className="font-semibold mb-4 text-foreground">Finanzas del mes</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={finanzasChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip />
              <Bar dataKey="valor" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Alumnos por curso */}
        <div className="bg-card border rounded-lg p-6">
          <h3 className="font-semibold mb-4 text-foreground">Alumnos por curso</h3>
          {academiaChart.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={academiaChart} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis type="category" dataKey="nombre" tick={{ fontSize: 11 }} width={120} stroke="hsl(var(--muted-foreground))" />
                <Tooltip />
                <Bar dataKey="alumnos" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-sm text-center py-12">No hay cursos registrados</p>
          )}
        </div>

        {/* Estado de matrículas */}
        <div className="bg-card border rounded-lg p-6">
          <h3 className="font-semibold mb-4 text-foreground">Estado de matrículas</h3>
          {matriculasEstado.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={matriculasEstado} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {matriculasEstado.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-sm text-center py-12">No hay matrículas registradas</p>
          )}
        </div>

        {/* Resumen general */}
        <div className="bg-card border rounded-lg p-6">
          <h3 className="font-semibold mb-4 text-foreground">Resumen general</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <div className="flex items-center gap-3"><GraduationCap className="h-5 w-5 text-primary" /><span className="text-sm">Cursos activos</span></div>
              <span className="font-bold text-foreground">{cursos?.filter(c => c.estado === "Activo").length || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <div className="flex items-center gap-3"><Users className="h-5 w-5 text-accent" /><span className="text-sm">Alumnos matriculados</span></div>
              <span className="font-bold text-foreground">{matriculas?.length || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <div className="flex items-center gap-3"><CalendarDays className="h-5 w-5 text-muted-foreground" /><span className="text-sm">Próximos eventos</span></div>
              <span className="font-bold text-foreground">{stats?.eventos?.length || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <div className="flex items-center gap-3"><DollarSign className="h-5 w-5 text-primary" /><span className="text-sm">Balance del mes</span></div>
              <span className="font-bold text-foreground">${((stats?.ingresosMes || 0) - (stats?.gastosMes || 0)).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

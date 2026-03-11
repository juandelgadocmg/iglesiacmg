import { useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useDashboardStats, useFinanzas, usePersonas } from "@/hooks/useDatabase";
import { useCursos, useAllMatriculas, useCertificados } from "@/hooks/useAcademia";
import { usePeticiones } from "@/hooks/usePeticiones";
import MetricCard from "@/components/shared/MetricCard";
import StatusBadge from "@/components/shared/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users, Church, DollarSign, UserPlus, CalendarDays, Cake, TrendingUp,
  GraduationCap, Award, Activity, ArrowUpRight, ArrowDownRight, Wallet,
  HandHeart, Clock, CheckCircle2
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from "recharts";
import { format, parseISO, isThisMonth, differenceInDays, subMonths } from "date-fns";
import { es } from "date-fns/locale";

const PIE_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(var(--success))",
  "hsl(var(--info))",
  "hsl(var(--destructive))",
];

export default function Dashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading } = useDashboardStats();
  const { data: finanzas } = useFinanzas();
  const { data: personas } = usePersonas();
  const { data: cursos } = useCursos();
  const { data: matriculas } = useAllMatriculas();
  const { data: certificados } = useCertificados();
  const { data: peticiones } = usePeticiones();

  const totalMiembros = stats?.totalPersonas || 0;
  const nuevos = stats?.nuevosEsteMes || 0;
  const ingresos = stats?.ingresosMes || 0;
  const gastos = stats?.gastosMes || 0;
  const balance = ingresos - gastos;

  const fmt = (n: number) =>
    n >= 1000000 ? `$${(n / 1000000).toFixed(1)}M` : n >= 1000 ? `$${(n / 1000).toFixed(0)}K` : `$${n}`;

  // Prayer stats
  const peticionStats = useMemo(() => {
    if (!peticiones) return { pendientes: 0, enOracion: 0, respondidas: 0 };
    return {
      pendientes: peticiones.filter((p: any) => p.estado === "Pendiente").length,
      enOracion: peticiones.filter((p: any) => p.estado === "En oración").length,
      respondidas: peticiones.filter((p: any) => p.estado === "Respondida").length,
    };
  }, [peticiones]);

  // Distribution by type
  const personasByType = useMemo(() => {
    if (!personas) return [];
    const counts: Record<string, number> = {};
    personas.forEach((p: any) => { counts[p.tipo_persona] = (counts[p.tipo_persona] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [personas]);

  // Financial breakdown by category this month
  const finanzasByCategory = useMemo(() => {
    if (!finanzas) return [];
    const thisMonth = finanzas.filter((f) => { try { return isThisMonth(parseISO(f.fecha)); } catch { return false; } });
    const cats: Record<string, number> = {};
    thisMonth.filter(f => f.tipo === "Ingreso").forEach((f) => {
      const cat = f.categoria_nombre || "Otros";
      cats[cat] = (cats[cat] || 0) + Number(f.monto);
    });
    return Object.entries(cats).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 5);
  }, [finanzas]);

  // Growth trend (last 6 months)
  const growthTrend = useMemo(() => {
    if (!personas) return [];
    const now = new Date();
    const months: { month: string; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = subMonths(now, i);
      const m = d.getMonth();
      const y = d.getFullYear();
      const count = (personas as any[]).filter(p => {
        try {
          const created = parseISO(p.created_at);
          return created.getMonth() === m && created.getFullYear() === y;
        } catch { return false; }
      }).length;
      months.push({ month: format(d, "MMM", { locale: es }), count });
    }
    return months;
  }, [personas]);

  // Recent movements
  const recentMovements = useMemo(() => {
    if (!finanzas) return [];
    return finanzas.slice(0, 6);
  }, [finanzas]);

  // Recent activity feed
  const activityFeed = useMemo(() => {
    const items: { type: string; text: string; date: string; icon: string }[] = [];
    if (personas) {
      (personas as any[]).slice(0, 3).forEach(p => {
        items.push({ type: "persona", text: `${p.nombres} ${p.apellidos} registrado/a`, date: p.created_at, icon: "user" });
      });
    }
    if (finanzas) {
      finanzas.slice(0, 3).forEach(f => {
        items.push({ type: "finanza", text: `${f.tipo}: $${Number(f.monto).toLocaleString()} - ${f.categoria_nombre || f.descripcion || ""}`, date: f.created_at, icon: f.tipo === "Ingreso" ? "up" : "down" });
      });
    }
    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8);
  }, [personas, finanzas]);

  // Upcoming birthdays
  const birthdays = useMemo(() => {
    if (!personas) return [];
    const now = new Date();
    const thisMonth = now.getMonth();
    return (personas as any[])
      .filter((p) => { if (!p.fecha_nacimiento) return false; try { return parseISO(p.fecha_nacimiento).getMonth() === thisMonth; } catch { return false; } })
      .map((p) => ({ nombre: `${p.nombres} ${p.apellidos}`, fecha: format(parseISO(p.fecha_nacimiento), "dd MMM", { locale: es }), initials: `${p.nombres?.[0] || ""}${p.apellidos?.[0] || ""}` }))
      .slice(0, 5);
  }, [personas]);

  // Upcoming events
  const upcomingEvents = useMemo(() => {
    if (!stats?.eventos) return [];
    return stats.eventos.map((e: any) => {
      const days = differenceInDays(parseISO(e.fecha_inicio), new Date());
      const inscritos = e.inscripciones?.[0]?.count || 0;
      return { ...e, daysLeft: Math.max(0, days), inscritos, progress: e.cupos ? Math.round((inscritos / e.cupos) * 100) : 0 };
    });
  }, [stats]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Buenos días" : hour < 18 ? "Buenas tardes" : "Buenas noches";
  const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "Usuario";

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-16 w-72" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-[320px]" />
          <Skeleton className="h-[320px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{greeting}, {displayName} 👋</h1>
          <p className="text-sm text-muted-foreground mt-1">{format(new Date(), "EEEE, d 'de' MMMM yyyy", { locale: es })}</p>
        </div>
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-success/10 text-success text-xs font-medium">
          <Activity className="h-3.5 w-3.5" /> Sistema operativo
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard title="Total Miembros" value={totalMiembros} icon={Users} variant="default" trend={nuevos > 0 ? { value: `+${nuevos} este mes`, positive: true } : undefined} />
        <MetricCard title="Ingresos" value={fmt(ingresos)} icon={TrendingUp} variant="success" subtitle="Este mes" />
        <MetricCard title="Balance" value={fmt(balance)} icon={DollarSign} variant={balance >= 0 ? "success" : "info"} />
        <MetricCard title="Peticiones Activas" value={peticionStats.pendientes + peticionStats.enOracion} icon={HandHeart} variant="accent" />
        <MetricCard title="Respondidas" value={peticionStats.respondidas} icon={CheckCircle2} variant="success" />
      </div>

      {/* Row 2: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Income by Category */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" /> Ingresos del Mes por Categoría
            </CardTitle>
          </CardHeader>
          <CardContent>
            {finanzasByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={finanzasByCategory} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, "Monto"]} contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", fontSize: 12 }} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[260px] flex items-center justify-center text-muted-foreground text-sm">Sin datos financieros este mes</div>
            )}
          </CardContent>
        </Card>

        {/* Persona distribution pie */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" /> Distribución de Personas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {personasByType.length > 0 ? (
              <div>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={personasByType} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" strokeWidth={2} stroke="hsl(var(--card))">
                      {personasByType.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v: number, name: string) => [v, name]} contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid hsl(var(--border))" }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center mt-2">
                  {personasByType.map((item, i) => (
                    <div key={item.name} className="flex items-center gap-1.5 text-xs">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="text-muted-foreground">{item.name}</span>
                      <span className="font-semibold text-foreground">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">Sin datos</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Growth trend + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Growth Trend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-success" /> Crecimiento de Membresía (6 meses)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {growthTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={growthTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid hsl(var(--border))" }} />
                  <Area type="monotone" dataKey="count" stroke="hsl(var(--success))" fill="hsl(var(--success))" fillOpacity={0.15} strokeWidth={2} name="Nuevos" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">Sin datos</div>
            )}
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4 text-accent" /> Actividad Reciente
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y max-h-[280px] overflow-y-auto">
              {activityFeed.map((item, i) => (
                <div key={i} className="flex items-center gap-3 px-6 py-3">
                  <div className={`p-1.5 rounded-lg ${item.icon === "up" ? "bg-success/10" : item.icon === "down" ? "bg-destructive/10" : "bg-primary/10"}`}>
                    {item.icon === "up" ? <ArrowUpRight className="h-3.5 w-3.5 text-success" /> :
                     item.icon === "down" ? <ArrowDownRight className="h-3.5 w-3.5 text-destructive" /> :
                     <UserPlus className="h-3.5 w-3.5 text-primary" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{item.text}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {format(parseISO(item.date), "dd MMM, HH:mm", { locale: es })}
                    </p>
                  </div>
                </div>
              ))}
              {activityFeed.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">Sin actividad reciente</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 4: Events + Services + Birthdays + Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Upcoming Events */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-info" /> Próximos Eventos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingEvents.map((e: any) => (
              <div key={e.id} className="p-3 rounded-lg bg-muted/30 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{e.nombre}</p>
                    <p className="text-[10px] text-muted-foreground">{e.lugar} · {e.fecha_inicio}</p>
                  </div>
                  <span className="text-[10px] font-medium bg-info/10 text-info px-2 py-0.5 rounded-full whitespace-nowrap">
                    {e.daysLeft === 0 ? "Hoy" : `${e.daysLeft}d`}
                  </span>
                </div>
                {e.cupos && (
                  <div>
                    <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                      <span>{e.inscritos} / {e.cupos} inscritos</span>
                      <span>{e.progress}%</span>
                    </div>
                    <Progress value={e.progress} className="h-1.5" />
                  </div>
                )}
              </div>
            ))}
            {upcomingEvents.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">Sin eventos próximos</p>
            )}
          </CardContent>
        </Card>

        {/* Services + Birthdays */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Church className="h-4 w-4 text-primary" /> Próximos Servicios
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {(stats?.servicios || []).filter((s: any) => s.estado === "Programado").slice(0, 3).map((s: any) => (
                <div key={s.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="text-xs font-medium text-foreground">{s.nombre}</p>
                    <p className="text-[10px] text-muted-foreground">{s.fecha} · {s.hora}</p>
                  </div>
                  <StatusBadge status={s.estado} />
                </div>
              ))}
              {(stats?.servicios || []).filter((s: any) => s.estado === "Programado").length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">Sin servicios programados</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Cake className="h-4 w-4 text-accent" /> Cumpleaños del Mes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {birthdays.length > 0 ? (
                <div className="space-y-2">
                  {birthdays.map((b, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="bg-accent/10 text-accent text-[10px] font-semibold">{b.initials}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0"><p className="text-xs font-medium truncate">{b.nombre}</p></div>
                      <span className="text-[10px] text-muted-foreground">{b.fecha}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-4">Sin cumpleaños este mes</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats + Recent Movements */}
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-muted-foreground"><GraduationCap className="h-3.5 w-3.5" /> Cursos activos</div>
                <span className="text-sm font-bold text-foreground">{cursos?.filter(c => c.estado === "Activo").length || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-muted-foreground"><Users className="h-3.5 w-3.5" /> Alumnos</div>
                <span className="text-sm font-bold text-foreground">{matriculas?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-muted-foreground"><Award className="h-3.5 w-3.5" /> Certificados</div>
                <span className="text-sm font-bold text-foreground">{certificados?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-muted-foreground"><HandHeart className="h-3.5 w-3.5" /> Peticiones en oración</div>
                <span className="text-sm font-bold text-foreground">{peticionStats.enOracion}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Wallet className="h-4 w-4 text-accent" /> Movimientos Recientes
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {recentMovements.slice(0, 4).map((m) => (
                  <div key={m.id} className="flex items-center justify-between px-6 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className={`p-1 rounded-md ${m.tipo === "Ingreso" ? "bg-success/10" : "bg-destructive/10"}`}>
                        {m.tipo === "Ingreso" ? <ArrowUpRight className="h-3 w-3 text-success" /> : <ArrowDownRight className="h-3 w-3 text-destructive" />}
                      </div>
                      <div>
                        <p className="text-[11px] font-medium text-foreground">{m.categoria_nombre || m.descripcion}</p>
                        <p className="text-[9px] text-muted-foreground">{m.fecha}</p>
                      </div>
                    </div>
                    <span className={`text-[11px] font-semibold ${m.tipo === "Ingreso" ? "text-success" : "text-destructive"}`}>
                      {m.tipo === "Ingreso" ? "+" : "-"}${Number(m.monto).toLocaleString()}
                    </span>
                  </div>
                ))}
                {recentMovements.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">Sin movimientos</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

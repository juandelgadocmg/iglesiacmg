import { useState } from "react";
import PageHeader from "@/components/shared/PageHeader";
import MetricCard from "@/components/shared/MetricCard";
import StatusBadge from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ClipboardCheck, Users, TrendingUp, CalendarDays, Check, X, Search, Save, Church } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { personas, servicios } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Mock attendance records
const initialAttendance: Record<string, Record<string, boolean>> = {
  "1": { "1": true, "2": true, "3": true, "4": false, "5": true, "6": true, "7": true, "8": true },
  "2": { "1": true, "2": false, "3": true, "4": true, "5": true, "6": false, "7": true, "8": true },
  "3": { "1": true, "2": true, "3": false, "4": true, "5": false, "6": true, "7": true, "8": false },
  "4": { "1": false, "2": true, "3": true, "4": true, "5": true, "6": true, "7": false, "8": true },
  "5": { "1": true, "2": true, "3": true, "4": true, "5": true, "6": true, "7": true, "8": true },
  "6": { "1": true, "2": true, "3": true, "4": true, "5": true, "6": true, "7": true, "8": true },
};

const attendanceTrend = [
  { fecha: "Feb 2", asistencia: 285 },
  { fecha: "Feb 9", asistencia: 310 },
  { fecha: "Feb 16", asistencia: 295 },
  { fecha: "Feb 23", asistencia: 320 },
  { fecha: "Mar 1", asistencia: 600 },
  { fecha: "Mar 4", asistencia: 45 },
];

const attendanceByType = [
  { tipo: "Culto general", promedio: 550 },
  { tipo: "Oración", promedio: 48 },
  { tipo: "Escuela bíblica", promedio: 62 },
  { tipo: "Vigilia", promedio: 120 },
  { tipo: "Reunión líderes", promedio: 35 },
];

export default function AsistenciaPage() {
  const [selectedService, setSelectedService] = useState(servicios[0].id);
  const [attendance, setAttendance] = useState(initialAttendance);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "present" | "absent">("all");

  const currentService = servicios.find(s => s.id === selectedService)!;
  const serviceAttendance = attendance[selectedService] || {};

  const toggleAttendance = (personId: string) => {
    setAttendance(prev => ({
      ...prev,
      [selectedService]: {
        ...prev[selectedService],
        [personId]: !prev[selectedService]?.[personId],
      },
    }));
  };

  const markAll = (present: boolean) => {
    const updated: Record<string, boolean> = {};
    personas.forEach(p => { updated[p.id] = present; });
    setAttendance(prev => ({ ...prev, [selectedService]: updated }));
  };

  const saveAttendance = () => {
    toast.success("Asistencia guardada correctamente", {
      description: `${currentService.nombre} — ${Object.values(serviceAttendance).filter(Boolean).length} presentes`,
    });
  };

  const filteredPersonas = personas.filter(p => {
    const matchesSearch = `${p.nombres} ${p.apellidos}`.toLowerCase().includes(searchTerm.toLowerCase());
    if (filterStatus === "present") return matchesSearch && serviceAttendance[p.id];
    if (filterStatus === "absent") return matchesSearch && !serviceAttendance[p.id];
    return matchesSearch;
  });

  const totalPresent = Object.values(serviceAttendance).filter(Boolean).length;
  const totalAbsent = personas.length - totalPresent;
  const attendanceRate = personas.length > 0 ? Math.round((totalPresent / personas.length) * 100) : 0;

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader title="Asistencia" description="Control de asistencia por servicio y grupo" />

      <Tabs defaultValue="registro" className="space-y-6">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="registro" className="gap-2"><ClipboardCheck className="h-4 w-4" /> Registro</TabsTrigger>
          <TabsTrigger value="historial" className="gap-2"><CalendarDays className="h-4 w-4" /> Historial</TabsTrigger>
          <TabsTrigger value="estadisticas" className="gap-2"><TrendingUp className="h-4 w-4" /> Estadísticas</TabsTrigger>
        </TabsList>

        {/* === TAB: REGISTRO === */}
        <TabsContent value="registro" className="space-y-4">
          {/* Service selector */}
          <div className="bg-card rounded-lg border p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                <Church className="h-5 w-5 text-info" />
              </div>
              <div className="flex-1">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Servicio</label>
                <Select value={selectedService} onValueChange={setSelectedService}>
                  <SelectTrigger className="mt-1 border-0 bg-muted/30 h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {servicios.map(s => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.nombre} — {s.fecha}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => markAll(true)} className="text-xs gap-1.5">
                <Check className="h-3.5 w-3.5" /> Marcar todos
              </Button>
              <Button variant="outline" size="sm" onClick={() => markAll(false)} className="text-xs gap-1.5">
                <X className="h-3.5 w-3.5" /> Desmarcar todos
              </Button>
              <Button size="sm" onClick={saveAttendance} className="text-xs gap-1.5 bg-primary text-primary-foreground">
                <Save className="h-3.5 w-3.5" /> Guardar
              </Button>
            </div>
          </div>

          {/* Metrics row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <MetricCard title="Presentes" value={totalPresent} icon={Check} variant="success" />
            <MetricCard title="Ausentes" value={totalAbsent} icon={X} variant="default" />
            <MetricCard title="Tasa de Asistencia" value={`${attendanceRate}%`} icon={TrendingUp} variant="accent" />
          </div>

          {/* Attendance list */}
          <div className="bg-card rounded-lg border">
            <div className="p-4 border-b flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar persona..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-9 h-9 bg-muted/30 border-0"
                />
              </div>
              <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as any)}>
                <SelectTrigger className="w-44 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="present">Presentes</SelectItem>
                  <SelectItem value="absent">Ausentes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="divide-y">
              {filteredPersonas.map(p => {
                const isPresent = !!serviceAttendance[p.id];
                return (
                  <div
                    key={p.id}
                    className="flex items-center justify-between px-4 py-3 hover:bg-muted/20 transition-colors cursor-pointer"
                    onClick={() => toggleAttendance(p.id)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                          {p.nombres[0]}{p.apellidos[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{p.nombres} {p.apellidos}</p>
                        <p className="text-xs text-muted-foreground">{p.tipoPersona} · {p.grupo || "Sin grupo"}</p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleAttendance(p.id); }}
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 shrink-0",
                        isPresent
                          ? "bg-success text-success-foreground shadow-sm"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      )}
                    >
                      {isPresent ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
                    </button>
                  </div>
                );
              })}
              {filteredPersonas.length === 0 && (
                <div className="px-4 py-12 text-center text-muted-foreground text-sm">
                  No se encontraron personas
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* === TAB: HISTORIAL === */}
        <TabsContent value="historial" className="space-y-4">
          <div className="bg-card rounded-lg border">
            <div className="p-4 border-b">
              <h3 className="font-semibold text-sm">Historial de Asistencia por Persona</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Últimos servicios registrados</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider sticky left-0 bg-muted/30">Persona</th>
                    {servicios.slice(0, 6).map(s => (
                      <th key={s.id} className="text-center px-3 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider min-w-[80px]">
                        <div>{s.fecha.slice(5)}</div>
                        <div className="text-[10px] font-normal opacity-70">{s.tipo.slice(0, 8)}</div>
                      </th>
                    ))}
                    <th className="text-center px-3 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">%</th>
                  </tr>
                </thead>
                <tbody>
                  {personas.map(p => {
                    const total = servicios.slice(0, 6).length;
                    const present = servicios.slice(0, 6).filter(s => attendance[s.id]?.[p.id]).length;
                    const rate = Math.round((present / total) * 100);
                    return (
                      <tr key={p.id} className="border-b last:border-0 hover:bg-muted/20">
                        <td className="px-4 py-3 sticky left-0 bg-card">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-7 w-7">
                              <AvatarFallback className="bg-primary/10 text-primary text-[10px]">{p.nombres[0]}{p.apellidos[0]}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-sm whitespace-nowrap">{p.nombres} {p.apellidos.split(' ')[0]}</span>
                          </div>
                        </td>
                        {servicios.slice(0, 6).map(s => (
                          <td key={s.id} className="text-center px-3 py-3">
                            {attendance[s.id]?.[p.id] ? (
                              <span className="inline-flex w-7 h-7 rounded-full bg-success/10 items-center justify-center">
                                <Check className="h-4 w-4 text-success" />
                              </span>
                            ) : (
                              <span className="inline-flex w-7 h-7 rounded-full bg-destructive/10 items-center justify-center">
                                <X className="h-4 w-4 text-destructive" />
                              </span>
                            )}
                          </td>
                        ))}
                        <td className="text-center px-3 py-3">
                          <Badge variant="outline" className={cn(
                            "text-xs font-semibold",
                            rate >= 80 ? "bg-success/10 text-success border-success/20" :
                            rate >= 50 ? "bg-warning/10 text-warning border-warning/20" :
                            "bg-destructive/10 text-destructive border-destructive/20"
                          )}>
                            {rate}%
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* === TAB: ESTADÍSTICAS === */}
        <TabsContent value="estadisticas" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <MetricCard title="Promedio Semanal" value={325} icon={Users} variant="default" />
            <MetricCard title="Máxima Asistencia" value={600} icon={TrendingUp} variant="success" subtitle="Mar 1 — Culto general" />
            <MetricCard title="Servicios Registrados" value={6} icon={ClipboardCheck} variant="info" />
            <MetricCard title="Tasa Promedio" value="78%" icon={TrendingUp} variant="accent" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-card rounded-lg border p-5">
              <h3 className="font-semibold text-sm mb-4">Tendencia de Asistencia</h3>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={attendanceTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 20% 90%)" />
                  <XAxis dataKey="fecha" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="asistencia" stroke="hsl(215 50% 23%)" strokeWidth={2} dot={{ r: 4, fill: "hsl(215 50% 23%)" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-card rounded-lg border p-5">
              <h3 className="font-semibold text-sm mb-4">Promedio por Tipo de Servicio</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={attendanceByType} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 20% 90%)" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="tipo" type="category" tick={{ fontSize: 11 }} width={100} />
                  <Tooltip />
                  <Bar dataKey="promedio" fill="hsl(40 60% 50%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

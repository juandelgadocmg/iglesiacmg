import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Line, ComposedChart } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp } from "lucide-react";
import { useState } from "react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

interface Props {
  materias: any[];
  periodoId: string;
}

function useAllMateriaAttendance(materiaId: string | null) {
  return useQuery({
    queryKey: ["materia-attendance-trend", materiaId],
    enabled: !!materiaId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("asistencia_materias")
        .select("fecha, presente")
        .eq("materia_id", materiaId!)
        .order("fecha", { ascending: true });
      if (error) throw error;

      // Group by fecha
      const grouped: Record<string, { present: number; total: number }> = {};
      (data || []).forEach((a) => {
        if (!grouped[a.fecha]) grouped[a.fecha] = { present: 0, total: 0 };
        grouped[a.fecha].total++;
        if (a.presente) grouped[a.fecha].present++;
      });

      return Object.entries(grouped).map(([fecha, stats]) => ({
        fecha,
        label: format(parseISO(fecha), "dd MMM", { locale: es }),
        presentes: stats.present,
        ausentes: stats.total - stats.present,
        tasa: stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0,
      }));
    },
  });
}

export default function MateriaAttendanceTrendChart({ materias, periodoId }: Props) {
  const [selectedMateria, setSelectedMateria] = useState<string | null>(null);
  const { data, isLoading } = useAllMateriaAttendance(selectedMateria);

  return (
    <div className="rounded-xl border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Tendencia de Asistencia por Materia</h3>
        </div>
        <Select value={selectedMateria || ""} onValueChange={setSelectedMateria}>
          <SelectTrigger className="h-8 w-56 text-xs">
            <SelectValue placeholder="Seleccionar materia" />
          </SelectTrigger>
          <SelectContent>
            {(materias || []).map((m: any) => (
              <SelectItem key={m.id} value={m.id}>{m.nombre}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!selectedMateria && (
        <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
          Selecciona una materia para ver la tendencia
        </div>
      )}

      {selectedMateria && isLoading && <Skeleton className="h-[250px] w-full" />}

      {selectedMateria && !isLoading && !data?.length && (
        <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
          No hay datos de asistencia para esta materia
        </div>
      )}

      {selectedMateria && data && data.length > 0 && (
        <ResponsiveContainer width="100%" height={250}>
          <ComposedChart data={data} margin={{ top: 5, right: 20, bottom: 20, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
            <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
            <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
            <Tooltip
              contentStyle={{ borderRadius: 8, fontSize: 12 }}
              formatter={(value: number, name: string) => {
                if (name === "tasa") return [`${value}%`, "Tasa"];
                return [value, name === "presentes" ? "Presentes" : "Ausentes"];
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar yAxisId="left" dataKey="presentes" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} name="Presentes" />
            <Bar yAxisId="left" dataKey="ausentes" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} opacity={0.4} name="Ausentes" />
            <Line yAxisId="right" type="monotone" dataKey="tasa" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} name="Tasa %" />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

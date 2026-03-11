import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Line, ComposedChart } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp } from "lucide-react";

/**
 * Fetches attendance summary per service: for each servicio, count present and total.
 */
function useAttendanceTrendByService() {
  return useQuery({
    queryKey: ["attendance-trend-services"],
    queryFn: async () => {
      // Get all attendance records with service info
      const { data: asistencia, error: aErr } = await supabase
        .from("asistencia")
        .select("servicio_id, presente");
      if (aErr) throw aErr;

      const { data: servicios, error: sErr } = await supabase
        .from("servicios")
        .select("id, nombre, fecha")
        .order("fecha", { ascending: true });
      if (sErr) throw sErr;

      // Group by servicio
      const grouped: Record<string, { present: number; total: number }> = {};
      (asistencia || []).forEach((a) => {
        if (!grouped[a.servicio_id]) grouped[a.servicio_id] = { present: 0, total: 0 };
        grouped[a.servicio_id].total++;
        if (a.presente) grouped[a.servicio_id].present++;
      });

      return (servicios || [])
        .filter((s) => grouped[s.id])
        .map((s) => ({
          nombre: s.nombre.length > 20 ? s.nombre.substring(0, 18) + "…" : s.nombre,
          fecha: s.fecha,
          presentes: grouped[s.id].present,
          ausentes: grouped[s.id].total - grouped[s.id].present,
          tasa: grouped[s.id].total > 0 ? Math.round((grouped[s.id].present / grouped[s.id].total) * 100) : 0,
        }));
    },
  });
}

export default function AttendanceTrendChart() {
  const { data, isLoading } = useAttendanceTrendByService();

  if (isLoading) return <Skeleton className="h-[300px] w-full rounded-xl" />;
  if (!data?.length) {
    return (
      <div className="rounded-xl border bg-card p-6 text-center text-muted-foreground text-sm">
        <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-40" />
        No hay datos de asistencia registrados aún.
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-4 space-y-3">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold">Tendencia de Asistencia por Servicio</h3>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={data} margin={{ top: 5, right: 20, bottom: 40, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis
            dataKey="nombre"
            tick={{ fontSize: 11 }}
            angle={-30}
            textAnchor="end"
            height={60}
          />
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
    </div>
  );
}

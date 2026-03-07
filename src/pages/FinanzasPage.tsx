import PageHeader from "@/components/shared/PageHeader";
import MetricCard from "@/components/shared/MetricCard";
import DataTable from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import FinanzaFormDialog from "@/components/forms/FinanzaFormDialog";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { useFinanzas } from "@/hooks/useDatabase";
import { Skeleton } from "@/components/ui/skeleton";

export default function FinanzasPage() {
  const { data: finanzas, isLoading } = useFinanzas();

  if (isLoading) {
    return (
      <div className="animate-fade-in space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  const data = finanzas || [];
  const ingresos = data.filter(f => f.tipo === 'Ingreso').reduce((s, f) => s + Number(f.monto), 0);
  const gastos = data.filter(f => f.tipo === 'Gasto').reduce((s, f) => s + Number(f.monto), 0);
  const balance = ingresos - gastos;

  const fmt = (n: number) => n >= 1000000 ? `$${(n / 1000000).toFixed(1)}M` : `$${(n / 1000).toFixed(0)}K`;

  return (
    <div className="animate-fade-in">
      <PageHeader title="Finanzas" description="Panel financiero de la iglesia">
        <FinanzaFormDialog />
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <MetricCard title="Ingresos" value={fmt(ingresos)} icon={TrendingUp} variant="success" />
        <MetricCard title="Gastos" value={fmt(gastos)} icon={TrendingDown} variant="default" />
        <MetricCard title="Balance" value={fmt(balance)} icon={Wallet} variant="accent" />
      </div>

      <DataTable
        data={data}
        searchKey="descripcion"
        searchPlaceholder="Buscar movimiento..."
        filterKey="tipo"
        filterPlaceholder="Tipo"
        filterOptions={[
          { value: "Ingreso", label: "Ingresos" },
          { value: "Gasto", label: "Gastos" },
        ]}
        columns={[
          { key: "tipo", label: "Tipo", render: (f: any) => <StatusBadge status={f.tipo} /> },
          { key: "categoria_nombre", label: "Categoría", render: (f: any) => f.categoria_nombre || "—" },
          { key: "descripcion", label: "Descripción", render: (f: any) => f.descripcion || "—" },
          { key: "monto", label: "Monto", render: (f: any) => (
            <span className={f.tipo === 'Ingreso' ? 'text-success font-semibold' : 'text-destructive font-semibold'}>
              {f.tipo === 'Ingreso' ? '+' : '-'}${Number(f.monto).toLocaleString()}
            </span>
          )},
          { key: "fecha", label: "Fecha" },
          { key: "metodo_pago", label: "Método", render: (f: any) => f.metodo_pago || "—" },
        ]}
      />
    </div>
  );
}

import PageHeader from "@/components/shared/PageHeader";
import MetricCard from "@/components/shared/MetricCard";
import DataTable from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Plus, DollarSign, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { finanzas } from "@/data/mockData";

export default function FinanzasPage() {
  const ingresos = finanzas.filter(f => f.tipo === 'Ingreso').reduce((s, f) => s + f.monto, 0);
  const gastos = finanzas.filter(f => f.tipo === 'Gasto').reduce((s, f) => s + f.monto, 0);
  const balance = ingresos - gastos;

  const fmt = (n: number) => `$${(n / 1000000).toFixed(1)}M`;

  return (
    <div className="animate-fade-in">
      <PageHeader title="Finanzas" description="Panel financiero de la iglesia">
        <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Nuevo Registro
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <MetricCard title="Ingresos del Mes" value={fmt(ingresos)} icon={TrendingUp} variant="success" />
        <MetricCard title="Gastos del Mes" value={fmt(gastos)} icon={TrendingDown} variant="default" />
        <MetricCard title="Balance" value={fmt(balance)} icon={Wallet} variant="accent" />
      </div>

      <DataTable
        data={finanzas}
        searchKey="descripcion"
        searchPlaceholder="Buscar movimiento..."
        filterKey="tipo"
        filterPlaceholder="Tipo"
        filterOptions={[
          { value: "Ingreso", label: "Ingresos" },
          { value: "Gasto", label: "Gastos" },
        ]}
        columns={[
          { key: "tipo", label: "Tipo", render: (f) => <StatusBadge status={f.tipo} /> },
          { key: "categoria", label: "Categoría" },
          { key: "descripcion", label: "Descripción" },
          { key: "monto", label: "Monto", render: (f) => (
            <span className={f.tipo === 'Ingreso' ? 'text-success font-semibold' : 'text-destructive font-semibold'}>
              {f.tipo === 'Ingreso' ? '+' : '-'}${(f.monto / 1000).toFixed(0)}K
            </span>
          )},
          { key: "fecha", label: "Fecha" },
          { key: "metodoPago", label: "Método" },
        ]}
      />
    </div>
  );
}

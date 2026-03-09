import { useState } from "react";
import PageHeader from "@/components/shared/PageHeader";
import MetricCard from "@/components/shared/MetricCard";
import DataTable from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import FinanzaFormDialog from "@/components/forms/FinanzaFormDialog";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import { TrendingUp, TrendingDown, Wallet, Pencil } from "lucide-react";
import { useFinanzas, useDeleteFinanza } from "@/hooks/useDatabase";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import ExportDropdown from "@/components/shared/ExportDropdown";

export default function FinanzasPage() {
  const { data: finanzas, isLoading } = useFinanzas();
  const deleteFinanza = useDeleteFinanza();
  const [editing, setEditing] = useState<any>(null);

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

  const handleDelete = async (id: string) => {
    try {
      await deleteFinanza.mutateAsync(id);
      toast.success("Registro eliminado");
    } catch { toast.error("Error al eliminar"); }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader title="Finanzas" description="Panel financiero de la iglesia">
        <FinanzaFormDialog />
      </PageHeader>

      {editing && <FinanzaFormDialog initialData={editing} onClose={() => setEditing(null)} />}

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
          {
            key: "actions", label: "",
            render: (f: any) => (
              <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditing({ ...f })}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <DeleteConfirmDialog onConfirm={() => handleDelete(f.id)} />
              </div>
            )
          },
        ]}
      />
    </div>
  );
}

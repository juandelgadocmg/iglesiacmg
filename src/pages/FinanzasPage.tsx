import { useState, useMemo } from "react";
import PageHeader from "@/components/shared/PageHeader";
import MetricCard from "@/components/shared/MetricCard";
import DataTable from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import FinanzaFormDialog from "@/components/forms/FinanzaFormDialog";
import DonacionFormDialog from "@/components/forms/DonacionFormDialog";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import { TrendingUp, TrendingDown, Wallet, Pencil, Plus, Trash2, Search, Heart, DollarSign } from "lucide-react";
import { useFinanzas, useDeleteFinanza, useDonaciones } from "@/hooks/useDatabase";
import {
  useCategoriasFinancieras, useCreateCategoriaFinanciera,
  useUpdateCategoriaFinanciera, useDeleteCategoriaFinanciera,
} from "@/hooks/useEventosExtras";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import ExportDropdown from "@/components/shared/ExportDropdown";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";

export default function FinanzasPage() {
  const { data: finanzas, isLoading } = useFinanzas();
  const { data: donaciones, isLoading: loadingDon } = useDonaciones();
  const deleteFinanza = useDeleteFinanza();
  const { data: categorias, isLoading: loadingCats } = useCategoriasFinancieras();
  const createCat = useCreateCategoriaFinanciera();
  const updateCat = useUpdateCategoriaFinanciera();
  const deleteCat = useDeleteCategoriaFinanciera();
  const [editing, setEditing] = useState<any>(null);

  // Period filter
  const currentYear = new Date().getFullYear();
  const [periodoDesde, setPeriodoDesde] = useState(`${currentYear}-01-01`);
  const [periodoHasta, setPeriodoHasta] = useState(`${currentYear}-12-31`);

  // Category form
  const [newCatName, setNewCatName] = useState("");
  const [newCatTipo, setNewCatTipo] = useState<"Ingreso" | "Gasto">("Ingreso");
  const [editingCat, setEditingCat] = useState<any>(null);
  const [searchCat, setSearchCat] = useState("");

  if (isLoading) {
    return (
      <div className="animate-fade-in space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  const data = finanzas || [];

  // Filter by period
  const filteredData = data.filter(f => f.fecha >= periodoDesde && f.fecha <= periodoHasta);
  const ingresos = filteredData.filter(f => f.tipo === "Ingreso").reduce((s, f) => s + Number(f.monto), 0);
  const gastos = filteredData.filter(f => f.tipo === "Gasto").reduce((s, f) => s + Number(f.monto), 0);
  const saldo = ingresos - gastos;
  const fmt = (n: number) => `$${n.toLocaleString("es", { minimumFractionDigits: 2 })}`;

  // Reportes: group by category
  const ingresosCats = (categorias || []).filter(c => c.tipo === "Ingreso");
  const egresosCats = (categorias || []).filter(c => c.tipo === "Gasto");

  const getCatTotal = (catName: string) =>
    filteredData.filter(f => f.categoria_nombre === catName).reduce((s, f) => s + Number(f.monto), 0);

  const handleDelete = async (id: string) => {
    try { await deleteFinanza.mutateAsync(id); toast.success("Registro eliminado"); }
    catch { toast.error("Error al eliminar"); }
  };

  const handleAddCat = async () => {
    if (!newCatName.trim()) { toast.error("Nombre requerido"); return; }
    try {
      await createCat.mutateAsync({ nombre: newCatName.trim(), tipo: newCatTipo });
      setNewCatName("");
      toast.success("Categoría agregada");
    } catch { toast.error("Error"); }
  };

  const handleUpdateCat = async () => {
    if (!editingCat) return;
    try {
      await updateCat.mutateAsync({ id: editingCat.id, nombre: editingCat.nombre, tipo: editingCat.tipo });
      setEditingCat(null);
      toast.success("Categoría actualizada");
    } catch { toast.error("Error"); }
  };

  const handleDeleteCat = async (id: string) => {
    try { await deleteCat.mutateAsync(id); toast.success("Categoría eliminada"); }
    catch { toast.error("Error al eliminar"); }
  };

  const filteredCats = (categorias || []).filter(c =>
    c.nombre.toLowerCase().includes(searchCat.toLowerCase())
  );

  const COLORS_INGRESO = ["#22c55e", "#16a34a", "#15803d", "#166534", "#14532d"];
  const COLORS_EGRESO = ["#ef4444", "#dc2626", "#b91c1c", "#991b1b", "#7f1d1d", "#f97316", "#ea580c", "#c2410c"];

  return (
    <div className="animate-fade-in">
      <PageHeader title="Finanzas" description="Panel financiero de la iglesia">
        <ExportDropdown title="Finanzas" filename="finanzas" columns={[
          { header: "Tipo", key: "tipo" }, { header: "Categoría", key: "categoria_nombre" },
          { header: "Monto", key: "monto" }, { header: "Fecha", key: "fecha" },
        ]} data={filteredData} />
      </PageHeader>

      {editing && <FinanzaFormDialog initialData={editing} onClose={() => setEditing(null)} />}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-card rounded-xl border p-5">
          <p className="text-xs font-medium text-muted-foreground mb-1">Total Ingresos</p>
          <p className="text-2xl font-bold text-emerald-600">{fmt(ingresos)}</p>
        </div>
        <div className="bg-card rounded-xl border p-5">
          <p className="text-xs font-medium text-muted-foreground mb-1">Total de egresos</p>
          <p className="text-2xl font-bold text-rose-600">{fmt(gastos)}</p>
        </div>
        <div className="bg-card rounded-xl border p-5">
          <p className="text-xs font-medium text-muted-foreground mb-1">Saldo disponible</p>
          <p className="text-2xl font-bold text-foreground">{fmt(saldo)}</p>
        </div>
      </div>

      <Tabs defaultValue="movimientos" className="space-y-4">
        <TabsList className="flex flex-wrap gap-1">
          <TabsTrigger value="movimientos">📋 Movimientos</TabsTrigger>
          <TabsTrigger value="reportes">📊 Reportes</TabsTrigger>
          <TabsTrigger value="categorias">⚙️ Administrar categorías</TabsTrigger>
        </TabsList>

        {/* TAB MOVIMIENTOS */}
        <TabsContent value="movimientos">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-1.5 text-sm">
                <span className="text-muted-foreground">📅 Periodo:</span>
                <Input type="date" value={periodoDesde} onChange={e => setPeriodoDesde(e.target.value)} className="h-7 w-36 text-xs" />
                <span className="text-muted-foreground">a</span>
                <Input type="date" value={periodoHasta} onChange={e => setPeriodoHasta(e.target.value)} className="h-7 w-36 text-xs" />
              </div>
              <div className="flex-1" />
              <FinanzaFormDialog />
            </div>

            <DataTable
              data={filteredData} searchKey="descripcion" searchPlaceholder="Buscar movimiento..."
              filterKey="tipo" filterPlaceholder="Tipo"
              filterOptions={[{ value: "Ingreso", label: "Ingresos" }, { value: "Gasto", label: "Gastos" }]}
              columns={[
                { key: "tipo", label: "Tipo", render: (f: any) => <StatusBadge status={f.tipo} /> },
                { key: "categoria_nombre", label: "Categoría", render: (f: any) => f.categoria_nombre || "—" },
                { key: "descripcion", label: "Concepto", render: (f: any) => f.descripcion || "—" },
                { key: "monto", label: "Cantidad", render: (f: any) => (
                  <span className={f.tipo === "Ingreso" ? "text-emerald-600 font-semibold" : "text-rose-600 font-semibold"}>
                    {f.tipo === "Ingreso" ? "+" : "-"}${Number(f.monto).toLocaleString()}
                  </span>
                )},
                { key: "fecha", label: "Fecha" },
                { key: "metodo_pago", label: "Método", render: (f: any) => f.metodo_pago || "—" },
                {
                  key: "actions", label: "",
                  render: (f: any) => (
                    <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditing({ ...f })}><Pencil className="h-4 w-4" /></Button>
                      <DeleteConfirmDialog onConfirm={() => handleDelete(f.id)} />
                    </div>
                  )
                },
              ]}
            />
          </div>
        </TabsContent>

        {/* TAB REPORTES */}
        <TabsContent value="reportes">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-1.5 text-sm">
                <span className="text-muted-foreground">📅 Periodo:</span>
                <Input type="date" value={periodoDesde} onChange={e => setPeriodoDesde(e.target.value)} className="h-7 w-36 text-xs" />
                <span className="text-muted-foreground">al</span>
                <Input type="date" value={periodoHasta} onChange={e => setPeriodoHasta(e.target.value)} className="h-7 w-36 text-xs" />
              </div>
              <div className="flex-1" />
              <Button variant="outline" size="sm">📄 Exportar a PDF</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Ingresos */}
              <div>
                <h3 className="font-bold text-lg text-foreground mb-3">Ingresos</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">#</th>
                        <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Categoría</th>
                        <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ingresosCats.map((cat, i) => (
                        <tr key={cat.id} className="border-t hover:bg-muted/30">
                          <td className="px-4 py-2.5">
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded text-white text-xs font-bold" style={{ backgroundColor: COLORS_INGRESO[i % COLORS_INGRESO.length] }}>
                              {i + 1}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-sm font-medium text-primary cursor-pointer hover:underline">{cat.nombre}</td>
                          <td className="px-4 py-2.5 text-sm text-right">{fmt(getCatTotal(cat.nombre))}</td>
                        </tr>
                      ))}
                      {ingresosCats.length === 0 && (
                        <tr><td colSpan={3} className="text-center py-6 text-sm text-muted-foreground">Sin categorías de ingreso</td></tr>
                      )}
                      <tr className="border-t bg-muted/30 font-bold">
                        <td colSpan={2} className="px-4 py-2.5 text-sm text-center">Total</td>
                        <td className="px-4 py-2.5 text-sm text-right">{fmt(ingresos)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Egresos */}
              <div>
                <h3 className="font-bold text-lg text-foreground mb-3">Egresos</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">#</th>
                        <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Categoría</th>
                        <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {egresosCats.map((cat, i) => (
                        <tr key={cat.id} className="border-t hover:bg-muted/30">
                          <td className="px-4 py-2.5">
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded text-white text-xs font-bold" style={{ backgroundColor: COLORS_EGRESO[i % COLORS_EGRESO.length] }}>
                              {i + 1}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-sm font-medium text-primary cursor-pointer hover:underline">{cat.nombre}</td>
                          <td className="px-4 py-2.5 text-sm text-right">{fmt(getCatTotal(cat.nombre))}</td>
                        </tr>
                      ))}
                      {egresosCats.length === 0 && (
                        <tr><td colSpan={3} className="text-center py-6 text-sm text-muted-foreground">Sin categorías de egreso</td></tr>
                      )}
                      <tr className="border-t bg-muted/30 font-bold">
                        <td colSpan={2} className="px-4 py-2.5 text-sm text-center">Total</td>
                        <td className="px-4 py-2.5 text-sm text-right">{fmt(gastos)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* TAB CATEGORIAS */}
        <TabsContent value="categorias">
          <div className="space-y-4">
            <div className="flex flex-wrap items-end gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Nombre</Label>
                <Input value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="Nombre de la categoría" className="w-56" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Tipo</Label>
                <Select value={newCatTipo} onValueChange={v => setNewCatTipo(v as any)}>
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ingreso">Ingreso</SelectItem>
                    <SelectItem value="Gasto">Gasto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddCat} disabled={createCat.isPending} className="gap-2">
                <Plus className="h-4 w-4" /> Agregar
              </Button>
              <div className="flex-1" />
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar..." value={searchCat} onChange={e => setSearchCat(e.target.value)} className="pl-9 w-48" />
              </div>
            </div>

            {loadingCats ? <Skeleton className="h-64 w-full" /> : (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Categoría</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Tipo</th>
                      <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCats.length === 0 ? (
                      <tr><td colSpan={3} className="text-center py-8 text-sm text-muted-foreground">No hay categorías</td></tr>
                    ) : filteredCats.map((cat, i) => (
                      <tr key={cat.id} className="border-t hover:bg-muted/30">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <span
                              className="inline-flex items-center justify-center w-7 h-7 rounded text-white text-xs font-bold"
                              style={{ backgroundColor: cat.tipo === "Ingreso" ? COLORS_INGRESO[i % COLORS_INGRESO.length] : COLORS_EGRESO[i % COLORS_EGRESO.length] }}
                            >
                              {i + 1}
                            </span>
                            <span className="text-sm font-medium">{cat.nombre}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={cat.tipo === "Ingreso" ? "default" : "secondary"} className="text-xs">
                            {cat.tipo}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="outline" size="sm" className="text-xs gap-1" onClick={() => setEditingCat({ ...cat })}>
                              <Pencil className="h-3 w-3" /> Editar
                            </Button>
                            <DeleteConfirmDialog onConfirm={() => handleDeleteCat(cat.id)} title="¿Eliminar categoría?" description={`Se eliminará "${cat.nombre}" permanentemente.`} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Edit Category Dialog */}
            {editingCat && (
              <Dialog open={!!editingCat} onOpenChange={() => setEditingCat(null)}>
                <DialogContent className="max-w-sm">
                  <DialogHeader><DialogTitle>Editar categoría</DialogTitle></DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Nombre</Label>
                      <Input value={editingCat.nombre} onChange={e => setEditingCat((c: any) => ({ ...c, nombre: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Tipo</Label>
                      <Select value={editingCat.tipo} onValueChange={v => setEditingCat((c: any) => ({ ...c, tipo: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Ingreso">Ingreso</SelectItem>
                          <SelectItem value="Gasto">Gasto</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setEditingCat(null)}>Cancelar</Button>
                      <Button onClick={handleUpdateCat}>Guardar</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

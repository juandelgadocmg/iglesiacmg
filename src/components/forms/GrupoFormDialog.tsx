import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Plus, ChevronsUpDown, Check, X } from "lucide-react";
import { useCreateGrupo, useUpdateGrupo, usePersonas } from "@/hooks/useDatabase";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Props { initialData?: any; onClose?: () => void; }

export default function GrupoFormDialog({ initialData, onClose }: Props) {
  const isEdit = !!initialData;
  const [open, setOpen] = useState(false);
  const [liderPopoverOpen, setLiderPopoverOpen] = useState(false);
  const [selectedLiderId, setSelectedLiderId] = useState<string>("");
  const [estado, setEstado] = useState<string>("Activo");
  const createGrupo = useCreateGrupo();
  const updateGrupo = useUpdateGrupo();
  const { data: personas } = usePersonas();

  useEffect(() => { if (initialData) { setOpen(true); setSelectedLiderId(initialData.lider_id || ""); setEstado(initialData.estado || "Activo"); } }, [initialData]);
  const handleClose = () => { setOpen(false); setSelectedLiderId(""); setEstado("Activo"); onClose?.(); };

  const selectedLiderName = useMemo(() => {
    if (!selectedLiderId || !personas) return "";
    const p = personas.find(p => p.id === selectedLiderId);
    return p ? `${p.nombres} ${p.apellidos}` : "";
  }, [selectedLiderId, personas]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const nombre = (fd.get("nombre") as string)?.trim();
    if (!nombre) { toast.error("El nombre es obligatorio"); return; }

    const ubicacion = (fd.get("ubicacion") as string) || null;

    let latitud: number | null = initialData?.latitud || null;
    let longitud: number | null = initialData?.longitud || null;
    if (ubicacion && ubicacion !== initialData?.ubicacion) {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(ubicacion)}&limit=1`);
        const results = await res.json();
        if (results && results.length > 0) {
          latitud = parseFloat(results[0].lat);
          longitud = parseFloat(results[0].lon);
        }
      } catch { /* ignore geocoding errors */ }
    }

    const payload = {
      nombre,
      tipo: (fd.get("tipo") as any),
      descripcion: (fd.get("descripcion") as string) || null,
      lider_id: selectedLiderId || null,
      dia_reunion: (fd.get("dia_reunion") as string) || null,
      hora_reunion: (fd.get("hora_reunion") as string) || null,
      ubicacion,
      red: (fd.get("red") as string) || null,
      latitud,
      longitud,
      estado,
    };

    try {
      if (isEdit) {
        await updateGrupo.mutateAsync({ id: initialData.id, ...payload });
        toast.success("Grupo actualizado");
      } else {
        await createGrupo.mutateAsync(payload);
        toast.success("Grupo creado exitosamente");
      }
      handleClose();
    } catch (err: any) {
      toast.error("Error", { description: err.message });
    }
  };

  const isPending = createGrupo.isPending || updateGrupo.isPending;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); else setOpen(true); }}>
      {!isEdit && (
        <DialogTrigger asChild>
          <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4" /> Nuevo Grupo
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{isEdit ? "Editar Grupo" : "Crear Nuevo Grupo"}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre del grupo *</Label>
            <Input id="nombre" name="nombre" required maxLength={100} defaultValue={initialData?.nombre || ""} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo *</Label>
              <Select name="tipo" defaultValue={initialData?.tipo || "Casas de paz"}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Casas de paz","Grupos encuentro"].map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Líder</Label>
              <Popover open={liderPopoverOpen} onOpenChange={setLiderPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={liderPopoverOpen}
                    className="w-full justify-between font-normal"
                  >
                    <span className="truncate">
                      {selectedLiderName || "Buscar líder..."}
                    </span>
                    <div className="flex items-center gap-1 ml-1 shrink-0">
                      {selectedLiderId && (
                        <X
                          className="h-3.5 w-3.5 opacity-50 hover:opacity-100"
                          onClick={(e) => { e.stopPropagation(); setSelectedLiderId(""); }}
                        />
                      )}
                      <ChevronsUpDown className="h-4 w-4 opacity-50" />
                    </div>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Buscar persona..." />
                    <CommandList>
                      <CommandEmpty>No se encontró ninguna persona.</CommandEmpty>
                      <CommandGroup className="max-h-[200px] overflow-y-auto">
                        {(personas || []).map(p => (
                          <CommandItem
                            key={p.id}
                            value={`${p.nombres} ${p.apellidos}`}
                            onSelect={() => {
                              setSelectedLiderId(p.id);
                              setLiderPopoverOpen(false);
                            }}
                          >
                            <Check className={cn("mr-2 h-4 w-4", selectedLiderId === p.id ? "opacity-100" : "opacity-0")} />
                            {p.nombres} {p.apellidos}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dia_reunion">Día de reunión</Label>
              <Select name="dia_reunion" defaultValue={initialData?.dia_reunion || ""}>
                <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                <SelectContent>
                  {["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"].map(d => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="hora_reunion">Hora</Label>
              <Input id="hora_reunion" name="hora_reunion" type="time" defaultValue={initialData?.hora_reunion || ""} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ubicacion">Ubicación</Label>
              <Input id="ubicacion" name="ubicacion" maxLength={255} defaultValue={initialData?.ubicacion || ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="red">Red</Label>
              <Select name="red" defaultValue={initialData?.red || ""}>
                <SelectTrigger><SelectValue placeholder="Seleccionar red" /></SelectTrigger>
                <SelectContent>
                  {["Nissi","Rohi","Jireh","Adonai","Shaddai","Elohim"].map(r => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea id="descripcion" name="descripcion" maxLength={500} rows={3} defaultValue={initialData?.descripcion || ""} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={handleClose}>Cancelar</Button>
            <Button type="submit" disabled={isPending}>{isPending ? "Guardando..." : isEdit ? "Actualizar" : "Guardar Grupo"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { UserPlus, Search, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type TipoMaestro = "Maestro Seminario" | "Maestro Discipulado" | "Mentor";

export default function MaestroFormDialog() {
  const [open, setOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [personas, setPersonas] = useState<{ id: string; nombres: string; apellidos: string; documento: string | null; tipo_persona: string }[]>([]);
  const [selectedPersona, setSelectedPersona] = useState<typeof personas[0] | null>(null);
  const [tipoMaestro, setTipoMaestro] = useState<TipoMaestro>("Maestro Seminario");
  const [loading, setLoading] = useState(false);
  const qc = useQueryClient();

  useEffect(() => {
    if (open) {
      supabase
        .from("personas")
        .select("id, nombres, apellidos, documento, tipo_persona")
        .order("nombres")
        .limit(2000)
        .then(({ data }) => setPersonas(data || []));
    }
  }, [open]);

  const filtered = personas.filter(p => {
    const q = search.toLowerCase();
    const full = `${p.nombres} ${p.apellidos}`.toLowerCase();
    return full.includes(q) || (p.documento || "").toLowerCase().includes(q);
  });

  const handleSubmit = async () => {
    if (!selectedPersona) {
      toast.error("Selecciona una persona existente");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase
        .from("personas")
        .update({ tipo_persona: tipoMaestro as any })
        .eq("id", selectedPersona.id);
      if (error) throw error;
      toast.success(`${selectedPersona.nombres} ${selectedPersona.apellidos} asignado como ${tipoMaestro}`);
      qc.invalidateQueries({ queryKey: ["personas"] });
      setSelectedPersona(null);
      setSearch("");
      setOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Error al asignar maestro");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setSelectedPersona(null); setSearch(""); } }}>
      <DialogTrigger asChild>
        <Button size="sm"><UserPlus className="h-4 w-4 mr-1" /> Asignar Maestro</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Asignar Maestro desde Personas</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Buscar persona existente *</Label>
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-between font-normal">
                  {selectedPersona
                    ? <span>{selectedPersona.nombres} {selectedPersona.apellidos}</span>
                    : <span className="text-muted-foreground">Buscar por nombre o documento...</span>}
                  <div className="flex items-center gap-1">
                    {selectedPersona && (
                      <X className="h-4 w-4 text-muted-foreground hover:text-foreground" onClick={(e) => { e.stopPropagation(); setSelectedPersona(null); }} />
                    )}
                    <Search className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[380px] p-0" align="start">
                <Command shouldFilter={false}>
                  <CommandInput placeholder="Nombre o documento..." value={search} onValueChange={setSearch} />
                  <CommandList className="max-h-60">
                    <CommandEmpty>No se encontró la persona</CommandEmpty>
                    <CommandGroup>
                      {filtered.slice(0, 50).map(p => (
                        <CommandItem
                          key={p.id}
                          onSelect={() => { setSelectedPersona(p); setPopoverOpen(false); }}
                          className="flex items-center justify-between"
                        >
                          <div>
                            <span className="font-medium">{p.nombres} {p.apellidos}</span>
                            {p.documento && <span className="text-xs text-muted-foreground ml-2">({p.documento})</span>}
                            <span className="text-xs text-muted-foreground ml-2">· {p.tipo_persona}</span>
                          </div>
                          {selectedPersona?.id === p.id && <Check className="h-4 w-4 text-primary" />}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Tipo de maestro</Label>
            <Select value={tipoMaestro} onValueChange={(v) => setTipoMaestro(v as TipoMaestro)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Maestro Seminario">Maestro Seminario</SelectItem>
                <SelectItem value="Maestro Discipulado">Maestro Discipulado</SelectItem>
                <SelectItem value="Mentor">Mentor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={loading || !selectedPersona}>
              {loading ? "Guardando..." : "Asignar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { useState, useMemo, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";

interface Props {
  personas: any[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
}

export default function MaestroSearchPicker({ personas, value, onChange, className }: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selected = personas.find(p => p.id === value);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return personas.filter(p => {
      const full = `${p.nombres} ${p.apellidos}`.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return !q || full.includes(q);
    }).slice(0, 60);
  }, [personas, query]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (selected && !open) {
    return (
      <div className={`flex items-center justify-between rounded-md border px-3 py-1.5 bg-background text-sm ${className || ""}`}>
        <div className="truncate">
          <span className="font-medium">{selected.nombres} {selected.apellidos}</span>
        </div>
        <button type="button" onClick={() => { onChange(""); setQuery(""); }}
          className="text-muted-foreground hover:text-destructive ml-2 shrink-0">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div ref={wrapperRef} className={`relative ${className || ""}`}>
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Buscar maestro por nombre..."
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          className="pl-8 h-8 text-xs"
          autoComplete="off"
        />
      </div>
      {open && (
        <div className="absolute z-50 w-full mt-1 rounded-md border bg-popover shadow-lg max-h-52 overflow-y-auto">
          <div
            className="px-3 py-2 cursor-pointer hover:bg-muted/60 text-xs text-muted-foreground italic"
            onMouseDown={() => { onChange(""); setQuery(""); setOpen(false); }}>
            Sin maestro
          </div>
          {filtered.length === 0 ? (
            <div className="px-3 py-3 text-xs text-center text-muted-foreground">Sin resultados</div>
          ) : filtered.map(p => (
            <div key={p.id}
              className="flex items-center gap-2 px-3 py-1.5 cursor-pointer hover:bg-muted/60 text-xs"
              onMouseDown={() => { onChange(p.id); setQuery(""); setOpen(false); }}>
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[9px] font-bold text-primary shrink-0">
                {p.nombres?.[0]}{p.apellidos?.[0]}
              </div>
              <span className="truncate">{p.nombres} {p.apellidos}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

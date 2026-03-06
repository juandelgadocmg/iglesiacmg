import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

interface DataTableProps<T> {
  data: T[];
  columns: { key: string; label: string; render?: (item: T) => React.ReactNode }[];
  searchKey?: string;
  searchPlaceholder?: string;
  filterKey?: string;
  filterOptions?: { value: string; label: string }[];
  filterPlaceholder?: string;
  onRowClick?: (item: T) => void;
}

export default function DataTable<T extends Record<string, any>>({
  data, columns, searchKey, searchPlaceholder = "Buscar...",
  filterKey, filterOptions, filterPlaceholder = "Filtrar",
  onRowClick
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(0);
  const perPage = 10;

  let filtered = data;
  if (search && searchKey) {
    filtered = filtered.filter(item =>
      String(item[searchKey]).toLowerCase().includes(search.toLowerCase())
    );
  }
  if (filter !== "all" && filterKey) {
    filtered = filtered.filter(item => String(item[filterKey]) === filter);
  }

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice(page * perPage, (page + 1) * perPage);

  return (
    <div className="bg-card rounded-lg border">
      {/* Toolbar */}
      <div className="p-4 border-b flex flex-col sm:flex-row gap-3">
        {searchKey && (
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(0); }}
              className="pl-9 h-9 bg-muted/30 border-0"
            />
          </div>
        )}
        {filterKey && filterOptions && (
          <Select value={filter} onValueChange={v => { setFilter(v); setPage(0); }}>
            <SelectTrigger className="w-48 h-9">
              <SelectValue placeholder={filterPlaceholder} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {filterOptions.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              {columns.map(col => (
                <th key={col.key} className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr><td colSpan={columns.length} className="px-4 py-12 text-center text-muted-foreground">No se encontraron resultados</td></tr>
            ) : (
              paged.map((item, i) => (
                <tr
                  key={i}
                  className="border-b last:border-0 hover:bg-muted/20 transition-colors cursor-pointer"
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map(col => (
                    <td key={col.key} className="px-4 py-3">
                      {col.render ? col.render(item) : String(item[col.key] ?? "")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 border-t flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Mostrando {page * perPage + 1}-{Math.min((page + 1) * perPage, filtered.length)} de {filtered.length}
          </span>
          <div className="flex gap-1">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="px-3 py-1 rounded border hover:bg-muted disabled:opacity-40">Anterior</button>
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="px-3 py-1 rounded border hover:bg-muted disabled:opacity-40">Siguiente</button>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useMemo, useEffect } from "react";
import PageHeader from "@/components/shared/PageHeader";
import MetricCard from "@/components/shared/MetricCard";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useGruposMap, GrupoMapItem } from "@/hooks/useGruposMap";
import { MapPin, Search, Users, MapPinOff, Layers, Eye } from "lucide-react";

const TIPO_COLORS: Record<string, string> = {
  "Células": "#2563eb",
  "Jóvenes": "#7c3aed",
  "Mujeres": "#db2777",
  "Hombres": "#059669",
  "Niños": "#f59e0b",
  "Alabanza": "#6366f1",
  "Ujieres": "#64748b",
  "Liderazgo": "#dc2626",
  "Discipulado": "#0891b2",
};

function LeafletMap({ grupos, showCoverage }: { grupos: GrupoMapItem[]; showCoverage: boolean }) {
  const mapId = "leaflet-map-container";

  useEffect(() => {
    let map: any = null;
    let L: any = null;

    const initMap = async () => {
      // Dynamic import to avoid SSR issues
      L = await import("leaflet");
      await import("leaflet/dist/leaflet.css");

      // Fix default marker icons
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      const container = document.getElementById(mapId);
      if (!container) return;
      // Clean up any existing map instance
      if ((container as any)._leaflet_id) {
        (container as any)._leaflet_id = null;
        container.innerHTML = "";
      }

      const center: [number, number] = grupos.length > 0
        ? [
            grupos.reduce((s, g) => s + g.latitud!, 0) / grupos.length,
            grupos.reduce((s, g) => s + g.longitud!, 0) / grupos.length,
          ]
        : [4.711, -74.0721];

      map = L.map(mapId).setView(center, 12);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      grupos.forEach((g) => {
        const color = TIPO_COLORS[g.tipo] || "#6b7280";
        const icon = L.divIcon({
          className: "custom-map-marker",
          html: `<div style="background:${color};width:28px;height:28px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;"><svg width="14" height="14" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg></div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
          popupAnchor: [0, -14],
        });

        const marker = L.marker([g.latitud!, g.longitud!], { icon }).addTo(map);
        marker.bindPopup(`
          <div style="min-width:200px">
            <h3 style="font-weight:600;font-size:14px;margin:0">${g.nombre}</h3>
            <p style="color:#6b7280;font-size:12px;margin:2px 0">${g.tipo}</p>
            ${g.lider_nombre ? `<p style="font-size:12px;margin:4px 0"><b>Líder:</b> ${g.lider_nombre}</p>` : ""}
            <p style="font-size:12px;margin:2px 0"><b>Miembros:</b> ${g.miembros_count}</p>
            ${g.dia_reunion ? `<p style="font-size:12px;margin:2px 0"><b>Reunión:</b> ${g.dia_reunion}${g.hora_reunion ? ` - ${g.hora_reunion}` : ""}</p>` : ""}
            ${g.ubicacion ? `<p style="font-size:12px;color:#6b7280;margin:4px 0">${g.ubicacion}</p>` : ""}
          </div>
        `);

        if (showCoverage) {
          L.circle([g.latitud!, g.longitud!], {
            radius: 500,
            color,
            fillColor: color,
            fillOpacity: 0.12,
            weight: 1,
          }).addTo(map);
        }
      });

      // Fit bounds
      if (grupos.length > 0) {
        const bounds = L.latLngBounds(grupos.map((g) => [g.latitud!, g.longitud!] as [number, number]));
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      }

      // Force resize after render
      setTimeout(() => map?.invalidateSize(), 200);
    };

    initMap();

    return () => {
      if (map) {
        map.remove();
        map = null;
      }
    };
  }, [grupos, showCoverage]);

  return <div id={mapId} style={{ height: "100%", width: "100%" }} />;
}

export default function MapaGruposPage() {
  const { data: grupos, isLoading } = useGruposMap();
  const [search, setSearch] = useState("");
  const [showCoverage, setShowCoverage] = useState(false);

  const withCoords = useMemo(
    () => (grupos || []).filter((g) => g.latitud != null && g.longitud != null),
    [grupos]
  );
  const withoutCoords = useMemo(
    () => (grupos || []).filter((g) => g.latitud == null || g.longitud == null),
    [grupos]
  );
  const filtered = useMemo(() => {
    if (!search) return withCoords;
    const q = search.toLowerCase();
    return withCoords.filter(
      (g) =>
        g.nombre.toLowerCase().includes(q) ||
        g.lider_nombre?.toLowerCase().includes(q) ||
        g.tipo.toLowerCase().includes(q)
    );
  }, [withCoords, search]);

  return (
    <div className="space-y-6">
      <PageHeader title="Mapa de Grupos" description="Ubicación geográfica de los grupos y células" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="Total Grupos" value={grupos?.length || 0} icon={Users} />
        <MetricCard title="Con Ubicación" value={withCoords.length} icon={MapPin} variant="success" />
        <MetricCard title="Sin Ubicación" value={withoutCoords.length} icon={MapPinOff} variant="accent" />
        <MetricCard title="Mostrando" value={filtered.length} icon={Eye} variant="info" />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar grupo, líder o tipo..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={showCoverage} onCheckedChange={setShowCoverage} />
          <label className="text-sm font-medium flex items-center gap-1.5 cursor-pointer">
            <Layers className="h-4 w-4 text-muted-foreground" />
            Mostrar cobertura
          </label>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {Object.entries(TIPO_COLORS).map(([tipo, color]) => (
          <Badge key={tipo} variant="outline" className="text-xs gap-1.5 cursor-default">
            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: color }} />
            {tipo}
          </Badge>
        ))}
      </div>

      <div className="rounded-xl border bg-card overflow-hidden shadow-sm" style={{ height: "520px" }}>
        {isLoading ? (
          <div className="h-full flex items-center justify-center text-muted-foreground">Cargando mapa...</div>
        ) : filtered.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
            <MapPinOff className="h-12 w-12 opacity-40" />
            <p className="text-sm">No hay grupos con ubicación geográfica.</p>
            <p className="text-xs">Agrega latitud y longitud a los grupos para verlos en el mapa.</p>
          </div>
        ) : (
          <LeafletMap grupos={filtered} showCoverage={showCoverage} />
        )}
      </div>

      {withoutCoords.length > 0 && (
        <div className="rounded-xl border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <MapPinOff className="h-4 w-4 text-muted-foreground" />
            Grupos sin georreferencia ({withoutCoords.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {withoutCoords.map((g) => (
              <div key={g.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 text-sm">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: TIPO_COLORS[g.tipo] || "#6b7280" }} />
                <span className="truncate font-medium">{g.nombre}</span>
                <span className="text-xs text-muted-foreground ml-auto">{g.tipo}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

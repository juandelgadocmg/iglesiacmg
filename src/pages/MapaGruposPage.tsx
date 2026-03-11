import { useState, useMemo, useEffect, useRef } from "react";
import PageHeader from "@/components/shared/PageHeader";
import MetricCard from "@/components/shared/MetricCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useGruposMap, GrupoMapItem } from "@/hooks/useGruposMap";
import { MapPin, Search, Eye, Users, MapPinOff, Layers } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icons for Leaflet + bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

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

function createColorIcon(color: string) {
  return L.divIcon({
    className: "custom-map-marker",
    html: `<div style="
      background:${color};
      width:28px;height:28px;border-radius:50%;
      border:3px solid white;
      box-shadow:0 2px 6px rgba(0,0,0,0.3);
      display:flex;align-items:center;justify-content:center;
    "><svg width="14" height="14" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
}

function FitBounds({ grupos }: { grupos: GrupoMapItem[] }) {
  const map = useMap();
  useEffect(() => {
    const withCoords = grupos.filter((g) => g.latitud && g.longitud);
    if (withCoords.length > 0) {
      const bounds = L.latLngBounds(
        withCoords.map((g) => [g.latitud!, g.longitud!] as [number, number])
      );
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [grupos, map]);
  return null;
}

export default function MapaGruposPage() {
  const { data: grupos, isLoading } = useGruposMap();
  const [search, setSearch] = useState("");
  const [showCoverage, setShowCoverage] = useState(false);
  const [selectedGrupo, setSelectedGrupo] = useState<string | null>(null);

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

  const center: [number, number] = useMemo(() => {
    if (filtered.length > 0) {
      const lat = filtered.reduce((s, g) => s + g.latitud!, 0) / filtered.length;
      const lng = filtered.reduce((s, g) => s + g.longitud!, 0) / filtered.length;
      return [lat, lng];
    }
    return [4.711, -74.0721]; // Bogotá default
  }, [filtered]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mapa de Grupos"
        description="Ubicación geográfica de los grupos y células"
      />

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="Total Grupos" value={grupos?.length || 0} icon={Users} />
        <MetricCard
          title="Con Ubicación"
          value={withCoords.length}
          icon={MapPin}
          variant="success"
        />
        <MetricCard
          title="Sin Ubicación"
          value={withoutCoords.length}
          icon={MapPinOff}
          variant="accent"
        />
        <MetricCard
          title="Mostrando"
          value={filtered.length}
          icon={Eye}
          variant="info"
        />
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar grupo, líder o tipo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={showCoverage} onCheckedChange={setShowCoverage} />
          <label className="text-sm font-medium flex items-center gap-1.5 cursor-pointer">
            <Layers className="h-4 w-4 text-muted-foreground" />
            Mostrar cobertura
          </label>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(TIPO_COLORS).map(([tipo, color]) => (
          <Badge
            key={tipo}
            variant="outline"
            className="text-xs gap-1.5 cursor-default"
          >
            <span
              className="w-2.5 h-2.5 rounded-full inline-block"
              style={{ backgroundColor: color }}
            />
            {tipo}
          </Badge>
        ))}
      </div>

      {/* Map */}
      <div className="rounded-xl border bg-card overflow-hidden shadow-sm" style={{ height: "520px" }}>
        {isLoading ? (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            Cargando mapa...
          </div>
        ) : (
          <MapContainer
            center={center}
            zoom={12}
            style={{ height: "100%", width: "100%" }}
            className="z-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <FitBounds grupos={filtered} />

            {filtered.map((g) => (
              <Marker
                key={g.id}
                position={[g.latitud!, g.longitud!]}
                icon={createColorIcon(TIPO_COLORS[g.tipo] || "#6b7280")}
                eventHandlers={{
                  click: () => setSelectedGrupo(g.id),
                }}
              >
                <Popup>
                  <div className="min-w-[200px]">
                    <h3 className="font-semibold text-sm">{g.nombre}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{g.tipo}</p>
                    {g.lider_nombre && (
                      <p className="text-xs mt-1">
                        <span className="font-medium">Líder:</span> {g.lider_nombre}
                      </p>
                    )}
                    <p className="text-xs">
                      <span className="font-medium">Miembros:</span> {g.miembros_count}
                    </p>
                    {g.dia_reunion && (
                      <p className="text-xs">
                        <span className="font-medium">Reunión:</span> {g.dia_reunion}
                        {g.hora_reunion ? ` - ${g.hora_reunion}` : ""}
                      </p>
                    )}
                    {g.ubicacion && (
                      <p className="text-xs mt-1 text-gray-500">{g.ubicacion}</p>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}

            {showCoverage &&
              filtered.map((g) => (
                <Circle
                  key={`cov-${g.id}`}
                  center={[g.latitud!, g.longitud!]}
                  radius={500}
                  pathOptions={{
                    color: TIPO_COLORS[g.tipo] || "#6b7280",
                    fillColor: TIPO_COLORS[g.tipo] || "#6b7280",
                    fillOpacity: 0.12,
                    weight: 1,
                  }}
                />
              ))}
          </MapContainer>
        )}
      </div>

      {/* Groups without location */}
      {withoutCoords.length > 0 && (
        <div className="rounded-xl border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <MapPinOff className="h-4 w-4 text-muted-foreground" />
            Grupos sin georreferencia ({withoutCoords.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {withoutCoords.map((g) => (
              <div
                key={g.id}
                className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 text-sm"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: TIPO_COLORS[g.tipo] || "#6b7280" }}
                />
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

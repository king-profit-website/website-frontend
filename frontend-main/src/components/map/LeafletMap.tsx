"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet icon issue with webpack
const goldIcon = new L.Icon({
  iconUrl: "data:image/svg+xml;charset=utf-8," + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
      <ellipse cx="16" cy="38" rx="6" ry="2" fill="rgba(0,0,0,0.2)"/>
      <path d="M16 0C7.163 0 0 7.163 0 16c0 12 16 24 16 24S32 28 32 16C32 7.163 24.837 0 16 0z" fill="#C9A84C"/>
      <circle cx="16" cy="16" r="9" fill="#102820"/>
      <text x="16" y="21" font-family="serif" font-size="10" font-weight="bold" fill="#E8C96C" text-anchor="middle">MD</text>
    </svg>
  `),
  iconSize: [32, 40],
  iconAnchor: [16, 40],
  popupAnchor: [0, -40],
});

interface Props {
  partners: any[];
  onSelect: (p: any) => void;
}

function FlyTo({ partners }: { partners: any[] }) {
  const map = useMap();
  useEffect(() => {
    if (partners.length > 0) {
      const bounds = L.latLngBounds(partners.map(p => [p.latitude, p.longitude]));
      map.flyToBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [partners, map]);
  return null;
}

export default function LeafletMap({ partners, onSelect }: Props) {
  const defaultCenter: [number, number] = [50.4501, 30.5234]; // Kyiv

  return (
    <MapContainer
      center={defaultCenter}
      zoom={12}
      style={{ height: "100%", width: "100%" }}
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {partners.length > 0 && <FlyTo partners={partners} />}
      {partners.map((p) => (
        <Marker
          key={p.id}
          position={[p.latitude, p.longitude]}
          icon={goldIcon}
          eventHandlers={{ click: () => onSelect(p) }}
        >
          <Popup>
            <div className="text-sm font-semibold">{p.company_name}</div>
            <div className="text-xs text-gray-500">{p.category}</div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

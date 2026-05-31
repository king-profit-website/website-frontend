"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { SlidersHorizontal, MapPin, Navigation } from "lucide-react";
import api from "@/lib/api";

const Map = dynamic(() => import("@/components/map/LeafletMap"), { ssr: false });

const CATEGORIES = ["Всі", "Ресторан", "Кафе", "Магазин", "Краса", "Фітнес", "Розваги"];

export default function MapPage() {
  const [partners, setPartners] = useState<any[]>([]);
  const [category, setCategory] = useState("Всі");
  const [selected, setSelected] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get("/partner/list?limit=100")
      .then(r => setPartners(r.data))
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = category === "Всі"
    ? partners
    : partners.filter(p => p.category === category);

  const mapPartners = filtered.filter(p => p.latitude && p.longitude);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100dvh" }}>
      {/* Header overlay on map */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, zIndex: 30,
        padding: "12px 16px",
        background: "linear-gradient(to bottom, rgba(16,40,32,0.92) 70%, transparent)",
        backdropFilter: "blur(8px)",
      }}>
        {/* Only visible on mobile where sidebar isn't shown */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", fontWeight: 700, color: "#F9F5E8", lineHeight: 1 }}>
              Карта партнерів
            </h1>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, marginTop: 3 }}>
              <MapPin size={11} style={{ display: "inline", marginRight: 3 }} />
              {mapPartners.length} на карті
            </p>
          </div>
          <button
            aria-label="Фільтри"
            style={{
              width: 38, height: 38, borderRadius: 12,
              background: "rgba(201,168,76,0.15)", border: "1px solid rgba(201,168,76,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "#C9A84C",
            }}
          >
            <SlidersHorizontal size={17} />
          </button>
        </div>

        {/* Category pills */}
        <div style={{ display: "flex", gap: 8, overflowX: "auto" }} className="scrollbar-none">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              style={{
                flexShrink: 0, padding: "5px 14px", borderRadius: 999,
                fontSize: 12, fontWeight: 500, border: "none", cursor: "pointer",
                background: category === cat
                  ? "linear-gradient(135deg, #C9A84C, #E8C96C)"
                  : "rgba(255,255,255,0.08)",
                color: category === cat ? "#102820" : "rgba(255,255,255,0.7)",
                boxShadow: category === cat ? "0 2px 10px rgba(201,168,76,0.4)" : "none",
                transition: "all 0.18s",
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Map fills entire area */}
      <div style={{ flex: 1, position: "relative" }}>
        {isLoading ? (
          <div className="skeleton" style={{ height: "100%", borderRadius: 0 }} />
        ) : (
          <Map partners={mapPartners} onSelect={setSelected} />
        )}
      </div>

      {/* Selected partner bottom sheet */}
      {selected && (
        <div style={{
          position: "absolute", bottom: 80, left: 16, right: 16, zIndex: 50,
          animation: "slideUp 0.3s ease-out",
        }}>
          <div className="card" style={{ padding: "14px 16px", boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{
                width: 46, height: 46, borderRadius: 14, flexShrink: 0,
                background: "linear-gradient(135deg, #102820, #1A4A38)",
                border: "1px solid rgba(201,168,76,0.25)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 22,
              }}>
                🏪
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 600, fontSize: 15, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {selected.company_name}
                </p>
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 3, display: "flex", alignItems: "center", gap: 4 }}>
                  <MapPin size={11} color="#C9A84C" />
                  {selected.category} • {selected.address}
                </p>
              </div>
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <button
                  aria-label="Маршрут"
                  style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: "linear-gradient(135deg, #C9A84C, #E8C96C)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", border: "none",
                  }}
                >
                  <Navigation size={15} color="#102820" />
                </button>
                <button
                  onClick={() => setSelected(null)}
                  style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: "var(--bg-card-alt)", border: "1px solid var(--border)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", color: "var(--text-muted)", fontSize: 16,
                  }}
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Home, MapPin, Users, UserCircle, Coins,
  BarChart3, LogOut, Settings, ChevronRight
} from "lucide-react";
import { useAuthStore } from "@/lib/store";
import ThemeToggle from "@/components/ThemeToggle";

const NAV = [
  { href: "/app/home",     icon: Home,       label: "Головна" },
  { href: "/app/map",      icon: MapPin,      label: "Карта" },
  { href: "/app/partners", icon: Users,       label: "Партнери" },
  { href: "/app/profile",  icon: UserCircle,  label: "Профіль" },
];

const PARTNER_NAV = [
  { href: "/partner/dashboard", icon: BarChart3, label: "B2B Кабінет" },
];

const LEVEL_COLOR: Record<string, string> = {
  Silver: "#9E9E9E",
  Gold: "#C9A84C",
  Platinum: "#78909C",
  Diamond: "#42A5F5",
};

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.replace("/auth");
  };

  return (
    <aside className="app-sidebar" aria-label="Навігація">
      {/* Logo */}
      <div style={{ padding: "24px 20px 16px" }}>
        <Link href="/app/home" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
          <div style={{
            width: 44, height: 44,
            borderRadius: 14,
            background: "linear-gradient(135deg, #C9A84C, #E8C96C)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 16px rgba(201,168,76,0.35)",
            flexShrink: 0,
          }}>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "#102820" }}>P</span>
          </div>
          <div>
            <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 20, color: "#F9F5E8", lineHeight: 1 }}>PROFIT</p>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>Loyalty Ecosystem</p>
          </div>
        </Link>
      </div>

      {/* User card */}
      {user && (
        <div style={{ margin: "0 12px 12px", padding: "14px", background: "rgba(201,168,76,0.07)", borderRadius: 14, border: "1px solid rgba(201,168,76,0.12)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12, flexShrink: 0,
              background: "linear-gradient(135deg, #C9A84C, #E8C96C)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: "#102820" }}>
                {user.first_name?.[0]}{user.last_name?.[0]}
              </span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ color: "#F9F5E8", fontWeight: 600, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user.first_name} {user.last_name}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                <span style={{
                  background: `linear-gradient(135deg, ${LEVEL_COLOR[user.level] || "#9E9E9E"}, ${LEVEL_COLOR[user.level] || "#BDBDBD"})`,
                  color: user.level === "Gold" ? "#102820" : "white",
                  fontSize: 10, fontWeight: 700,
                  padding: "2px 8px", borderRadius: 999,
                }}>
                  {user.level}
                </span>
                <span style={{ fontSize: 11, color: "#C9A84C", fontWeight: 600 }}>
                  {Number(user.md_balance).toLocaleString("uk-UA")} MD
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Divider */}
      <div style={{ height: 1, background: "rgba(201,168,76,0.08)", margin: "4px 12px 8px" }} />

      {/* Main nav */}
      <nav style={{ flex: 1, padding: "4px 0" }}>
        <p style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.25)", letterSpacing: "0.08em", textTransform: "uppercase", padding: "6px 20px 6px" }}>
          Навігація
        </p>
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href);
          return (
            <Link key={href} href={href} className={`sidebar-item ${active ? "active" : ""}`}>
              <Icon size={18} className="sidebar-icon" strokeWidth={active ? 2.5 : 1.8} />
              <span>{label}</span>
              {active && <ChevronRight size={14} style={{ marginLeft: "auto", opacity: 0.5 }} />}
            </Link>
          );
        })}

        {/* Partner section */}
        {user?.role === "partner" && (
          <>
            <div style={{ height: 1, background: "rgba(201,168,76,0.08)", margin: "8px 12px" }} />
            <p style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.25)", letterSpacing: "0.08em", textTransform: "uppercase", padding: "6px 20px 6px" }}>
              Партнер
            </p>
            {PARTNER_NAV.map(({ href, icon: Icon, label }) => {
              const active = pathname.startsWith(href);
              return (
                <Link key={href} href={href} className={`sidebar-item ${active ? "active" : ""}`}>
                  <Icon size={18} className="sidebar-icon" strokeWidth={active ? 2.5 : 1.8} />
                  <span>{label}</span>
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* Bottom actions */}
      <div style={{ padding: "8px 0 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ height: 1, background: "rgba(201,168,76,0.08)", margin: "0 12px 8px" }} />
        
        {/* Theme Toggle Button */}
        <div style={{ padding: "0 20px", display: "flex", justifyContent: "flex-start" }}>
          <ThemeToggle />
        </div>

        <button
          onClick={handleLogout}
          className="sidebar-item"
          style={{ width: "100%", background: "none", border: "none", textAlign: "left", cursor: "pointer", color: "rgba(239,68,68,0.7)" }}
        >
          <LogOut size={17} />
          <span>Вийти</span>
        </button>
      </div>
    </aside>
  );
}

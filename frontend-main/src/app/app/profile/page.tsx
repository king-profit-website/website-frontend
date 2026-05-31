"use client";

import { useEffect, useState } from "react";
import {
  Copy, Check, LogOut, Moon, Sun,
  Users, Coins, Share2, QrCode,
  ChevronRight, ArrowUpRight, ArrowDownLeft,
  Repeat2, Zap, Award, Star, BarChart3
} from "lucide-react";
import { useAuthStore } from "@/lib/store";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const QRCode = dynamic(() => import("qrcode.react").then(m => m.QRCodeSVG), { ssr: false });

const LEVEL_XP: Record<string, [number, number]> = {
  Silver: [0, 500], Gold: [500, 1500], Platinum: [1500, 3000], Diamond: [3000, 3000],
};
const LEVEL_COLORS: Record<string, string> = {
  Silver: "level-silver", Gold: "level-gold", Platinum: "level-platinum", Diamond: "level-diamond",
};
const LEVEL_NEXT: Record<string, string | null> = {
  Silver: "Gold", Gold: "Platinum", Platinum: "Diamond", Diamond: null,
};

const TXN_ICONS: Record<string, { icon: React.ReactNode; color: string }> = {
  earn:           { icon: <ArrowUpRight  size={16} />, color: "#10B981" },
  spend:          { icon: <ArrowDownLeft size={16} />, color: "#EF4444" },
  wheel:          { icon: <Repeat2       size={16} />, color: "#8B5CF6" },
  referral:       { icon: <Users         size={16} />, color: "#3B82F6" },
  quest:          { icon: <Zap           size={16} />, color: "#F59E0B" },
  partner_charge: { icon: <ArrowUpRight  size={16} />, color: "#10B981" },
  partner_deduct: { icon: <ArrowDownLeft size={16} />, color: "#EF4444" },
};

export default function ProfilePage() {
  const { user, logout, theme, setTheme, fetchMe } = useAuthStore();
  const router = useRouter();
  const [referral, setReferral]         = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [copied, setCopied]             = useState(false);
  const [showQR, setShowQR]             = useState(false);

  useEffect(() => {
    Promise.all([
      api.get("/user/referral"),
      api.get("/user/transactions?limit=15"),
    ]).then(([r, t]) => {
      setReferral(r.data);
      setTransactions(t.data);
    }).catch(() => {});
  }, []);

  const copyRef = () => {
    if (referral?.referral_link) {
      navigator.clipboard.writeText(referral.referral_link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const handleLogout = () => {
    logout();
    router.replace("/auth");
  };

  const level = user?.level || "Silver";
  const xp    = user?.xp   || 0;
  const [xpMin, xpMax] = LEVEL_XP[level] || [0, 500];
  const xpPct = xpMax > xpMin ? Math.min(100, ((xp - xpMin) / (xpMax - xpMin)) * 100) : 100;
  const nextLevel = LEVEL_NEXT[level];

  return (
    <div style={{ animation: "fadeIn 0.4s ease-out" }}>

      {/* Header */}
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.5rem, 4vw, 2rem)", fontWeight: 700, color: "#F9F5E8" }}>
            Профіль
          </h1>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Змінити тему"
              style={{
                width: 40, height: 40, borderRadius: 12,
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: "#C9A84C",
              }}
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={handleLogout}
              aria-label="Вийти"
              style={{
                width: 40, height: 40, borderRadius: 12,
                background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: "#EF4444",
              }}
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* Avatar card */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{
            width: 72, height: 72, borderRadius: 22, flexShrink: 0, position: "relative",
            background: "linear-gradient(135deg, #C9A84C, #E8C96C)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 6px 24px rgba(201,168,76,0.35)",
          }}>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 28, color: "#102820" }}>
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </span>
            <div style={{
              position: "absolute", bottom: -6, right: -6,
              background: "#0D1F1C", border: "2px solid #1A4A38",
              borderRadius: 10, padding: "2px 8px",
            }}>
              <span className={`level-badge ${LEVEL_COLORS[level]}`} style={{ fontSize: 10 }}>{level}</span>
            </div>
          </div>

          <div>
            <p style={{ color: "#F9F5E8", fontWeight: 700, fontSize: 20, lineHeight: 1.2 }}>
              {user?.first_name} {user?.last_name}
            </p>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginTop: 4 }}>{user?.phone}</p>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
              <span style={{ color: "#C9A84C", fontSize: 13, fontWeight: 600 }}>{xp} XP</span>
              {nextLevel && (
                <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 11 }}>→ {LEVEL_XP[nextLevel][0] - xp} до {nextLevel}</span>
              )}
            </div>
            <div className="xp-bar" style={{ marginTop: 8, width: 180 }}>
              <div className="xp-bar-fill" style={{ width: `${xpPct}%` }} />
            </div>
          </div>
        </div>

        {/* Partner CTA */}
        {user?.role === "partner" && (
          <button
            onClick={() => router.push("/partner/dashboard")}
            className="btn-gold"
            style={{ width: "100%", marginTop: 20 }}
          >
            <BarChart3 size={18} />
            Відкрити Партнерський Кабінет
          </button>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: "16px 16px 0" }}>

        {/* Desktop 2-col */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16, alignItems: "start" }}>

          {/* LEFT */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Stats row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              {[
                { icon: Coins, label: "MD Баланс", value: Number(user?.md_balance || 0).toLocaleString("uk-UA"), color: "#C9A84C" },
                { icon: Star,  label: "XP",        value: xp.toLocaleString(),                                     color: "#8B5CF6" },
                { icon: Users, label: "Запрошено", value: referral?.invited_count ?? "—",                          color: "#3B82F6" },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="card" style={{ padding: 14, textAlign: "center" }}>
                  <div className="icon-box icon-box-sm" style={{ background: `${color}15`, border: `1px solid ${color}20`, margin: "0 auto 8px" }}>
                    <Icon size={16} color={color} />
                  </div>
                  <p style={{ fontWeight: 700, fontSize: 16, color: "var(--text-primary)" }}>{value}</p>
                  <p style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>{label}</p>
                </div>
              ))}
            </div>

            {/* Referral */}
            <div className="card" style={{ padding: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div className="icon-box icon-box-md icon-box-gold">
                  <Users size={20} color="#C9A84C" />
                </div>
                <div>
                  <p style={{ fontWeight: 600, fontSize: 14, color: "var(--text-primary)" }}>Реферальна програма</p>
                  <p style={{ fontSize: 12, color: "var(--text-muted)" }}>+{referral?.bonus_per_referral || 100} MD за кожного друга</p>
                </div>
              </div>

              {/* Link block */}
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                background: "var(--bg-card-alt)", border: "1px solid var(--border)",
                borderRadius: 12, padding: "10px 12px", marginBottom: 12,
              }}>
                <code style={{ flex: 1, fontSize: 12, color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {referral?.referral_link || "Завантаження..."}
                </code>
                <button onClick={() => setShowQR(!showQR)} title="QR-код" style={{ background: "none", border: "none", cursor: "pointer", color: "#C9A84C", display: "flex" }}>
                  <QrCode size={17} />
                </button>
                <button onClick={copyRef} title="Копіювати" style={{ background: "none", border: "none", cursor: "pointer", display: "flex", color: copied ? "#10B981" : "#C9A84C" }}>
                  {copied ? <Check size={17} /> : <Copy size={17} />}
                </button>
              </div>

              {showQR && referral?.referral_link && (
                <div style={{ display: "flex", justifyContent: "center", padding: 16, background: "#fff", borderRadius: 12, marginBottom: 12 }}>
                  <QRCode value={referral.referral_link} size={160} />
                </div>
              )}

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, fontSize: 13 }}>
                <span style={{ color: "var(--text-muted)" }}>
                  Запрошено: <strong style={{ color: "var(--text-primary)" }}>{referral?.invited_count || 0}</strong>
                </span>
                <span style={{ color: "#C9A84C", fontWeight: 600 }}>
                  Зароблено: {((referral?.invited_count || 0) * (referral?.bonus_per_referral || 100)).toLocaleString()} MD
                </span>
              </div>

              <button
                onClick={() => navigator.share?.({ url: referral?.referral_link, title: "PROFIT" }).catch(copyRef)}
                className="btn-outline"
                style={{ width: "100%" }}
              >
                <Share2 size={15} /> Поділитись
              </button>
            </div>

            {/* Personal info */}
            <div className="card" style={{ padding: 18 }}>
              <p style={{ fontWeight: 600, fontSize: 14, color: "var(--text-primary)", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                <Award size={16} color="#C9A84C" />
                Особисті дані
              </p>
              {[
                { label: "Ім'я",             value: `${user?.first_name} ${user?.last_name}` },
                { label: "Телефон",          value: user?.phone || "—" },
                { label: "Вік",              value: user?.age ? `${user.age} р.` : "—" },
                { label: "Реферальний код",  value: user?.referral_code || "—" },
                { label: "Роль",             value: user?.role === "partner" ? "👔 Партнер" : "👤 Клієнт" },
                { label: "Рівень",           value: `⭐ ${level}` },
              ].map(({ label, value }) => (
                <div key={label} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "10px 0", borderBottom: "1px solid var(--border)",
                }}>
                  <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{label}</span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — Transactions */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <p className="section-title">
                <Coins size={16} color="#C9A84C" />
                Історія транзакцій
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {transactions.length > 0
                ? transactions.map(t => <TransactionRow key={t.id} txn={t} />)
                : (
                  <div style={{ textAlign: "center", padding: "40px 0" }}>
                    <div className="icon-box icon-box-xl icon-box-gold" style={{ margin: "0 auto 16px" }}>
                      <Coins size={32} color="#C9A84C" />
                    </div>
                    <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Транзакцій ще немає</p>
                  </div>
                )
              }
            </div>
          </div>
        </div>
      </div>

      <div style={{ height: 24 }} />
    </div>
  );
}

function TransactionRow({ txn }: { txn: any }) {
  const isPlus  = Number(txn.amount) > 0;
  const cfg     = TXN_ICONS[txn.type] || { icon: <Coins size={16} />, color: "#C9A84C" };

  return (
    <div className="card" style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }}>
      <div className="icon-box icon-box-md" style={{ background: `${cfg.color}15`, border: `1px solid ${cfg.color}25`, flexShrink: 0 }}>
        <span style={{ color: cfg.color }}>{cfg.icon}</span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {txn.description || txn.type}
        </p>
        <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
          {new Date(txn.created_at).toLocaleDateString("uk-UA", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
      <span style={{ fontSize: 14, fontWeight: 700, color: isPlus ? "#10B981" : "#EF4444", flexShrink: 0 }}>
        {isPlus ? "+" : ""}{Number(txn.amount).toLocaleString("uk-UA")} MD
      </span>
    </div>
  );
}

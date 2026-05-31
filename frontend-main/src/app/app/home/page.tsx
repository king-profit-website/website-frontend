"use client";

import { useEffect, useState } from "react";
import {
  Bell, FileText, ChevronRight, Gift, Coins,
  Star, Zap, TrendingUp, Sparkles, Clock
} from "lucide-react";
import { useAuthStore } from "@/lib/store";
import api from "@/lib/api";
import dynamic from "next/dynamic";

const WheelCanvas = dynamic(() => import("@/components/wheel/WheelCanvas"), { ssr: false });

const LEVEL_XP: Record<string, [number, number]> = {
  Silver:   [0,    500],
  Gold:     [500,  1500],
  Platinum: [1500, 3000],
  Diamond:  [3000, 3000],
};

const LEVEL_COLORS: Record<string, string> = {
  Silver:   "level-silver",
  Gold:     "level-gold",
  Platinum: "level-platinum",
  Diamond:  "level-diamond",
};

const LEVEL_NEXT: Record<string, string | null> = {
  Silver: "Gold", Gold: "Platinum", Platinum: "Diamond", Diamond: null,
};

export default function HomePage() {
  const { user, fetchMe } = useAuthStore();
  const [wheelStatus, setWheelStatus] = useState<any>(null);
  const [quests, setQuests] = useState<any[]>([]);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [wheelLoading, setWheelLoading] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [ws, qs, ps] = await Promise.all([
        api.get("/wheel/status"),
        api.get("/user/quests"),
        api.get("/partner/list?limit=6"),
      ]);
      setWheelStatus(ws.data);
      setQuests(qs.data.slice(0, 4));
      setPromotions(ps.data);
    } catch {}
  };

  const handleSpin = async (paid: boolean) => {
    setWheelLoading(true);
    try {
      const { data } = await api.post(`/wheel/spin?paid=${paid}`);
      await fetchMe();
      await fetchData();
      return { winning_index: data.winning_index, result_md: Number(data.result_md) };
    } finally {
      setWheelLoading(false);
    }
  };

  const level = user?.level || "Silver";
  const xp    = user?.xp   || 0;
  const [xpMin, xpMax] = LEVEL_XP[level] || [0, 500];
  const xpPct  = xpMax > xpMin ? Math.min(100, ((xp - xpMin) / (xpMax - xpMin)) * 100) : 100;
  const nextLevel = LEVEL_NEXT[level];

  return (
    <div style={{ animation: "fadeIn 0.4s ease-out" }}>

      {/* ── Hero Header ────────────────────────────────────────────────────────── */}
      <div className="page-header" style={{ position: "relative", overflow: "hidden" }}>
        {/* Decorative glow */}
        <div style={{
          position: "absolute", top: -40, right: -40,
          width: 200, height: 200,
          background: "rgba(201,168,76,0.08)",
          borderRadius: "50%", pointerEvents: "none",
        }} />

        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
          {/* Avatar + greeting */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 16, flexShrink: 0,
              background: "linear-gradient(135deg, #C9A84C, #E8C96C)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 16px rgba(201,168,76,0.3)",
            }}>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "#102820" }}>
                {user?.first_name?.[0] || "U"}
              </span>
            </div>
            <div>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, marginBottom: 2 }}>Вітаємо,</p>
              <p style={{ color: "#F9F5E8", fontWeight: 600, fontSize: 16 }}>
                {user?.first_name} {user?.last_name}
              </p>
              <span className={`level-badge ${LEVEL_COLORS[level]}`} style={{ marginTop: 4, display: "inline-flex" }}>
                {level}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <button
              aria-label="Сповіщення"
              style={{
                width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center",
                justifyContent: "center", cursor: "pointer", position: "relative", color: "rgba(255,255,255,0.7)",
              }}
            >
              <Bell size={18} strokeWidth={1.8} />
              <span style={{
                position: "absolute", top: 8, right: 8, width: 7, height: 7,
                background: "#C9A84C", borderRadius: "50%", border: "1.5px solid #1A4A38",
              }} />
            </button>
            <button
              aria-label="Звіти"
              style={{
                width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center",
                justifyContent: "center", cursor: "pointer", color: "rgba(255,255,255,0.7)",
              }}
            >
              <FileText size={18} strokeWidth={1.8} />
            </button>
          </div>
        </div>

        {/* Balance */}
        <div style={{ textAlign: "center", padding: "24px 0 16px" }}>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
            Ваш баланс
          </p>
          <p className="balance-value" style={{ fontSize: "clamp(2.5rem, 8vw, 3.5rem)" }}>
            {Number(user?.md_balance || 0).toLocaleString("uk-UA")}
          </p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 6 }}>
            <div style={{
              width: 20, height: 20, borderRadius: "50%",
              background: "linear-gradient(135deg, #C9A84C, #E8C96C)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ fontSize: 10, fontWeight: 800, color: "#102820" }}>M</span>
            </div>
            <span style={{ color: "#C9A84C", fontWeight: 600, fontSize: 14 }}>MD токени</span>
          </div>
        </div>

        {/* XP Progress */}
        <div style={{ marginTop: 4 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Star size={14} color="#C9A84C" />
              <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>
                {xp} XP
              </span>
            </div>
            {nextLevel && (
              <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 11 }}>
                {LEVEL_XP[nextLevel][0] - xp} XP до {nextLevel}
              </span>
            )}
          </div>
          <div className="xp-bar">
            <div className="xp-bar-fill" style={{ width: `${xpPct}%` }} />
          </div>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────────────────────── */}
      <div style={{ padding: "16px 16px 0" }}>

        {/* Desktop: 2-col grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 16,
          alignItems: "start",
        }}>

          {/* LEFT COLUMN */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Special Offers */}
            <section>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <p className="section-title">
                  <Sparkles size={16} color="#C9A84C" />
                  Спеціальні пропозиції
                </p>
                <button className="btn-outline" style={{ padding: "4px 12px", fontSize: 12 }}>
                  Всі <ChevronRight size={13} />
                </button>
              </div>

              {promotions.length > 0 ? (
                <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 4 }} className="scrollbar-none">
                  {promotions.map((p: any, i: number) => (
                    <div key={i} className="card-emerald" style={{
                      flexShrink: 0, width: 190, borderRadius: 16, padding: 16,
                      cursor: "pointer",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                        <div className="icon-box icon-box-sm" style={{ background: "rgba(201,168,76,0.15)", border: "1px solid rgba(201,168,76,0.2)" }}>
                          <Gift size={16} color="#C9A84C" />
                        </div>
                        <span style={{ color: "#C9A84C", fontSize: 11, fontWeight: 600 }}>Акція</span>
                      </div>
                      <p style={{ color: "#F9F5E8", fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{p.company_name}</p>
                      <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 12 }}>Партнер PROFIT</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="card-emerald" style={{ borderRadius: 16, padding: 18 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div className="icon-box icon-box-lg" style={{ background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.2)" }}>
                      <Gift size={28} color="#C9A84C" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ color: "#F9F5E8", fontWeight: 600, fontSize: 15 }}>Спеціальні пропозиції</p>
                      <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginTop: 4 }}>
                        Акції та бонуси від партнерів
                      </p>
                    </div>
                    <ChevronRight size={18} color="rgba(201,168,76,0.6)" />
                  </div>
                </div>
              )}
            </section>

            {/* Quests */}
            <section>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <p className="section-title">
                  <Zap size={16} color="#C9A84C" />
                  Квести та завдання
                </p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {quests.length > 0
                  ? quests.map((q: any) => <QuestCard key={q.id} quest={q} onClaim={fetchData} />)
                  : [1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 72 }} />)
                }
              </div>
            </section>

          </div>

          {/* RIGHT COLUMN — Wheel */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <section className="card" style={{ padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <p className="section-title">
                  <Coins size={16} color="#C9A84C" />
                  Колесо Удачі
                </p>
                {wheelStatus?.can_spin_free && (
                  <span className="md-badge" style={{ animation: "pulseGold 2s ease-in-out infinite" }}>
                    Безкоштовно!
                  </span>
                )}
              </div>

              {wheelStatus ? (
                <WheelCanvas
                  onSpin={handleSpin}
                  canSpinFree={wheelStatus.can_spin_free}
                  paidCost={wheelStatus.paid_spin_cost_md}
                  isLoading={wheelLoading}
                />
              ) : (
                <div className="skeleton" style={{ height: 280 }} />
              )}

              {wheelStatus && !wheelStatus.can_spin_free && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center", marginTop: 12 }}>
                  <Clock size={13} color="var(--text-muted)" />
                  <p style={{ color: "var(--text-muted)", fontSize: 12 }}>
                    Безкоштовний спін через {wheelStatus.hours_until_free?.toFixed(1)} год.
                  </p>
                </div>
              )}
            </section>

            {/* Quick Stats */}
            <section>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  { icon: TrendingUp, label: "Рівень",    value: level,                       color: "#C9A84C" },
                  { icon: Star,       label: "XP",        value: `${xp.toLocaleString()}`,    color: "#8B5CF6" },
                  { icon: Coins,      label: "MD Баланс", value: Number(user?.md_balance || 0).toLocaleString("uk-UA"), color: "#10B981" },
                  { icon: Zap,        label: "Квести",    value: `${quests.filter(q=>!q.is_completed).length} активних`, color: "#F59E0B" },
                ].map(({ icon: Icon, label, value, color }) => (
                  <div key={label} className="card" style={{ padding: 14 }}>
                    <div className="icon-box icon-box-sm" style={{ background: `${color}15`, border: `1px solid ${color}25`, marginBottom: 8 }}>
                      <Icon size={16} color={color} />
                    </div>
                    <p style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>{value}</p>
                    <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{label}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

        </div>
      </div>

      <div style={{ height: 24 }} />
    </div>
  );
}

function QuestCard({ quest, onClaim }: { quest: any; onClaim: () => void }) {
  const [claiming, setClaiming] = useState(false);

  const claim = async () => {
    setClaiming(true);
    try {
      await api.post(`/user/quests/${quest.quest_id}/claim`);
      onClaim();
    } catch {} finally { setClaiming(false); }
  };

  const pct = quest.condition_value > 0
    ? Math.min(100, (quest.current_progress / quest.condition_value) * 100)
    : 100;
  const canClaim = pct >= 100 && !quest.is_completed;

  const iconBg = quest.is_completed ? "#10B98115" : "#C9A84C15";
  const iconColor = quest.is_completed ? "#10B981" : "#C9A84C";

  return (
    <div className="card" style={{ padding: "12px 14px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div className="icon-box icon-box-md" style={{ background: iconBg, border: `1px solid ${iconColor}25` }}>
          {quest.is_completed
            ? <span style={{ fontSize: 18 }}>✓</span>
            : <Zap size={18} color={iconColor} />
          }
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 600, fontSize: 13, color: "var(--text-primary)", marginBottom: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {quest.title}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div className="xp-bar" style={{ flex: 1 }}>
              <div className="xp-bar-fill" style={{ width: `${pct}%` }} />
            </div>
            <span style={{ fontSize: 10, color: "var(--text-muted)", flexShrink: 0 }}>
              {quest.current_progress}/{quest.condition_value}
            </span>
          </div>
        </div>
        <div style={{ flexShrink: 0 }}>
          {canClaim ? (
            <button onClick={claim} disabled={claiming} className="md-badge" style={{ cursor: "pointer" }}>
              {claiming ? "..." : `+${quest.reward_md}`}
            </button>
          ) : (
            <span style={{ fontSize: 12, color: "#C9A84C", fontWeight: 600 }}>+{quest.reward_md} MD</span>
          )}
        </div>
      </div>
    </div>
  );
}

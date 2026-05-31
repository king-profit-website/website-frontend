"use client";

import { useEffect, useState } from "react";
import {
  ChevronRight, Store, MapPin, Handshake,
  Search, X, Send, Coffee, ShoppingBag,
  Dumbbell, Scissors, Music, Wrench
} from "lucide-react";
import api from "@/lib/api";

const CATEGORIES = ["Всі", "Ресторан", "Кафе", "Магазин", "Краса", "Фітнес", "Розваги", "Послуги"];

const CAT_ICONS: Record<string, React.ReactNode> = {
  "Ресторан":  <Store   size={20} />,
  "Кафе":      <Coffee  size={20} />,
  "Магазин":   <ShoppingBag size={20} />,
  "Краса":     <Scissors size={20} />,
  "Фітнес":   <Dumbbell size={20} />,
  "Розваги":  <Music   size={20} />,
  "Послуги":  <Wrench  size={20} />,
  "Інше":     <Store   size={20} />,
};

const CAT_EMOJI: Record<string, string> = {
  "Ресторан": "🍽️", "Кафе": "☕", "Магазин": "🛍️",
  "Краса": "💅", "Фітнес": "💪", "Розваги": "🎉",
  "Послуги": "🔧", "Інше": "📌",
};

export default function PartnersPage() {
  const [partners, setPartners]   = useState<any[]>([]);
  const [filtered, setFiltered]   = useState<any[]>([]);
  const [category, setCategory]   = useState("Всі");
  const [search, setSearch]       = useState("");
  const [showApply, setShowApply] = useState(false);
  const [myApp, setMyApp]         = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    let list = partners;
    if (category !== "Всі") list = list.filter(p => p.category === category);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.company_name.toLowerCase().includes(q) ||
        (p.address || "").toLowerCase().includes(q)
      );
    }
    setFiltered(list);
  }, [partners, category, search]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [ps, app] = await Promise.all([
        api.get("/partner/list"),
        api.get("/partner/my-application"),
      ]);
      setPartners(ps.data);
      setFiltered(ps.data);
      setMyApp(app.data);
    } catch {} finally { setIsLoading(false); }
  };

  return (
    <div style={{ animation: "fadeIn 0.4s ease-out" }}>
      {/* Header */}
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.5rem, 4vw, 2rem)", fontWeight: 700, color: "#F9F5E8", marginBottom: 4 }}>
              Партнери
            </h1>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>
              Заклади де діють ваші MD токени
            </p>
          </div>
          <div style={{
            background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.2)",
            borderRadius: 12, padding: "6px 14px", color: "#C9A84C", fontSize: 13, fontWeight: 600,
            whiteSpace: "nowrap",
          }}>
            {filtered.length} закл.
          </div>
        </div>

        {/* Search */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 14, padding: "10px 14px",
        }}>
          <Search size={16} color="#C9A84C" />
          <input
            type="text"
            placeholder="Пошук закладів..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              flex: 1, background: "none", border: "none", outline: "none",
              color: "#F9F5E8", fontSize: 14, fontFamily: "var(--font-sans)",
            }}
          />
          {search && (
            <button onClick={() => setSearch("")} style={{ color: "rgba(255,255,255,0.4)", background: "none", border: "none", cursor: "pointer", display: "flex" }}>
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      <div style={{ padding: "16px 16px 0" }}>
        {/* Category pills */}
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, marginBottom: 16 }} className="scrollbar-none">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              style={{
                flexShrink: 0, padding: "7px 16px",
                borderRadius: 999, fontSize: 13, fontWeight: 500,
                cursor: "pointer", transition: "all 0.18s",
                background: category === cat
                  ? "linear-gradient(135deg, #C9A84C, #E8C96C)"
                  : "var(--bg-card)",
                color: category === cat ? "#102820" : "var(--text-secondary)",
                boxShadow: category === cat
                  ? "0 3px 12px rgba(201,168,76,0.3)"
                  : "0 1px 6px rgba(0,0,0,0.05)",
                border: category !== cat ? "1px solid var(--border)" : "none",
              } as any}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Partner Grid */}
        {isLoading ? (
          <div className="grid-auto-fill">
            {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 16 }} />)}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid-auto-fill">
            {filtered.map((p: any) => <PartnerCard key={p.id} partner={p} />)}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "64px 0" }}>
            <div className="icon-box icon-box-xl icon-box-gold" style={{ margin: "0 auto 16px" }}>
              <Store size={32} color="#C9A84C" />
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
              {search || category !== "Всі" ? "Нічого не знайдено" : "Партнери незабаром з'являться"}
            </p>
          </div>
        )}

        {/* CTA */}
        <div style={{ marginTop: 24, paddingBottom: 16 }}>
          {myApp ? <ApplicationStatus app={myApp} /> : <BePartnerButton onClick={() => setShowApply(true)} />}
        </div>
      </div>

      {showApply && <ApplyModal onClose={() => { setShowApply(false); fetchData(); }} />}
    </div>
  );
}

function PartnerCard({ partner }: { partner: any }) {
  return (
    <div className="card card-hover" style={{ padding: 16, cursor: "pointer", display: "flex", alignItems: "center", gap: 14 }}>
      <div className="icon-box icon-box-lg icon-box-emerald">
        {CAT_ICONS[partner.category] || <Store size={24} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 600, fontSize: 14, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {partner.company_name}
        </p>
        <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
          {CAT_EMOJI[partner.category]} {partner.category}
        </p>
        {partner.address && (
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 6 }}>
            <MapPin size={11} color="#C9A84C" />
            <span style={{ fontSize: 11, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {partner.address}
            </span>
          </div>
        )}
      </div>
      <ChevronRight size={16} color="rgba(201,168,76,0.5)" style={{ flexShrink: 0 }} />
    </div>
  );
}

function BePartnerButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      width: "100%", border: "none", cursor: "pointer",
      padding: "2px",
      borderRadius: 20,
      background: "linear-gradient(135deg, #C9A84C, #E8C96C, #C9A84C)",
      boxShadow: "0 6px 28px rgba(201,168,76,0.3)",
    } as any}>
      <div style={{
        background: "linear-gradient(135deg, #102820, #1A4A38)",
        borderRadius: 18, padding: "18px 20px",
        display: "flex", alignItems: "center", gap: 16,
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: 16, flexShrink: 0,
          background: "linear-gradient(135deg, #C9A84C, #E8C96C)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 16px rgba(201,168,76,0.3)",
        }}>
          <Handshake size={24} color="#102820" strokeWidth={2} />
        </div>
        <div style={{ flex: 1, textAlign: "left" }}>
          <p style={{ color: "#F9F5E8", fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Стати партнером</p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 13 }}>Підключіть свій бізнес до PROFIT</p>
        </div>
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          background: "linear-gradient(135deg, #C9A84C, #E8C96C)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <ChevronRight size={16} color="#102820" />
        </div>
      </div>
    </button>
  );
}

function ApplicationStatus({ app }: { app: any }) {
  const cfg: Record<string, { bg: string; text: string; label: string }> = {
    pending:  { bg: "rgba(201,168,76,0.08)",  text: "#C9A84C",  label: "⏳ Заявка розглядається" },
    approved: { bg: "rgba(16,185,129,0.08)", text: "#10B981", label: "✅ Заявку схвалено" },
    rejected: { bg: "rgba(239,68,68,0.08)",   text: "#EF4444", label: "❌ Заявку відхилено" },
  };
  const s = cfg[app?.status || "pending"];

  return (
    <div className="card" style={{ padding: 16, background: s.bg, borderColor: `${s.text}30` }}>
      <p style={{ fontWeight: 600, fontSize: 14, color: s.text }}>{s.label}</p>
      <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>{app?.company_name}</p>
    </div>
  );
}

function ApplyModal({ onClose }: { onClose: () => void }) {
  const [form, setForm]       = useState({ company_name: "", description: "", address: "", category: "Ресторан" });
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);
  const [error, setError]     = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      await api.post("/partner/apply", form);
      setDone(true);
      setTimeout(onClose, 2200);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Помилка відправки");
    } finally { setLoading(false); }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "flex-end", justifyContent: "center",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 520,
          background: "var(--bg-card)", borderRadius: "24px 24px 0 0",
          padding: "20px 24px 32px",
          animation: "slideUp 0.35s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        {/* Handle */}
        <div style={{ width: 40, height: 4, borderRadius: 99, background: "var(--border)", margin: "0 auto 20px" }} />

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div className="icon-box icon-box-md" style={{ background: "linear-gradient(135deg, #C9A84C, #E8C96C)" }}>
            <Handshake size={20} color="#102820" />
          </div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--text-primary)" }}>
            Заявка на партнерство
          </h2>
        </div>

        {done ? (
          <div style={{ textAlign: "center", padding: "32px 0" }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
            <p style={{ fontWeight: 700, fontSize: 18, color: "var(--text-primary)" }}>Заявку надіслано!</p>
            <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 8 }}>Ми розглянемо її найближчим часом</p>
          </div>
        ) : (
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {error && (
              <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 12, padding: 12, color: "#EF4444", fontSize: 13 }}>
                {error}
              </div>
            )}
            <Field label="Назва компанії">
              <input className="input-field" value={form.company_name} onChange={e => setForm(p => ({ ...p, company_name: e.target.value }))} placeholder="Мій бізнес" required />
            </Field>
            <Field label="Категорія">
              <select className="input-field" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                {CATEGORIES.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Адреса">
              <input className="input-field" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} placeholder="вул. Хрещатик, 1, Київ" required />
            </Field>
            <Field label="Опис">
              <textarea className="input-field" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Розкажіть про ваш бізнес..." rows={3} style={{ resize: "none" }} />
            </Field>
            <button type="submit" disabled={loading} className="btn-gold" style={{ width: "100%", marginTop: 4 }}>
              {loading ? "Надсилаємо..." : <><Send size={16} /> Надіслати заявку</>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 12, color: "var(--text-muted)", marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}

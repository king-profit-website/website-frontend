"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  BarChart3, ArrowLeft, Coins, Users, TrendingUp, 
  Plus, Trash2, UserSearch, CheckCircle, AlertCircle
} from "lucide-react";
import { useAuthStore } from "@/lib/store";
import api from "@/lib/api";
import dynamic from "next/dynamic";

const BarChart = dynamic(() => import("recharts").then(m => m.BarChart), { ssr: false });
const Bar = dynamic(() => import("recharts").then(m => m.Bar), { ssr: false });
const XAxis = dynamic(() => import("recharts").then(m => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then(m => m.YAxis), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then(m => m.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import("recharts").then(m => m.ResponsiveContainer), { ssr: false });

const TABS = ["Статистика", "Транзакції", "Акції", "Нарахування"];

export default function PartnerDashboard() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [tab, setTab] = useState(0);
  const [stats, setStats] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    if (user.role !== "partner") {
      router.replace("/app/home");
      return;
    }
    fetchAll();
  }, [user]);

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const [s, t, p] = await Promise.all([
        api.get("/partner/stats"),
        api.get("/partner/transactions"),
        api.get("/partner/promotions"),
      ]);
      setStats(s.data);
      setTransactions(t.data);
      setPromotions(p.data);
    } catch {} finally {
      setIsLoading(false);
    }
  };

  if (!user || user.role !== "partner") return null;

  return (
    <div className="min-h-dvh animate-fade-in" style={{ background: "var(--bg-primary)" }}>
      {/* Header */}
      <div className="card-emerald px-5 pt-12 pb-5">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-white/60"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="font-display text-xl font-bold text-white">Кабінет партнера</h1>
            <p className="text-white/60 text-xs">B2B Dashboard</p>
          </div>
          <div className="ml-auto">
            <span className="md-badge">Partner</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-black/20 rounded-2xl p-1">
          {TABS.map((t, i) => (
            <button
              key={t}
              onClick={() => setTab(i)}
              className={`flex-1 py-2 text-xs font-medium rounded-xl transition-all ${
                tab === i ? "bg-gold-gradient text-emerald-900" : "text-white/50"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-4 pb-8">
        {isLoading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-24 skeleton rounded-2xl" />)}
          </div>
        ) : (
          <>
            {tab === 0 && <StatsTab stats={stats} transactions={transactions} />}
            {tab === 1 && <TransactionsTab transactions={transactions} />}
            {tab === 2 && <PromotionsTab promotions={promotions} onRefresh={fetchAll} />}
            {tab === 3 && <ChargeTab />}
          </>
        )}
      </div>
    </div>
  );
}

function StatsTab({ stats, transactions }: { stats: any; transactions: any[] }) {
  // Build last 7 days chart
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().slice(0, 10);
    const dayTxns = transactions.filter(t => t.created_at.slice(0, 10) === dateStr);
    const earned = dayTxns.filter(t => t.type === "earn").reduce((s: number, t: any) => s + Math.abs(Number(t.amount)), 0);
    const spent = dayTxns.filter(t => t.type === "spend").reduce((s: number, t: any) => s + Math.abs(Number(t.amount)), 0);
    return { day: d.toLocaleDateString("uk-UA", { weekday: "short" }), earned, spent };
  });

  return (
    <div className="space-y-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { icon: Coins, label: "MD видано", value: Number(stats?.total_md_issued || 0).toLocaleString(), color: "text-gold-500" },
          { icon: TrendingUp, label: "MD списано", value: Number(stats?.total_md_spent || 0).toLocaleString(), color: "text-green-500" },
          { icon: Users, label: "Клієнтів", value: stats?.total_clients || 0, color: "text-blue-400" },
          { icon: BarChart3, label: "Транзакцій", value: stats?.transactions_count || 0, color: "text-purple-400" },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="card rounded-2xl p-4">
            <div className={`w-8 h-8 rounded-xl bg-current/10 flex items-center justify-center mb-3 ${color}`} style={{ backgroundColor: "var(--bg-card-alt)" }}>
              <Icon size={18} className={color} />
            </div>
            <p className="font-bold text-xl" style={{ color: "var(--text-primary)" }}>{value}</p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="card rounded-2xl p-4">
        <h3 className="font-semibold text-sm mb-4" style={{ color: "var(--text-primary)" }}>
          Активність за 7 днів
        </h3>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "12px", fontSize: "12px" }}
              />
              <Bar dataKey="earned" fill="#C9A84C" radius={[4, 4, 0, 0]} name="Видано MD" />
              <Bar dataKey="spent" fill="#1A4A38" radius={[4, 4, 0, 0]} name="Списано MD" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function TransactionsTab({ transactions }: { transactions: any[] }) {
  return (
    <div className="space-y-2">
      {transactions.length === 0 && (
        <p className="text-center py-12 text-sm" style={{ color: "var(--text-muted)" }}>
          Транзакцій ще немає
        </p>
      )}
      {transactions.map((t: any) => (
        <div key={t.id} className="card rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--bg-card-alt)] flex items-center justify-center flex-shrink-0">
            {t.type === "earn" ? <span>⬆️</span> : <span>⬇️</span>}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{t.user_name}</p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>{t.user_phone} • {new Date(t.created_at).toLocaleDateString("uk-UA")}</p>
          </div>
          <span className={`text-sm font-bold ${Number(t.amount) > 0 ? "text-gold-500" : "text-red-400"}`}>
            {Number(t.amount) > 0 ? "+" : ""}{t.amount} MD
          </span>
        </div>
      ))}
    </div>
  );
}

function PromotionsTab({ promotions, onRefresh }: { promotions: any[]; onRefresh: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", discount_percent: 0, bonus_md: 0 });
  const [loading, setLoading] = useState(false);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/partner/promotions", form);
      setShowForm(false);
      setForm({ title: "", description: "", discount_percent: 0, bonus_md: 0 });
      onRefresh();
    } finally { setLoading(false); }
  };

  const remove = async (id: number) => {
    await api.delete(`/partner/promotions/${id}`);
    onRefresh();
  };

  return (
    <div className="space-y-3">
      <button onClick={() => setShowForm(!showForm)} className="btn-gold w-full flex items-center justify-center gap-2">
        <Plus size={18} /> Нова акція
      </button>

      {showForm && (
        <form onSubmit={create} className="card rounded-2xl p-4 space-y-3">
          <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>Нова акція</h3>
          {[
            { key: "title", label: "Назва", type: "text", placeholder: "Знижка 20% на кофе" },
            { key: "description", label: "Опис", type: "text", placeholder: "Опис акції..." },
          ].map(({ key, label, type, placeholder }) => (
            <div key={key}>
              <label className="block text-xs mb-1" style={{ color: "var(--text-muted)" }}>{label}</label>
              <input
                type={type} placeholder={placeholder} required={key === "title"}
                value={(form as any)[key]}
                onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                className="w-full bg-[var(--bg-card-alt)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-sm outline-none"
                style={{ color: "var(--text-primary)" }}
              />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs mb-1" style={{ color: "var(--text-muted)" }}>Знижка (%)</label>
              <input type="number" min="0" max="100" value={form.discount_percent}
                onChange={e => setForm(p => ({ ...p, discount_percent: +e.target.value }))}
                className="w-full bg-[var(--bg-card-alt)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-sm outline-none"
                style={{ color: "var(--text-primary)" }}
              />
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: "var(--text-muted)" }}>Бонус MD</label>
              <input type="number" min="0" value={form.bonus_md}
                onChange={e => setForm(p => ({ ...p, bonus_md: +e.target.value }))}
                className="w-full bg-[var(--bg-card-alt)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-sm outline-none"
                style={{ color: "var(--text-primary)" }}
              />
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-gold w-full">
            {loading ? "Зберігаємо..." : "Зберегти"}
          </button>
        </form>
      )}

      {promotions.map((p: any) => (
        <div key={p.id} className="card rounded-2xl p-4 flex items-center gap-3">
          <div className="flex-1">
            <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{p.title}</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              {p.discount_percent > 0 && `${p.discount_percent}% знижка • `}
              {p.bonus_md > 0 && `+${p.bonus_md} MD`}
            </p>
          </div>
          <button onClick={() => remove(p.id)} className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400">
            <Trash2 size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

function ChargeTab() {
  const [form, setForm] = useState({ search: "", amount: "", is_earn: true, description: "" });
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setResult(null); setError("");
    try {
      const payload: any = {
        amount: Number(form.amount),
        description: form.description,
        is_earn: form.is_earn,
      };
      // Determine if referral code or user id
      if (/^\d+$/.test(form.search)) {
        payload.user_id = parseInt(form.search);
      } else {
        payload.referral_code = form.search.toUpperCase();
      }
      const { data } = await api.post("/partner/charge", payload);
      setResult(data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Помилка операції");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="card rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <UserSearch size={20} className="text-gold-500" />
          <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>Нарахування / Списання</h3>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="block text-xs mb-1" style={{ color: "var(--text-muted)" }}>
              ID клієнта або реферальний код
            </label>
            <input
              type="text" required placeholder="12345 або ABC123XY"
              value={form.search}
              onChange={e => setForm(p => ({ ...p, search: e.target.value }))}
              className="w-full bg-[var(--bg-card-alt)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm outline-none"
              style={{ color: "var(--text-primary)" }}
            />
          </div>

          {/* Operation type */}
          <div className="flex rounded-2xl bg-[var(--bg-card-alt)] p-1">
            {[{ label: "➕ Нарахувати MD", value: true }, { label: "➖ Списати MD", value: false }].map(({ label, value }) => (
              <button
                key={String(value)} type="button"
                onClick={() => setForm(p => ({ ...p, is_earn: value }))}
                className={`flex-1 py-2.5 text-xs font-medium rounded-xl transition-all ${
                  form.is_earn === value ? "bg-gold-gradient text-emerald-900" : ""
                }`}
                style={{ color: form.is_earn !== value ? "var(--text-muted)" : undefined }}
              >
                {label}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-xs mb-1" style={{ color: "var(--text-muted)" }}>Кількість MD</label>
            <input
              type="number" required min="1" placeholder="100"
              value={form.amount}
              onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
              className="w-full bg-[var(--bg-card-alt)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm outline-none"
              style={{ color: "var(--text-primary)" }}
            />
          </div>

          <div>
            <label className="block text-xs mb-1" style={{ color: "var(--text-muted)" }}>Коментар (необов'язково)</label>
            <input
              type="text" placeholder="За покупку..."
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              className="w-full bg-[var(--bg-card-alt)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm outline-none"
              style={{ color: "var(--text-primary)" }}
            />
          </div>

          <button type="submit" disabled={loading} className="btn-gold w-full flex items-center justify-center gap-2">
            {loading ? "Обробляємо..." : form.is_earn ? "Нарахувати MD" : "Списати MD"}
          </button>
        </form>

        {error && (
          <div className="mt-3 flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {result && (
          <div className="mt-3 flex items-start gap-2 bg-green-500/10 border border-green-500/30 rounded-xl p-4">
            <CheckCircle size={18} className="text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-green-400 font-semibold text-sm">Успішно!</p>
              <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
                Клієнт: <strong>{result.client_name}</strong>
              </p>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Операція: {result.operation === "earn" ? "+" : "-"}{result.amount} MD
              </p>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                Баланс: {result.new_balance} MD
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

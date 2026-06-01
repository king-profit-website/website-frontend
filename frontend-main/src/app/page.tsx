"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Coins, ArrowRight, Star, Users, MapPin, Shield, 
  Zap, Award, ChevronRight, CheckCircle
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuthStore } from "@/lib/store";

const FEATURES = [
  { icon: Coins, title: "Токени MD", desc: "Єдина валюта для всіх партнерів екосистеми" },
  { icon: Star, title: "Рівні та статуси", desc: "Silver → Gold → Platinum → Diamond" },
  { icon: Users, title: "Реферальна програма", desc: "Запрошуйте друзів — отримуйте бонуси" },
  { icon: MapPin, title: "Карта партнерів", desc: "Знаходьте найближчі заклади на карті" },
  { icon: Zap, title: "Колесо удачі", desc: "Крутіть безкоштовно кожні 3 дні" },
  { icon: Award, title: "Квести та завдання", desc: "Виконуйте завдання — отримуйте нагороди" },
];

const LEVELS = [
  { name: "Silver", xp: "0 XP", color: "from-gray-400 to-gray-300", perks: ["Базові бонуси", "Колесо удачі"] },
  { name: "Gold", xp: "500 XP", color: "from-gold-500 to-gold-300", perks: ["Підвищені бонуси", "+1 безкоштовний спін"] },
  { name: "Platinum", xp: "1500 XP", color: "from-blue-400 to-cyan-300", perks: ["Максимальні бонуси", "Ексклюзивні акції"] },
  { name: "Diamond", xp: "3000 XP", color: "from-purple-400 to-pink-300", perks: ["Преміум статус", "VIP підтримка"] },
];

const PARTNERS_PREVIEW = [
  { name: "Gastro Hub", category: "Ресторан", bonus: "5%" },
  { name: "Beauty Studio", category: "Краса", bonus: "10%" },
  { name: "FitLife", category: "Фітнес", bonus: "8%" },
  { name: "CoffeeTime", category: "Кафе", bonus: "7%" },
];

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user, fetchMe } = useAuthStore();

  useEffect(() => {
    setMounted(true);
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handler);
    if (localStorage.getItem("access_token")) {
      fetchMe();
    }
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div className="min-h-screen font-sans overflow-x-hidden bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300">
      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? "bg-[var(--bg-secondary)]/90 backdrop-blur-xl border-b border-[var(--border)] shadow-lg" 
          : "bg-transparent"
      }`}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--bg-card)] border border-gold-500/30 flex items-center justify-center shadow-md">
              <span className="text-gold-500 font-display font-bold text-lg">P</span>
            </div>
            <span className="text-[var(--text-primary)] font-display font-semibold text-xl">PROFIT</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-[var(--text-secondary)] text-sm">
            <a href="#features" className="hover:text-gold-500 transition-colors">Можливості</a>
            <a href="#levels" className="hover:text-gold-500 transition-colors">Рівні</a>
            <a href="#partners" className="hover:text-gold-500 transition-colors">Партнери</a>
            <a href="#business" className="hover:text-gold-500 transition-colors">Для бізнесу</a>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {!mounted ? (
              <div className="w-[110px] h-[38px] rounded-xl bg-transparent" />
            ) : user ? (
              <Link href="/app/home" className="btn-gold text-sm px-5 py-2.5 flex items-center gap-2">
                <span>Кабінет ({user.first_name})</span>
                <ArrowRight size={15} />
              </Link>
            ) : (
              <>
                <Link href="/auth" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm transition-colors px-4 py-2">
                  Увійти
                </Link>
                <Link href="/auth?tab=register" className="btn-gold text-sm px-5 py-2.5">
                  Розпочати
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen bg-gradient-to-br from-[var(--bg-primary)] to-[var(--bg-card-alt)] flex items-center overflow-hidden transition-colors duration-300">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
          {/* Grid pattern */}
          <div className="absolute inset-0" style={{
            backgroundImage: "linear-gradient(rgba(201,168,76,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.04) 1px, transparent 1px)",
            backgroundSize: "60px 60px"
          }} />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 pt-24 pb-16 grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-gold-500/10 border border-gold-500/30 rounded-full px-4 py-1.5 mb-6">
              <div className="w-2 h-2 rounded-full bg-gold-400 animate-pulse" />
              <span className="text-gold-500 text-sm font-medium">Екосистема лояльності нового покоління</span>
            </div>
            <h1 className="font-display text-5xl lg:text-7xl font-bold text-[var(--text-primary)] leading-tight mb-6">
              Один бонус.
              <br />
              <span className="text-gold-gradient">
                Багато
              </span>
              <br />
              можливостей.
            </h1>
            <p className="text-[var(--text-secondary)] text-lg mb-8 max-w-lg leading-relaxed">
              PROFIT — єдина система токенів MD, яка об'єднує локальний бізнес і клієнтів. 
              Накопичуйте, витрачайте, вигравайте.
            </p>
            <div className="flex flex-wrap gap-4 min-h-[48px]">
              {!mounted ? (
                <div className="w-[180px] h-[48px] rounded-xl bg-transparent" />
              ) : user ? (
                <Link href="/app/home" className="btn-gold flex items-center gap-2 text-base">
                  Перейти в кабінет <ArrowRight size={18} />
                </Link>
              ) : (
                <>
                  <Link href="/auth?tab=register" className="btn-gold flex items-center gap-2 text-base">
                    Зареєструватись <ArrowRight size={18} />
                  </Link>
                  <a href="#features" className="btn-emerald flex items-center gap-2 text-base">
                    Дізнатись більше
                  </a>
                </>
              )}
            </div>
            <div className="mt-10 flex items-center gap-8">
              {[["1000+", "Клієнтів"], ["50+", "Партнерів"], ["500K+", "MD видано"]].map(([val, label]) => (
                <div key={label}>
                  <p className="font-display text-2xl font-bold text-gold-500">{val}</p>
                  <p className="text-[var(--text-secondary)] text-sm">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* MD Token 3D visual */}
          <div className="relative flex justify-center animate-fade-in">
            <div className="relative w-80 h-80">
              {/* Glow rings */}
              <div className="absolute inset-0 rounded-full border border-gold-500/20 animate-ping" style={{ animationDuration: "3s" }} />
              <div className="absolute inset-4 rounded-full border border-gold-500/30" />
              <div className="absolute inset-8 rounded-full border border-gold-500/40" />
              {/* Main coin */}
              <div className="absolute inset-12 rounded-full bg-gold-gradient shadow-gold-lg flex flex-col items-center justify-center">
                <span className="font-display font-bold text-emerald-900 text-6xl">MD</span>
                <span className="text-emerald-900/60 text-xs font-medium tracking-widest mt-1">PROFIT</span>
              </div>
              {/* Orbiting badges */}
              {[
                { label: "+50 MD", deg: 0, color: "bg-gold-500 text-emerald-900" },
                { label: "Silver", deg: 120, color: "bg-gray-300 text-gray-800" },
                { label: "×3 XP", deg: 240, color: "bg-emerald-600 text-white" },
              ].map(({ label, deg, color }) => (
                <div
                  key={label}
                  className={`absolute w-16 h-8 rounded-full ${color} text-xs font-bold flex items-center justify-center shadow-lg`}
                  style={{
                    top: `calc(50% + ${Math.sin((deg * Math.PI) / 180) * 120}px - 16px)`,
                    left: `calc(50% + ${Math.cos((deg * Math.PI) / 180) * 120}px - 32px)`,
                  }}
                >
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────────────── */}
      <section id="features" className="py-24 bg-[var(--bg-secondary)] border-y border-[var(--border)] transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold text-[var(--text-primary)] mb-4">
              Всі можливості в одному додатку
            </h2>
            <p className="text-[var(--text-secondary)] max-w-xl mx-auto">
              Геймифікована система лояльності з картою партнерів, колесом удачі та персональними квестами
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card card-hover p-6 group cursor-default">
                <div className="w-12 h-12 rounded-2xl bg-gold-500/10 flex items-center justify-center mb-4 group-hover:bg-gold-500/20 transition-colors">
                  <Icon className="text-gold-500" size={24} />
                </div>
                <h3 className="font-semibold text-[var(--text-primary)] mb-2">{title}</h3>
                <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Levels ──────────────────────────────────────────────────────────── */}
      <section id="levels" className="py-24 bg-gradient-to-br from-[var(--bg-primary)] to-[var(--bg-card-alt)] transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold text-[var(--text-primary)] mb-4">Рівні та привілеї</h2>
            <p className="text-[var(--text-secondary)]">Підвищуйте свій рівень та отримуйте більше переваг</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {LEVELS.map(({ name, xp, color, perks }) => (
              <div key={name} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 hover:border-gold-500/40 shadow-sm transition-all">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-gold`}>
                  <Award className="text-[#102820]" size={28} />
                </div>
                <h3 className="font-display text-2xl font-bold text-[var(--text-primary)] mb-1">{name}</h3>
                <p className="text-gold-500 text-sm mb-4">{xp}</p>
                <ul className="space-y-2">
                  {perks.map((perk) => (
                    <li key={perk} className="flex items-center gap-2 text-[var(--text-secondary)] text-sm">
                      <CheckCircle size={14} className="text-gold-500 flex-shrink-0" />
                      {perk}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Partners preview ────────────────────────────────────────────────── */}
      <section id="partners" className="py-24 bg-[var(--bg-secondary)] border-b border-[var(--border)] transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="font-display text-4xl font-bold text-[var(--text-primary)] mb-2">
                Партнери PROFIT
              </h2>
              <p className="text-[var(--text-secondary)]">Заклади, де ваші MD мають цінність</p>
            </div>
            <Link href="/auth" className="btn-gold flex items-center gap-2 text-sm">
              Всі партнери <ChevronRight size={16} />
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {PARTNERS_PREVIEW.map(({ name, category, bonus }) => (
              <div key={name} className="card card-hover p-5">
                <div className="w-12 h-12 rounded-xl bg-gold-500/10 flex items-center justify-center mb-4">
                  <span className="text-gold-500 font-display font-bold text-lg">{name[0]}</span>
                </div>
                <h3 className="font-semibold text-[var(--text-primary)]">{name}</h3>
                <p className="text-[var(--text-secondary)] text-sm">{category}</p>
                <div className="mt-3 md-badge">{bonus} MD back</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── For Business ────────────────────────────────────────────────────── */}
      <section id="business" className="py-24 bg-gradient-to-br from-[var(--bg-primary)] to-[var(--bg-card-alt)] transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-gold-500/10 border border-gold-500/30 rounded-full px-4 py-1.5 mb-6">
              <Shield size={14} className="text-gold-500" />
              <span className="text-gold-500 text-sm">Для бізнесу</span>
            </div>
            <h2 className="font-display text-4xl font-bold text-[var(--text-primary)] mb-6">
              Розвивайте свій бізнес разом з PROFIT
            </h2>
            <p className="text-[var(--text-secondary)] mb-8 leading-relaxed">
              Підключіться до екосистеми та отримайте готову базу лояльних клієнтів. 
              Управляйте акціями, нараховуйте бонуси та відстежуйте статистику через зручний B2B-дашборд.
            </p>
            <ul className="space-y-4 mb-8">
              {[
                "Власний B2B-дашборд зі статистикою",
                "Нарахування та списання MD за QR-кодом",
                "Управління акціями та знижками",
                "Аналітика транзакцій клієнтів",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-[var(--text-secondary)]">
                  <CheckCircle size={18} className="text-gold-500 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/auth" className="btn-gold flex items-center gap-2 w-fit">
              Стати партнером <ArrowRight size={18} />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Транзакцій/день", value: "200+" },
              { label: "Середній чек", value: "+23%" },
              { label: "Повторні візити", value: "+41%" },
              { label: "NPS партнерів", value: "4.8/5" },
            ].map(({ label, value }) => (
              <div key={label} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 shadow-sm">
                <p className="font-display text-3xl font-bold text-gold-500 mb-1">{value}</p>
                <p className="text-[var(--text-secondary)] text-sm">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-[var(--bg-secondary)] border-y border-[var(--border)] text-center transition-colors duration-300">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="font-display text-5xl font-bold text-[var(--text-primary)] mb-6">
            Готові розпочати?
          </h2>
          <p className="text-[var(--text-secondary)] text-lg mb-8">
            Приєднуйтесь до тисяч клієнтів, які вже накопичують MD токени
          </p>
          <Link href="/auth?tab=register" className="btn-gold text-lg px-8 py-4 inline-flex items-center gap-2">
            Зареєструватись безкоштовно <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="bg-[var(--bg-secondary)] border-t border-[var(--border)] py-12 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[var(--bg-card)] border border-gold-500/30 flex items-center justify-center shadow-sm">
              <span className="text-gold-500 font-display font-bold">P</span>
            </div>
            <span className="text-[var(--text-primary)] font-display font-semibold">PROFIT</span>
          </div>
          <p className="text-[var(--text-secondary)] opacity-70 text-sm">Один бонус. Багато можливостей. © 2026</p>
          <div className="flex gap-6 text-[var(--text-secondary)] text-sm">
            <a href="#" className="hover:text-gold-500 transition-colors">Умови</a>
            <a href="#" className="hover:text-gold-500 transition-colors">Конфіденційність</a>
            <a href="#" className="hover:text-gold-400 transition-colors">Контакти</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Eye, EyeOff, Phone, Lock, User, Calendar,
  ArrowRight, AlertCircle, CheckCircle
} from "lucide-react";
import { useAuthStore } from "@/lib/store";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

/**
 * Helper: formatPhoneNumber
 * Enforces +380 prefix, prevents deleting, removes leading zeroes and duplicate country codes,
 * and formats the input on the fly as '+380 99 123 45 67'.
 */
const formatPhoneNumber = (val: string) => {
  // Strip all characters except digits
  let digits = val.replace(/\D/g, "");
  
  // If they entered the full 380...
  if (digits.startsWith("380")) {
    digits = digits.slice(3);
  }
  
  // If they entered a leading 0 (like 099...), strip it
  if (digits.startsWith("0")) {
    digits = digits.slice(1);
  }
  
  // Limit to maximum 9 digits
  digits = digits.slice(0, 9);
  
  // Format as: 99 123 45 67
  let formatted = "";
  if (digits.length > 0) {
    formatted += digits.slice(0, 2);
  }
  if (digits.length > 2) {
    formatted += " " + digits.slice(2, 5);
  }
  if (digits.length > 5) {
    formatted += " " + digits.slice(5, 7);
  }
  if (digits.length > 7) {
    formatted += " " + digits.slice(7, 9);
  }
  
  return formatted ? "+380 " + formatted : "+380";
};

/**
 * Helper: calculateAge
 * Calculates exact age in years from a YYYY-MM-DD birthdate string.
 */
const calculateAge = (birthDateString: string) => {
  if (!birthDateString) return 0;
  const today = new Date();
  const birthDate = new Date(birthDateString);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

/**
 * Helper: getErrorMessage
 * Parses Axios/FastAPI errors. Extracts exact messages from nested objects/arrays
 * and translates them into user-friendly Ukrainian.
 */
const getErrorMessage = (err: any): string => {
  if (err?.response?.data?.detail) {
    const detail = err.response.data.detail;
    if (typeof detail === "string") {
      return detail;
    }
    if (Array.isArray(detail)) {
      // Map over all FastAPI validation errors and translate them beautifully
      return detail.map(item => {
        const field = item.loc ? item.loc[item.loc.length - 1] : "";
        let msg = item.msg || "";
        
        if (field === "phone") {
          if (msg.includes("already registered") || msg.includes("already exists")) {
            return "Цей номер телефону вже зареєстровано";
          }
          return `Поле "Телефон": ${msg}`;
        }
        if (field === "age") {
          return "Помилка віку. Вкажіть коректну дату народження";
        }
        if (field === "password") {
          return `Поле "Пароль": ${msg}`;
        }
        if (field === "first_name") {
          return "Будь ласка, вкажіть коректне ім'я";
        }
        if (field === "last_name") {
          return "Будь ласка, вкажіть коректне прізвище";
        }
        
        return field ? `Поле "${field}": ${msg}` : msg;
      }).join("; ");
    }
    if (typeof detail === "object") {
      return JSON.stringify(detail);
    }
  }
  
  if (err?.message) {
    if (err.message.includes("Network Error")) {
      return "Помилка мережі. Перевірте з'єднання з сервером або запустіть backend";
    }
    return err.message;
  }
  
  return "Помилка з'єднання з сервером";
};

function AuthForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [tab, setTab] = useState<"login" | "register">(
    params.get("tab") === "register" ? "register" : "login"
  );
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState("");
  const { login, register, isLoading, user } = useAuthStore();

  useEffect(() => {
    if (user) router.replace("/app/home");
  }, [user, router]);

  const [lf, setLf] = useState({ phone: "+380", password: "" });
  const [rf, setRf] = useState({ first_name: "", last_name: "", phone: "+380", birthdate: "", password: "", confirm: "" });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    try {
      await login(lf.phone.replace(/\s/g, ""), lf.password);
      router.replace("/app/home");
    } catch (err: any) {
      setError(getErrorMessage(err));
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    if (rf.password !== rf.confirm) { setError("Паролі не співпадають"); return; }
    if (rf.password.length < 8)     { setError("Пароль мінімум 8 символів"); return; }
    if (!rf.birthdate)              { setError("Вкажіть дату народження"); return; }
    try {
      await register({
        first_name: rf.first_name, last_name: rf.last_name,
        phone: rf.phone.replace(/\s/g, ""), age: calculateAge(rf.birthdate), password: rf.password,
      });
      router.replace("/app/home");
    } catch (err: any) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div style={{
      minHeight: "100dvh",
      background: "linear-gradient(135deg, #0A1F1C 0%, #102820 50%, #1A3A2F 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Floating Theme Toggle (Premium Sun/Moon Switcher) */}
      <div style={{ position: "absolute", top: 20, right: 20, zIndex: 50 }}>
        <ThemeToggle />
      </div>

      {/* Background blobs */}
      <div style={{ position: "absolute", top: "10%", right: "15%", width: 300, height: 300, background: "rgba(201,168,76,0.05)", borderRadius: "50%", filter: "blur(60px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "15%", left: "10%", width: 200, height: 200, background: "rgba(26,74,56,0.15)", borderRadius: "50%", filter: "blur(40px)", pointerEvents: "none" }} />

      {/* Desktop: side-by-side layout */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        maxWidth: 900,
        width: "100%",
        gap: 40,
        alignItems: "center",
      }}>

        {/* Left: Branding */}
        <div style={{ textAlign: "center" }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <div style={{
              width: 80, height: 80, borderRadius: 24,
              background: "linear-gradient(135deg, #C9A84C, #E8C96C)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 20px",
              boxShadow: "0 8px 32px rgba(201,168,76,0.4)",
            }}>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 40, color: "#102820" }}>P</span>
            </div>
          </Link>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 700, color: "#F9F5E8", lineHeight: 1.1, marginBottom: 12 }}>
            PROFIT
          </h1>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 16, maxWidth: 300, margin: "0 auto 32px", lineHeight: 1.5 }}>
            Один бонус. Багато можливостей.
          </p>

          {/* Features list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, textAlign: "left", maxWidth: 280, margin: "0 auto" }}>
            {[
              "Накопичуйте MD токени",
              "Колесо удачі кожні 3 дні",
              "Карта партнерів поруч",
              "Реферальна програма",
            ].map(item => (
              <div key={item} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <CheckCircle size={16} color="#10B981" />
                <span style={{ color: "rgba(255,255,255,0.65)", fontSize: 14 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Form card */}
        <div style={{
          background: "rgba(255,255,255,0.05)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(201,168,76,0.18)",
          borderRadius: 28,
          padding: "32px 28px",
          animation: "slideUp 0.4s cubic-bezier(0.4,0,0.2,1)",
        }}>
          {/* Tabs */}
          <div style={{
            display: "flex", gap: 4, background: "rgba(0,0,0,0.2)",
            borderRadius: 16, padding: 4, marginBottom: 24,
          }}>
            {(["login", "register"] as const).map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(""); }}
                style={{
                  flex: 1, padding: "10px 0", fontSize: 13, fontWeight: 600,
                  borderRadius: 12, border: "none", cursor: "pointer",
                  transition: "all 0.2s",
                  background: tab === t
                    ? "linear-gradient(135deg, #C9A84C, #E8C96C)"
                    : "transparent",
                  color: tab === t ? "#102820" : "rgba(255,255,255,0.45)",
                  boxShadow: tab === t ? "0 3px 12px rgba(201,168,76,0.35)" : "none",
                }}
              >
                {t === "login" ? "Увійти" : "Реєстрація"}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)",
              borderRadius: 12, padding: "10px 14px", marginBottom: 16,
              color: "#FC8181", fontSize: 13,
            }}>
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              {error}
            </div>
          )}

          {/* Login */}
          {tab === "login" && (
            <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <AuthInput icon={<Phone size={16} />} type="tel" placeholder="+380 XX XXX XX XX" label="Номер телефону" value={lf.phone} onChange={v => setLf(p => ({ ...p, phone: formatPhoneNumber(v) }))} />
              <AuthInput
                icon={<Lock size={16} />} type={showPass ? "text" : "password"}
                placeholder="••••••••" label="Пароль"
                value={lf.password} onChange={v => setLf(p => ({ ...p, password: v }))}
                right={
                  <button type="button" onClick={() => setShowPass(!showPass)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.35)", display: "flex" }}>
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
              />
              <button type="submit" disabled={isLoading} className="btn-gold" style={{ width: "100%", marginTop: 8, padding: "13px 24px" }}>
                {isLoading ? <Spinner /> : <><span>Увійти</span><ArrowRight size={17} /></>}
              </button>
            </form>
          )}

          {/* Register */}
          {tab === "register" && (
            <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" style={{ marginBottom: 2 }}>
                <AuthInput icon={<User size={15} />} type="text" placeholder="Ім'я" label="Ім'я" value={rf.first_name} onChange={v => setRf(p => ({ ...p, first_name: v }))} />
                <AuthInput icon={<User size={15} />} type="text" placeholder="Прізвище" label="Прізвище" value={rf.last_name} onChange={v => setRf(p => ({ ...p, last_name: v }))} />
              </div>
              <AuthInput icon={<Phone size={15} />} type="tel" placeholder="+380 XX XXX XX XX" label="Телефон" value={rf.phone} onChange={v => setRf(p => ({ ...p, phone: formatPhoneNumber(v) }))} />
              <AuthInput icon={<Calendar size={15} />} type="date" placeholder="ДД.ММ.РРРР" label="Дата народження" value={rf.birthdate} onChange={v => setRf(p => ({ ...p, birthdate: v }))} />
              <AuthInput
                icon={<Lock size={15} />}
                type={showPass ? "text" : "password"}
                placeholder="Мін. 8 символів" label="Пароль"
                value={rf.password} onChange={v => setRf(p => ({ ...p, password: v }))}
                right={
                  <button type="button" onClick={() => setShowPass(!showPass)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.35)", display: "flex" }}>
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                }
              />
              <AuthInput icon={<Lock size={15} />} type="password" placeholder="Повторіть пароль" label="Підтвердження" value={rf.confirm} onChange={v => setRf(p => ({ ...p, confirm: v }))} />
              <button type="submit" disabled={isLoading} className="btn-gold" style={{ width: "100%", marginTop: 6, padding: "13px 24px" }}>
                {isLoading ? <Spinner /> : <><span>Зареєструватись</span><ArrowRight size={17} /></>}
              </button>
              <p style={{ textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 4 }}>
                Реєструючись, ви погоджуєтесь з умовами використання
              </p>
            </form>
          )}
        </div>
      </div>

      {/* Back link */}
      <Link href="/" style={{ position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)", color: "rgba(255,255,255,0.3)", fontSize: 13, textDecoration: "none" }}>
        ← Повернутись на головну
      </Link>
    </div>
  );
}

function AuthInput({
  icon, label, type, placeholder, value, onChange, right
}: {
  icon: React.ReactNode; label: string; type: string; placeholder: string;
  value: string; onChange: (v: string) => void; right?: React.ReactNode;
}) {
  return (
    <div style={{ width: "100%" }}>
      <label style={{ display: "block", fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>{label}</label>
      <div style={{
        display: "flex", alignItems: "center",
        background: "rgba(255,255,255,0.05)", border: "1px solid rgba(201,168,76,0.18)",
        borderRadius: 14, transition: "border-color 0.18s",
        width: "100%",
      }}>
        <span style={{ paddingLeft: 14, color: "rgba(201,168,76,0.6)", display: "flex", flexShrink: 0 }}>{icon}</span>
        <input
          type={type} placeholder={placeholder} value={value || ""}
          onChange={e => onChange(e.target.value)} required
          style={{
            flex: 1, background: "none", border: "none", outline: "none",
            padding: "11px 12px", color: "#F9F5E8", fontSize: 14,
            fontFamily: "var(--font-sans)",
            width: "100%",
            minWidth: 0,
          }}
        />
        {right && <span style={{ paddingRight: 12, display: "flex", flexShrink: 0 }}>{right}</span>}
      </div>
    </div>
  );
}

function Spinner() {
  return <div style={{ width: 18, height: 18, border: "2px solid rgba(16,40,32,0.3)", borderTopColor: "#102820", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />;
}

export default function AuthPage() {
  return (
    <Suspense>
      <AuthForm />
    </Suspense>
  );
}

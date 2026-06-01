"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useAuthStore } from "@/lib/store";

/**
 * ThemeToggle Component
 * A premium, animated button to switch between dark (default) and light themes.
 * Integrates perfectly with the global useAuthStore.
 */
export default function ThemeToggle() {
  const { theme, setTheme } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Sync document class with the store's state on mount
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  if (!mounted) {
    return (
      <div 
        className="w-[42px] h-[42px] rounded-xl border border-gold-500/20 bg-emerald-900/10 dark:bg-white/5" 
        style={{ opacity: 0.5 }}
      />
    );
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2.5 rounded-xl border border-gold-500/20 bg-emerald-900/10 dark:bg-white/5 hover:bg-gold-500/10 dark:hover:bg-gold-500/10 text-gold-500 hover:text-gold-400 transition-all duration-300 flex items-center justify-center cursor-pointer shadow-sm hover:scale-105 active:scale-95"
      aria-label="Toggle Theme"
    >
      {theme === "dark" ? (
        <Sun className="w-5 h-5 animate-spin-slow" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
    </button>
  );
}

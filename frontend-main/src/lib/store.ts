import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "@/lib/api";

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  phone: string;
  age: number;
  role: "client" | "partner" | "admin";
  level: "Silver" | "Gold" | "Platinum" | "Diamond";
  md_balance: number;
  xp: number;
  referral_code: string;
  created_at: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  theme: "light" | "dark";
  setUser: (user: User | null) => void;
  setTheme: (theme: "light" | "dark") => void;
  login: (phone: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
}

interface RegisterData {
  first_name: string;
  last_name: string;
  phone: string;
  age: number;
  password: string;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      theme: "dark",

      setUser: (user) => set({ user }),
      setTheme: (theme) => {
        set({ theme });
        if (typeof document !== "undefined") {
          document.documentElement.classList.toggle("dark", theme === "dark");
        }
      },

      login: async (phone, password) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post("/auth/login", { phone, password });
          localStorage.setItem("access_token", data.access_token);
          localStorage.setItem("refresh_token", data.refresh_token);
          await get().fetchMe();
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (payload) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post("/auth/register", payload);
          localStorage.setItem("access_token", data.access_token);
          localStorage.setItem("refresh_token", data.refresh_token);
          await get().fetchMe();
        } finally {
          set({ isLoading: false });
        }
      },

      logout: () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        set({ user: null });
      },

      fetchMe: async () => {
        try {
          const { data } = await api.get("/user/me");
          set({ user: data });
        } catch {
          set({ user: null });
        }
      },
    }),
    { name: "profit-auth", partialize: (s) => ({ theme: s.theme }) }
  )
);

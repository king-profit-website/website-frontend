"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import Sidebar from "@/components/layout/Sidebar";
import TabBar from "@/components/layout/TabBar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, fetchMe } = useAuthStore();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.replace("/auth");
      return;
    }
    if (!user) fetchMe();
  }, []);

  return (
    <div className="app-shell">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Main content */}
      <main className="app-content">
        <div className="page-inner">
          {children}
        </div>
      </main>

      {/* Mobile bottom tab bar */}
      <TabBar />
    </div>
  );
}

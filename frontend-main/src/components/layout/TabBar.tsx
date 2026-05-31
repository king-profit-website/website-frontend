"use client";

import { usePathname, useRouter } from "next/navigation";
import { Home, MapPin, Users, UserCircle } from "lucide-react";

const TABS = [
  { href: "/app/home",     icon: Home,       label: "Головна" },
  { href: "/app/map",      icon: MapPin,      label: "Карта" },
  { href: "/app/partners", icon: Users,       label: "Партнери" },
  { href: "/app/profile",  icon: UserCircle,  label: "Профіль" },
];

export default function TabBar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="tab-bar" aria-label="Навігація">
      {TABS.map(({ href, icon: Icon, label }) => {
        const active = pathname.startsWith(href);
        return (
          <button
            key={href}
            onClick={() => router.push(href)}
            className={`tab-item${active ? " active" : ""}`}
            aria-label={label}
            aria-current={active ? "page" : undefined}
          >
            <Icon
              size={22}
              strokeWidth={active ? 2.5 : 1.8}
              aria-hidden="true"
            />
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}

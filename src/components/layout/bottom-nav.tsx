"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/discover", icon: "🔍", label: "Ontdek" },
  { href: "/matches", icon: "💬", label: "Matches" },
  { href: "/profile", icon: "👤", label: "Profiel" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50">
      <div
        className="flex items-center justify-around py-2 pb-6 px-4 bg-white border-t border-border"
      >
        {NAV_ITEMS.map((item) => {
          const isActive = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 py-1.5 px-5 rounded-2xl transition-all",
                isActive ? "text-primary-dark" : "text-text-muted"
              )}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs font-bold">{item.label}</span>
              {isActive && (
                <div className="w-1 h-1 rounded-full bg-primary mt-0.5" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

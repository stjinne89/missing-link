"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { DisciplineBadge, ModeBadge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import type { UserProfile, SportStats } from "@/types";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<(UserProfile & { sportStats?: SportStats | null }) | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/users/me");
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        const data = await res.json();
        setUser(data);
      } catch {
        router.push("/login");
      }
      setLoading(false);
    }
    load();
  }, [router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-4xl animate-pulse">🚴</div>
      </div>
    );
  }

  const stats = user.sportStats;

  return (
    <div className="min-h-screen pb-24 px-5 pt-5 bg-white">
      <h2
        className="text-2xl font-black mb-5"
        style={{ fontFamily: "'Libre Baskerville', serif", fontWeight: 700 }}
      >
        Mijn profiel
      </h2>

      {/* Profile card */}
      <div className="rounded-3xl overflow-hidden mb-5 bg-white card-shadow">
        <div
          className="h-32 flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #FFF3D0, #FFE5E5)" }}
        >
          <Avatar name={user.name} photoUrl={user.photoUrl} size={80} />
        </div>
        <div className="p-5 text-center">
          <h3 className="text-xl font-bold text-text">
            {user.name}{user.age ? `, ${user.age}` : ""}
          </h3>
          {user.city && <p className="text-sm text-text-muted">📍 {user.city}</p>}
          {user.bio && <p className="text-sm text-text mt-2">{user.bio}</p>}
          <div className="flex flex-wrap justify-center gap-1.5 mt-3">
            {user.modes?.map((m) => <ModeBadge key={m} mode={m} />)}
            {user.disciplines?.map((d) => (
              <DisciplineBadge key={d} discipline={d} small />
            ))}
          </div>
        </div>
      </div>

      {/* Sport stats */}
      {stats && (
        <div className="rounded-2xl p-4 mb-5 bg-white card-shadow">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-bold text-text">📊 Mijn statistieken</span>
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: "#FC4C0215", color: "#FC4C02" }}
            >
              {stats.provider}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <StatCard icon="⚡" label="Snelheid" value={stats.avgSpeed ?? "-"} unit="km/h" />
            <StatCard icon="📏" label="Afstand" value={stats.avgDistance ?? "-"} unit="km" color="#F4A261" />
            <StatCard icon="⏱️" label="Duur" value={stats.avgDuration ?? "-"} unit="min" color="#E63946" />
          </div>
          <div className="grid grid-cols-3 gap-2 mt-2">
            <StatCard icon="🔄" label="Ritten/wk" value={stats.weeklyRides ?? "-"} color="#9B5DE5" />
            <StatCard icon="🏔️" label="Hoogte" value={stats.avgElevation ?? "-"} unit="m" color="#457B9D" />
            <StatCard
              icon="📈"
              label="Totaal"
              value={stats.totalDistance ? `${(stats.totalDistance / 1000).toFixed(1)}k` : "-"}
              unit="km"
            />
          </div>
        </div>
      )}

      {/* Preferences summary */}
      <div className="rounded-2xl p-4 mb-5 bg-white card-shadow">
        <div className="text-sm font-bold text-text mb-3">⚙️ Voorkeuren</div>
        <div className="space-y-2 text-sm">
          {user.experience && (
            <div className="flex justify-between">
              <span className="text-text-muted">Niveau</span>
              <span className="text-text">{user.experience}</span>
            </div>
          )}
          {user.preferredDistance && (
            <div className="flex justify-between">
              <span className="text-text-muted">Afstand</span>
              <span className="text-text">{user.preferredDistance}</span>
            </div>
          )}
          {user.preferredDays?.length > 0 && (
            <div className="flex justify-between">
              <span className="text-text-muted">Dagen</span>
              <span className="text-text">{user.preferredDays.join(", ")}</span>
            </div>
          )}
          {user.ridePref?.length > 0 && (
            <div className="flex justify-between">
              <span className="text-text-muted">Voorkeur</span>
              <span className="text-text">{user.ridePref.join(", ")}</span>
            </div>
          )}
        </div>
      </div>

      {/* Menu items */}
      <div className="rounded-2xl overflow-hidden mb-5 bg-white card-shadow">
        {[
          { icon: "✏️", label: "Profiel bewerken", action: () => router.push("/profile/edit") },
          { icon: "🔗", label: "Gekoppelde accounts", action: () => {} },
          { icon: "🔒", label: "Privacy", action: () => {} },
          { icon: "🔔", label: "Notificaties", action: () => {} },
          { icon: "❓", label: "Help & support", action: () => {} },
        ].map((item, i) => (
          <button
            key={i}
            onClick={item.action}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-sm text-left text-text border-b border-border last:border-b-0 transition-colors hover:bg-bg-elevated"
          >
            <span>{item.icon}</span>
            <span className="flex-1">{item.label}</span>
            <span className="text-text-muted">→</span>
          </button>
        ))}
      </div>

      {/* Logout */}
      <button
        onClick={async () => {
          await fetch("/api/auth/logout", { method: "POST" });
          router.push("/");
          router.refresh();
        }}
        className="w-full py-3 rounded-full text-sm font-bold text-dating bg-dating-light transition-all active:scale-95"
      >
        Uitloggen
      </button>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { DisciplineBadge, ModeBadge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";

interface ProfileData {
  id: string;
  name: string;
  age: number | null;
  city: string | null;
  bio: string | null;
  photoUrl: string | null;
  modes: string[];
  disciplines: string[];
  experience: string | null;
  preferredDistance: string | null;
  preferredDays: string[];
  ridePref: string[];
  goals: string[];
  region: string | null;
  distance: number;
  sportStats: {
    provider: string;
    avgSpeed: number | null;
    avgDistance: number | null;
    avgDuration: number | null;
    avgElevation: number | null;
    weeklyRides: number | null;
    totalDistance: number | null;
    totalRides: number | null;
    recentActivities: {
      name: string;
      distance: string;
      speed: string;
      date: string;
      elevation: number;
    }[];
  } | null;
}

export default function ProfileDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const profileId = params.id as string;
  const mode = (searchParams.get("mode") || "dating") as "dating" | "ride";

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [liking, setLiking] = useState(false);
  const [matchPopup, setMatchPopup] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/users/${profileId}`);
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        }
      } catch (err) {
        console.error("Load error:", err);
      }
      setLoading(false);
    }
    if (profileId) load();
  }, [profileId]);

  const handleLike = async () => {
    if (!profile || liking) return;
    setLiking(true);
    try {
      const res = await fetch("/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetId: profile.id, mode }),
      });
      const data = await res.json();
      if (data.matched) {
        setMatchPopup(true);
        setTimeout(() => {
          setMatchPopup(false);
          router.push(`/chat?matchId=${data.matchId}&name=${profile.name}`);
        }, 2000);
      } else {
        router.back();
      }
    } catch (err) {
      console.error("Like error:", err);
    }
    setLiking(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-4xl animate-pulse">🚴</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6">
        <div className="text-4xl mb-4">😕</div>
        <p className="font-bold text-text">Profiel niet gevonden</p>
        <button onClick={() => router.back()} className="mt-4 text-sm text-primary-dark font-bold">
          ← Terug
        </button>
      </div>
    );
  }

  const isDating = mode === "dating";
  const stats = profile.sportStats;

  return (
    <div className="min-h-screen bg-white pb-28">
      {/* Header with back button */}
      <div
        className="relative h-64 flex items-end"
        style={{
          background: isDating
            ? "linear-gradient(160deg, #FFE5E5 0%, #FFF3D0 100%)"
            : "linear-gradient(160deg, #E0F8EA 0%, #FFF3D0 100%)",
        }}
      >
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 w-10 h-10 rounded-full flex items-center justify-center bg-white card-shadow text-text font-bold"
        >
          ←
        </button>

        <div className="absolute top-12 left-1/2 -translate-x-1/2">
          <Avatar name={profile.name} photoUrl={profile.photoUrl} size={120} />
        </div>

        <div className="relative z-10 p-5 w-full">
          <h1
            className="text-3xl tracking-tight text-text"
            style={{ fontFamily: "'Libre Baskerville', serif", fontWeight: 700 }}
          >
            {profile.name}
            {profile.age && (
              <span className="text-text-muted font-normal">, {profile.age}</span>
            )}
          </h1>
          <p className="text-sm text-text-muted font-semibold mt-0.5">
            📍 {profile.city || profile.region}
            {profile.distance > 0 && ` · ${profile.distance} km`}
          </p>
        </div>
      </div>

      <div className="px-5 space-y-5 mt-4">
        {/* Mode + Discipline badges */}
        <div className="flex flex-wrap gap-2">
          {profile.modes.map((m) => (
            <ModeBadge key={m} mode={m as "dating" | "ride"} />
          ))}
          {profile.disciplines.map((d) => (
            <DisciplineBadge key={d} discipline={d as any} small />
          ))}
        </div>

        {/* Bio */}
        {profile.bio && (
          <div className="rounded-2xl p-4 bg-bg-elevated">
            <p className="text-sm text-text leading-relaxed">{profile.bio}</p>
          </div>
        )}

        {/* Sport stats */}
        {stats && (
          <div className="rounded-2xl p-4 bg-white card-shadow">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-bold text-text">Sportstatistieken</span>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-bold"
                style={{ background: "#FC4C0212", color: "#FC4C02" }}
              >
                {stats.provider}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <StatCard icon="⚡" label="Snelheid" value={stats.avgSpeed ?? "-"} unit="km/h" />
              <StatCard icon="📏" label="Afstand" value={stats.avgDistance ?? "-"} unit="km" color="#E5AD00" />
              <StatCard icon="⏱️" label="Duur" value={stats.avgDuration ?? "-"} unit="min" color="#FF6B6B" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <StatCard icon="🔄" label="Ritten/wk" value={stats.weeklyRides ?? "-"} color="#9B59B6" />
              <StatCard icon="🏔️" label="Hoogte" value={stats.avgElevation ?? "-"} unit="m" color="#5B9BD5" />
              <StatCard
                icon="📈"
                label="Totaal"
                value={stats.totalDistance ? `${(stats.totalDistance / 1000).toFixed(1)}k` : "-"}
                unit="km"
                color="#2ECC71"
              />
            </div>
          </div>
        )}

        {/* Recent activities */}
        {stats?.recentActivities && stats.recentActivities.length > 0 && (
          <div className="rounded-2xl p-4 bg-white card-shadow">
            <div className="text-sm font-bold text-text mb-3">Recente ritten</div>
            <div className="space-y-0">
              {stats.recentActivities.slice(0, 5).map((act, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-3"
                  style={{ borderBottom: i < stats.recentActivities.length - 1 ? "1px solid var(--color-border)" : "none" }}
                >
                  <div>
                    <div className="text-sm font-bold text-text">{act.name}</div>
                    <div className="text-xs text-text-muted">
                      {new Date(act.date).toLocaleDateString("nl-NL", {
                        day: "numeric",
                        month: "short",
                      })}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-primary-dark">{act.distance} km</div>
                    <div className="text-xs text-text-muted">{act.speed} km/h · {act.elevation}hm</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Preferences */}
        <div className="rounded-2xl p-4 bg-white card-shadow">
          <div className="text-sm font-bold text-text mb-3">Voorkeuren</div>
          <div className="space-y-2.5">
            {[
              { label: "Niveau", value: profile.experience },
              { label: "Afstand", value: profile.preferredDistance },
              { label: "Dagen", value: profile.preferredDays?.join(", ") },
              { label: "Rijvoorkeur", value: profile.ridePref?.join(", ") },
              { label: "Doelen", value: profile.goals?.join(", ") },
            ]
              .filter((item) => item.value)
              .map((item) => (
                <div key={item.label} className="flex justify-between text-sm">
                  <span className="text-text-muted">{item.label}</span>
                  <span className="text-text font-semibold text-right max-w-[60%]">{item.value}</span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Fixed action bar at bottom */}
      <div
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md p-4 bg-white border-t border-border"
        style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom, 0px))" }}
      >
        <div className="flex gap-3">
          <button
            onClick={() => router.back()}
            className="w-14 h-14 rounded-full flex items-center justify-center text-xl shrink-0 bg-bg-elevated border border-border text-text-muted transition-all active:scale-90"
          >
            ✕
          </button>
          <button
            onClick={handleLike}
            disabled={liking}
            className="flex-1 h-14 rounded-full font-bold text-base flex items-center justify-center gap-2 transition-all active:scale-95 text-white disabled:opacity-50"
            style={{
              background: isDating ? "#FF6B6B" : "#2ECC71",
              boxShadow: isDating
                ? "0 4px 15px rgba(255,107,107,0.35)"
                : "0 4px 15px rgba(46,204,113,0.35)",
            }}
          >
            {isDating ? "❤️ Like" : "🤝 Connect"}
          </button>
        </div>
      </div>

      {/* Match celebration popup */}
      {matchPopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in"
          style={{ background: "rgba(255,198,41,0.92)" }}
        >
          <div className="text-center animate-bounce-in">
            <div className="text-7xl mb-4">{isDating ? "❤️" : "🤝"}</div>
            <h2 className="text-3xl font-black text-secondary mb-2">
              {isDating ? "It's a Match!" : "Connected!"}
            </h2>
            <p className="text-secondary/70 font-semibold">
              Jij en {profile.name} kunnen nu chatten
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

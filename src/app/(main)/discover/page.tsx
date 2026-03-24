"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ProfileCard } from "@/components/cards/profile-card";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { ChipSelect } from "@/components/ui/chip-select";
import { DISCIPLINES } from "@/config/constants";
import { LogoInline } from "@/components/ui/logo";
import type { AppMode, DiscoverProfile } from "@/types";

export default function DiscoverPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<DiscoverProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentMode, setCurrentMode] = useState<AppMode>("dating");
  const [userModes, setUserModes] = useState<AppMode[]>(["dating", "ride"]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [matchPopup, setMatchPopup] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    discipline: "",
    maxDistance: 100,
    minSpeed: 0,
    maxSpeed: 50,
  });

  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        mode: currentMode,
        maxDistance: String(filters.maxDistance),
        minSpeed: String(filters.minSpeed),
        maxSpeed: String(filters.maxSpeed),
      });
      if (filters.discipline) params.set("discipline", filters.discipline);

      const res = await fetch(`/api/discover?${params}`);
      const data = await res.json();
      setProfiles(data.profiles || []);
      setCurrentIndex(0);
    } catch (err) {
      console.error("Fetch error:", err);
    }
    setLoading(false);
  }, [currentMode, filters]);

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch("/api/users/me");
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      if (!data.onboardingComplete) {
        router.push("/onboarding");
        return;
      }
      setUserModes(data.modes || ["dating", "ride"]);
      if (data.modes?.length && !data.modes.includes(currentMode)) {
        setCurrentMode(data.modes[0]);
      }
    } catch {
      router.push("/login");
    }
  }, [router, currentMode]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const handleLike = async () => {
    const profile = profiles[currentIndex];
    if (!profile) return;

    try {
      const res = await fetch("/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetId: profile.id, mode: currentMode }),
      });
      const data = await res.json();
      if (data.matched) {
        setMatchPopup(profile.name);
        setTimeout(() => setMatchPopup(null), 2500);
      }
    } catch (err) {
      console.error("Like error:", err);
    }

    setCurrentIndex((i) => i + 1);
  };

  const handleSkip = () => {
    setCurrentIndex((i) => i + 1);
  };

  const currentProfile = profiles[currentIndex];

  return (
    <div className="min-h-screen pb-24 bg-white">
      {/* Header */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center justify-between mb-4">
          <LogoInline />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-10 h-10 rounded-xl flex items-center justify-center bg-bg-elevated card-shadow"
          >
            ⚙
          </button>
        </div>

        <ModeToggle
          current={currentMode}
          available={userModes}
          onChange={(m) => setCurrentMode(m)}
        />
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="px-5 pb-4 animate-slide-up">
          <div className="rounded-2xl p-4 space-y-3 bg-white card-shadow">
            <div>
              <label className="text-xs font-semibold text-text-muted block mb-1.5">
                Discipline
              </label>
              <select
                value={filters.discipline}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, discipline: e.target.value }))
                }
                className="w-full px-3 py-2 rounded-lg text-sm bg-bg-elevated text-text border border-border outline-none"
              >
                <option value="">Alle disciplines</option>
                {DISCIPLINES.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.icon} {d.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-text-muted block mb-1.5">
                Max afstand: {filters.maxDistance} km
              </label>
              <input
                type="range"
                min="5"
                max="150"
                value={filters.maxDistance}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, maxDistance: +e.target.value }))
                }
                className="w-full"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-text-muted block mb-1">
                  Min snelheid (km/h)
                </label>
                <input
                  type="number"
                  value={filters.minSpeed}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, minSpeed: +e.target.value }))
                  }
                  className="w-full px-3 py-2 rounded-lg text-sm bg-bg-elevated text-text border border-border outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-text-muted block mb-1">
                  Max snelheid (km/h)
                </label>
                <input
                  type="number"
                  value={filters.maxSpeed}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, maxSpeed: +e.target.value }))
                  }
                  className="w-full px-3 py-2 rounded-lg text-sm bg-bg-elevated text-text border border-border outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Card stack */}
      <div className="px-5">
        {loading ? (
          <div className="rounded-3xl p-16 text-center bg-white card-shadow">
            <div className="text-4xl mb-3 animate-pulse">🚴</div>
            <p className="text-text-muted">Fietsers zoeken...</p>
          </div>
        ) : currentProfile ? (
          <ProfileCard
            profile={currentProfile}
            currentMode={currentMode}
            onLike={handleLike}
            onSkip={handleSkip}
            onViewProfile={() => {
              router.push(`/profile/${currentProfile.id}?mode=${currentMode}`);
            }}
          />
        ) : (
          <div className="rounded-3xl p-12 text-center bg-white card-shadow">
            <div className="text-4xl mb-3">🔍</div>
            <p className="font-semibold text-text">Geen fietsers meer</p>
            <p className="text-sm text-text-muted mt-1">
              Pas je filters aan of kom later terug
            </p>
            <button
              onClick={() => {
                setCurrentIndex(0);
                fetchProfiles();
              }}
              className="mt-4 px-6 py-2 rounded-xl text-sm font-semibold bg-bg-elevated text-accent border border-accent/30"
            >
              Opnieuw laden
            </button>
          </div>
        )}
      </div>

      {/* Counter */}
      {profiles.length > 0 && (
        <div className="text-center mt-4">
          <span className="text-xs text-text-muted">
            {Math.min(currentIndex + 1, profiles.length)} / {profiles.length} fietsers
          </span>
        </div>
      )}

      {/* Match popup */}
      {matchPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in"
          style={{ background: "rgba(255,198,41,0.92)" }}>
          <div className="text-center animate-bounce-in">
            <div className="text-7xl mb-4">
              {currentMode === "dating" ? "❤️" : "🤝"}
            </div>
            <h2 className="text-3xl font-black text-secondary mb-2">
              {currentMode === "dating" ? "It's a Match!" : "Connected!"}
            </h2>
            <p className="text-secondary/70 font-semibold">
              Jij en {matchPopup} kunnen nu chatten
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

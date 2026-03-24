"use client";

import { Avatar } from "@/components/ui/avatar";
import { DisciplineBadge, ModeBadge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import type { DiscoverProfile, AppMode } from "@/types";

interface ProfileCardProps {
  profile: DiscoverProfile;
  currentMode: AppMode;
  onLike: () => void;
  onSkip: () => void;
  onViewProfile: () => void;
}

export function ProfileCard({
  profile: p,
  currentMode,
  onLike,
  onSkip,
  onViewProfile,
}: ProfileCardProps) {
  const isDating = currentMode === "dating";

  return (
    <div className="rounded-3xl overflow-hidden animate-scale-in card-shadow-lg bg-white">
      {/* Header area with avatar */}
      <div
        className="relative h-52 flex items-center justify-center"
        style={{
          background: isDating
            ? "linear-gradient(135deg, #FFE5E5, #FFF3D0)"
            : "linear-gradient(135deg, #E0F8EA, #FFF3D0)",
        }}
      >
        <Avatar name={p.name} photoUrl={p.photoUrl} size={110} />
        {p.matchScore > 0 && (
          <div className="absolute top-4 right-4 px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-white card-shadow text-primary-dark">
            {p.matchScore}% match
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="text-xl font-extrabold text-text">
              {p.name}
              {p.age && <span className="font-normal text-text-muted">, {p.age}</span>}
            </h3>
            <p className="text-sm text-text-muted font-semibold">
              📍 {p.city || p.region} · {p.distance}km
            </p>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {p.modes.map((m) => (
            <ModeBadge key={m} mode={m} />
          ))}
          {p.disciplines.slice(0, 3).map((d) => (
            <DisciplineBadge key={d} discipline={d} small />
          ))}
        </div>

        {/* Bio */}
        <p className="text-sm text-text-secondary mb-4 line-clamp-2 leading-relaxed">{p.bio}</p>

        {/* Quick sport stats */}
        {p.sportStats && (
          <div className="grid grid-cols-4 gap-2 mb-5 bg-bg-elevated rounded-2xl p-3">
            <div className="text-center">
              <div className="text-sm font-extrabold text-primary-dark">
                {p.sportStats.avgSpeed}
              </div>
              <div className="text-xs text-text-muted font-semibold">km/h</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-extrabold" style={{ color: "#E5AD00" }}>
                {p.sportStats.avgDistance}
              </div>
              <div className="text-xs text-text-muted font-semibold">km</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-extrabold" style={{ color: "#FF6B6B" }}>
                {p.sportStats.weeklyRides}x
              </div>
              <div className="text-xs text-text-muted font-semibold">per wk</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-extrabold" style={{ color: "#9B59B6" }}>
                {p.sportStats.avgElevation}
              </div>
              <div className="text-xs text-text-muted font-semibold">hm</div>
            </div>
          </div>
        )}

        {/* Actions — Bumble-style rounded buttons */}
        <div className="flex gap-3 items-center">
          <button
            onClick={onSkip}
            className="w-14 h-14 rounded-full flex items-center justify-center text-xl shrink-0 bg-bg-elevated border border-border transition-all active:scale-90 text-text-muted"
          >
            ✕
          </button>
          <button
            onClick={onViewProfile}
            className="flex-1 h-14 rounded-full font-bold text-sm bg-bg-elevated text-text-secondary border border-border transition-all active:scale-95"
          >
            Bekijk profiel
          </button>
          <button
            onClick={onLike}
            className="w-14 h-14 rounded-full flex items-center justify-center text-2xl shrink-0 transition-all active:scale-90 text-white"
            style={{
              background: isDating ? "#FF6B6B" : "#2ECC71",
              boxShadow: isDating ? "0 4px 15px rgba(255,107,107,0.35)" : "0 4px 15px rgba(46,204,113,0.35)",
            }}
          >
            {isDating ? "♥" : "🤝"}
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { DisciplineBadge, ModeBadge } from "@/components/ui/badge";
import { ModeToggle } from "@/components/ui/mode-toggle";
import type { AppMode, MatchData } from "@/types";

export default function MatchesPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMode, setCurrentMode] = useState<AppMode>("dating");
  const [userModes, setUserModes] = useState<AppMode[]>(["dating", "ride"]);

  useEffect(() => {
    async function load() {
      try {
        const [matchRes, userRes] = await Promise.all([
          fetch("/api/matches"),
          fetch("/api/users/me"),
        ]);

        if (userRes.status === 401) {
          router.push("/login");
          return;
        }

        const matchData = await matchRes.json();
        const userData = await userRes.json();

        setMatches(matchData.matches || []);
        setUserModes(userData.modes || ["dating", "ride"]);
      } catch {
        router.push("/login");
      }
      setLoading(false);
    }
    load();
  }, [router]);

  const filteredMatches = matches.filter((m) => m.mode === currentMode);

  return (
    <div className="min-h-screen pb-24 px-5 pt-5 bg-white">
      <h2
        className="text-2xl font-black mb-4"
        style={{ fontFamily: "'Libre Baskerville', serif", fontWeight: 700 }}
      >
        {currentMode === "dating" ? "💕 Matches" : "🤝 Connecties"}
      </h2>

      <div className="mb-5">
        <ModeToggle
          current={currentMode}
          available={userModes}
          onChange={setCurrentMode}
        />
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3 animate-pulse">💬</div>
          <p className="text-text-muted">Laden...</p>
        </div>
      ) : filteredMatches.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🚴</div>
          <p className="font-semibold text-text">Nog geen matches</p>
          <p className="text-sm text-text-muted mt-1">
            Begin met swipen om fietsers te ontdekken
          </p>
          <button
            onClick={() => router.push("/discover")}
            className="mt-4 px-6 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-br primary text-secondary font-extrabold"
          >
            Ontdekken →
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredMatches.map((m) => (
            <button
              key={m.id}
              onClick={() => router.push(`/chat?matchId=${m.id}&name=${m.partnerName}&partnerId=${m.partnerId}`)}
              className="w-full p-4 rounded-2xl flex items-center gap-4 text-left transition-all active:scale-[0.98] bg-white card-shadow"
            >
              <Avatar name={m.partnerName} photoUrl={m.partnerPhotoUrl} size={52} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-text">{m.partnerName}</span>
                  {m.partnerCity && (
                    <span className="text-xs text-text-muted">{m.partnerCity}</span>
                  )}
                </div>
                <div className="flex gap-1 mt-1">
                  {m.partnerDisciplines?.slice(0, 2).map((d) => (
                    <DisciplineBadge key={d} discipline={d} small />
                  ))}
                </div>
                {m.lastMessage && (
                  <p className="text-xs text-text-muted mt-1 truncate">
                    {m.lastMessage}
                  </p>
                )}
              </div>
              <div className="text-right shrink-0 flex flex-col items-end gap-1">
                {m.score && (
                  <div className="text-sm font-bold text-success">{Math.round(m.score)}%</div>
                )}
                {m.unreadCount > 0 ? (
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: "#FF6B6B" }}
                  >
                    {m.unreadCount > 9 ? "9+" : m.unreadCount}
                  </div>
                ) : (
                  <div className="text-xs text-text-muted">→</div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

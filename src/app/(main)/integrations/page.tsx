"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { StatCard } from "@/components/ui/stat-card";

interface Integration {
  provider: string;
  avgSpeed: number | null;
  avgDistance: number | null;
  avgDuration: number | null;
  avgElevation: number | null;
  weeklyRides: number | null;
  totalDistance: number | null;
  totalRides: number | null;
  lastSyncAt: string | null;
}

const PROVIDERS = [
  {
    id: "strava",
    name: "Strava",
    color: "#FC4C02",
    icon: "🟠",
    description: "Koppel je Strava account om je ritten automatisch te importeren",
  },
  {
    id: "garmin",
    name: "Garmin",
    color: "#007AC9",
    icon: "🔵",
    description: "Garmin Connect koppeling (binnenkort beschikbaar)",
    comingSoon: true,
  },
  {
    id: "wahoo",
    name: "Wahoo",
    color: "#E8003D",
    icon: "🔴",
    description: "Wahoo Cloud koppeling (binnenkort beschikbaar)",
    comingSoon: true,
  },
];

function IntegrationsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [banner, setBanner] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    const success = searchParams.get("success");
    const error = searchParams.get("error");
    if (success) setBanner({ type: "success", message: `${success.charAt(0).toUpperCase() + success.slice(1)} succesvol gekoppeld!` });
    if (error) setBanner({ type: "error", message: decodeURIComponent(error) });
    if (success || error) {
      // Clean up URL
      window.history.replaceState({}, "", "/integrations");
      setTimeout(() => setBanner(null), 4000);
    }
  }, [searchParams]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/integrations");
        if (res.status === 401) { router.push("/login"); return; }
        const data = await res.json();
        setIntegrations(data.integrations || []);
      } catch {
        router.push("/login");
      }
      setLoading(false);
    }
    load();
  }, [router]);

  const syncStrava = async () => {
    setSyncing("strava");
    try {
      const res = await fetch("/api/integrations/strava/sync", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setIntegrations((prev) =>
          prev.map((i) => (i.provider === "strava" ? { ...i, ...data.integration } : i))
        );
        setBanner({ type: "success", message: "Strava data bijgewerkt!" });
      }
    } catch {
      setBanner({ type: "error", message: "Sync mislukt, probeer opnieuw" });
    }
    setSyncing(null);
    setTimeout(() => setBanner(null), 3000);
  };

  const connected = (id: string) => integrations.find((i) => i.provider === id);

  return (
    <div className="min-h-screen pb-24 px-5 pt-5 bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.push("/profile")}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-bg-elevated border border-border text-text font-bold"
        >
          ←
        </button>
        <h1
          className="text-xl tracking-tight text-text"
          style={{ fontFamily: "'Libre Baskerville', serif", fontWeight: 700 }}
        >
          Gekoppelde accounts
        </h1>
      </div>

      {/* Banner */}
      {banner && (
        <div
          className="mb-4 px-4 py-3 rounded-2xl text-sm font-medium animate-slide-up"
          style={{
            background: banner.type === "success" ? "#E0F8EA" : "#FFE5E5",
            color: banner.type === "success" ? "#27AE60" : "#E74C3C",
          }}
        >
          {banner.type === "success" ? "✅ " : "❌ "}{banner.message}
        </div>
      )}

      {/* Provider cards */}
      <div className="space-y-4">
        {PROVIDERS.map((p) => {
          const conn = connected(p.id);
          const isConnected = !!conn;

          return (
            <div key={p.id} className="rounded-3xl p-5 bg-white card-shadow">
              {/* Header */}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{p.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-text">{p.name}</span>
                    {isConnected && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-bold"
                        style={{ background: "#E0F8EA", color: "#27AE60" }}
                      >
                        Gekoppeld
                      </span>
                    )}
                    {p.comingSoon && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-bold"
                        style={{ background: "#F5F5F5", color: "#999" }}
                      >
                        Binnenkort
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-muted mt-0.5">{p.description}</p>
                </div>
              </div>

              {/* Stats (if connected) */}
              {isConnected && conn && (
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <StatCard icon="⚡" label="Snelheid" value={conn.avgSpeed ?? "-"} unit="km/h" />
                  <StatCard icon="📏" label="Gem. afstand" value={conn.avgDistance ?? "-"} unit="km" color="#F4A261" />
                  <StatCard icon="🔄" label="Ritten/wk" value={conn.weeklyRides ?? "-"} color="#9B5DE5" />
                </div>
              )}

              {isConnected && conn?.lastSyncAt && (
                <p className="text-xs text-text-muted mb-3">
                  Laatste sync: {new Date(conn.lastSyncAt).toLocaleString("nl-NL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </p>
              )}

              {/* Action buttons */}
              {!p.comingSoon && (
                <div className="flex gap-2">
                  {!isConnected ? (
                    <a
                      href={`/api/integrations/${p.id}/authorize`}
                      className="flex-1 py-2.5 rounded-2xl text-sm font-bold text-center text-white transition-all active:scale-95"
                      style={{ background: p.color }}
                    >
                      Koppelen met {p.name}
                    </a>
                  ) : (
                    <>
                      <button
                        onClick={p.id === "strava" ? syncStrava : undefined}
                        disabled={syncing === p.id}
                        className="flex-1 py-2.5 rounded-2xl text-sm font-bold transition-all active:scale-95"
                        style={{ background: `${p.color}15`, color: p.color, border: `1.5px solid ${p.color}30` }}
                      >
                        {syncing === p.id ? "Syncing..." : "↻ Opnieuw sync"}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Info block */}
      <div className="mt-6 p-4 rounded-2xl bg-bg-elevated">
        <p className="text-xs text-text-muted leading-relaxed">
          <strong className="text-text">Hoe het werkt:</strong> Door je fietsapp te koppelen importeert Missing Link automatisch je gemiddelde snelheid, ritafstand en trainingsfrequentie. Dit maakt je match-score nauwkeuriger en laat andere fietsers zien wie jij bent als fietser. We slaan nooit je volledige ritgeschiedenis op.
        </p>
      </div>
    </div>
  );
}

export default function IntegrationsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-4xl animate-pulse">🔗</div>
      </div>
    }>
      <IntegrationsContent />
    </Suspense>
  );
}

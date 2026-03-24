"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChipSelect } from "@/components/ui/chip-select";
import { StatCard } from "@/components/ui/stat-card";
import {
  DISCIPLINES,
  EXPERIENCE_LEVELS,
  GOALS,
  DAYS,
  RIDE_PREFS,
  DISTANCE_OPTIONS,
  INTEGRATION_PROVIDERS,
} from "@/config/constants";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    modes: [] as string[],
    age: "",
    city: "",
    bio: "",
    gender: "Man",
    genderPref: "Vrouw",
    disciplines: [] as string[],
    experience: "Gevorderd",
    goals: [] as string[],
    preferredDistance: "",
    preferredDays: [] as string[],
    ridePref: [] as string[],
    connectedProvider: null as string | null,
    sportStats: null as Record<string, number> | null,
  });

  const toggle = (field: string, val: string) => {
    setProfile((p) => {
      const arr = (p as any)[field] as string[];
      return {
        ...p,
        [field]: arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val],
      };
    });
  };

  const connectProvider = async (provider: string) => {
    try {
      const res = await fetch("/api/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider }),
      });
      const data = await res.json();
      if (data.success) {
        setProfile((p) => ({
          ...p,
          connectedProvider: provider,
          sportStats: data.stats,
        }));
      }
    } catch (err) {
      console.error("Connect error:", err);
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age: profile.age ? Number(profile.age) : null,
          city: profile.city,
          bio: profile.bio,
          gender: profile.gender,
          genderPref: profile.genderPref,
          modes: profile.modes,
          disciplines: profile.disciplines,
          experience: profile.experience,
          goals: profile.goals,
          preferredDistance: profile.preferredDistance,
          preferredDays: profile.preferredDays,
          ridePref: profile.ridePref,
          onboardingComplete: true,
        }),
      });
      router.push("/discover");
      router.refresh();
    } catch (err) {
      console.error("Save error:", err);
      setSaving(false);
    }
  };

  const STEPS = [
    // 0 — Mode selection
    {
      title: "Wat zoek je?",
      subtitle: "Je kunt altijd beide kiezen",
      icon: "🚴‍♂️",
      valid: profile.modes.length > 0,
      content: (
        <div className="space-y-3">
          {[
            { id: "dating", icon: "❤️", title: "Dating", desc: "Vind liefde via een gedeelde passie", color: "#FF6B6B" },
            { id: "ride", icon: "🚴", title: "Ride / BFF", desc: "Zoek fietsmaatjes om samen te rijden", color: "#2ECC71" },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => toggle("modes", m.id)}
              className="w-full p-5 rounded-2xl text-left transition-all flex items-center gap-4 active:scale-[0.98]"
              style={{
                background: profile.modes.includes(m.id) ? m.color + "12" : "var(--color-bg-elevated)",
                border: `2px solid ${profile.modes.includes(m.id) ? m.color : "var(--color-border)"}`,
              }}
            >
              <span className="text-3xl">{m.icon}</span>
              <div className="flex-1">
                <div
                  className="font-bold text-lg"
                  style={{ color: profile.modes.includes(m.id) ? m.color : "var(--color-text)" }}
                >
                  {m.title}
                </div>
                <div className="text-sm text-text-muted">{m.desc}</div>
              </div>
              {profile.modes.includes(m.id) && <span className="text-xl">✓</span>}
            </button>
          ))}
        </div>
      ),
    },
    // 1 — Basic info
    {
      title: "Over jou",
      icon: "👤",
      valid: Boolean(profile.age && profile.city),
      content: (
        <div className="space-y-4">
          <Input
            label="Leeftijd"
            type="number"
            placeholder="25"
            value={profile.age}
            onChange={(e) => setProfile((p) => ({ ...p, age: e.target.value }))}
          />
          <Input
            label="Woonplaats"
            placeholder="Utrecht"
            value={profile.city}
            onChange={(e) => setProfile((p) => ({ ...p, city: e.target.value }))}
          />
          <div>
            <label className="text-sm font-semibold text-text-muted mb-1.5 block">Bio</label>
            <textarea
              rows={3}
              placeholder="Vertel iets over jezelf en je fietspassie..."
              value={profile.bio}
              onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl text-sm bg-bg-elevated text-text border border-border outline-none resize-none focus:ring-2 focus:ring-accent/40"
            />
          </div>
          {profile.modes.includes("dating") && (
            <div className="grid grid-cols-2 gap-3">
              {(["gender", "genderPref"] as const).map((field) => (
                <div key={field}>
                  <label className="text-sm font-semibold text-text-muted mb-1.5 block">
                    {field === "gender" ? "Ik ben" : "Ik zoek"}
                  </label>
                  <select
                    value={profile[field]}
                    onChange={(e) => setProfile((p) => ({ ...p, [field]: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl text-sm bg-bg-elevated text-text border border-border outline-none"
                  >
                    {["Man", "Vrouw", "Non-binair", "Iedereen"].map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}
        </div>
      ),
    },
    // 2 — Cycling profile
    {
      title: "Jouw fietsprofiel",
      icon: "🚲",
      valid: profile.disciplines.length > 0,
      content: (
        <div className="space-y-5">
          <div>
            <label className="text-sm font-semibold text-text-muted mb-2 block">Disciplines</label>
            <ChipSelect
              options={DISCIPLINES.map((d) => ({ id: d.id, label: d.label, icon: d.icon, color: d.color }))}
              selected={profile.disciplines}
              onToggle={(id) => toggle("disciplines", id)}
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-text-muted mb-2 block">Niveau</label>
            <ChipSelect
              options={EXPERIENCE_LEVELS.map((e) => e)}
              selected={[profile.experience]}
              onToggle={(e) => setProfile((p) => ({ ...p, experience: e }))}
              color="#F4A261"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-text-muted mb-2 block">Doelen</label>
            <ChipSelect
              options={GOALS.map((g) => g)}
              selected={profile.goals}
              onToggle={(g) => toggle("goals", g)}
            />
          </div>
        </div>
      ),
    },
    // 3 — Preferences
    {
      title: "Voorkeuren",
      icon: "⚙️",
      valid: true,
      content: (
        <div className="space-y-5">
          <div>
            <label className="text-sm font-semibold text-text-muted mb-1.5 block">Voorkeursafstand</label>
            <select
              value={profile.preferredDistance}
              onChange={(e) => setProfile((p) => ({ ...p, preferredDistance: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl text-sm bg-bg-elevated text-text border border-border outline-none"
            >
              <option value="">Kies...</option>
              {DISTANCE_OPTIONS.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-text-muted mb-2 block">Voorkeursdagen</label>
            <ChipSelect
              options={DAYS.map((d) => d)}
              selected={profile.preferredDays}
              onToggle={(d) => toggle("preferredDays", d)}
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-text-muted mb-2 block">Rijvoorkeur</label>
            <ChipSelect
              options={RIDE_PREFS.map((r) => r)}
              selected={profile.ridePref}
              onToggle={(r) => toggle("ridePref", r)}
              color="#F4A261"
            />
          </div>
        </div>
      ),
    },
    // 4 — Sport integrations
    {
      title: "Koppel je sportdata",
      subtitle: "Voor betere matches en profielstatistieken",
      icon: "📊",
      valid: true,
      content: (
        <div className="space-y-4">
          {Object.values(INTEGRATION_PROVIDERS).map((prov) => {
            const isConnected = profile.connectedProvider === prov.id;
            return (
              <button
                key={prov.id}
                onClick={() => connectProvider(prov.id)}
                className="w-full p-4 rounded-2xl flex items-center gap-4 transition-all active:scale-[0.98]"
                style={{
                  background: isConnected ? prov.color + "12" : "var(--color-bg-elevated)",
                  border: `2px solid ${isConnected ? prov.color : "var(--color-border)"}`,
                }}
              >
                <span className="text-2xl">{prov.icon}</span>
                <div className="flex-1 text-left">
                  <div className="font-bold text-text">{prov.name}</div>
                  <div className="text-xs text-text-muted">
                    {isConnected ? "Gekoppeld ✓" : "Klik om te verbinden (demo)"}
                  </div>
                </div>
              </button>
            );
          })}

          {profile.sportStats && (
            <div
              className="rounded-2xl p-4"
              style={{ background: "rgba(255,198,41,0.1)", border: "1px solid rgba(255,198,41,0.2)" }}
            >
              <div className="text-sm font-semibold text-primary-dark mb-3">📊 Opgehaalde data</div>
              <div className="grid grid-cols-3 gap-2">
                <StatCard
                  icon="⚡"
                  label="Gem. snelheid"
                  value={profile.sportStats.avgSpeed?.toFixed(1) ?? "-"}
                  unit="km/h"
                />
                <StatCard
                  icon="📏"
                  label="Gem. afstand"
                  value={profile.sportStats.avgDistance?.toFixed(0) ?? "-"}
                  unit="km"
                  color="#F4A261"
                />
                <StatCard
                  icon="🔄"
                  label="Ritten/week"
                  value={profile.sportStats.weeklyRides?.toFixed(0) ?? "-"}
                  color="#E63946"
                />
              </div>
            </div>
          )}
        </div>
      ),
    },
  ];

  const current = STEPS[step];
  const totalSteps = STEPS.length;

  return (
    <div className="min-h-screen px-5 py-8 flex flex-col bg-white">
      {/* Progress bar */}
      <div className="flex gap-1.5 mb-8">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className="flex-1 h-1.5 rounded-full transition-all"
            style={{ background: i <= step ? "var(--color-primary)" : "var(--color-border)" }}
          />
        ))}
      </div>

      {/* Step content */}
      <div className="flex-1 animate-slide-up" key={step}>
        <div className="text-center mb-6">
          {current.icon && <div className="text-4xl mb-3">{current.icon}</div>}
          <h2 className="text-2xl font-bold text-text">{current.title}</h2>
          {current.subtitle && (
            <p className="text-sm text-text-muted mt-1">{current.subtitle}</p>
          )}
        </div>
        {current.content}
      </div>

      {/* Navigation buttons */}
      <div className="flex gap-3 mt-8">
        {step > 0 && (
          <Button variant="secondary" className="flex-1" onClick={() => setStep((s) => s - 1)}>
            Terug
          </Button>
        )}
        <Button
          className="flex-1"
          disabled={!current.valid || saving}
          onClick={() => {
            if (step < totalSteps - 1) {
              setStep((s) => s + 1);
            } else {
              saveProfile();
            }
          }}
        >
          {step < totalSteps - 1
            ? "Volgende"
            : saving
              ? "Opslaan..."
              : "Start met ontdekken 🚀"}
        </Button>
      </div>
    </div>
  );
}

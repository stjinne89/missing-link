"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChipSelect } from "@/components/ui/chip-select";
import { Avatar } from "@/components/ui/avatar";
import {
  DISCIPLINES,
  EXPERIENCE_LEVELS,
  GOALS,
  DAYS,
  RIDE_PREFS,
  DISTANCE_OPTIONS,
} from "@/config/constants";

interface ProfileForm {
  name: string;
  age: string;
  city: string;
  bio: string;
  gender: string;
  genderPref: string;
  modes: string[];
  disciplines: string[];
  experience: string;
  goals: string[];
  preferredDistance: string;
  preferredDays: string[];
  ridePref: string[];
}

export default function EditProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/users/me");
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        const data = await res.json();
        setProfile({
          name: data.name || "",
          age: data.age?.toString() || "",
          city: data.city || "",
          bio: data.bio || "",
          gender: data.gender || "Man",
          genderPref: data.genderPref || "Iedereen",
          modes: data.modes || [],
          disciplines: data.disciplines || [],
          experience: data.experience || "Gevorderd",
          goals: data.goals || [],
          preferredDistance: data.preferredDistance || "",
          preferredDays: data.preferredDays || [],
          ridePref: data.ridePref || [],
        });
      } catch {
        router.push("/login");
      }
      setLoading(false);
    }
    load();
  }, [router]);

  const toggle = (field: keyof ProfileForm, val: string) => {
    setProfile((p) => {
      if (!p) return p;
      const arr = p[field] as string[];
      return {
        ...p,
        [field]: arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val],
      };
    });
    setSaved(false);
  };

  const update = (field: keyof ProfileForm, val: string) => {
    setProfile((p) => (p ? { ...p, [field]: val } : p));
    setSaved(false);
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name,
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
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Save error:", err);
    }
    setSaving(false);
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-4xl animate-pulse">🚴</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-28">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-5 pb-3">
        <button
          onClick={() => router.push("/profile")}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-bg-elevated border border-border text-text font-bold"
        >
          ←
        </button>
        <h1
          className="text-xl tracking-tight text-text flex-1"
          style={{ fontFamily: "'Libre Baskerville', serif", fontWeight: 700 }}
        >
          Profiel bewerken
        </h1>
      </div>

      <div className="px-5 space-y-6 mt-2">
        {/* Avatar placeholder */}
        <div className="flex justify-center">
          <div className="relative">
            <Avatar name={profile.name || "U"} size={90} />
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-sm text-secondary font-bold card-shadow">
              +
            </div>
          </div>
        </div>

        {/* --- SECTION: Basisinfo --- */}
        <Section title="Basisinfo">
          <Input
            label="Naam"
            value={profile.name}
            onChange={(e) => update("name", e.target.value)}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Leeftijd"
              type="number"
              value={profile.age}
              onChange={(e) => update("age", e.target.value)}
            />
            <Input
              label="Woonplaats"
              value={profile.city}
              onChange={(e) => update("city", e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-bold text-text-secondary mb-1.5 block">Bio</label>
            <textarea
              rows={3}
              value={profile.bio}
              onChange={(e) => update("bio", e.target.value)}
              placeholder="Vertel iets over jezelf en je fietspassie..."
              className="w-full px-4 py-3.5 rounded-2xl text-sm bg-bg-elevated text-text border border-border outline-none resize-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        </Section>

        {/* --- SECTION: Modus --- */}
        <Section title="Wat zoek je?">
          <div className="space-y-2">
            {[
              { id: "dating", label: "❤️ Dating", color: "#FF6B6B" },
              { id: "ride", label: "🚴 Ride / BFF", color: "#2ECC71" },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => toggle("modes", m.id)}
                className="w-full p-4 rounded-2xl text-left transition-all flex items-center gap-3 active:scale-[0.98]"
                style={{
                  background: profile.modes.includes(m.id) ? m.color + "12" : "var(--color-bg-elevated)",
                  border: `2px solid ${profile.modes.includes(m.id) ? m.color : "var(--color-border)"}`,
                }}
              >
                <span className="text-lg">{m.label.split(" ")[0]}</span>
                <span
                  className="font-bold"
                  style={{ color: profile.modes.includes(m.id) ? m.color : "var(--color-text)" }}
                >
                  {m.label.substring(m.label.indexOf(" ") + 1)}
                </span>
                {profile.modes.includes(m.id) && <span className="ml-auto font-bold" style={{ color: m.color }}>✓</span>}
              </button>
            ))}
          </div>
        </Section>

        {/* --- SECTION: Dating voorkeuren --- */}
        {profile.modes.includes("dating") && (
          <Section title="Dating voorkeuren">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-bold text-text-secondary mb-1.5 block">Ik ben</label>
                <select
                  value={profile.gender}
                  onChange={(e) => update("gender", e.target.value)}
                  className="w-full px-4 py-3.5 rounded-2xl text-sm bg-bg-elevated text-text border border-border outline-none"
                >
                  {["Man", "Vrouw", "Non-binair", "Iedereen"].map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-bold text-text-secondary mb-1.5 block">Ik zoek</label>
                <select
                  value={profile.genderPref}
                  onChange={(e) => update("genderPref", e.target.value)}
                  className="w-full px-4 py-3.5 rounded-2xl text-sm bg-bg-elevated text-text border border-border outline-none"
                >
                  {["Man", "Vrouw", "Non-binair", "Iedereen"].map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              </div>
            </div>
          </Section>
        )}

        {/* --- SECTION: Fietsprofiel --- */}
        <Section title="Fietsprofiel">
          <div>
            <label className="text-sm font-bold text-text-secondary mb-2 block">Disciplines</label>
            <ChipSelect
              options={DISCIPLINES.map((d) => ({ id: d.id, label: d.label, icon: d.icon, color: d.color }))}
              selected={profile.disciplines}
              onToggle={(id) => toggle("disciplines", id)}
            />
          </div>
          <div>
            <label className="text-sm font-bold text-text-secondary mb-2 block">Niveau</label>
            <ChipSelect
              options={EXPERIENCE_LEVELS.map((e) => e)}
              selected={[profile.experience]}
              onToggle={(e) => update("experience", e)}
              color="#E5AD00"
            />
          </div>
          <div>
            <label className="text-sm font-bold text-text-secondary mb-2 block">Doelen</label>
            <ChipSelect
              options={GOALS.map((g) => g)}
              selected={profile.goals}
              onToggle={(g) => toggle("goals", g)}
            />
          </div>
        </Section>

        {/* --- SECTION: Ritvoorkeuren --- */}
        <Section title="Ritvoorkeuren">
          <div>
            <label className="text-sm font-bold text-text-secondary mb-1.5 block">Voorkeursafstand</label>
            <select
              value={profile.preferredDistance}
              onChange={(e) => update("preferredDistance", e.target.value)}
              className="w-full px-4 py-3.5 rounded-2xl text-sm bg-bg-elevated text-text border border-border outline-none"
            >
              <option value="">Kies...</option>
              {DISTANCE_OPTIONS.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-bold text-text-secondary mb-2 block">Voorkeursdagen</label>
            <ChipSelect
              options={DAYS.map((d) => d)}
              selected={profile.preferredDays}
              onToggle={(d) => toggle("preferredDays", d)}
            />
          </div>
          <div>
            <label className="text-sm font-bold text-text-secondary mb-2 block">Rijvoorkeur</label>
            <ChipSelect
              options={RIDE_PREFS.map((r) => r)}
              selected={profile.ridePref}
              onToggle={(r) => toggle("ridePref", r)}
              color="#E5AD00"
            />
          </div>
        </Section>
      </div>

      {/* Fixed save bar */}
      <div
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md p-4 bg-white border-t border-border"
        style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom, 0px))" }}
      >
        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full"
          size="lg"
        >
          {saving ? "Opslaan..." : saved ? "✓ Opgeslagen!" : "Wijzigingen opslaan"}
        </Button>
      </div>
    </div>
  );
}

/** Reusable section wrapper */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-base font-bold text-text mb-3">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

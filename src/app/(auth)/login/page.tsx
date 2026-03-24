"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Inloggen mislukt");
        setLoading(false);
        return;
      }

      // Redirect based on onboarding status
      if (data.onboardingComplete) {
        router.push("/discover");
      } else {
        router.push("/onboarding");
      }
      router.refresh();
    } catch {
      setError("Er ging iets mis");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 py-12 bg-white">
      <div className="text-center mb-10 animate-slide-up">
        <div className="flex justify-center mb-2">
          <Logo size="lg" />
        </div>
        <h1
          className="text-3xl tracking-tight"
          style={{ fontFamily: "'Libre Baskerville', serif", fontWeight: 700 }}
        >
          Missing<span className="text-primary-dark">Link</span>
        </h1>
        <p className="text-sm text-text-muted mt-1">Log in om verder te gaan</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 animate-slide-up">
        <Input
          label="Email"
          type="email"
          placeholder="je@email.nl"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          label="Wachtwoord"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && (
          <p className="text-sm text-primary text-center">{error}</p>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full"
          size="lg"
        >
          {loading ? "Bezig..." : "Inloggen"}
        </Button>

        {/* Strava login placeholder */}
        <button
          type="button"
          className="w-full py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
          style={{
            background: "#FC4C0215",
            color: "#FC4C02",
            border: "1.5px solid #FC4C0230",
          }}
          onClick={() => {
            // TODO: Strava OAuth login
            alert("Strava login komt in de volgende iteratie!");
          }}
        >
          🟠 Inloggen met Strava
        </button>

        <p className="text-center text-sm text-text-muted mt-6">
          Nog geen account?{" "}
          <Link href="/register" className="text-primary-dark font-bold hover:underline">
            Registreren
          </Link>
        </p>

        <p className="text-center text-xs text-text-muted mt-4">
          Demo: demo@missinglink.nl / test1234
        </p>
      </form>
    </div>
  );
}

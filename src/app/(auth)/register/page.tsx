"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Registratie mislukt");
        setLoading(false);
        return;
      }

      // Session cookie is already set by the API
      router.push("/onboarding");
      router.refresh();
    } catch {
      setError("Er ging iets mis");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 py-12 bg-white">
      <div className="text-center mb-10 animate-slide-up">
        <div className="flex justify-center mb-4">
          <Logo size="xl" />
        </div>
        <p className="text-sm text-text-muted mt-1">Maak een account aan</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 animate-slide-up">
        <Input
          label="Naam"
          placeholder="Je voornaam"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
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
          placeholder="Minimaal 6 tekens"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
        />

        {error && (
          <p className="text-sm text-primary text-center">{error}</p>
        )}

        <Button type="submit" disabled={loading} className="w-full" size="lg">
          {loading ? "Bezig..." : "Account aanmaken"}
        </Button>

        <p className="text-center text-sm text-text-muted mt-6">
          Al een account?{" "}
          <Link href="/login" className="text-primary-dark font-bold hover:underline">
            Inloggen
          </Link>
        </p>
      </form>
    </div>
  );
}

"use client";

import Link from "next/link";
import { ModeBadge } from "@/components/ui/badge";
import { Logo } from "@/components/ui/logo";

export default function HomePage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden"
      style={{ background: "linear-gradient(170deg, #FFF9EC 0%, #FFF3D0 40%, #FFFFFF 100%)" }}
    >
      {/* Decorative circles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full" style={{ background: "rgba(255,198,41,0.12)" }} />
        <div className="absolute -bottom-32 -left-16 w-80 h-80 rounded-full" style={{ background: "rgba(255,107,107,0.08)" }} />
        <div className="absolute top-1/3 -left-10 w-40 h-40 rounded-full" style={{ background: "rgba(46,204,113,0.06)" }} />
      </div>

      <div className="text-center relative z-10 animate-slide-up">
        <div className="mb-4">
          <Logo size="xl" showText />
        </div>

        <p className="text-sm text-text-muted mb-8 max-w-xs mx-auto leading-relaxed">
          Match op passie, tempo en stijl. Of je nu op zoek bent naar liefde of een trainingsmaatje.
        </p>

        <div className="flex gap-2 justify-center mb-10">
          <ModeBadge mode="dating" />
          <ModeBadge mode="ride" />
        </div>

        <div className="space-y-3 w-full max-w-xs mx-auto">
          <Link
            href="/register"
            className="block w-full px-8 py-4 rounded-full text-secondary font-extrabold text-base text-center shadow-lg transition-all hover:scale-105 active:scale-95 bg-primary"
            style={{ boxShadow: "0 6px 24px rgba(255,198,41,0.35)" }}
          >
            Account aanmaken
          </Link>
          <Link
            href="/login"
            className="block w-full px-8 py-4 rounded-full font-bold text-base text-center transition-all hover:scale-105 active:scale-95 text-text-secondary bg-white border border-border"
          >
            Ik heb al een account
          </Link>
        </div>
      </div>
    </div>
  );
}

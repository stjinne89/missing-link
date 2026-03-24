"use client";

import type { AppMode } from "@/types";

interface ModeToggleProps {
  current: AppMode;
  available: AppMode[];
  onChange: (mode: AppMode) => void;
}

const MODE_CONFIG = {
  dating: { label: "❤️ Dating", color: "#FF6B6B", bg: "#FFE5E5" },
  ride: { label: "🚴 Ride/BFF", color: "#2ECC71", bg: "#E0F8EA" },
};

export function ModeToggle({ current, available, onChange }: ModeToggleProps) {
  if (available.length <= 1) return null;

  return (
    <div className="flex rounded-full p-1 bg-bg-elevated border border-border">
      {available.map((mode) => {
        const config = MODE_CONFIG[mode];
        const isActive = current === mode;

        return (
          <button
            key={mode}
            onClick={() => onChange(mode)}
            className="flex-1 py-2.5 rounded-full text-sm font-bold transition-all"
            style={{
              background: isActive ? config.bg : "transparent",
              color: isActive ? config.color : "var(--color-text-muted)",
            }}
          >
            {config.label}
          </button>
        );
      })}
    </div>
  );
}

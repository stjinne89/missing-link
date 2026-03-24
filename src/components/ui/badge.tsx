import { DISCIPLINES } from "@/config/constants";
import type { AppMode, Discipline } from "@/types";

interface DisciplineBadgeProps {
  discipline: Discipline;
  small?: boolean;
}

export function DisciplineBadge({ discipline, small = false }: DisciplineBadgeProps) {
  const config = DISCIPLINES.find((d) => d.id === discipline);
  if (!config) return null;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-bold ${
        small ? "px-2.5 py-1 text-xs" : "px-3.5 py-1.5 text-sm"
      }`}
      style={{
        background: config.color + "14",
        color: config.color,
      }}
    >
      <span>{config.icon}</span> {config.label}
    </span>
  );
}

interface ModeBadgeProps {
  mode: AppMode;
}

export function ModeBadge({ mode }: ModeBadgeProps) {
  const isDating = mode === "dating";
  const color = isDating ? "#FF6B6B" : "#2ECC71";
  const bg = isDating ? "#FFE5E5" : "#E0F8EA";
  const label = isDating ? "❤️ Dating" : "🚴 Ride/BFF";

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold"
      style={{ background: bg, color }}
    >
      {label}
    </span>
  );
}

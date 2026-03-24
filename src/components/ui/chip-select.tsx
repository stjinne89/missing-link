"use client";

interface ChipOption {
  id: string;
  label: string;
  icon?: string;
  color?: string;
}

interface ChipSelectProps {
  options: (ChipOption | string)[];
  selected: string[];
  onToggle: (id: string) => void;
  color?: string;
  multi?: boolean;
}

export function ChipSelect({
  options,
  selected,
  onToggle,
  color = "#FFC629",
  multi = true,
}: ChipSelectProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const key = typeof opt === "string" ? opt : opt.id;
        const label =
          typeof opt === "string"
            ? opt
            : opt.icon
              ? `${opt.icon} ${opt.label}`
              : opt.label;
        const itemColor =
          typeof opt === "string" ? color : opt.color || color;
        const isSelected = selected.includes(key);

        return (
          <button
            key={key}
            type="button"
            onClick={() => onToggle(key)}
            className="px-4 py-2.5 rounded-full text-sm font-bold transition-all active:scale-95"
            style={{
              background: isSelected ? itemColor + "18" : "var(--color-bg-elevated)",
              color: isSelected ? itemColor : "var(--color-text-muted)",
              border: `1.5px solid ${isSelected ? itemColor + "40" : "var(--color-border)"}`,
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

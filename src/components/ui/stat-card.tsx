interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  unit?: string;
  color?: string;
}

export function StatCard({
  icon,
  label,
  value,
  unit = "",
  color = "#FFC629",
}: StatCardProps) {
  return (
    <div
      className="rounded-2xl p-3 text-center"
      style={{ background: color + "10" }}
    >
      <div className="text-lg mb-0.5">{icon}</div>
      <div className="text-lg font-extrabold" style={{ color }}>
        {value}
        {unit && (
          <span className="text-xs font-semibold ml-0.5 opacity-60">{unit}</span>
        )}
      </div>
      <div className="text-xs mt-0.5 text-text-muted font-semibold">{label}</div>
    </div>
  );
}

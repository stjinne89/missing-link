import { cn } from "@/lib/utils";

const GRADIENT_PAIRS = [
  ["#FFC629", "#FF6B6B"],
  ["#2ECC71", "#5B9BD5"],
  ["#FF6B6B", "#9B59B6"],
  ["#5B9BD5", "#FFC629"],
  ["#E5AD00", "#FF6B6B"],
  ["#9B59B6", "#2ECC71"],
];

interface AvatarProps {
  name: string;
  photoUrl?: string | null;
  size?: number;
  className?: string;
}

export function Avatar({ name, photoUrl, size = 48, className }: AvatarProps) {
  const idx = (name?.charCodeAt(0) ?? 0) % GRADIENT_PAIRS.length;
  const [from, to] = GRADIENT_PAIRS[idx];

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name}
        className={cn("rounded-full object-cover shrink-0", className)}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-bold text-white shrink-0",
        className
      )}
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${from}, ${to})`,
        fontSize: size * 0.4,
      }}
    >
      {name?.charAt(0).toUpperCase() ?? "?"}
    </div>
  );
}

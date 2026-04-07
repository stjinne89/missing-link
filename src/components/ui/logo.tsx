import Image from "next/image";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
}

const sizes = { sm: 32, md: 48, lg: 64, xl: 120 };

export function Logo({ size = "md", className = "" }: LogoProps) {
  const px = sizes[size];
  return (
    <Image
      src="/images/logo.jpeg"
      alt="Missing Link"
      width={px}
      height={px}
      className={className}
      priority
    />
  );
}

/** Compact inline logo for headers */
export function LogoInline({ className = "" }: { className?: string }) {
  return (
    <Image
      src="/images/logo.jpeg"
      alt="Missing Link"
      width={160}
      height={70}
      className={className}
      priority
    />
  );
}

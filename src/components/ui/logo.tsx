interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
}

/** Single chain link — outer plate (dark steel) */
function OuterPlate({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect x="0" y="8" width="64" height="44" rx="22" fill="#3a3a3a" stroke="#2a2a2a" strokeWidth="1.5"/>
      <circle cx="22" cy="30" r="7" fill="#2a2a2a"/><circle cx="42" cy="30" r="7" fill="#2a2a2a"/>
      <rect x="0" y="4" width="64" height="44" rx="22" fill="#555" stroke="#444" strokeWidth="1.5"/>
      <circle cx="22" cy="26" r="7.5" fill="#888" stroke="#777" strokeWidth="1"/><circle cx="22" cy="26" r="3.5" fill="#aaa"/>
      <circle cx="42" cy="26" r="7.5" fill="#888" stroke="#777" strokeWidth="1"/><circle cx="42" cy="26" r="3.5" fill="#aaa"/>
      <rect x="12" y="12" width="40" height="6" rx="3" fill="white" opacity="0.08"/>
    </g>
  );
}

/** Single chain link — inner plate (lighter steel) */
function InnerPlate({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect x="4" y="10" width="48" height="38" rx="19" fill="#666" stroke="#555" strokeWidth="1"/>
      <rect x="4" y="6" width="48" height="38" rx="19" fill="#777" stroke="#666" strokeWidth="1"/>
      <circle cx="22" cy="26" r="8" fill="#999" stroke="#888" strokeWidth="1"/><circle cx="22" cy="26" r="4" fill="#bbb"/>
      <circle cx="42" cy="26" r="8" fill="#999" stroke="#888" strokeWidth="1"/><circle cx="42" cy="26" r="4" fill="#bbb"/>
      <rect x="14" y="12" width="30" height="5" rx="2.5" fill="white" opacity="0.1"/>
    </g>
  );
}

/** The golden missing link — open master link */
function MissingChainLink({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect x="-6" y="-4" width="76" height="60" rx="30" fill="#FFC629" opacity="0.1"/>
      <rect x="-3" y="-1" width="70" height="54" rx="27" fill="#FFC629" opacity="0.06"/>
      <path d="M22,4 Q0,4 0,26 Q0,48 22,48 L34,48 Q50,48 54,42" fill="none" stroke="#E5AD00" strokeWidth="6" strokeLinecap="round"/>
      <path d="M56,12 Q64,4 42,4" fill="none" stroke="#FFC629" strokeWidth="6" strokeLinecap="round" opacity="0.7"/>
      <circle cx="22" cy="26" r="8" fill="#E5AD00" stroke="#D4A000" strokeWidth="1.5"/><circle cx="22" cy="26" r="3.5" fill="#FFC629"/>
      <circle cx="44" cy="22" r="7" fill="#FFC629" stroke="#E5AD00" strokeWidth="1.5" opacity="0.75"/><circle cx="44" cy="22" r="3" fill="#FFD54F" opacity="0.8"/>
      <circle cx="52" cy="8" r="2" fill="#FFC629" opacity="0.5"/>
      <circle cx="60" cy="16" r="1.5" fill="#FFD54F" opacity="0.4"/>
      <circle cx="48" cy="2" r="1.5" fill="#E5AD00" opacity="0.35"/>
    </g>
  );
}

export function Logo({ size = "md", showText = false, className = "" }: LogoProps) {
  const showBrandText = showText || size === "xl";
  const vb = showBrandText ? "60 120 560 180" : "60 130 560 60";
  const heights = { sm: 28, md: 40, lg: 56, xl: 180 };

  return (
    <svg
      height={heights[size]}
      viewBox={vb}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <OuterPlate x={80} y={140} />
      <InnerPlate x={140} y={140} />
      <OuterPlate x={200} y={140} />
      <InnerPlate x={260} y={140} />
      <MissingChainLink x={330} y={140} />
      <InnerPlate x={398} y={140} />
      <OuterPlate x={458} y={140} />

      {showBrandText && (
        <text x="340" y="285" textAnchor="middle"
          fontFamily="'Libre Baskerville', serif" fontSize="42" fontWeight="700"
          fill="#1B1B1B" letterSpacing="-0.5">
          Missing<tspan fill="#E5AD00">Link</tspan>
        </text>
      )}
    </svg>
  );
}

/** Compact inline logo for headers — chain icon + wordmark */
export function LogoInline({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <Logo size="sm" />
      <span
        className="text-xl tracking-tight text-secondary"
        style={{ fontFamily: "'Libre Baskerville', serif", fontWeight: 700 }}
      >
        Missing<span className="text-primary-dark">Link</span>
      </span>
    </div>
  );
}

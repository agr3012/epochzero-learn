// components/GradientRing.tsx
// SVG gradient progress ring — inspired by CyberDefenders' circular badge
// Server component (pure SVG — no JS needed)

interface Props {
  value:       number;   // current value
  max?:        number;   // max value (default 100)
  size?:       number;   // diameter in px (default 140)
  strokeWidth?: number;
  colorStart?: string;   // gradient start
  colorEnd?:   string;   // gradient end
  label?:      string;   // center large text
  sublabel?:   string;   // center small text
  id:          string;   // unique id for gradient defs (required for SSR)
}

export function GradientRing({
  value,
  max         = 100,
  size        = 140,
  strokeWidth = 7,
  colorStart  = '#E8A020',
  colorEnd    = '#1B7C3E',
  label,
  sublabel,
  id,
}: Props) {
  const r          = 44 - strokeWidth / 2;
  const circ       = 2 * Math.PI * r;
  const progress   = Math.min(Math.max(value / max, 0), 1);
  const dashOffset = circ * (1 - progress);
  const gradId     = `ring-grad-${id}`;

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}>
      {/* SVG ring */}
      <svg
        viewBox="0 0 88 88"
        style={{ width: size, height: size, position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor={colorStart} stopOpacity="1" />
            <stop offset="100%" stopColor={colorEnd}   stopOpacity="0.85" />
          </linearGradient>
        </defs>
        {/* Track */}
        <circle
          cx="44" cy="44" r={r}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          cx="44" cy="44" r={r}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circ.toFixed(3)}
          strokeDashoffset={dashOffset.toFixed(3)}
          strokeLinecap="round"
        />
      </svg>
      {/* Center text */}
      {(label || sublabel) && (
        <div className="relative z-10 text-center select-none">
          {label && (
            <div
              className="font-display font-bold leading-none"
              style={{ fontSize: size / 4, color: colorStart }}>
              {label}
            </div>
          )}
          {sublabel && (
            <div
              className="font-sans leading-tight mt-0.5"
              style={{ fontSize: size / 10, color: 'hsl(var(--foreground-muted))' }}>
              {sublabel}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

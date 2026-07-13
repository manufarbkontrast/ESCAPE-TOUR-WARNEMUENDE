interface LogoProps {
  readonly className?: string
}

/**
 * Escape Tour logomark — a Warnemünde lighthouse rendered as a line drawing.
 *
 * Uses `currentColor` for the stroke so it adapts to its container (dark mark
 * on the white header badge, white mark on dark backgrounds). Brand-compliant:
 * no gold, no fills, line-only per the project design rules.
 */
export function Logo({ className }: LogoProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role="img"
      aria-label="Escape Tour Leuchtturm-Logo"
    >
      {/* Light rays */}
      <path d="M11.5 7.4 8 5.8M11.2 9.4 7.6 10.8M20.5 7.4 24 5.8M20.8 9.4 24.4 10.8" opacity={0.7} />
      {/* Lantern roof */}
      <path d="M12.6 7 16 3.6 19.4 7" />
      {/* Lantern room */}
      <path d="M13 7v3.4M19 7v3.4M16 6.6v3.8" />
      {/* Gallery platform */}
      <path d="M11.6 10.4h8.8" />
      {/* Tower */}
      <path d="M13 10.4 10.6 26M19 10.4 21.4 26" />
      {/* Tower bands */}
      <path d="M12.3 15h7.4M11.5 20.5h9" />
      {/* Door */}
      <path d="M14.7 26v-2.4a1.3 1.3 0 0 1 2.6 0V26" />
      {/* Base / plinth */}
      <path d="M9.4 26h13.2M8.6 29h14.8M10 26v3M22 26v3" />
    </svg>
  )
}

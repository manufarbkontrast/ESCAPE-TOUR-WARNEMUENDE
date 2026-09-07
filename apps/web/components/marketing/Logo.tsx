interface LogoProps {
  readonly className?: string
}

/**
 * Escape Tour logomark — the Warnemünde lighthouse, reduced to what still
 * reads at 28 pixels.
 *
 * Two rounds of this. The first tried to be faithful to the building: ray fan,
 * lantern room, tower bands, a door, a plinth with legs. All of it turned to
 * mush at header size. The second was too timid — a thin post with two loose
 * ticks beside it, and too light next to the bold wordmark.
 *
 * What works: a visibly tapered tower with a wide stance, a lantern big enough
 * to be a lantern, and the light as a cone rather than as strokes. The cone is
 * the same motif as `hero-beam` on the page, so the mark and the site share
 * their one light source, and it points — which a symmetrical ray fan does not.
 *
 * The body uses `currentColor`, so the mark takes the colour of whatever it
 * sits in. Keep this file and `public/icons/icon.svg` in step.
 */
export function Logo({ className }: LogoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      role="img"
      aria-label="Escape Tour Leuchtturm-Logo"
    >
      {/* Der Lichtkegel liegt hinter dem Turm, damit die Laterne ihn schneidet
          und er wirklich aus ihr zu kommen scheint. */}
      <path d="M14.6 7.4 21.8 3.9v7.6z" fill="#22d3ee" fillOpacity={0.22} />
      <path
        d="M15.4 5.9 21.6 3.6"
        stroke="#22d3ee"
        strokeWidth={1.5}
        strokeLinecap="round"
      />

      <g
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Laternendach */}
        <path d="M8.5 6.1 12 2.7l3.5 3.4" />
        {/* Laterne */}
        <path d="M9.5 6.1v2.8m5-2.8v2.8" />
        {/* Galerie, breiter als die Laterne */}
        <path d="M8 8.9h8" />
        {/* Turm, deutlich auslaufend */}
        <path d="M9.6 8.9 7.7 19.3m6.7-10.4 1.9 10.4" />
        {/* Boden */}
        <path d="M6.4 19.3h11.2" />
      </g>
    </svg>
  )
}

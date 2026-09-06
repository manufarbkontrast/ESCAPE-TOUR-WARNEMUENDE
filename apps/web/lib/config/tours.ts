/**
 * Tour variants — single source of truth for prices, durations and group
 * discounts.
 *
 * Prices previously lived in three places (booking form, checkout route,
 * marketing pages) and had to be kept in sync by hand. Everything that shows or
 * charges a price reads from here instead.
 *
 * `priceCents` must match the `tours` table in Supabase.
 */

export type TourVariantId = 'family' | 'adult' | 'pro';

export interface TourVariant {
  /** Stable id, also used as the Stripe metadata value and booking query param */
  readonly id: TourVariantId;
  /** Short display name */
  readonly name: string;
  /** Full product name used on the Stripe checkout line item */
  readonly checkoutName: string;
  /** One-line product description for Stripe */
  readonly checkoutDescription: string;
  /** Age gate, e.g. "Ab 8 Jahren" */
  readonly ageLabel: string;
  /** Price per person in cents */
  readonly priceCents: number;
  /** Play time as shown to guests */
  readonly duration: string;
  /** Walking distance as shown to guests */
  readonly distance: string;
  /** Difficulty label — plain words, no colour coding (see CLAUDE.md) */
  readonly difficulty: string;
  /** Selling points, shown as a list on marketing and booking pages */
  readonly features: ReadonlyArray<string>;
  /** Marks the default recommendation */
  readonly recommended?: boolean;
}

export const TOUR_VARIANTS: ReadonlyArray<TourVariant> = [
  {
    id: 'family',
    name: 'Familien-Tour',
    checkoutName: 'Escape Tour Warnemünde – Familien-Tour',
    checkoutDescription: 'Das Vermächtnis des Lotsenkapitäns (ab 8 Jahren)',
    ageLabel: 'Ab 8 Jahren',
    priceCents: 2490,
    duration: '2–3 Stunden',
    distance: '3 km',
    difficulty: 'Leicht',
    features: [
      'Kindgerechte Rätsel',
      'Einfache Navigation',
      'Spielerisches Lernen',
    ],
  },
  {
    id: 'adult',
    name: 'Erwachsenen-Tour',
    checkoutName: 'Escape Tour Warnemünde – Erwachsenen-Tour',
    checkoutDescription: 'Das Vermächtnis des Lotsenkapitäns (ab 14 Jahren)',
    ageLabel: 'Ab 14 Jahren',
    priceCents: 2990,
    duration: '3–4 Stunden',
    distance: '5 km',
    difficulty: 'Mittel',
    recommended: true,
    features: [
      'Anspruchsvolle Rätsel',
      'Historische Tiefe',
      'Komplexe Logik',
    ],
  },
  {
    id: 'pro',
    name: 'Profi-Tour',
    checkoutName: 'Escape Tour Warnemünde – Profi-Tour',
    checkoutDescription: 'Die letzte Spur des Lotsenkapitäns (ab 16 Jahren)',
    ageLabel: 'Ab 16 Jahren',
    priceCents: 3490,
    duration: '4–5 Stunden',
    distance: '5 km',
    difficulty: 'Schwer',
    features: [
      'Keine Hinweise in Fragen',
      'Caesar-Chiffren',
      'Mehrstufige Berechnungen',
    ],
  },
] as const;

/** Lookup by id. Returns null for unknown ids so callers can reject cleanly. */
export function getTourVariant(id: string): TourVariant | null {
  return TOUR_VARIANTS.find((variant) => variant.id === id) ?? null;
}

/** Cheapest per-person price — used for "ab X €" claims. */
export const LOWEST_PRICE_CENTS: number = TOUR_VARIANTS.reduce(
  (lowest, variant) => Math.min(lowest, variant.priceCents),
  Number.POSITIVE_INFINITY
);

/** Group discount tiers, largest group first. */
export const GROUP_DISCOUNTS: ReadonlyArray<{
  readonly minParticipants: number;
  readonly rate: number;
}> = [
  { minParticipants: 10, rate: 0.15 },
  { minParticipants: 6, rate: 0.1 },
] as const;

/** Discount rate (0–1) for a given party size. */
export function calculateGroupDiscount(participantCount: number): number {
  const tier = GROUP_DISCOUNTS.find(
    (entry) => participantCount >= entry.minParticipants
  );
  return tier?.rate ?? 0;
}

/** Formats cents as a German price string without the currency symbol. */
export function formatPrice(cents: number): string {
  return (cents / 100).toFixed(2).replace('.', ',');
}

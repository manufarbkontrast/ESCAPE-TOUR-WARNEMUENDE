export type TourVariant = 'family' | 'adult'

export interface Tour {
  readonly id: string
  readonly slug: string
  readonly nameDe: string
  readonly nameEn: string | null
  readonly variant: TourVariant
  readonly descriptionDe: string | null
  readonly descriptionEn: string | null
  readonly durationMinutes: number
  readonly distanceMeters: number
  readonly minAge: number
  readonly priceCents: number
  readonly groupPriceCents: number | null
  readonly maxGroupSize: number
  readonly isActive: boolean
  readonly metaTitle: string | null
  readonly metaDescription: string | null
  readonly createdAt: string
  readonly updatedAt: string
}

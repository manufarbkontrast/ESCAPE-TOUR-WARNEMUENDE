export interface GeoPoint {
  readonly lat: number
  readonly lng: number
}

export interface Station {
  readonly id: string
  readonly tourId: string
  readonly orderIndex: number
  readonly nameDe: string
  readonly nameEn: string | null
  readonly subtitleDe: string | null
  readonly subtitleEn: string | null
  readonly location: GeoPoint
  readonly locationName: string | null
  readonly radiusMeters: number
  readonly introTextDe: string | null
  readonly introTextEn: string | null
  readonly storyTextDe: string | null
  readonly storyTextEn: string | null
  readonly completionTextDe: string | null
  readonly completionTextEn: string | null
  readonly headerImageUrl: string | null
  readonly backgroundAudioUrl: string | null
  readonly ambientSound: string | null
  readonly estimatedDurationMinutes: number
  readonly createdAt: string
  readonly updatedAt: string
}

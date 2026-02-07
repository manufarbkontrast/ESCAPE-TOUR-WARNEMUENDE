/** Total number of stations per tour */
export const TOTAL_STATIONS = 8 as const

/** Maximum group size */
export const MAX_GROUP_SIZE = 6 as const

/** Default GPS radius for station unlock (meters) */
export const DEFAULT_STATION_RADIUS_METERS = 50 as const

/** Hint levels */
export const HINT_LEVELS = {
  SMALL_HINT: 1,
  MEDIUM_HINT: 2,
  BIG_HINT: 3,
  SHOW_SOLUTION: 4,
} as const

/** Time bonus: max percentage of base points */
export const TIME_BONUS_MAX_PERCENT = 0.5 as const

/** Penalty per failed attempt (percentage) */
export const ATTEMPT_PENALTY_PERCENT = 10 as const

/** Maximum penalty from failed attempts (percentage) */
export const MAX_ATTEMPT_PENALTY_PERCENT = 50 as const

/** Badge thresholds */
export const BADGE_THRESHOLDS = {
  GOLD_MIN_POINTS: 800,
  GOLD_MAX_TIME_SECONDS: 5400, // 90 minutes
  SILVER_MIN_POINTS: 700,
  SILVER_MAX_HINTS: 3,
  SILVER_MAX_TIME_SECONDS: 7200, // 2 hours
} as const

/** Offline sync */
export const OFFLINE_MAX_RETRIES = 3 as const
export const OFFLINE_DB_NAME = 'escape-tour-offline' as const
export const OFFLINE_DB_VERSION = 1 as const

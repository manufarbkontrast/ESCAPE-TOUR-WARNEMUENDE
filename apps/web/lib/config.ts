const gpsFlag = process.env.NEXT_PUBLIC_DISABLE_GPS

export const GPS_DISABLED =
  gpsFlag === 'true' ||
  (process.env.NODE_ENV !== 'production' && gpsFlag !== 'false')

/**
 * Parsing for PostGIS `geography(Point)` columns.
 *
 * PostgREST hands these back in different shapes depending on how the project
 * is configured: EWKB hex by default, GeoJSON when a cast or a view is in
 * play. Rather than pin the API to one of them, we accept every plausible
 * encoding and return null when a value cannot be read — a station with an
 * unreadable coordinate must not take the whole tour down.
 */

import type { GeoPoint } from '@escape-tour/shared'

/** EWKB type flag indicating a trailing SRID field. */
const SRID_FLAG = 0x20000000
/** EWKB base type id for Point. */
const POINT_TYPE = 1
/** endianness byte + uint32 type + two float64 = 21 bytes = 42 hex chars. */
const MIN_POINT_HEX_LENGTH = 42

const HEX_PATTERN = /^[0-9a-fA-F]+$/
const WKT_POINT_PATTERN = /^\s*(?:SRID=\d+;)?\s*POINT\s*\(\s*(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s*\)\s*$/i

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function toPoint(lng: unknown, lat: unknown): GeoPoint | null {
  if (!isFiniteNumber(lng) || !isFiniteNumber(lat)) {
    return null
  }
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return null
  }
  return { lat, lng }
}

function hexToBytes(hex: string): Uint8Array | null {
  if (hex.length % 2 !== 0 || !HEX_PATTERN.test(hex)) {
    return null
  }
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < bytes.length; i += 1) {
    bytes[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  }
  return bytes
}

/** Decode a (E)WKB hex string holding a single Point. */
function parseWkbHex(hex: string): GeoPoint | null {
  if (hex.length < MIN_POINT_HEX_LENGTH) {
    return null
  }

  const bytes = hexToBytes(hex)
  if (!bytes) {
    return null
  }

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  const endianByte = view.getUint8(0)
  if (endianByte !== 0 && endianByte !== 1) {
    return null
  }
  const littleEndian = endianByte === 1

  const rawType = view.getUint32(1, littleEndian)
  if ((rawType & 0xff) !== POINT_TYPE) {
    return null
  }

  // Skip the optional SRID field before the coordinates.
  const coordinateOffset = (rawType & SRID_FLAG) === SRID_FLAG ? 9 : 5
  if (bytes.byteLength < coordinateOffset + 16) {
    return null
  }

  return toPoint(
    view.getFloat64(coordinateOffset, littleEndian),
    view.getFloat64(coordinateOffset + 8, littleEndian)
  )
}

function parseGeoJson(value: Record<string, unknown>): GeoPoint | null {
  if (value.type !== 'Point' || !Array.isArray(value.coordinates)) {
    return null
  }
  const [lng, lat] = value.coordinates
  return toPoint(lng, lat)
}

/**
 * Read a coordinate from whatever PostgREST returned for a geography column.
 * Returns null for anything unreadable — callers decide the fallback.
 */
export function parseGeoPoint(value: unknown): GeoPoint | null {
  if (value === null || value === undefined) {
    return null
  }

  if (typeof value === 'object') {
    const record = value as Record<string, unknown>
    if ('lat' in record && 'lng' in record) {
      return toPoint(record.lng, record.lat)
    }
    return parseGeoJson(record)
  }

  if (typeof value !== 'string') {
    return null
  }

  const trimmed = value.trim()
  if (trimmed === '') {
    return null
  }

  const wkt = WKT_POINT_PATTERN.exec(trimmed)
  if (wkt) {
    return toPoint(Number.parseFloat(wkt[1]), Number.parseFloat(wkt[2]))
  }

  if (trimmed.startsWith('{')) {
    try {
      const parsed: unknown = JSON.parse(trimmed)
      return typeof parsed === 'object' && parsed !== null
        ? parseGeoPoint(parsed)
        : null
    } catch {
      return null
    }
  }

  return parseWkbHex(trimmed)
}

/**
 * Generate a unique 6-character booking code
 * Uses uppercase alphanumeric characters, avoids ambiguous chars (0/O, 1/I/L)
 */

const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

export function generateBookingCode(): string {
  const chars = Array.from({ length: 6 }, () => {
    const randomIndex = Math.floor(Math.random() * ALPHABET.length)
    return ALPHABET[randomIndex]
  })
  return chars.join('')
}

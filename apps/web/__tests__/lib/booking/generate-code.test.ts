import { describe, it, expect } from 'vitest'
import { generateBookingCode } from '@/lib/booking/generate-code'

const AMBIGUOUS_CHARS = ['0', 'O', '1', 'I', 'L']

describe('generateBookingCode', () => {
  it('should return a 6-character string', () => {
    const code = generateBookingCode()
    expect(code).toHaveLength(6)
  })

  it('should return only uppercase alphanumeric characters', () => {
    for (let i = 0; i < 50; i++) {
      const code = generateBookingCode()
      expect(code).toMatch(/^[A-Z0-9]{6}$/)
    }
  })

  it('should not contain ambiguous characters (0, O, 1, I, L)', () => {
    for (let i = 0; i < 100; i++) {
      const code = generateBookingCode()
      for (const char of AMBIGUOUS_CHARS) {
        expect(code).not.toContain(char)
      }
    }
  })

  it('should generate different codes on subsequent calls', () => {
    const codes = new Set(Array.from({ length: 20 }, () => generateBookingCode()))
    // With 29^6 possible codes, collisions in 20 draws are astronomically unlikely
    expect(codes.size).toBeGreaterThan(15)
  })
})

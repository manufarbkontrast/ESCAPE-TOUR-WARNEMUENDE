import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils/cn'

describe('cn', () => {
  it('should merge class strings', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('should filter out falsy values', () => {
    expect(cn('base', false && 'hidden', undefined, null, 'end')).toBe('base end')
  })

  it('should handle empty input', () => {
    expect(cn()).toBe('')
  })

  it('should trim the result', () => {
    expect(cn('  spaced  ')).toBe('spaced')
  })

  it('should handle single class', () => {
    expect(cn('single')).toBe('single')
  })

  it('should handle conditional classes', () => {
    const isActive = true
    const isDisabled = false
    expect(cn('btn', isActive && 'active', isDisabled && 'disabled')).toBe('btn active')
  })
})

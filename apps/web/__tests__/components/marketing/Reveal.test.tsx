// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { Reveal } from '@/components/marketing/Reveal'

/**
 * Reveal hides its content until it scrolls into view. That makes two failure
 * modes expensive, and both are covered here:
 *
 *  - content that never un-hides is content nobody can read (no observer
 *    support, reduced motion, observer that never fires)
 *  - an observer that outlives its element leaks on every navigation
 */

type ObserverCallback = (entries: ReadonlyArray<{ isIntersecting: boolean }>) => void

interface FakeObserver {
 readonly callback: ObserverCallback
 readonly observe: ReturnType<typeof vi.fn>
 readonly unobserve: ReturnType<typeof vi.fn>
 readonly disconnect: ReturnType<typeof vi.fn>
}

let observers: FakeObserver[] = []

function installObserver() {
 class FakeIntersectionObserver {
  constructor(callback: ObserverCallback) {
   const entry: FakeObserver = {
    callback,
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
   }
   observers.push(entry)
   Object.assign(this, entry)
  }
 }
 vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver)
}

function setReducedMotion(reduced: boolean) {
 vi.stubGlobal(
  'matchMedia',
  vi.fn().mockImplementation((query: string) => ({
   matches: reduced && query.includes('reduce'),
   media: query,
   addEventListener: vi.fn(),
   removeEventListener: vi.fn(),
  }))
 )
}

/** Fire the observer as the browser would once the element enters the viewport. */
function scrollIntoView(index = 0) {
 act(() => {
  observers[index]?.callback([{ isIntersecting: true }])
 })
}

beforeEach(() => {
 observers = []
 installObserver()
 setReducedMotion(false)
})

afterEach(() => {
 vi.unstubAllGlobals()
})

describe('Reveal', () => {
 it('renders its children', () => {
  render(
   <Reveal>
    <p>Zwölf Rätsel</p>
   </Reveal>
  )

  expect(screen.getByText('Zwölf Rätsel')).toBeInTheDocument()
 })

 it('keeps the passed className so layout does not depend on the animation', () => {
  const { container } = render(
   <Reveal className="mt-12 grid">
    <p>Inhalt</p>
   </Reveal>
  )

  expect(container.firstElementChild).toHaveClass('mt-12', 'grid')
 })

 it('hides the content until it enters the viewport', () => {
  const { container } = render(
   <Reveal>
    <p>Inhalt</p>
   </Reveal>
  )

  expect(container.firstElementChild).toHaveClass('reveal-pending')
 })

 it('shows the content once it enters the viewport', () => {
  const { container } = render(
   <Reveal>
    <p>Inhalt</p>
   </Reveal>
  )
  scrollIntoView()

  expect(container.firstElementChild).not.toHaveClass('reveal-pending')
 })

 it('stops observing after revealing once, so scrolling back does not re-hide', () => {
  render(
   <Reveal>
    <p>Inhalt</p>
   </Reveal>
  )
  scrollIntoView()

  expect(observers[0]?.disconnect).toHaveBeenCalled()
 })

 it('disconnects the observer on unmount', () => {
  const { unmount } = render(
   <Reveal>
    <p>Inhalt</p>
   </Reveal>
  )
  unmount()

  expect(observers[0]?.disconnect).toHaveBeenCalled()
 })

 it('shows the content immediately when the visitor asked for reduced motion', () => {
  setReducedMotion(true)

  const { container } = render(
   <Reveal>
    <p>Inhalt</p>
   </Reveal>
  )

  expect(container.firstElementChild).not.toHaveClass('reveal-pending')
  expect(observers).toHaveLength(0)
 })

 it('shows the content when the browser has no IntersectionObserver', () => {
  vi.stubGlobal('IntersectionObserver', undefined)

  const { container } = render(
   <Reveal>
    <p>Inhalt</p>
   </Reveal>
  )

  expect(container.firstElementChild).not.toHaveClass('reveal-pending')
 })

 it('offsets the transition when a delay is given, for staggering siblings', () => {
  const { container } = render(
   <Reveal delay={120}>
    <p>Inhalt</p>
   </Reveal>
  )

  expect(container.firstElementChild).toHaveStyle({ transitionDelay: '120ms' })
 })
})

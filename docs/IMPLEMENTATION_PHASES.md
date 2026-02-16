# Implementation Phases: Escape Tour Warnemuende - Testing & Quality

**Project**: Escape Tour Warnemuende (Das Vermaechtnis des Lotsenkapitaens)
**Stack**: Next.js 14 (App Router) + Supabase + TypeScript + TailwindCSS + Zustand + Mapbox + Vitest
**Monorepo**: Turborepo + pnpm (apps/web, packages/shared, packages/game-logic, packages/database)
**Focus**: Testing & Quality - achieve 80%+ coverage, fix code quality issues, production hardening
**Estimated Total**: ~32-40 hours

---

## Phase 1: Test Infrastructure & Game Logic Tests
**Type**: Testing | **Estimated**: 6-8 hours

Establish test infrastructure across the monorepo and achieve full coverage for the game-logic package (the most critical, pure-logic code).

### Tasks

1. **Configure Vitest for all workspaces**
   - Verify/update `vitest.config.ts` in `packages/game-logic`
   - Add `vitest.config.ts` to `packages/shared` (constants validation)
   - Add `vitest.config.ts` to `packages/database` (client initialization)
   - Add `vitest.config.ts` to `apps/web` (components, API routes, stores)
   - Configure coverage thresholds (80% minimum per package)
   - Add `test` and `test:coverage` scripts to root `turbo.json`

2. **Extend game-logic unit tests**
   - Existing: `score-calculator.test.ts`, `answer-validator.test.ts`
   - Add edge case tests for `calculateScore()`: zero base points, max attempts, all hints used
   - Add edge case tests for `determineBadge()`: boundary values (exactly 800pts, exactly 90min)
   - Add edge case tests for `validateAnswer()`: all 6 validation modes
   - Add tests for `calculateSessionDurationSeconds()`: pause handling, edge cases
   - Add tests for Haversine distance calculation
   - Target: 95%+ coverage for game-logic package

3. **Add shared package tests**
   - Validate all constants are correct types and reasonable values
   - Validate all TypeScript types compile correctly (type-level tests)
   - Test enum completeness (PuzzleType, Difficulty, AnswerType, etc.)
   - Target: 90%+ coverage for shared package

4. **Add database package tests**
   - Test Supabase client initialization (mock Supabase)
   - Test type exports compile correctly
   - Target: 80%+ coverage for database package

### Key Files
- `packages/game-logic/src/score-calculator.ts`
- `packages/game-logic/src/answer-validator.ts`
- `packages/game-logic/tests/`
- `packages/shared/src/constants/`
- `packages/shared/src/types/`
- `packages/database/src/`
- `turbo.json`

### Definition of Done
- [ ] Vitest configured in all 4 workspaces
- [ ] `turbo test` and `turbo test:coverage` work from root
- [ ] game-logic: 95%+ coverage
- [ ] shared: 90%+ coverage
- [ ] database: 80%+ coverage
- [ ] All tests pass with `pnpm test` from root

---

## Phase 2: API Route Tests (Integration)
**Type**: Testing | **Estimated**: 6-8 hours

Test all Next.js API routes with mocked Supabase responses. These are integration tests that verify request handling, validation, error handling, and response formatting.

### Tasks

1. **Set up API route test utilities**
   - Create test helpers for mocking NextRequest/NextResponse
   - Create Supabase mock factory (mock client, mock query builder)
   - Create test fixtures for sessions, bookings, stations, puzzles
   - Set up test environment variables

2. **Test `POST /api/game/session` (create session)**
   - Valid booking code creates session
   - Invalid booking code format returns 400
   - Expired booking returns 400
   - Already-used booking code returns 409
   - Booking not found returns 404
   - Database error returns 500 with safe error message

3. **Test `GET /api/game/session` (get session)**
   - Valid session ID returns full session with stations
   - Missing session ID returns 400
   - Session not found returns 404
   - Includes stations and puzzles in response

4. **Test `PATCH /api/game/session` (update session)**
   - Pause session updates status and paused_at
   - Resume session clears paused_at
   - Complete session sets completed_at
   - Invalid status transition returns 400
   - Missing session ID returns 400

5. **Test `POST /api/game/validate-answer`**
   - Correct answer returns points and time bonus
   - Incorrect answer returns correct=false
   - Missing fields return 400
   - Edge function error handled gracefully

6. **Test `GET /api/game/hints/[puzzleId]`**
   - Returns hints ordered by level
   - Invalid puzzle ID returns 400
   - No hints found returns empty array

7. **Test `POST /api/game/certificate`**
   - Valid completed session generates certificate
   - Incomplete session returns 400
   - Already-generated certificate returns existing

### Key Files
- `apps/web/app/api/game/session/route.ts`
- `apps/web/app/api/game/validate-answer/route.ts`
- `apps/web/app/api/game/hints/[puzzleId]/route.ts`
- `apps/web/app/api/game/certificate/route.ts`
- `apps/web/__tests__/api/` (new)

### Definition of Done
- [ ] API test utilities created
- [ ] All 6 API routes have comprehensive tests
- [ ] Happy path and error paths covered
- [ ] Response format verified (success/data/error envelope)
- [ ] 80%+ coverage for API route files
- [ ] All tests pass

---

## Phase 3: Zustand Store Tests
**Type**: Testing | **Estimated**: 4-5 hours

Test all Zustand stores that manage game state, location tracking, and audio. These stores contain critical business logic.

### Tasks

1. **Test `gameStore.ts`**
   - `startSession()` initializes state correctly
   - `updateProgress()` creates new state (immutability check)
   - `pauseSession()` / `resumeSession()` toggle correctly
   - `completeStation()` advances station index
   - `useHint()` increments hints_used
   - `skipPuzzle()` increments puzzles_skipped
   - `completeSession()` sets final state
   - Persistence: state survives store recreation
   - Edge cases: double-pause, complete already-completed

2. **Test `locationStore.ts`**
   - `startWatching()` initializes geolocation
   - `stopWatching()` clears watch
   - `checkProximity()` calculates distance correctly
   - Within radius returns true
   - Outside radius returns false
   - Mock Geolocation API for tests
   - Error handling: permission denied, position unavailable

3. **Test `audioStore.ts`**
   - `playAmbient()` starts ambient audio
   - `playEffect()` plays one-shot sound
   - `playVoice()` plays voice narration
   - `stopAll()` stops everything
   - Volume control works
   - Mute toggle works
   - Mock Howler.js for tests

### Key Files
- `apps/web/stores/gameStore.ts`
- `apps/web/stores/locationStore.ts`
- `apps/web/stores/audioStore.ts`
- `apps/web/__tests__/stores/` (new)

### Definition of Done
- [ ] All 3 stores have comprehensive tests
- [ ] State immutability verified in gameStore tests
- [ ] Geolocation API properly mocked
- [ ] Howler.js properly mocked
- [ ] 85%+ coverage for store files
- [ ] All tests pass

---

## Phase 4: React Component Tests
**Type**: Testing | **Estimated**: 8-10 hours

Test key React components, focusing on game components (the core user experience) and puzzle components (the most complex interactive elements).

### Tasks

1. **Set up component test infrastructure**
   - Configure React Testing Library with Vitest
   - Create render helpers with providers (Zustand, etc.)
   - Create mock data factories for stations, puzzles, hints
   - Set up Mapbox GL mock (jsdom doesn't support WebGL)

2. **Test game components**
   - `CodeInput.tsx`: validates 6-char code format, submit handling
   - `Timer.tsx`: displays time, pause/resume, format (HH:MM:SS)
   - `HintSystem.tsx`: progressive reveal, point penalty display
   - `GameMenu.tsx`: navigation, pause/resume actions
   - `StoryContent.tsx`: renders markdown/story text
   - `AudioPlayer.tsx`: play/pause/volume controls

3. **Test puzzle components (all 10 types)**
   - `TextInputPuzzle.tsx`: input, submit, validation feedback
   - `CountPuzzle.tsx`: counter increment/decrement, submit
   - `PhotoSearchPuzzle.tsx`: image display, answer selection
   - `SymbolFindPuzzle.tsx`: symbol grid, selection
   - `CombinationPuzzle.tsx`: combination lock UI
   - `LogicPuzzle.tsx`: logic grid/selection
   - `AudioPuzzle.tsx`: audio playback, answer input
   - `NavigationPuzzle.tsx`: compass/direction input
   - `DocumentAnalysisPuzzle.tsx`: document display, answer
   - `ARPuzzle.tsx`: fallback when AR not available

4. **Test marketing components**
   - `Header.tsx`: navigation links, mobile menu toggle
   - `Footer.tsx`: links render correctly
   - `FaqAccordion.tsx`: expand/collapse, accessibility

### Key Files
- `apps/web/components/game/`
- `apps/web/components/game/puzzles/`
- `apps/web/components/marketing/`
- `apps/web/__tests__/components/` (new)

### Definition of Done
- [ ] React Testing Library configured with Vitest
- [ ] All 6 game components tested
- [ ] All 10 puzzle components tested
- [ ] 3 marketing components tested
- [ ] Accessibility basics verified (aria labels, keyboard nav)
- [ ] 80%+ coverage for component files
- [ ] All tests pass

---

## Phase 5: E2E Tests (Critical User Flows)
**Type**: E2E Testing | **Estimated**: 5-6 hours

Test the critical user journeys end-to-end with Playwright. Focus on the flows that must work for the business.

### Tasks

1. **Set up Playwright**
   - Install and configure Playwright in `apps/web`
   - Configure for mobile viewport (375x812 - primary target)
   - Set up test fixtures for demo mode / mock API
   - Create page object models for game pages

2. **E2E: Booking Code Entry Flow**
   - Navigate to `/play`
   - Enter valid booking code
   - Verify redirect to game session
   - Test invalid code shows error
   - Test expired code shows appropriate message

3. **E2E: Game Play Flow (Demo Mode)**
   - Start session with demo booking code
   - Verify map loads with station markers
   - Navigate to first station
   - Read story content
   - Attempt puzzle (correct answer)
   - Verify score updates
   - Use a hint, verify penalty shown
   - Complete station, advance to next

4. **E2E: Game Completion Flow**
   - Complete all stations (demo/shortcut mode)
   - Verify completion screen shows
   - Verify certificate generation
   - Verify badge display (Bronze/Silver/Gold)
   - Verify stats summary

5. **E2E: Marketing Pages**
   - Landing page loads, hero visible
   - Tour variant cards display correctly
   - Pricing page shows both variants
   - Legal pages accessible
   - Navigation works (header links)
   - Mobile menu toggles

### Key Files
- `apps/web/e2e/` (new)
- `apps/web/playwright.config.ts` (new)
- `apps/web/e2e/fixtures/` (new)

### Definition of Done
- [ ] Playwright configured with mobile-first viewports
- [ ] Booking code entry E2E passes
- [ ] Game play flow E2E passes (demo mode)
- [ ] Game completion E2E passes
- [ ] Marketing pages E2E passes
- [ ] Tests run in CI-compatible headless mode
- [ ] All E2E tests pass

---

## Phase 6: Code Quality & Hardening
**Type**: Quality | **Estimated**: 3-4 hours

Fix remaining code quality issues, add missing error handling, validate security boundaries, and ensure production readiness.

### Tasks

1. **Security review**
   - Validate all API routes check authentication where needed
   - Verify booking code validation is secure (timing attacks, brute force)
   - Check Supabase RLS policies are adequate
   - Verify no secrets leak in client-side code
   - Check error messages don't expose internals
   - Validate input sanitization on all user inputs

2. **Error handling audit**
   - Verify all API routes have try/catch with proper error responses
   - Check all fetch calls in stores handle network errors
   - Verify offline mode gracefully handles missing data
   - Check GPS permission denied handling in locationStore
   - Validate Mapbox error handling (token invalid, load failure)

3. **Code quality fixes**
   - Run TypeScript strict checks, fix any issues
   - Remove unused imports and dead code
   - Verify immutability patterns (no mutation in stores)
   - Check file sizes (split any >800 line files)
   - Verify function sizes (<50 lines)

4. **Coverage verification**
   - Run full coverage report across all packages
   - Identify any gaps below 80%
   - Add targeted tests for uncovered critical paths
   - Generate final coverage badge/report

### Key Files
- All API routes
- All stores
- All components with user input
- `.env.example` (verify all vars documented)

### Definition of Done
- [ ] Security review complete, no critical issues
- [ ] Error handling comprehensive across all layers
- [ ] TypeScript strict mode passes
- [ ] No files exceed 800 lines
- [ ] Overall test coverage 80%+
- [ ] Coverage report generated
- [ ] All tests pass (unit + integration + E2E)

---

## Summary

| Phase | Type | Hours | Coverage Target |
|-------|------|-------|----------------|
| 1. Test Infrastructure & Game Logic | Unit | 6-8 | 95% (game-logic) |
| 2. API Route Tests | Integration | 6-8 | 80% (API routes) |
| 3. Zustand Store Tests | Unit | 4-5 | 85% (stores) |
| 4. React Component Tests | Component | 8-10 | 80% (components) |
| 5. E2E Tests | E2E | 5-6 | Critical flows |
| 6. Code Quality & Hardening | Quality | 3-4 | 80%+ overall |
| **Total** | | **32-40** | **80%+ overall** |

### Dependencies
- Phase 1 must complete first (test infrastructure needed by all phases)
- Phases 2, 3, 4 can run in parallel after Phase 1
- Phase 5 requires app to be runnable (Phase 1 complete)
- Phase 6 runs last as a sweep

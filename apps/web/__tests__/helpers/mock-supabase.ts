/**
 * Supabase client mock factory for API route tests.
 * Creates a chainable query builder that simulates Supabase's fluent API.
 *
 * The builder is "thenable" (implements `.then()`), so it can be awaited
 * directly — just like the real PostgREST builder. Queries that end without
 * an explicit terminal method (`.single()`, `.maybeSingle()`) resolve to
 * `{ data, error }` when awaited.
 */
import { vi } from 'vitest'

export interface MockQueryResult<T = unknown> {
  readonly data: T | null
  readonly error: { message: string; code?: string } | null
}

export interface MockQueryBuilder {
  readonly select: ReturnType<typeof vi.fn>
  readonly insert: ReturnType<typeof vi.fn>
  readonly update: ReturnType<typeof vi.fn>
  readonly delete: ReturnType<typeof vi.fn>
  readonly eq: ReturnType<typeof vi.fn>
  readonly in: ReturnType<typeof vi.fn>
  readonly order: ReturnType<typeof vi.fn>
  readonly single: ReturnType<typeof vi.fn>
  readonly maybeSingle: ReturnType<typeof vi.fn>
  readonly then: ReturnType<typeof vi.fn>
}

/**
 * Create a chainable Supabase query builder mock.
 * Each method returns `this` to enable chaining. Terminal methods
 * (`single`, `maybeSingle`) resolve the query, and the builder itself
 * is thenable so `await builder.from(...).select(...)` works correctly.
 */
export function createMockQueryBuilder(
  result: MockQueryResult = { data: null, error: null },
): MockQueryBuilder {
  const builder: MockQueryBuilder = {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    eq: vi.fn(),
    in: vi.fn(),
    order: vi.fn(),
    single: vi.fn(),
    maybeSingle: vi.fn(),
    then: vi.fn(),
  }

  // All chaining methods return the builder itself
  builder.select.mockReturnValue(builder)
  builder.insert.mockReturnValue(builder)
  builder.update.mockReturnValue(builder)
  builder.delete.mockReturnValue(builder)
  builder.eq.mockReturnValue(builder)
  builder.in.mockReturnValue(builder)
  builder.order.mockReturnValue(builder)

  // Terminal methods return the result (as a resolved promise)
  builder.single.mockResolvedValue(result)
  builder.maybeSingle.mockResolvedValue(result)

  // Make the builder itself thenable so `await builder` works.
  // This mimics the PostgREST PromiseLike interface.
  builder.then.mockImplementation(
    (onfulfilled?: (value: MockQueryResult) => unknown) =>
      Promise.resolve(result).then(onfulfilled),
  )

  return builder
}

export interface MockFunctionsClient {
  readonly invoke: ReturnType<typeof vi.fn>
}

/**
 * Create a mock Supabase client with configurable table query builders.
 */
export function createMockSupabaseClient(
  tableBuilders: Readonly<Record<string, MockQueryBuilder>> = {},
  functionsClient?: MockFunctionsClient,
) {
  const from = vi.fn((table: string) => {
    if (tableBuilders[table]) {
      return tableBuilders[table]
    }
    // Default: return a builder with null result
    return createMockQueryBuilder()
  })

  return {
    from,
    functions: functionsClient ?? {
      invoke: vi.fn().mockResolvedValue({ data: null, error: null }),
    },
  }
}

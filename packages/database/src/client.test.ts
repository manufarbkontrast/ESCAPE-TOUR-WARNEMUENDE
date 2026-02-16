import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock @supabase/supabase-js before importing the module under test
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(),
    auth: { getUser: vi.fn() },
  })),
}))

import { createClient } from '@supabase/supabase-js'
import { createSupabaseClient, createSupabaseServerClient } from './client'

const mockedCreateClient = vi.mocked(createClient)

describe('createSupabaseClient', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
    mockedCreateClient.mockClear()
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('should create a client when env vars are set', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

    const client = createSupabaseClient()

    expect(mockedCreateClient).toHaveBeenCalledWith(
      'https://test.supabase.co',
      'test-anon-key',
    )
    expect(client).toBeDefined()
  })

  it('should throw when NEXT_PUBLIC_SUPABASE_URL is missing', () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

    expect(() => createSupabaseClient()).toThrow('Missing Supabase environment variables')
  })

  it('should throw when NEXT_PUBLIC_SUPABASE_ANON_KEY is missing', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    expect(() => createSupabaseClient()).toThrow('Missing Supabase environment variables')
  })

  it('should throw when both env vars are missing', () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    expect(() => createSupabaseClient()).toThrow('Missing Supabase environment variables')
  })
})

describe('createSupabaseServerClient', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
    mockedCreateClient.mockClear()
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('should create a server client when env vars are set', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'

    const client = createSupabaseServerClient()

    expect(mockedCreateClient).toHaveBeenCalledWith(
      'https://test.supabase.co',
      'test-service-role-key',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    )
    expect(client).toBeDefined()
  })

  it('should throw when NEXT_PUBLIC_SUPABASE_URL is missing', () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'

    expect(() => createSupabaseServerClient()).toThrow('Missing Supabase environment variables')
  })

  it('should throw when SUPABASE_SERVICE_ROLE_KEY is missing', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    delete process.env.SUPABASE_SERVICE_ROLE_KEY

    expect(() => createSupabaseServerClient()).toThrow('Missing Supabase environment variables')
  })

  it('should throw when both env vars are missing', () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    delete process.env.SUPABASE_SERVICE_ROLE_KEY

    expect(() => createSupabaseServerClient()).toThrow('Missing Supabase environment variables')
  })

  it('should disable auto refresh and session persistence for server client', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'

    createSupabaseServerClient()

    const callArgs = mockedCreateClient.mock.calls[0]
    const options = callArgs?.[2] as { auth: { autoRefreshToken: boolean; persistSession: boolean } }
    expect(options.auth.autoRefreshToken).toBe(false)
    expect(options.auth.persistSession).toBe(false)
  })
})

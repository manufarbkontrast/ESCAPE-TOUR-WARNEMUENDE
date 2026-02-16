import { describe, it, expect } from 'vitest'
import {
  successResponse,
  errorResponse,
  toNextResponse,
} from '@/lib/utils/api-response'

describe('successResponse', () => {
  it('should create a success response with data', () => {
    const data = { id: '123', name: 'test' }
    const result = successResponse(data)

    expect(result).toEqual({
      success: true,
      data: { id: '123', name: 'test' },
      error: null,
    })
  })

  it('should handle null data', () => {
    const result = successResponse(null)
    expect(result.success).toBe(true)
    expect(result.data).toBeNull()
    expect(result.error).toBeNull()
  })

  it('should handle array data', () => {
    const result = successResponse([1, 2, 3])
    expect(result.data).toEqual([1, 2, 3])
  })
})

describe('errorResponse', () => {
  it('should create an error response with message', () => {
    const result = errorResponse('Something went wrong')

    expect(result).toEqual({
      success: false,
      data: null,
      error: 'Something went wrong',
    })
  })

  it('should always have null data', () => {
    const result = errorResponse('error')
    expect(result.data).toBeNull()
  })
})

describe('toNextResponse', () => {
  it('should return 200 for success response without explicit status', async () => {
    const response = toNextResponse(successResponse({ ok: true }))
    expect(response.status).toBe(200)

    const body = await response.json()
    expect(body.success).toBe(true)
  })

  it('should return 400 for error response without explicit status', async () => {
    const response = toNextResponse(errorResponse('bad'))
    expect(response.status).toBe(400)

    const body = await response.json()
    expect(body.success).toBe(false)
    expect(body.error).toBe('bad')
  })

  it('should use explicit status code when provided', async () => {
    const response = toNextResponse(successResponse({ id: '1' }), 201)
    expect(response.status).toBe(201)
  })

  it('should use explicit 500 status for server errors', async () => {
    const response = toNextResponse(errorResponse('internal'), 500)
    expect(response.status).toBe(500)
  })

  it('should return JSON content', async () => {
    const response = toNextResponse(successResponse('hello'))
    const body = await response.json()
    expect(body.data).toBe('hello')
  })
})

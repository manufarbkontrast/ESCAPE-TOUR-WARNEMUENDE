/**
 * Tests for POST /api/contact
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const { mockSend } = vi.hoisted(() => ({
  mockSend: vi.fn(),
}))

vi.mock('@/lib/email/client', () => ({
  resend: { emails: { send: mockSend } },
  EMAIL_FROM: 'test@example.com',
  CONTACT_EMAIL: 'admin@example.com',
}))

vi.mock('@/lib/email/templates/contact-notification', () => ({
  buildContactNotificationEmail: vi.fn(() => ({
    subject: 'Test Subject',
    html: '<p>Test</p>',
    text: 'Test',
  })),
}))

import { POST } from '@/app/api/contact/route'

function createRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost:3000/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

async function parseResponse(response: Response) {
  return response.json()
}

describe('POST /api/contact', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSend.mockResolvedValue({ data: { id: 'email_123' }, error: null })
  })

  it('should return 400 if required fields are missing', async () => {
    const response = await POST(createRequest({ name: 'Test' }))
    expect(response.status).toBe(400)
    const body = await parseResponse(response)
    expect(body.success).toBe(false)
  })

  it('should return 400 for invalid email', async () => {
    const response = await POST(
      createRequest({
        name: 'Test',
        email: 'not-an-email',
        subject: 'booking',
        message: 'Hello',
      }),
    )
    expect(response.status).toBe(400)
  })

  it('should return 400 for message exceeding 5000 chars', async () => {
    const response = await POST(
      createRequest({
        name: 'Test',
        email: 'test@test.de',
        subject: 'booking',
        message: 'x'.repeat(5001),
      }),
    )
    expect(response.status).toBe(400)
  })

  it('should send email and return success on valid input', async () => {
    const response = await POST(
      createRequest({
        name: 'Max',
        email: 'max@test.de',
        subject: 'feedback',
        message: 'Tolle Tour!',
      }),
    )
    expect(response.status).toBe(200)
    const body = await parseResponse(response)
    expect(body.success).toBe(true)
    expect(mockSend).toHaveBeenCalledOnce()
  })

  it('should set replyTo to sender email', async () => {
    await POST(
      createRequest({
        name: 'Max',
        email: 'max@test.de',
        subject: 'feedback',
        message: 'Hi',
      }),
    )
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({ replyTo: 'max@test.de' }),
    )
  })

  it('should return 500 if email sending fails', async () => {
    mockSend.mockResolvedValue({ data: null, error: { message: 'Send failed' } })
    const response = await POST(
      createRequest({
        name: 'Max',
        email: 'max@test.de',
        subject: 'feedback',
        message: 'Hi',
      }),
    )
    expect(response.status).toBe(500)
  })
})

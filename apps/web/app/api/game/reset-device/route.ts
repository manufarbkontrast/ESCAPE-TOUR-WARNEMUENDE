import { NextResponse } from 'next/server'
import { SESSION_COOKIE_NAME } from '@/lib/utils/session-token'
import { successResponse } from '@/lib/utils/api-response'

export async function POST() {
  const response = NextResponse.json(successResponse({ redirectTo: '/staff' }))

  response.cookies.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })

  return response
}

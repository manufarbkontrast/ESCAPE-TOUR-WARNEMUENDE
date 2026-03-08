/**
 * Consistent API response envelope for all API routes
 */

export type ApiResponse<T = unknown> = {
  readonly success: boolean;
  readonly data: T | null;
  readonly error: string | null;
};

/**
 * Create a successful API response
 */
export function successResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
    error: null,
  };
}

/**
 * Create an error API response
 */
export function errorResponse(error: string): ApiResponse<never> {
  return {
    success: false,
    data: null,
    error,
  };
}

/**
 * Convert ApiResponse to NextResponse with proper status codes
 */
export function toNextResponse<T>(
  response: ApiResponse<T>,
  status?: number
): Response {
  const statusCode = status ?? (response.success ? 200 : 400);
  return Response.json(response, { status: statusCode });
}

interface CookieOptions {
  readonly name: string;
  readonly value: string;
  readonly httpOnly?: boolean;
  readonly secure?: boolean;
  readonly sameSite?: 'lax' | 'strict' | 'none';
  readonly path?: string;
  readonly maxAge?: number;
}

/**
 * Convert ApiResponse to NextResponse with cookies set
 */
export function toNextResponseWithCookies<T>(
  response: ApiResponse<T>,
  status: number,
  cookies: readonly CookieOptions[],
): Response {
  const statusCode = status ?? (response.success ? 200 : 400);
  const res = new Response(JSON.stringify(response), {
    status: statusCode,
    headers: { 'Content-Type': 'application/json' },
  });

  for (const cookie of cookies) {
    const parts = [`${cookie.name}=${encodeURIComponent(cookie.value)}`];
    if (cookie.httpOnly) parts.push('HttpOnly');
    if (cookie.secure) parts.push('Secure');
    if (cookie.sameSite) parts.push(`SameSite=${cookie.sameSite}`);
    if (cookie.path) parts.push(`Path=${cookie.path}`);
    if (cookie.maxAge !== undefined) parts.push(`Max-Age=${cookie.maxAge}`);
    res.headers.append('Set-Cookie', parts.join('; '));
  }

  return res;
}

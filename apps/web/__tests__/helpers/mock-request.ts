/**
 * NextRequest mock factory for API route tests.
 */

/**
 * Create a mock NextRequest for GET requests with query params.
 */
export function createGetRequest(
  url: string,
  params?: Readonly<Record<string, string>>,
): Request {
  const urlObj = new URL(url, 'http://localhost:3000')
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      urlObj.searchParams.set(key, value)
    }
  }
  return new Request(urlObj.toString(), { method: 'GET' })
}

/**
 * Create a mock NextRequest for POST/PATCH requests with JSON body.
 */
export function createJsonRequest(
  url: string,
  method: 'POST' | 'PATCH',
  body: unknown,
): Request {
  return new Request(new URL(url, 'http://localhost:3000').toString(), {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

/**
 * Parse the JSON body and status from a Response.
 */
export async function parseResponse<T = unknown>(
  response: Response,
): Promise<{ readonly status: number; readonly body: T }> {
  const body = (await response.json()) as T
  return { status: response.status, body }
}

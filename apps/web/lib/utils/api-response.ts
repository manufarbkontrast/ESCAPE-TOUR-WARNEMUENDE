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

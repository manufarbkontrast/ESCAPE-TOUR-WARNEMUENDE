/**
 * Builds the URL reported to analytics, with credential-bearing query
 * parameters removed.
 *
 * The booking confirmation page carries `?session_id=cs_…`, and that id is
 * enough to read the booking — including the booking code, which is the only
 * credential needed to start a paid tour — from `/api/booking/status`.
 * Sending it to a third-party analytics service would put a working
 * credential into someone else's data store.
 */

/** Query parameters that must never leave the browser in an analytics event. */
const SENSITIVE_PARAMS: ReadonlySet<string> = new Set([
  'session_id',
  'payment_intent',
  'payment_intent_client_secret',
  'code',
  'token',
  'email',
])

export function buildPageviewUrl(pathname: string, searchParams: URLSearchParams): string {
  const safe = new URLSearchParams()

  for (const [key, value] of searchParams.entries()) {
    if (!SENSITIVE_PARAMS.has(key.toLowerCase())) {
      safe.append(key, value)
    }
  }

  const query = safe.toString()
  return query ? `${pathname}?${query}` : pathname
}

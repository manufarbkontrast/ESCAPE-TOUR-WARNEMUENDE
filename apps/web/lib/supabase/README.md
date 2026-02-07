# Supabase SSR Integration

This directory contains the Supabase client configuration for Next.js 14+ App Router with SSR support.

## Files

- **`client.ts`** - Browser-side client (Client Components)
- **`server.ts`** - Server-side client (Server Components, Route Handlers)
- **`middleware.ts`** - Middleware helper for auth session refresh
- **`index.ts`** - Barrel exports for convenience

## Usage

### Client Components

```typescript
'use client';

import { createBrowserClient } from '@/lib/supabase';

export default function ClientComponent() {
  const supabase = createBrowserClient();

  // Use supabase client...
}
```

### Server Components

```typescript
import { createServerClient } from '@/lib/supabase';

export default async function ServerComponent() {
  const supabase = await createServerClient();

  // Use supabase client...
}
```

### Route Handlers

```typescript
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const supabase = await createClient();

  // Use supabase client...
}
```

### Middleware

Middleware is configured in `/middleware.ts` and automatically:
- Refreshes auth sessions on each request
- Updates cookies with fresh session data
- Protects routes (configured in middleware matcher)

## Environment Variables

Required environment variables (see `.env.example`):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Type Safety

All clients are typed with the `Database` type from `@escape-tour/database/src/types/supabase`, providing full type safety for:
- Table schemas
- Query results
- Mutations
- Enums

## Session Management

Sessions are automatically managed via cookies:
- Browser client reads/writes cookies automatically
- Server client integrates with Next.js cookies API
- Middleware refreshes sessions on navigation

## Security

- Uses anon key for client-side operations
- RLS policies enforce security at database level
- Service role key should NEVER be exposed to client
- All sensitive operations should use RLS or Edge Functions

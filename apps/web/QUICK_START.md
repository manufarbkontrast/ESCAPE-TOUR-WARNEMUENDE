# Quick Start - Supabase Integration

## 1. Set Up Environment Variables

Create `/apps/web/.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://zwextqejkoqjfbbphczo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<get-from-supabase-dashboard>
```

Get your anon key from: https://supabase.com/dashboard/project/zwextqejkoqjfbbphczo/settings/api

## 2. Available API Endpoints

### Create Game Session
```bash
curl -X POST http://localhost:3000/api/game/session \
  -H "Content-Type: application/json" \
  -d '{"bookingCode": "ABC123"}'
```

### Get Session
```bash
curl http://localhost:3000/api/game/session?id=<session-id>
```

### Update Session
```bash
curl -X PATCH http://localhost:3000/api/game/session \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "<session-id>",
    "status": "active",
    "currentStationIndex": 1
  }'
```

### Validate Answer
```bash
curl -X POST http://localhost:3000/api/game/validate-answer \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "<session-id>",
    "puzzleId": "<puzzle-id>",
    "answer": "your answer",
    "timeSeconds": 45
  }'
```

### Generate Certificate
```bash
curl -X POST http://localhost:3000/api/game/certificate \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "<session-id>"}'
```

## 3. Import Clients in Your Code

### Client Component
```typescript
'use client';
import { createBrowserClient } from '@/lib/supabase';

export default function MyComponent() {
  const supabase = createBrowserClient();
  // Use supabase...
}
```

### Server Component
```typescript
import { createServerClient } from '@/lib/supabase';

export default async function MyPage() {
  const supabase = await createServerClient();
  // Use supabase...
}
```

### API Route
```typescript
import { createClient } from '@/lib/supabase/server';
import { successResponse, toNextResponse } from '@/lib/utils';

export async function GET() {
  const supabase = await createClient();
  // Use supabase...
  return toNextResponse(successResponse(data));
}
```

## 4. TypeScript Types

Import database types:
```typescript
import type { Database } from '@escape-tour/database/src/types/supabase';

type Session = Database['public']['Tables']['game_sessions']['Row'];
type Booking = Database['public']['Tables']['bookings']['Row'];
```

Import API response type:
```typescript
import type { ApiResponse } from '@/lib/utils';
```

## 5. Run Development Server

```bash
cd apps/web
npm run dev
```

Visit http://localhost:3000

## 6. Common Errors

### Missing Environment Variables
**Error**: "Missing Supabase environment variables"
**Fix**: Create `.env.local` with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY

### Session Not Found
**Error**: `{"success": false, "error": "Session not found"}`
**Fix**: Verify session ID exists in database

### Invalid Booking Code
**Error**: `{"success": false, "error": "Invalid or expired booking code"}`
**Fix**: Ensure booking code is 6 uppercase alphanumeric characters and exists with status "confirmed"

## 7. Documentation

- **API Routes**: See `/apps/web/app/api/README.md`
- **Supabase Clients**: See `/apps/web/lib/supabase/README.md`
- **Full Implementation**: See `/apps/web/SUPABASE_INTEGRATION.md`

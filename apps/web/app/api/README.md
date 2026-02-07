# API Routes

Next.js App Router API routes for the Escape Tour application.

## Structure

```
api/
├── game/
│   ├── validate-answer/   # Answer validation via Edge Function
│   ├── session/           # Game session management (CRUD)
│   └── certificate/       # Certificate generation
├── booking/              # Booking operations
└── webhooks/             # External webhooks (Stripe, etc.)
```

## API Response Format

All API routes return a consistent response envelope:

```typescript
type ApiResponse<T> = {
  success: boolean;
  data: T | null;
  error: string | null;
};
```

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

### Error Response

```json
{
  "success": false,
  "data": null,
  "error": "Error message here"
}
```

## Game API Routes

### POST /api/game/validate-answer

Validates a puzzle answer via Supabase Edge Function.

**Request:**
```json
{
  "sessionId": "uuid",
  "puzzleId": "uuid",
  "answer": "string or array",
  "timeSeconds": 123
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "correct": true,
    "points": 100,
    "timeBonus": 25,
    "feedback": "Correct!"
  }
}
```

### GET /api/game/session?id=xxx

Fetch game session by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "booking_id": "uuid",
    "tour_id": "uuid",
    "status": "active",
    "current_station_index": 2,
    "total_points": 350,
    ...
  }
}
```

### POST /api/game/session

Create new game session from booking code.

**Request:**
```json
{
  "bookingCode": "ABC123",
  "teamName": "Optional Team Name"
}
```

**Response:**
```json
{
  "success": true,
  "data": { ... session object ... }
}
```

### PATCH /api/game/session

Update session state (pause/resume/complete).

**Request:**
```json
{
  "sessionId": "uuid",
  "status": "paused",
  "currentStationIndex": 3,
  "totalPoints": 450,
  "hintsUsed": 2,
  "puzzlesSkipped": 0
}
```

**Response:**
```json
{
  "success": true,
  "data": { ... updated session ... }
}
```

### POST /api/game/certificate

Generate completion certificate via Edge Function.

**Request:**
```json
{
  "sessionId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "certificateId": "uuid",
    "verificationCode": "ABC123",
    "teamName": "Team Name",
    "completedAt": "2024-01-01T12:00:00Z",
    "duration": 7200,
    "totalPoints": 1250,
    "rank": "Gold",
    "pdfUrl": "https://..."
  }
}
```

## Error Handling

All routes implement comprehensive error handling:

1. **Validation Errors** (400) - Invalid request parameters
2. **Not Found** (404) - Resource not found
3. **Server Errors** (500) - Database or Edge Function errors

All errors include descriptive messages in the `error` field.

## Type Safety

Routes use TypeScript with strict types from:
- `@escape-tour/database/src/types/supabase` - Database schema
- Request/Response type definitions

## Security

- All routes validate inputs at the boundary
- Booking codes are validated for format and status
- Session IDs are verified before operations
- RLS policies enforce database-level security

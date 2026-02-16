# API Endpoints: Escape Tour Warnemuende

**Runtime**: Next.js 14 App Router API Routes
**Base Path**: `/api/game/`
**Auth**: Supabase SSR (cookie-based sessions)
**Response Format**: Consistent envelope `{ success: boolean, data: T | null, error: string | null }`

---

## Game Session Endpoints

### `POST /api/game/session` - Create Session

Start a new game session from a booking code.

**Request Body**:
```json
{
  "bookingCode": "ABC123",
  "teamName": "Die Seeraeuber"
}
```

**Validation**:
- `bookingCode`: required, 6 uppercase alphanumeric characters
- `teamName`: optional string

**Success Response** (201):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "booking_id": "uuid",
    "tour_id": "uuid",
    "status": "active",
    "team_name": "Die Seeraeuber",
    "started_at": "2025-06-15T10:00:00Z",
    "current_station_index": 0,
    "total_points": 0,
    "stations": [...]
  },
  "error": null
}
```

**Error Responses**:
- `400` - Invalid booking code format
- `400` - Booking expired (outside valid_from/valid_until)
- `404` - Booking code not found
- `409` - Active session already exists for this booking
- `500` - Internal server error

---

### `GET /api/game/session?id={sessionId}` - Get Session

Fetch a game session with all stations and puzzles.

**Query Parameters**:
- `id`: required, session UUID

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "session": { ... },
    "stations": [...],
    "puzzles": [...]
  },
  "error": null
}
```

**Error Responses**:
- `400` - Missing session ID
- `404` - Session not found
- `500` - Internal server error

---

### `PATCH /api/game/session` - Update Session

Update session state (pause, resume, complete, advance).

**Request Body**:
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

**Validation**:
- `sessionId`: required UUID
- `status`: optional, one of `active | paused | completed`
- All numeric fields: optional, non-negative integers

**Success Response** (200):
```json
{
  "success": true,
  "data": { "...updated session..." },
  "error": null
}
```

**Error Responses**:
- `400` - Missing session ID
- `400` - Invalid status transition
- `404` - Session not found
- `500` - Internal server error

---

## Puzzle Endpoints

### `POST /api/game/validate-answer` - Validate Answer

Submit and validate a puzzle answer. Delegates to Supabase Edge Function.

**Request Body**:
```json
{
  "sessionId": "uuid",
  "puzzleId": "uuid",
  "answer": "lighthouse",
  "timeSeconds": 45
}
```

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "correct": true,
    "points": 80,
    "timeBonus": 20,
    "feedback": "Richtig! Der Leuchtturm wurde 1898 erbaut."
  },
  "error": null
}
```

**Error Responses**:
- `400` - Missing required fields
- `404` - Puzzle not found
- `500` - Edge Function error

---

### `GET /api/game/hints/{puzzleId}` - Get Hints

Fetch available hints for a puzzle, ordered by level.

**Path Parameters**:
- `puzzleId`: puzzle UUID

**Success Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "hint_level": 1,
      "text_de": "Schauen Sie nach oben...",
      "available_after_seconds": 60,
      "point_penalty": 10
    },
    {
      "id": "uuid",
      "hint_level": 2,
      "text_de": "Die Antwort hat mit dem Gebaeude zu tun...",
      "available_after_seconds": 120,
      "point_penalty": 25
    }
  ],
  "error": null
}
```

**Error Responses**:
- `400` - Invalid puzzle ID
- `500` - Internal server error

---

## Certificate Endpoints

### `POST /api/game/certificate` - Generate Certificate

Generate a completion certificate. Delegates to Supabase Edge Function.

**Request Body**:
```json
{
  "sessionId": "uuid"
}
```

**Success Response** (201):
```json
{
  "success": true,
  "data": {
    "certificateId": "uuid",
    "verificationCode": "CERT-ABC123",
    "pdfUrl": "https://...",
    "badge": "gold",
    "stats": {
      "totalPoints": 850,
      "duration": "01:28:00",
      "hintsUsed": 1,
      "puzzlesSkipped": 0
    }
  },
  "error": null
}
```

**Error Responses**:
- `400` - Session not completed
- `404` - Session not found
- `409` - Certificate already generated (returns existing)
- `500` - Edge Function error

---

## Supabase Edge Functions

### `validate-answer`
Server-side answer validation to prevent cheating. Receives puzzle data and player answer, returns validation result with scoring.

### `generate-certificate`
Server-side certificate generation. Creates PDF, stores in Supabase Storage, returns URL and verification code.

---

## Demo Mode

All endpoints support a demo mode when `bookingCode` is `"DEMO00"`. Demo mode:
- Skips database lookups
- Returns static test data
- Allows full game flow testing without Supabase
- Useful for development and E2E tests

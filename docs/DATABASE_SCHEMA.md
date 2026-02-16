# Database Schema: Escape Tour Warnemuende

**Database**: Supabase (PostgreSQL)
**Package**: `packages/database`

---

## Tables

### `tours`
Primary tour definitions (family and adult variants).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, default gen_random_uuid() | Tour identifier |
| slug | text | UNIQUE, NOT NULL | URL-friendly identifier |
| name_de | text | NOT NULL | German name |
| name_en | text | | English name |
| variant | tour_variant | NOT NULL | `family` or `adult` |
| description_de | text | | German description |
| description_en | text | | English description |
| duration_minutes | integer | NOT NULL | Expected duration |
| distance_meters | integer | NOT NULL | Total walking distance |
| price_cents | integer | NOT NULL | Price in EUR cents |
| group_price_cents | integer | | Group discount price |
| max_group_size | integer | DEFAULT 6 | Max participants |
| min_age | integer | NOT NULL | Minimum age |
| is_active | boolean | DEFAULT true | Published status |
| meta_title | text | | SEO title |
| meta_description | text | | SEO description |
| created_at | timestamptz | DEFAULT now() | |
| updated_at | timestamptz | DEFAULT now() | |

### `stations`
Physical locations along a tour route.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Station identifier |
| tour_id | uuid | FK tours.id, NOT NULL | Parent tour |
| order_index | integer | NOT NULL | Station sequence (0-based) |
| name_de | text | NOT NULL | German name |
| name_en | text | | English name |
| subtitle_de | text | | German subtitle |
| subtitle_en | text | | English subtitle |
| location | geography(Point) | NOT NULL | PostGIS point |
| location_name | text | | Human-readable location |
| radius_meters | integer | DEFAULT 50 | GPS unlock radius |
| intro_text_de | text | | Introduction text |
| intro_text_en | text | | |
| story_text_de | text | | Story narrative |
| story_text_en | text | | |
| completion_text_de | text | | Completion message |
| completion_text_en | text | | |
| header_image_url | text | | Station header image |
| background_audio_url | text | | Ambient audio file |
| ambient_sound | text | | Ambient sound type |
| estimated_duration_minutes | integer | | Per-station estimate |
| created_at | timestamptz | DEFAULT now() | |

### `puzzles`
Individual puzzles attached to stations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Puzzle identifier |
| station_id | uuid | FK stations.id, NOT NULL | Parent station |
| order_index | integer | NOT NULL | Puzzle sequence |
| puzzle_type | puzzle_type | NOT NULL | Type enum |
| difficulty | difficulty | NOT NULL | Difficulty enum |
| question_de | text | NOT NULL | German question |
| question_en | text | | English question |
| instruction_de | text | | German instructions |
| instruction_en | text | | English instructions |
| answer_type | text | NOT NULL | Expected answer format |
| correct_answer | jsonb | NOT NULL | Answer data |
| answer_validation_mode | text | NOT NULL | Validation strategy |
| case_sensitive | boolean | DEFAULT false | |
| options | jsonb | | Multiple choice options |
| ar_content | jsonb | | AR overlay data |
| ar_marker_url | text | | AR marker image |
| audio_url | text | | Puzzle audio file |
| image_url | text | | Puzzle image |
| target_location | geography(Point) | | For navigation puzzles |
| target_radius_meters | integer | | GPS check radius |
| base_points | integer | NOT NULL | Points before bonuses |
| time_bonus_enabled | boolean | DEFAULT true | Time bonus active |
| time_bonus_max_seconds | integer | | Seconds for max bonus |
| created_at | timestamptz | DEFAULT now() | |

### `bookings`
Tour bookings linked to payments.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Booking identifier |
| user_id | uuid | FK auth.users.id | Supabase auth user |
| tour_id | uuid | FK tours.id, NOT NULL | Booked tour |
| booking_code | text | UNIQUE, NOT NULL | 6-char alphanumeric |
| status | booking_status | NOT NULL, DEFAULT 'pending' | |
| scheduled_date | date | | Planned play date |
| scheduled_time | time | | Planned start time |
| team_name | text | | Team/group name |
| participant_count | integer | DEFAULT 1 | |
| amount_cents | integer | NOT NULL | Price charged |
| payment_intent_id | text | | Stripe payment intent |
| paid_at | timestamptz | | Payment timestamp |
| contact_email | text | NOT NULL | |
| contact_phone | text | | |
| valid_from | timestamptz | NOT NULL | Validity window start |
| valid_until | timestamptz | NOT NULL | Validity window end |
| created_at | timestamptz | DEFAULT now() | |
| updated_at | timestamptz | DEFAULT now() | |

### `game_sessions`
Active game play sessions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Session identifier |
| booking_id | uuid | FK bookings.id, NOT NULL | Source booking |
| tour_id | uuid | FK tours.id, NOT NULL | Tour being played |
| status | session_status | NOT NULL, DEFAULT 'pending' | |
| team_name | text | | Display name |
| started_at | timestamptz | | Game start time |
| paused_at | timestamptz | | Current pause start |
| completed_at | timestamptz | | Game completion time |
| total_pause_seconds | integer | DEFAULT 0 | Cumulative pause time |
| current_station_index | integer | DEFAULT 0 | Progress marker |
| total_points | integer | DEFAULT 0 | Running score |
| hints_used | integer | DEFAULT 0 | Total hints consumed |
| puzzles_skipped | integer | DEFAULT 0 | Total skipped |
| device_info | jsonb | | Browser/device details |
| offline_data | jsonb | | Offline sync buffer |
| needs_sync | boolean | DEFAULT false | Pending sync flag |
| last_activity_at | timestamptz | | For timeout detection |
| created_at | timestamptz | DEFAULT now() | |

### `hints`
Progressive hints for puzzles.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Hint identifier |
| puzzle_id | uuid | FK puzzles.id, NOT NULL | Parent puzzle |
| hint_level | integer | NOT NULL, CHECK 1-4 | Progressive level |
| text_de | text | NOT NULL | German hint text |
| text_en | text | | English hint text |
| available_after_seconds | integer | DEFAULT 0 | Time gate |
| point_penalty | integer | DEFAULT 0 | Points deducted |
| time_bonus_penalty_percent | integer | DEFAULT 0 | Time bonus reduction |
| marks_as_skipped | boolean | DEFAULT false | Level 4 = skip |
| created_at | timestamptz | DEFAULT now() | |

### `certificates`
Game completion certificates.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Certificate identifier |
| session_id | uuid | FK game_sessions.id, UNIQUE | One per session |
| verification_code | text | UNIQUE, NOT NULL | Public verification |
| data | jsonb | NOT NULL | Full certificate data |
| created_at | timestamptz | DEFAULT now() | |

---

## Enums

```sql
CREATE TYPE tour_variant AS ENUM ('family', 'adult');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
CREATE TYPE session_status AS ENUM ('pending', 'active', 'paused', 'completed', 'expired');
CREATE TYPE difficulty AS ENUM ('easy', 'medium', 'hard', 'finale');
CREATE TYPE puzzle_type AS ENUM (
  'count', 'photo_search', 'symbol_find', 'combination',
  'ar_puzzle', 'audio', 'logic', 'navigation',
  'document_analysis', 'text_analysis'
);
```

---

## Relationships

```
tours 1--* stations (tour_id)
stations 1--* puzzles (station_id)
puzzles 1--* hints (puzzle_id)
tours 1--* bookings (tour_id)
bookings 1--* game_sessions (booking_id)
game_sessions 1--1 certificates (session_id)
```

---

## Extensions Required

- `postgis` - Geographic data types and functions
- `pgcrypto` - UUID generation (`gen_random_uuid()`)

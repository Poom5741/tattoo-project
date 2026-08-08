# Ticket #93: Admin Edit Artist Details — Research & Decision

## Status: Decision Made

## Current State Analysis

### Artist Schema
```sql
artists (
  id          TEXT PRIMARY KEY,      -- Foreign key, immutable
  name        TEXT NOT NULL,         -- Display name
  handle      TEXT,                  -- @username
  city        TEXT,                  -- Location
  style       TEXT,                  -- Tattoo style
  years       INTEGER,              -- Years of experience
  booked      TEXT,                  -- Booking status text
  rate        INTEGER,              -- Hourly rate
  bio         TEXT,                  -- Biography
  pieces      INTEGER,              -- Number of pieces
  rating      TEXT,                 -- Rating (e.g., "4.98")
  seed        INTEGER,              -- Random seed for generative art
  email       TEXT,                 -- Contact email
  wallet_address TEXT               -- EVM wallet (added later)
)
```

### Current Admin UI
- Shows: Name, ID, Wallet Address
- Editable: Only `wallet_address` via inline form
- No edit mechanism for other fields

## Decision

### 1. Editable Fields

| Field | Admin Editable | Artist Editable | Notes |
|-------|---------------|-----------------|-------|
| `id` | ❌ No | ❌ No | Foreign key, immutable |
| `name` | ✅ Yes | ✅ Yes | Display name |
| `handle` | ✅ Yes | ✅ Yes | @username |
| `city` | ✅ Yes | ✅ Yes | Location |
| `style` | ✅ Yes | ✅ Yes | Tattoo style |
| `years` | ✅ Yes | ✅ Yes | Years of experience |
| `booked` | ✅ Yes | ✅ Yes | Booking status text |
| `rate` | ✅ Yes | ✅ Yes | Hourly rate |
| `bio` | ✅ Yes | ✅ Yes | Biography |
| `pieces` | ⚠️ Read-only | ⚠️ Read-only | Auto-calculated from designs |
| `rating` | ⚠️ Read-only | ⚠️ Read-only | Auto-calculated from reviews |
| `seed` | ❌ No | ❌ No | Internal, used for generative art |
| `email` | ✅ Yes | ✅ Yes | Contact email |
| `wallet_address` | ✅ Yes | ✅ Yes | EVM wallet |

**Admin-only fields:** None (all artist-editable fields are also admin-editable)

### 2. Edit Mechanism: **Modal Form**

**Rationale:**
- Inline editing is messy with many fields
- Separate page adds navigation complexity
- Modal is simple, focused, and works well for admin tasks

**Implementation:**
- "Edit" button in each artist row
- Opens modal with all editable fields pre-filled
- Save button submits via API
- Close/cancel dismisses modal

### 3. Validation Rules

| Field | Validation |
|-------|------------|
| `name` | Required, max 100 chars |
| `handle` | Optional, must start with `@`, max 50 chars |
| `city` | Optional, max 100 chars |
| `style` | Optional, max 200 chars |
| `years` | Optional, integer 0-100 |
| `booked` | Optional, max 100 chars |
| `rate` | Optional, integer 0-10000 (THB) |
| `bio` | Optional, max 2000 chars |
| `email` | Optional, valid email format |
| `wallet_address` | Optional, must match `^0x[0-9a-fA-F]{40}$` |

**No approval queue** — admin edits take effect immediately.

### 4. Audit Trail

**Decision:** No audit trail for v1

**Rationale:**
- Admin is trusted (password-protected)
- Adds complexity (new table, UI to view history)
- Can implement later if needed

**Future consideration:** Add `last_edited_by` and `last_edited_at` fields if audit becomes necessary.

### 5. Artist Self-Edit

**Decision:** Artists can edit their own profile via `/artist/portal`

**Fields artists can edit:**
- `name`, `handle`, `city`, `style`, `years`, `booked`, `rate`, `bio`, `email`, `wallet_address`

**Fields artists cannot edit:**
- `id`, `pieces`, `rating`, `seed`

**Admin override:** Admin can edit any field (including read-only ones if needed for corrections).

## Implementation Plan

### Files to Change

| File | Change |
|------|--------|
| `src/pages/admin/index.astro` | Add "Edit" button + modal HTML/JS |
| `src/pages/api/admin/update-artist.ts` | New API endpoint for all fields |
| `src/components/AdminArtistModal.tsx` | New modal component (optional, can inline) |

### API Design

**POST `/api/admin/update-artist`**
```typescript
// Request
{
  artistId: string;
  name?: string;
  handle?: string;
  city?: string;
  style?: string;
  years?: number;
  booked?: string;
  rate?: number;
  bio?: string;
  email?: string;
  wallet_address?: string;
}

// Response
{ ok: boolean, error?: string }

// Implementation
UPDATE artists SET name = ?, handle = ?, ... WHERE id = ?
```

### Modal Design

```
┌─────────────────────────────────────────┐
│  Edit Artist: {name}                    │
├─────────────────────────────────────────┤
│  Name: [________________]               │
│  Handle: [@_____________]               │
│  City: [________________]               │
│  Style: [________________]              │
│  Years: [____]                          │
│  Booked: [________________]             │
│  Rate (THB): [____]                     │
│  Bio: [________________]                │
│  Email: [________________]              │
│  Wallet: [0x________________]           │
├─────────────────────────────────────────┤
│              [Cancel]  [Save]           │
└─────────────────────────────────────────┘
```

## Risk Assessment

- **Data Loss:** Low — validation prevents invalid data
- **Broken References:** None — `id` is immutable
- **UX Impact:** Minimal — modal is intuitive for admin
- **Performance:** Negligible — single UPDATE query

## Decision Summary

**Approach:** Modal form with all editable fields
**Scope:** 2-3 files, ~150 lines
**Risk:** Low
**Time Estimate:** 2-3 hours

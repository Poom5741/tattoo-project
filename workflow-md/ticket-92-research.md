# Ticket #92: Admin Delete Artist — Research & Decision

## Status: Decision Made

## Current State Analysis

### Admin Page (`/admin`)
- Shows artists in a table: Name, ID, Wallet Address, Update Action
- **No delete button exists**
- Artists have related data: designs, booking inquiries, conversations

### Database Schema
```sql
-- artists table
CREATE TABLE artists (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  wallet_address TEXT,
  created_at INTEGER DEFAULT (unixepoch())
);

-- designs table (references artists)
CREATE TABLE designs (
  id TEXT PRIMARY KEY,
  artist_id TEXT NOT NULL,
  title TEXT NOT NULL,
  ...
);

-- booking_inquiries table (references artists)
CREATE TABLE booking_inquiries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  artist_id TEXT NOT NULL,
  ...
);
```

## Decision

### 1. Delete Type: **Soft Delete**

**Rationale:**
- Artists may have sold designs (NFTs in circulation)
- Bookings may be in progress
- Conversations may reference the artist
- Hard delete breaks referential integrity
- Soft delete preserves data while hiding from UI

**Implementation:**
- Add `deleted_at` INTEGER column to `artists` table
- NULL = active, non-NULL = deleted
- Add `status` TEXT column for explicit states: `'active'` | `'suspended'` | `'deleted'`

### 2. Cascading Behavior

| Data Type | Behavior |
|-----------|----------|
| **Designs** | Keep visible if status is `'sold'` or `'reserved'`; hide if `'available'` or `'pending'` |
| **Bookings** | Keep all bookings (they reference real-world appointments) |
| **Conversations** | Keep all messages (they reference real conversations) |

**UI Treatment:**
- Artist name shows as "[Deleted Artist]" with strikethrough
- Sold designs remain in vault/marketplace with original artist attribution
- New bookings blocked for deleted artists

### 3. UI/UX

**Delete Button:**
- Red "Delete" button in each artist row (next to wallet update)
- Uses native HTML confirmation: `confirm("Delete artist {name}? This will hide their profile and block new bookings.")`
- No complex modal needed for v1

**Confirmation:**
- Simple browser `confirm()` dialog
- Shows artist name in confirmation
- Warns about blocking new bookings

**Undo:**
- No undo for v1 (can implement admin "restore" later if needed)
- Admin can manually re-activate by setting `deleted_at = NULL`

### 4. Business Rules

| Rule | Decision |
|------|----------|
| Can delete artists with sold designs? | **Yes** — sold designs remain visible |
| Can delete artists with pending bookings? | **Yes** — bookings preserved, new ones blocked |
| Can delete artists with active conversations? | **Yes** — messages preserved |
| Requires reassignment first? | **No** — too complex for v1 |

## Implementation Plan

### Files to Change

| File | Change |
|------|--------|
| `migrations/` | Add `deleted_at` and `status` columns to `artists` table |
| `src/pages/admin/index.astro` | Add delete button + API call |
| `src/pages/api/admin/delete-artist.ts` | New API endpoint |
| `src/lib/catalog/seed.ts` | Update artist queries to filter deleted |

### API Design

**DELETE `/api/admin/delete-artist`**
```typescript
// Request
{ artistId: string }

// Response
{ ok: boolean, error?: string }

// Implementation
UPDATE artists SET deleted_at = unixepoch(), status = 'deleted' WHERE id = ?
```

### Query Updates

All artist queries must filter:
```sql
WHERE deleted_at IS NULL
```

Except:
- Admin page (shows all, with delete button)
- Sold design pages (show original artist attribution)

## Risk Assessment

- **Data Loss:** None — soft delete preserves everything
- **Broken References:** None — foreign keys remain valid
- **UX Impact:** Minimal — deleted artists hidden from public views
- **Performance:** Negligible — indexed column filter

## Decision Summary

**Approach:** Soft delete with `deleted_at` timestamp
**Scope:** 4 files, ~80 lines of code
**Risk:** Low
**Time Estimate:** 1-2 hours

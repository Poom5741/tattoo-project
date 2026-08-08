# Ticket #94: Admin Delete/Edit Designs — Research & Decision

## Status: Decision Made

## Current State Analysis

### Existing Endpoints
- `POST /api/admin/review-design` — Approve/reject pending designs (status: pending → available/rejected)
- `POST /api/admin/delist-design` — Delist designs (status → delisted)
- `POST /api/designs/[id]/edit` — Edit design details (title, style, price, etc.)

### Design Schema
```sql
designs (
  id          TEXT PRIMARY KEY,
  n           INTEGER,           -- Sequential number
  title       TEXT NOT NULL,
  artist_id   TEXT NOT NULL,     -- FK → artists
  style       TEXT,
  price       INTEGER,           -- THB
  status      TEXT DEFAULT 'pending',  -- pending|available|reserved|sold|rejected|delisted
  image_url   TEXT,
  created_at  INTEGER DEFAULT (unixepoch())
)
```

### Current Admin UI
- Shows all designs in table with status badges
- Pending designs can be approved/rejected via `AdminPendingReview` component
- No delete button, no edit mechanism from admin page

## Decision

### 1. Delete Type: **Hard Delete** (with confirmation)

**Rationale:**
- Unlike artists, designs don't have downstream dependencies (no NFTs yet)
- Sold/reserved designs can't be deleted anyway (status check)
- Hard delete simplifies data model (no `deleted_at` column needed)
- Admin can delist instead of delete for "hide but keep" scenarios

**Implementation:**
- Only allow delete for `pending`, `rejected`, or `delisted` designs
- Block delete for `available`, `reserved`, `sold` designs (use delist instead)
- Permanent deletion with confirmation dialog

### 2. Edit Mechanism: **Extend Existing Endpoint**

**Rationale:**
- `/api/designs/[id]/edit` already exists and works
- Just need to add admin UI to trigger it
- No new API endpoint needed

**Admin Edit Capabilities:**
| Field | Editable | Notes |
|-------|----------|-------|
| `title` | ✅ Yes | Design name |
| `style` | ✅ Yes | Tattoo style |
| `price` | ✅ Yes | Price in THB |
| `status` | ✅ Yes | Manual status override |
| `artist_id` | ❌ No | Immutable after creation |

### 3. Status Management

**Admin Can Set Status To:**
| Current Status | Allowed Transitions |
|----------------|---------------------|
| `pending` | → `available`, `rejected` |
| `rejected` | → `available`, `delisted`, (delete) |
| `available` | → `delisted`, `reserved` (manual) |
| `reserved` | → `available` (release), `sold` (confirm) |
| `sold` | ❌ No changes (final state) |
| `delisted` | → `available` (re-list), (delete) |

### 4. UI Design

**Actions Column:**
```
[Edit] [Delete]
```

- **Edit**: Opens modal with design details (title, style, price, status)
- **Delete**: Browser `confirm()` — "Permanently delete {title}? This cannot be undone."
- Disabled delete button for `available`, `reserved`, `sold` designs
- Status badge clickable to quick-change status (dropdown)

### 5. Cascading Behavior

| Scenario | Behavior |
|----------|----------|
| Delete design with bookings | Block delete, show warning |
| Delete design with conversations | Block delete, show warning |
| Delete design with no dependencies | Allow delete |

## Implementation Plan

### Files to Change

| File | Change |
|------|--------|
| `src/pages/admin/index.astro` | Add Edit/Delete buttons, modal |
| `src/pages/api/admin/delete-design.ts` | New API endpoint |
| `src/components/AdminDesignModal.tsx` | Edit modal component |

### API Design

**DELETE `/api/admin/delete-design`**
```typescript
// Request
{ designId: string }

// Response
{ ok: boolean, error?: string, dependencies?: string[] }

// Implementation
1. Check status (block if available/reserved/sold)
2. Check for bookings referencing this design_id
3. Check for conversations referencing this design_id
4. Hard delete: DELETE FROM designs WHERE id = ?
```

**POST `/api/admin/edit-design`**
```typescript
// Request
{
  designId: string;
  title?: string;
  style?: string;
  price?: number;
  status?: string;
}

// Response
{ ok: boolean, error?: string }

// Implementation
UPDATE designs SET ... WHERE id = ?
```

## Risk Assessment

- **Data Loss:** Medium — hard delete is permanent (mitigated by status checks)
- **Broken References:** Low — blocked by dependency checks
- **UX Impact:** Low — familiar pattern from artist delete
- **Performance:** Negligible — simple queries

## Decision Summary

**Approach:** Hard delete with dependency checks + modal edit
**Scope:** 3 files, ~200 lines
**Risk:** Medium (permanent deletion)
**Time Estimate:** 2-3 hours

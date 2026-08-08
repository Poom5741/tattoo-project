# Ticket #95: Admin Booking Management — Research & Decision

## Status: Decision Made

## Current State Analysis

### Booking Schema
```sql
booking_inquiries (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  artist_id   TEXT NOT NULL,
  design_id   TEXT,              -- Optional: specific design
  name        TEXT NOT NULL,
  contact     TEXT NOT NULL,
  message     TEXT,
  created_at  INTEGER DEFAULT (unixepoch())
)
```

### Current Admin UI
- Bookings displayed in table: #, Date, Name, Contact, Artist, Plate, Message
- **No actions** — read-only display
- No way to respond, approve, reject, or delete bookings

### No Existing Endpoints
- No booking management API exists

## Decision

### 1. Booking States (Implicit)

**Current State:** Bookings are inquiries, not confirmed appointments

**Proposed Workflow:**
```
[New Inquiry] → [Viewed] → [Confirmed/Rejected/Archived]
```

**Admin Actions:**
| Action | Behavior |
|--------|----------|
| **View** | Mark as "viewed" (visual indicator) |
| **Confirm** | Set status = 'confirmed', notify artist |
| **Reject** | Set status = 'rejected', optional reason |
| **Archive** | Hide from main list, keep in database |
| **Delete** | Hard delete (only for test/demo data) |

### 2. Schema Extension

**Add `status` column to `booking_inquiries`:**
```sql
ALTER TABLE booking_inquiries ADD COLUMN status TEXT DEFAULT 'new';
-- Values: 'new', 'viewed', 'confirmed', 'rejected', 'archived'
```

**Add `notes` column for admin notes:**
```sql
ALTER TABLE booking_inquiries ADD COLUMN notes TEXT;
```

### 3. UI Design

**Status Badges:**
- `new` — Blue badge, bold
- `viewed` — Gray badge
- `confirmed` — Green badge
- `rejected` — Red badge
- `archived` — Muted badge, hidden by default

**Actions Column:**
```
[View] [Confirm] [Reject] [Archive] [Delete]
```

- **View**: Marks as viewed, opens detail modal
- **Confirm**: Quick action, no modal
- **Reject**: Opens modal for optional reason
- **Archive**: Quick action, hides from list
- **Delete**: Browser `confirm()` — permanent

**Filter Tabs:**
```
[All] [New] [Viewed] [Confirmed] [Rejected] [Archived]
```

### 4. Detail Modal

**Shows:**
- Full contact info
- Full message (not truncated)
- Artist name and link
- Design reference (if any)
- Admin notes field
- Action buttons

### 5. Notifications (Out of Scope for v1)

**Future Consideration:**
- Email notification to artist on confirm
- SMS notification via Twilio
- In-app notification via chat system

**v1 Decision:** No notifications — admin manually contacts artist

## Implementation Plan

### Files to Change

| File | Change |
|------|--------|
| `migrations/` | Add `status` and `notes` columns |
| `src/pages/admin/index.astro` | Add actions, filters, modal |
| `src/pages/api/admin/booking-status.ts` | New API endpoint |
| `src/components/AdminBookingModal.tsx` | Detail modal component |

### API Design

**POST `/api/admin/booking-status`**
```typescript
// Request
{
  bookingId: number;
  action: 'viewed' | 'confirmed' | 'rejected' | 'archived' | 'deleted';
  notes?: string;
  rejectReason?: string;
}

// Response
{ ok: boolean, error?: string }

// Implementation
UPDATE booking_inquiries SET status = ?, notes = ? WHERE id = ?
-- or DELETE for 'deleted' action
```

### Query Updates

**Admin Dashboard:**
```sql
-- Default view (excludes archived)
SELECT * FROM booking_inquiries 
WHERE status != 'archived' 
ORDER BY created_at DESC

-- Filtered view
SELECT * FROM booking_inquiries 
WHERE status = ? 
ORDER BY created_at DESC
```

**Public Queries (unchanged):**
- Booking inquiries are admin-only, no public access

## Risk Assessment

- **Data Loss:** Low — soft states preserve data
- **Broken References:** None — self-contained table
- **UX Impact:** High — enables real booking workflow
- **Performance:** Negligible — simple queries, small dataset

## Decision Summary

**Approach:** Status-based workflow with modal detail view
**Scope:** 4 files, ~250 lines
**Risk:** Low
**Time Estimate:** 3-4 hours

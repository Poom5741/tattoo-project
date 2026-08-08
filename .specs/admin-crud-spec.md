# Admin CRUD Management — Specification

## Problem Statement

The SAKNID admin dashboard currently has limited management capabilities:
- Artists can only have their wallet address updated
- Designs can only be approved/rejected (pending status only)
- Bookings are read-only with no management actions

Admins need full CRUD operations to manage artists, designs, and bookings effectively.

---

## User Stories

### Artist Management
1. As an admin, I want to soft-delete artists so I can hide inactive profiles while preserving data integrity
2. As an admin, I want to edit all artist details (name, handle, city, style, etc.) via a modal form
3. As an admin, I want deleted artists to be hidden from public views but visible in admin dashboard

### Design Management
4. As an admin, I want to delete test/pending designs permanently
5. As an admin, I want to edit design details (title, style, price, status)
6. As an admin, I want to change design status manually (e.g., mark as reserved/sold)

### Booking Management
7. As an admin, I want to view booking inquiry details in a modal
8. As an admin, I want to mark bookings as confirmed/rejected/archived
9. As an admin, I want to filter bookings by status
10. As an admin, I want to add notes to bookings for internal tracking

---

## Implementation Decisions

### #91: Auth Persistence Architecture
- **Decision**: Server→Client Session Passing
- **Rationale**: Better-Auth sessions stored server-side, passed to client via SSR context
- **Implementation**: Use `Astro.locals.runtime.env` for D1 access

### #92: Admin Delete Artist
- **Decision**: Soft delete with `deleted_at` timestamp
- **Rationale**: Preserves data integrity, allows recovery, maintains referential integrity
- **Implementation**: Add `deleted_at` column, filter queries by `deleted_at IS NULL`
- **Status**: ✅ Implemented (migration + API endpoint)

### #93: Admin Edit Artist Details
- **Decision**: Modal form with all editable fields
- **Rationale**: Consistent with existing admin UI patterns, reduces page navigation
- **Implementation**: Create ArtistEditModal component, use React Query for mutations
- **Editable Fields**: name, handle, city, style, years, booked, rate, bio, email, wallet_address
- **Read-Only**: id, pieces (auto-calculated), rating (auto-calculated), seed (internal)

### #94: Admin Delete/Edit Designs
- **Decision**: Hard delete with dependency checks + modal edit
- **Rationale**: Designs don't have downstream dependencies (no NFTs yet), hard delete simplifies data model
- **Constraints**: Only allow delete for `pending`, `rejected`, `delisted` designs; block delete for `available`, `reserved`, `sold`
- **Edit**: Extend existing `/api/designs/[id]/edit` endpoint
- **Additional Status Transitions**:
  - `reserved` → `available` (release)
  - `reserved` → `sold` (confirm)
  - `delisted` → `available` (re-list)

### #95: Admin Booking Management
- **Decision**: Status-based workflow with modal detail view
- **Rationale**: Enables real booking workflow without complex state machine
- **Schema Changes**: Add `status` (new|viewed|confirmed|rejected|archived) and `notes` columns
- **Actions**: View, Confirm, Reject (with reason), Archive, Delete
- **Filters**: All, New, Viewed, Confirmed, Rejected, Archived

---

## Testing Decisions

### Unit Tests (Vitest)
- Test API endpoint validation (Zod schemas)
- Test database query logic (soft delete filters, status transitions)
- Mock D1 database for isolation
- Aim for >80% coverage on new features

### E2E Tests (Playwright)
- Test admin login flow
- Test artist CRUD operations (edit, delete, verify soft delete)
- Test design CRUD operations (edit, delete, status changes)
- Test booking management (status changes, filtering)
- Use real database (D1 via Wrangler)

### Test Commands
```bash
pnpm test          # Unit tests
pnpm test:e2e      # E2E tests
```

---

## Out of Scope (v1)

1. **Audit Trail** — No tracking of who made changes or when
2. **Notifications** — No email/SMS for booking confirmations
3. **Bulk Operations** — No batch delete/status changes
4. **Undo** — No undo for delete operations
5. **Artist Self-Edit** — Artist portal editing (separate ticket #102)
6. **Booking Chat** — In-app messaging for bookings (separate feature)

---

## File Structure

### New Files
```
src/pages/api/admin/
├── delete-artist.ts      ✅ Exists
├── update-artist.ts      🆕 New
├── delete-design.ts      🆕 New
├── edit-design.ts        🆕 New (or extend existing)
├── booking-status.ts     🆕 New

src/components/
├── AdminArtistModal.tsx  🆕 New
├── AdminDesignModal.tsx  🆕 New
├── AdminBookingModal.tsx 🆕 New
```

### Modified Files
```
src/pages/admin/index.astro          # Add actions, modals, filters
migrations/0012_admin_booking.sql    # Add status, notes columns
```

### Database Changes
```sql
-- Ticket #95: Booking management
ALTER TABLE booking_inquiries ADD COLUMN status TEXT DEFAULT 'new';
ALTER TABLE booking_inquiries ADD COLUMN notes TEXT;
CREATE INDEX IF NOT EXISTS idx_booking_status ON booking_inquiries(status);
```

---

## API Endpoints

### Artist Management
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/admin/delete-artist` | Soft delete artist |
| POST | `/api/admin/update-artist` | Update artist details |

### Design Management
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/admin/delete-design` | Hard delete design |
| POST | `/api/admin/edit-design` | Update design details |

### Booking Management
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/admin/booking-status` | Update booking status |

---

## Implementation Order

1. **Ticket #99**: Admin Artist CRUD Implementation
   - Create `update-artist.ts` endpoint
   - Create `AdminArtistModal.tsx` component
   - Update admin dashboard with edit button

2. **Ticket #100**: Admin Design Management Implementation
   - Create `delete-design.ts` endpoint
   - Create `AdminDesignModal.tsx` component
   - Update admin dashboard with edit/delete buttons

3. **Ticket #101**: Admin Booking Management Implementation
   - Run migration for status/notes columns
   - Create `booking-status.ts` endpoint
   - Create `AdminBookingModal.tsx` component
   - Update admin dashboard with actions and filters

---

## Success Criteria

- [ ] Admin can soft-delete artists (verify deleted_at set)
- [ ] Admin can edit all artist fields via modal
- [ ] Deleted artists hidden from public views
- [ ] Admin can delete pending/rejected/delisted designs
- [ ] Admin cannot delete available/reserved/sold designs
- [ ] Admin can edit design details and change status
- [ ] Admin can view booking details in modal
- [ ] Admin can confirm/reject/archive bookings
- [ ] Admin can filter bookings by status
- [ ] All operations have proper validation
- [ ] Unit tests pass (>80% coverage)
- [ ] E2E tests pass for critical flows

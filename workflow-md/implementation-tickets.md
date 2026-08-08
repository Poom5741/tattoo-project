# Implementation Tickets — Admin CRUD Management

## Ticket #99: Admin Artist CRUD Implementation

**Blocked By**: #92 ✅, #93 ✅ (unblocked)

### Description
Complete admin artist management with edit functionality. Delete endpoint already exists.

### Tasks
1. **Create `/api/admin/update-artist.ts` endpoint**
   - Validate input with Zod schema
   - Update artist record in D1
   - Return success/error response

2. **Create `AdminArtistModal.tsx` component**
   - Modal form with all editable fields
   - Pre-fill with current artist data
   - Submit via React Query mutation
   - Handle validation errors

3. **Update `src/pages/admin/index.astro`**
   - Add "Edit" button to artist table row
   - Wire up modal open/close
   - Pass artist data to modal

4. **Write unit tests**
   - Test API validation
   - Test database update logic

### Acceptance Criteria
- [ ] Admin can click "Edit" on any artist
- [ ] Modal opens with all fields pre-filled
- [ ] Admin can save changes
- [ ] Changes persist to database
- [ ] Validation errors display correctly
- [ ] Unit tests pass

### Estimated Time
2-3 hours

---

## Ticket #100: Admin Design Management Implementation

**Blocked By**: #94 (decision made)

### Description
Complete admin design management with delete and edit functionality.

### Tasks
1. **Create `/api/admin/delete-design.ts` endpoint**
   - Check design status (block if available/reserved/sold)
   - Check for dependent bookings
   - Hard delete design record
   - Return success/error with dependency info

2. **Create `/api/admin/edit-design.ts` endpoint** (or extend existing)
   - Validate input with Zod schema
   - Update design record in D1
   - Allow status transitions per rules

3. **Create `AdminDesignModal.tsx` component**
   - Modal form with title, style, price, status
   - Status dropdown with allowed transitions
   - Submit via React Query mutation

4. **Update `src/pages/admin/index.astro`**
   - Add "Edit" and "Delete" buttons to design table
   - Disable delete for protected statuses
   - Wire up modals and delete confirmation

5. **Write unit tests**
   - Test delete permission logic
   - Test status transition rules
   - Test API validation

### Acceptance Criteria
- [ ] Admin can delete pending/rejected/delisted designs
- [ ] Admin cannot delete available/reserved/sold designs (button disabled)
- [ ] Delete shows confirmation dialog
- [ ] Admin can edit design details via modal
- [ ] Admin can change design status
- [ ] Status transitions follow defined rules
- [ ] Unit tests pass

### Estimated Time
3-4 hours

---

## Ticket #101: Admin Booking Management Implementation

**Blocked By**: #95 (decision made)

### Description
Complete admin booking management with status workflow and filtering.

### Tasks
1. **Create migration `0012_admin_booking.sql`**
   - Add `status` column (default: 'new')
   - Add `notes` column
   - Create index on status

2. **Create `/api/admin/booking-status.ts` endpoint**
   - Handle all status transitions
   - Support notes/rejectReason fields
   - Handle delete action

3. **Create `AdminBookingModal.tsx` component**
   - Display full booking details
   - Show notes field (editable)
   - Action buttons (Confirm, Reject, Archive)

4. **Update `src/pages/admin/index.astro`**
   - Add status filter tabs
   - Add actions column to booking table
   - Wire up modal and status changes
   - Update query to exclude archived by default

5. **Write unit tests**
   - Test status transitions
   - Test filter logic
   - Test API validation

### Acceptance Criteria
- [ ] Bookings show status badges (new/viewed/confirmed/rejected/archived)
- [ ] Admin can filter bookings by status
- [ ] Admin can view booking details in modal
- [ ] Admin can confirm/reject/archive bookings
- [ ] Admin can add notes to bookings
- [ ] Archived bookings hidden by default
- [ ] Unit tests pass

### Estimated Time
3-4 hours

---

## Implementation Order

```
Ticket #99 (Artist CRUD)
    ↓
Ticket #100 (Design Management)
    ↓
Ticket #101 (Booking Management)
```

**Rationale**: Each ticket builds on patterns established in previous tickets. Artist CRUD is simplest (endpoint exists), Design Management adds dependency checks, Booking Management adds status workflow and filtering.

---

## Dependencies

| Ticket | Depends On | Notes |
|--------|------------|-------|
| #99 | #92, #93 | Decisions complete, delete endpoint exists |
| #100 | #94 | Decision complete, no existing endpoints |
| #101 | #95 | Decision complete, no existing endpoints |

---

## Testing Strategy

### Per Ticket
1. Write unit tests for API endpoints (TDD)
2. Implement endpoint
3. Write component tests (if applicable)
4. Implement component
5. Manual testing in browser
6. Update E2E tests if critical path affected

### Final Verification
- Run `pnpm test` — all unit tests pass
- Run `pnpm test:e2e` — all E2E tests pass
- Manual smoke test of all admin CRUD operations

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Accidental data loss | Confirmation dialogs for all delete operations |
| Status transition bugs | Strict validation, unit tests for all rules |
| UI inconsistencies | Reuse existing component patterns (cards, tables, modals) |
| Performance issues | Simple queries, indexed columns, small dataset |

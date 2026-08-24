# SAKNID Implementation Workflow

## Project Context

SAKNID is a Web3/EVM application for tattoo artists and clients. Key features:
- **Auth**: Better-Auth with D1 database, passkey wallet authentication
- **Admin**: Artist management, design management, booking oversight
- **Artist**: Profile editing, design portfolio, booking management
- **Client**: Browse artists, book appointments, manage bookings

## Architecture

- **Framework**: Astro SSR with React islands
- **Database**: Cloudflare D1 (SQLite)
- **Auth**: Better-Auth with Drizzle adapter
- **Styling**: Tailwind CSS
- **State**: React Query for server state, Zustand for client state
- **Testing**: Vitest (unit), Playwright (E2E)
- **Deployment**: Cloudflare Pages

---

## How to Use

### Queue multiple tickets (recommended for admin features)
```
/list Implement #92: admin delete artist with soft delete, Implement #93: admin edit artist with modal form, Implement #94: admin delete/edit designs with dependency checks, Implement #95: admin booking management with status workflow
```

### Single big goal (multi-hour scope)
```
/goal Implement the complete admin artist management system — API routes, React components, database migrations, and tests for #92, #93, #94, #95
```

### Continuous improvement loop
```
/loop start "reduce test failures" measure="pnpm test 2>&1 | grep -c 'FAIL'" direction=min
```

---

## Ticket Verification Contracts

### #92 Admin Delete Artist
```
Done when:
- POST /api/admin/artists/:id returns { success: true }
- artists table has deleted_at column (nullable timestamp)
- Admin UI shows delete button on artist row
- Clicking delete opens confirmation modal
- Confirming sets deleted_at, artist disappears from list
- pnpm test passes
- pnpm test:e2e passes
```

### #93 Admin Edit Artist Details
```
Done when:
- PUT /api/admin/artists/:id validates with Zod
- Admin UI shows edit button on artist row
- Clicking edit opens ArtistEditModal with pre-filled fields
- Submitting updates artist, modal closes, list refreshes
- Form validation shows errors for invalid input
- pnpm test passes
- pnpm test:e2e passes
```

### #94 Admin Delete/Edit Designs
```
Done when:
- DELETE /api/admin/designs/:id checks for active bookings
- Returns 409 if design has active bookings
- Hard deletes design if no active bookings
- Admin UI shows delete/edit buttons on design row
- Edit opens modal, delete opens confirmation
- pnpm test passes
- pnpm test:e2e passes
```

### #95 Admin Booking Management
```
Done when:
- PUT /api/admin/bookings/:id/status validates status transitions
- Status transitions: pending → confirmed → completed/cancelled
- Admin UI shows status badge on booking row
- Clicking status opens dropdown with valid transitions
- Updating status persists to database
- pnpm test passes
- pnpm test:e2e passes
```

---

## Subagent Workflow (for each item)

When working on a list item, use this pattern:

### 1. Scout (understand)
```
Use scout to understand [feature] in the codebase. Find:
- Existing API routes in src/pages/api/
- Related database schema in src/db/
- Similar components in src/components/
- Test files in src/tests/
```

### 2. Oracle (plan)
```
Ask oracle to review the implementation plan for [feature]. Challenge assumptions and suggest:
- API route structure
- Database schema changes
- Component architecture
- Test strategy
```

### 3. Implement (build)
```
Use worker to implement [feature]:
1. Add database migration if needed
2. Create API route with Zod validation
3. Build React component with React Query
4. Write Vitest unit tests
5. Write Playwright E2E tests
```

### 4. Review (verify)
```
Run parallel reviewers:
- Use reviewer for correctness and edge cases
- Use reviewer for test coverage
- Use reviewer for code simplicity
```

---

## Code Patterns

### API Route (Soft Delete)
```typescript
// src/pages/api/admin/artists/[id].delete.ts
import type { APIRoute } from 'astro';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { artists } from '@/db/schema';

export const POST: APIRoute = async ({ params, locals }) => {
  const db = locals.runtime.env.DB;
  const { id } = params;
  
  await db.update(artists)
    .set({ deletedAt: new Date() })
    .where(eq(artists.id, id));
  
  return new Response(JSON.stringify({ success: true }));
};
```

### API Route (Update with Validation)
```typescript
// src/pages/api/admin/artists/[id].put.ts
import type { APIRoute } from 'astro';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { artists } from '@/db/schema';

const UpdateSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  specialty: z.string().optional(),
});

export const PUT: APIRoute = async ({ params, request, locals }) => {
  const db = locals.runtime.env.DB;
  const { id } = params;
  const body = await request.json();
  const data = UpdateSchema.parse(body);
  
  await db.update(artists)
    .set(data)
    .where(eq(artists.id, id));
  
  return new Response(JSON.stringify({ success: true }));
};
```

### React Component (Delete Modal)
```typescript
// src/components/admin/ArtistDeleteModal.tsx
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal } from '@/components/ui/Modal';

interface Props {
  artistId: string;
  artistName: string;
  onClose: () => void;
}

export function ArtistDeleteModal({ artistId, artistName, onClose }: Props) {
  const queryClient = useQueryClient();
  
  const deleteMutation = useMutation({
    mutationFn: () => fetch(`/api/admin/artists/${artistId}`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artists'] });
      onClose();
    },
  });
  
  return (
    <Modal title="Delete Artist" onClose={onClose}>
      <p>Are you sure you want to delete <strong>{artistName}</strong>?</p>
      <p className="text-sm text-gray-500">This is a soft delete. The artist can be restored.</p>
      <div className="flex gap-2 mt-4">
        <button onClick={onClose} className="btn-secondary">Cancel</button>
        <button 
          onClick={() => deleteMutation.mutate()} 
          className="btn-danger"
          disabled={deleteMutation.isPending}
        >
          {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </Modal>
  );
}
```

### Unit Test
```typescript
// src/tests/api/admin/artists.test.ts
import { describe, it, expect, vi } from 'vitest';

describe('DELETE /api/admin/artists/:id', () => {
  it('soft deletes artist with deleted_at timestamp', async () => {
    const response = await fetch('/api/admin/artists/123', { method: 'POST' });
    const data = await response.json();
    expect(data.success).toBe(true);
  });

  it('returns 404 for non-existent artist', async () => {
    const response = await fetch('/api/admin/artists/999', { method: 'POST' });
    expect(response.status).toBe(404);
  });
});
```

### E2E Test
```typescript
// src/tests/e2e/admin-delete-artist.spec.ts
import { test, expect } from '@playwright/test';

test('admin can delete artist', async ({ page }) => {
  await page.goto('/admin/artists');
  await page.click('[data-testid="delete-artist-123"]');
  await expect(page.locator('[data-testid="confirm-modal"]')).toBeVisible();
  await page.click('[data-testid="confirm-delete"]');
  await expect(page.locator('.artist-123')).not.toBeVisible();
});
```

---

## Decision Reference

### #91 Auth Persistence Architecture
- **Decision**: Server→Client Session Passing
- **Implementation**: `Astro.locals.runtime.env` for D1, pass session to React islands

### #92 Admin Delete Artist
- **Decision**: Soft delete with `deleted_at` timestamp
- **Implementation**: Add column, filter `deleted_at IS NULL`

### #93 Admin Edit Artist Details
- **Decision**: Modal form with all editable fields
- **Implementation**: ArtistEditModal component, React Query mutations

### #94 Admin Delete/Edit Designs
- **Decision**: Hard delete with dependency checks
- **Implementation**: Check related records before delete

### #95 Admin Booking Management
- **Decision**: Status-based workflow with modal
- **Implementation**: Status transitions, modal for details

---

## Test Commands

```bash
pnpm test          # Unit tests
pnpm test:e2e      # E2E tests
pnpm test:e2e:ui   # E2E with UI
pnpm build         # Production build
```

---

## Grilling Rule

During implementation, the agent proposes decisions. The human approves without modification. The agent is responsible for:
- Architecture decisions
- UI/UX patterns
- Implementation approach
- Testing strategy
- File organization

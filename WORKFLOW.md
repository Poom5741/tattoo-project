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

## Grilling Rule

**During all grilling sessions, follow all AI recommendations.**

The human defers to the agent's suggestions on:
- Architecture decisions
- UI/UX patterns
- Implementation approach
- Testing strategy
- File organization

The agent proposes, the human approves without modification.

---

## The Loop

### Step 1: Resolve Decision Tickets (Wayfinder Frontier)

Work through unblocked tickets using `/grilling`:

```bash
/grilling "Ticket [number]: [title] — [question]"
```

**Order:**
1. #91 Auth Persistence Architecture (research)
2. #92 Admin Delete Artist
3. #93 Admin Edit Artist Details
4. #94 Admin Delete/Edit Designs
5. #95 Admin Booking Management

After each: close ticket, post decision as comment.

### Step 2: Collapse to Spec

Once decisions are clear:

```bash
/to-spec "Collapse these decisions into a spec: [list decisions]"
```

Produces a spec issue with:
- Problem statement
- User stories
- Implementation decisions
- Testing decisions
- Out of scope

### Step 3: Split to Tickets

```bash
/to-tickets "Split spec into implementation tickets"
```

Each ticket declares blocking edges.

### Step 4: Implement with TDD

For each ticket:

```bash
/implement "Ticket [number]: [description]"
```

Internally drives TDD loop:
- Red → Green → Red → Green
- One slice at a time
- No refactoring during loop

### Step 5: Review

```bash
/code-review main
```

Two axes: Standards + Spec.

### Step 6: Clear & Repeat

```bash
/clear
```

Next ticket.

---

## Quick Reference

| Phase | Skill | Purpose |
|-------|-------|---------|
| Decision | `/grilling` | Resolve questions |
| Research | `/research` | Investigate unknowns |
| Spec | `/to-spec` | Collapse decisions to plan |
| Tickets | `/to-tickets` | Split into implementable slices |
| Build | `/implement` | Code with TDD internally |
| Test | `/tdd` | Red-green loop |
| Review | `/code-review` | Standards + Spec check |
| Hygiene | `/clear` | Reset context between tickets |

---

## Current State

**Map**: [#90 Wayfinder Map](https://github.com/Poom5741/tattoo-project/issues/90)

### Frontier (Ready)

| Ticket | Title | Type |
|--------|-------|------|
| #92 | Admin Delete Artist | grilling |
| #93 | Admin Edit Artist Details | grilling |
| #94 | Admin Delete/Edit Designs | grilling |
| #95 | Admin Booking Management | grilling |

### In Progress

| Ticket | Title | Status |
|--------|-------|--------|
| #91 | Auth Persistence Architecture | ✅ Research Complete — Decision: Option A (Server→Client Session Passing) |
| #92 | Admin Delete Artist | ✅ Implemented — Soft delete with deleted_at timestamp |
| #93 | Admin Edit Artist Details | ✅ Implemented — Modal form with all editable fields |
| #94 | Admin Delete/Edit Designs | ✅ Decision Complete — Hard delete with dependency checks |
| #95 | Admin Booking Management | ✅ Decision Complete — Status-based workflow with modal |
| #99 | Admin Artist CRUD Implementation | 🔄 In Progress — API + Modal + Tests done |

### Decision Outcomes

#### #91 Auth Persistence Architecture
- **Decision**: Option A — Server→Client Session Passing
- **Rationale**: Better-Auth sessions stored server-side, passed to client via SSR context
- **Implementation**: Use `Astro.locals.runtime.env` for D1 access, pass session to React islands
- **Testing**: Verify session persistence across page loads, test auth middleware

#### #92 Admin Delete Artist
- **Decision**: Soft delete with `deleted_at` timestamp
- **Rationale**: Preserves data integrity, allows recovery, maintains referential integrity
- **Implementation**: Add `deleted_at` column to artists table, filter queries by `deleted_at IS NULL`
- **Testing**: Verify soft delete behavior, test cascading effects on related data

#### #93 Admin Edit Artist Details
- **Decision**: Modal form with all editable fields
- **Rationale**: Consistent with existing admin UI patterns, reduces page navigation
- **Implementation**: Create ArtistEditModal component, use React Query for mutations
- **Testing**: Test form validation, verify optimistic updates, test error handling

## Testing Requirements

### Unit Tests (Vitest)
- Test business logic in isolation
- Mock external dependencies (D1, auth)
- Aim for >80% coverage on new features

### E2E Tests (Playwright)
- Test critical user flows
- Use real database (D1 via Wrangler)
- Test across viewports (mobile/desktop)

### Test Commands
```bash
pnpm test          # Run unit tests
pnpm test:e2e      # Run E2E tests
pnpm test:e2e:ui   # Run E2E tests with UI
```

## Deployment

- **Platform**: Cloudflare Pages
- **Database**: Cloudflare D1
- **Environment Variables**: Set in Cloudflare dashboard
- **Preview Deployments**: Automatic on PR
- **Production**: Manual merge to main

### Deployment Commands
```bash
pnpm build                    # Build for production
wrangler pages deploy dist    # Deploy to Cloudflare Pages
```

## Workflow Phases

| Phase | Skill | Purpose | Output |
|-------|-------|---------|--------|
| Decision | `/grilling` | Resolve questions | Decision record |
| Research | `/research` | Investigate unknowns | Research doc |
| Spec | `/to-spec` | Collapse decisions to plan | Spec issue |
| Tickets | `/to-tickets` | Split into implementable slices | Ticket list |
| Build | `/implement` | Code with TDD internally | Working code |
| Test | `/tdd` | Red-green loop | Passing tests |
| Review | `/code-review` | Standards + Spec check | Review report |
| Hygiene | `/clear` | Reset context between tickets | Clean slate |

## Common Patterns

### API Routes
- Use Astro API routes (`src/pages/api/...`)
- Return JSON with proper status codes
- Validate input with Zod

### Database Queries
- Use Drizzle ORM for type safety
- Filter soft-deleted records with `deleted_at IS NULL`
- Use transactions for multi-step operations

### React Islands
- Keep components small and focused
- Use React Query for server state
- Pass SSR data as props from Astro

### Blocked (Waiting)

| Ticket | Title | Blocked By |
|--------|-------|------------|
| #96 | Artist Profile Editing | #91 ✅ (unblocked) |
| #97 | Artist Design Editing | #91 ✅ (unblocked) |
| #98 | Wallet Context Global Provider | #91 ✅ (unblocked) |
| #100 | Admin Design Management Implementation | #94 ✅ (unblocked) |
| #101 | Admin Booking Management Implementation | #95 ✅ (unblocked) |
| #102 | Artist Profile Edit Implementation | #96, #98 |
| #103 | Artist Design Edit Implementation | #97, #98 |

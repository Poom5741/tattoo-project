# SAKNID Implementation Workflow

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
| #92 | Admin Delete Artist | ✅ Decision Complete — Soft delete with deleted_at timestamp |
| #93 | Admin Edit Artist Details | ✅ Decision Complete — Modal form with all editable fields |

### Blocked (Waiting)

| Ticket | Title | Blocked By |
|--------|-------|------------|
| #96 | Artist Profile Editing | #91 ✅ (unblocked) |
| #97 | Artist Design Editing | #91 ✅ (unblocked) |
| #98 | Wallet Context Global Provider | #91 ✅ (unblocked) |
| #99 | Admin Artist CRUD Implementation | #92 ✅, #93 ✅ (unblocked) |
| #99 | Admin Artist CRUD Implementation | #92, #93 |
| #100 | Admin Design Management Implementation | #94 |
| #101 | Admin Booking Management Implementation | #95 |
| #102 | Artist Profile Edit Implementation | #96, #98 |
| #103 | Artist Design Edit Implementation | #97, #98 |

# Task for gentle-ai-explore

Research the best D1 (SQLite) schema for a chat feature in this Astro + Cloudflare project. The project is at /Users/poom-work/codingZone/business/tattoo-project.

Read these files first:
- migrations/0001_init.sql — existing schema
- src/lib/chat/schema.ts — existing chat types (ChatMessage, Conversation types)
- src/lib/chat/store.tsx — existing chat context (ChatContextValue interface)
- wrangler.toml — D1 binding config

Research question — ticket #51 "Database schema for chat":

What D1 tables, columns, indexes, and migration syntax do we need for chat persistence?

We need three tables:
1. **clients** — keyed by wallet_address (lowercased). Query patterns: upsert by wallet_address on booking submit.
2. **conversations** — linking client to artist. Query patterns: "all conversations for user X" (by client_id OR artist_id), "single conversation by id".
3. **messages** — the actual chat messages. Query patterns: "messages for conversation Y since timestamp Z" (by conversation_id + created_at range).

Deliverables:
1. Exact CREATE TABLE SQL with D1-compatible types and constraints
2. Index recommendations covering the query patterns
3. A clear migration file (0002_chat.sql) ready to use
4. Note any D1-specific gotchas (no foreign key enforcement, TEXT vs INTEGER for timestamps, etc.)

Write the findings to docs/research/chat-db-schema.md relative to the project root.

This is a git branch `research/db-schema-for-chat` — commit the findings file.

---
**Output:**
Write your findings to exactly this path: /Users/poom-work/codingZone/business/tattoo-project/.pi-subagents/artifacts/outputs/907bfccd-d950-415c-aed1-4415c995d0fc/research/db-schema-output.md
This path is authoritative for this run.
Ignore any other output filename or output path mentioned elsewhere, including output destinations in the base agent prompt, system prompt, or task instructions.

## Acceptance Contract
Acceptance level: reviewed
Completion is not accepted from prose alone. End with a structured acceptance report.

Criteria:
- criterion-1: Implement the requested change without widening scope
- criterion-2: Return evidence sufficient for an independent acceptance review

Required evidence: changed-files, tests-added, commands-run, validation-output, residual-risks, no-staged-files

Review gate: required by reviewer.

Finish with a fenced JSON block tagged `acceptance-report` in this shape:
Use empty arrays when no items apply; array fields contain strings unless object entries are shown.
```acceptance-report
{
  "criteriaSatisfied": [
    {
      "id": "criterion-1",
      "status": "satisfied",
      "evidence": "specific proof"
    }
  ],
  "changedFiles": [
    "src/file.ts"
  ],
  "testsAddedOrUpdated": [
    "test/file.test.ts"
  ],
  "commandsRun": [
    {
      "command": "command",
      "result": "passed",
      "summary": "short result"
    }
  ],
  "validationOutput": [
    "validation output or concise summary"
  ],
  "residualRisks": [
    "none"
  ],
  "noStagedFiles": true,
  "diffSummary": "short description of the diff",
  "reviewFindings": [
    "blocker: file.ts:12 - issue found, or no blockers"
  ],
  "manualNotes": "anything else the parent should know"
}
```
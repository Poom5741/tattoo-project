## Handoff: team-plan → team-exec

- **Decided**: 7 parallel worker tasks decomposed from 10 plan phases. Wave 1 (foundation) sequential. Waves 2-3 parallelize. Lead retains MCP + git steps.
- **Rejected**: Single executor for all phases (no parallelism); spawning per-phase (too granular, 10 workers fights I/O).
- **Risks**: Astro/React style port from prototype must remain pixel-faithful; visual baseline capture (T7) is the gate. Wagmi singleton across islands has a subtle gotcha (queryClient sharing) — documented in plan §4.1.
- **Files**: .omc/specs/deep-interview-suknid-astro-cloudflare.md, .omc/plans/suknid-astro-cloudflare.md, _handoff/tattoo-project/project/* (source prototype).
- **Remaining for team-exec**: scaffolding all code (T1-T7). Lead handles Phase 7 (CF MCP), Phase 8 (git push), Phase 9 (verification).

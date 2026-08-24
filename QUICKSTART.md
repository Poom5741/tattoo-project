# SAKNID Quick Start

## Installed Packages

| Package | Command | Purpose |
|---------|---------|---------|
| pi-goal-list-loop-audit | `/goal`, `/list`, `/loop` | Goal-driven work with auditor |
| @tintinweb/pi-subagents | `Agent` tool | Parallel sub-agents |
| @juicesharp/rpiv-ask-user-question | dialogs | Structured confirmations |
| pi-web-access | `web_search`, `fetch_content` | Research |

---

## Quick Commands

### Queue admin features (recommended)
```
/list Implement #92: admin delete artist, Implement #93: admin edit artist, Implement #94: admin delete/edit designs, Implement #95: admin booking management
```

### Single big goal (multi-hour)
```
/goal Implement the complete admin artist management system
```

### Check status
```
/goal status
/list
/glla
```

---

## Mode Selection

| Mode | When to use | Example |
|------|-------------|---------|
| `/list` | Multiple short tasks (minutes each) | "Implement #92, #93, #94, #95" |
| `/goal` | One big multi-hour task | "Implement entire admin system" |
| `/loop` | Infinite polish with metric | "Reduce test failures" |

---

## Subagent Pattern

For each item, use:

```
1. Use scout to understand the codebase
2. Ask oracle to review the plan
3. Use worker to implement
4. Run parallel reviewers
```

---

## Files

- `loop-work.md` — Full workflow + verification contracts + code patterns
- `QUICKSTART.md` — This file
- `AGENTS.md` — Project guidelines

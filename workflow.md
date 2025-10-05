# Vibe Coding Workflow

## Overview
A systematic approach to AI-assisted development with context engineering and knowledge compounding.

## Document Structure

```
thirdcommit/
├── docs/                           # Monorepo-wide documents
│   ├── ideas/
│   │   └── 20251005-001-idea-feature-name.md
│   ├── specs/
│   │   └── 20251005-001-spec.md
│   └── plans/
│       └── 20251005-001-plan.md
│
├── templates/                      # Boilerplates
│   ├── FE_ARCHI.md                # Frontend project template
│   └── BE_PARTITION.md            # Backend partition template
│
├── api/                           # Single backend server (logically partitioned)
│   └── docs/
│       ├── kb/                    # Knowledge base (compounding)
│       │   └── 20251005-001-learnings.md
│       └── tasks/
│           └── 20251005-001-be-tasks.md
│
└── app-{name}/                    # Multiple frontend projects
    └── docs/
        ├── archi.md               # Instantiated from template
        ├── kb/                    # Knowledge base (compounding)
        │   └── 20251005-001-learnings.md
        └── tasks/
            └── 20251005-001-fe-tasks.md
```

## ID Format

**Pattern:** `YYYYMMDD-NNN-description`

Examples:
- `20251005-001-user-analytics`
- `20251005-002-payment-refactor`
- `20251006-003-auth-improvement`

## Workflow Phases

### Phase 1: IDEA
**Input:** User request or feature concept

**Process:**
1. Walk through codebase and knowledge base
2. Explain current business logic landscape
3. Identify related systems/modules
4. Ask clarifying questions to understand requirements

**Output:** `docs/ideas/YYYYMMDD-NNN-idea-{name}.md`

**Document contains:**
- Current system overview
- Related modules/systems
- Open questions and answers
- Initial scope definition

---

### Phase 2: SPEC
**Input:** `YYYYMMDD-NNN-idea-{name}.md`

**Process:**
1. Review idea document
2. Walk through codebase for implementation details
3. Web research for best practices (if needed)
4. Define acceptance criteria (AC)
5. Clarify technical requirements

**Output:** `docs/specs/YYYYMMDD-NNN-spec.md`

**Document contains:**
- Feature description
- Acceptance criteria (AC)
- Technical requirements
- Success metrics
- Edge cases and constraints

---

### Phase 3: PLAN
**Input:** `YYYYMMDD-NNN-spec.md`

**Process:**
1. Review spec document
2. Design technical approach
3. Define API contracts (if FE+BE work)
4. Break down into tasks for BE and/or FE
5. Identify dependencies

**Output:** `docs/plans/YYYYMMDD-NNN-plan.md`

**Document contains:**
- Architecture/approach
- API contracts (if applicable)
- Task breakdown:
  - Backend tasks (→ `api/docs/tasks/YYYYMMDD-NNN-be-tasks.md`)
  - Frontend tasks (→ `app-{name}/docs/tasks/YYYYMMDD-NNN-fe-tasks.md`)
- Dependencies and sequence

**Task ID Format:**
- `YYYYMMDD-NNN-BE-T1`, `YYYYMMDD-NNN-BE-T2`, ...
- `YYYYMMDD-NNN-FE-T1`, `YYYYMMDD-NNN-FE-T2`, ...

---

### Phase 4: IMPLEMENT
**Input:**
- `YYYYMMDD-NNN-plan.md`
- `YYYYMMDD-NNN-{be|fe}-tasks.md`

**Process:**
1. Execute tasks from task documents
2. Can run parallel AI sessions for independent tasks
3. Update knowledge base with learnings

**Output:**
- Implementation (code)
- `api/docs/kb/YYYYMMDD-NNN-learnings.md` (if BE work)
- `app-{name}/docs/kb/YYYYMMDD-NNN-learnings.md` (if FE work)

**Knowledge base contains:**
- Patterns discovered
- Architectural decisions made
- Gotchas and solutions
- Performance insights

---

## Example Flow

### User Analytics Feature

**1. IDEA Phase**
```
File: docs/ideas/20251005-001-idea-user-analytics.md

- Current system: Auth module tracks logins, no analytics
- Related: User service, Activity logs
- Questions: What metrics? Real-time or batch?
- Scope: Track active users, session duration, feature usage
```

**2. SPEC Phase**
```
File: docs/specs/20251005-001-spec.md

AC:
- [ ] Track daily/weekly/monthly active users
- [ ] Display session duration metrics
- [ ] Real-time dashboard updates
- [ ] Export data as CSV

Technical: TimescaleDB for time-series, WebSocket for real-time
```

**3. PLAN Phase**
```
File: docs/plans/20251005-001-plan.md

Architecture: Analytics partition in NestJS + Dashboard in app-web

API Contract:
  GET /api/analytics/users/active
  GET /api/analytics/sessions/duration
  WebSocket: /ws/analytics/live

Tasks:
  BE: 20251005-001-BE-T1, T2, T3 → api/docs/tasks/20251005-001-be-tasks.md
  FE: 20251005-001-FE-T1, T2, T3 → app-web/docs/tasks/20251005-001-fe-tasks.md
```

**4. IMPLEMENT Phase**
```
Execute tasks → Update knowledge base

api/docs/kb/20251005-001-learnings.md:
- TimescaleDB continuous aggregates for performance
- WebSocket room pattern for live updates
- Query optimization: 100ms → 10ms

app-web/docs/kb/20251005-001-learnings.md:
- Chart.js react-chartjs-2 integration
- Debounce real-time updates to prevent jank
- Virtualization for large datasets
```

---

## Git Integration

**Commit messages:**
```
feat(20251005-001): implement analytics dashboard
fix(20251005-001): optimize time-series queries
docs(20251005-001): add analytics API documentation
```

**Branch naming:**
```
feature/20251005-001-user-analytics
```

---

## Cross-Referencing

**In code comments:**
```typescript
// See docs/specs/20251005-001-spec.md for acceptance criteria
// Implementation follows pattern from api/docs/kb/20251005-001-learnings.md
```

**In documents:**
```markdown
This builds on patterns from 20251004-005-learnings.md
Replaces approach from 20250920-012-spec.md
```

**In LLM prompts:**
```
"Fed in 20251005-001-spec.md and 20251005-001-plan.md to implement task 20251005-001-BE-T1"
```

---

## Templates

### Starting New Frontend Project
1. Copy `templates/FE_ARCHI.md` → `app-{name}/docs/archi.md`
2. Customize for project specifics
3. Initialize knowledge base structure

### Adding Backend Partition
1. Copy `templates/BE_PARTITION.md` → `api/docs/partitions/{name}.md`
2. Define partition boundaries and responsibilities
3. Update API documentation

---

## Best Practices

1. **Always start with IDEA phase** - Don't skip to implementation
2. **Update KB immediately after implementation** - Capture learnings while fresh
3. **Use IDs consistently** - Makes tracing and referencing easy
4. **Keep specs atomic** - One feature = one ID
5. **Parallel execution when possible** - Independent tasks can run simultaneously
6. **Review before merging** - Human checkpoint for AI-generated changes
7. **Archive completed tasks** - Keep active task list clean

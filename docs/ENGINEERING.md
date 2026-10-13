# AccessAtlas — Engineering Handbook

**Status:** Active repository development policy.

Read `AGENTS.md` and `SECURITY.md` before working on the repository.

## 1. Engineering principles

AccessAtlas is developed incrementally.

Every change should be:

- Scoped to an approved task.
- Explainable.
- Testable.
- Secure.
- Reproducible.
- Documented where necessary.
- Reviewed before integration.

Writing code is not equivalent to completing a task.

## 2. Repository branches

### `main`

Stable, release-ready code.

The public repository's default branch.

### `dev`

Integration branch for completed development work.

Feature and maintenance pull requests target `dev`.

### Task branches

Create each task branch from the latest `dev`.

Approved prefixes:

| Prefix | Purpose |
|---|---|
| `feat/` | New functionality |
| `fix/` | Bug fix |
| `chore/` | Tooling and maintenance |
| `docs/` | Documentation |
| `test/` | Test improvements |
| `refactor/` | Internal restructuring without intended behaviour change |

Examples:

- `chore/backend-foundation`
- `feat/qloo-integration`
- `feat/possibility-engine`
- `fix/qloo-timeout-handling`
- `test/agent-state-transitions`

Do not commit directly to `main` or `dev`.

## 3. Normal task workflow

### Step 1 — Create an issue

Define:

- Objective.
- Scope.
- Acceptance criteria.
- Out-of-scope work.
- Relevant dependencies.

### Step 2 — Update `dev`

```bash
git switch dev
git pull --ff-only origin dev
```

Do not switch branches while unexpected uncommitted changes exist.

### Step 3 — Create a task branch

```bash
git switch -c feat/example-task
```

Use the branch name specified by the approved issue.

### Step 4 — Implement

Read existing code and documentation first.

Make the smallest coherent change that satisfies the task.

### Step 5 — Verify

Run the relevant tests, linting and formatting checks.

Inspect changed files and ensure no protected files are staged.

### Step 6 — Commit

Use a focused Conventional Commit message.

### Step 7 — Push

Push the task branch after authorization.

### Step 8 — Open a pull request

Target `dev`.

Reference the issue and provide actual verification results.

### Step 9 — Review and merge

Merge only after review and required checks pass.

### Step 10 — Synchronize locally

```bash
git switch dev
git pull --ff-only origin dev
git status
```

Release changes move from `dev` to `main` through a separate reviewed pull request.

## 4. GitHub issue standard

Every implementation issue should include:

### Objective
What outcome must be achieved?

### Scope
What work is included?

### Acceptance criteria
What observable conditions establish completion?

### Out of scope
What must not be implemented in this task?

### Verification
Which tests or checks are required?

Avoid vague issues such as "work on backend" or "improve AI."

## 5. Commit convention

Use:

`type: concise description`

Accepted types include:

- `feat`
- `fix`
- `test`
- `docs`
- `chore`
- `refactor`

Examples:

```text
chore: initialize backend tooling
feat: resolve Qloo interest entities
fix: handle provider request timeouts
test: cover suitability conflict rules
docs: describe agent state transitions
```

A commit should represent one coherent change.

Do not use vague messages such as "update," "changes," or "final code."

## 6. Pull-request requirements

A pull request should include:

- Linked issue.
- Concise summary.
- Files or components affected.
- Actual verification commands and results.
- Relevant security considerations.
- Documentation updates.
- Known limitations.
- Screenshots when visual changes warrant them.

Normal pull requests target `dev`.

Only release pull requests target `main`.

Do not automatically merge a PR merely because an agent reports completion.

## 7. Local environment policy

Local runtime credentials belong in `.env.local`.

The developer creates and populates this file manually.

Coding agents must not read, create, edit, print, stage or commit secret-bearing environment files.

Do not commit environment files to the repository. Document required configuration variables in repository documentation.

The backend must explicitly support its approved local configuration mechanism.

Never assume a Python framework automatically reads `.env.local`.

## 8. Dependency policy

Introduce a dependency only when an approved task requires it.

Before adding one, establish:

1. What problem it solves.
2. Whether an existing dependency already solves the problem.
3. Its compatibility with the selected runtime.
4. Its licensing and maintenance considerations.
5. How its installation is reproduced.

Do not install every anticipated project dependency during repository initialization.

Commit the appropriate dependency manifests and lockfiles when introduced.

## 9. Backend standards

The backend uses Python and FastAPI.

Implementation tasks should follow:

- Clear module boundaries.
- Type annotations.
- Pydantic validation at relevant boundaries.
- Safe configuration loading.
- Structured error handling.
- Testable external integration clients.
- Deterministic domain logic where appropriate.
- Pytest-based automated verification.
- Ruff for Python linting and formatting once configured.

The exact package layout is established by the backend-foundation issue.

## 10. Frontend standards

The frontend uses Next.js and TypeScript.

Implementation tasks should prioritize:

- Accessible semantic components.
- Explicit loading and error states.
- Typed API integration.
- Responsive layout.
- Clear distinction between evidence and generated explanations.
- No privileged credentials in browser code.

Frontend testing tools are introduced with the relevant implementation milestones.

## 11. External integration standards

For every external API:

- Verify official documentation.
- Validate actual request and response shapes.
- Configure timeouts.
- Handle expected failures.
- Respect provider limits.
- Keep credentials private.
- Mock network requests in automated tests.
- Clearly distinguish mocked checks from live integration checks.

Never invent provider data or claim connectivity based only on successful mocked tests.

## 12. Testing standards

Tests must verify behaviour, not merely exercise code.

Use:

- Unit tests for deterministic logic.
- Mocked integration tests for external boundaries.
- Controlled live checks for authorized providers.
- End-to-end tests for completed user journeys.
- Evaluation tests for product claims.

Do not remove or weaken failing tests simply to obtain a green result.

If a check cannot run, report it as unverified.

## 13. Documentation standards

Update relevant documentation when changing:

- Product behaviour.
- Architecture.
- Runtime requirements.
- Environment variables.
- Development commands.
- API contracts.
- Agent state transitions.
- Deployment procedures.

Distinguish planned features from implemented features.

README instructions must be reproducible from a fresh clone.

## 14. Security review

Before committing:

- Inspect the working tree.
- Inspect staged filenames.
- Inspect staged changes.
- Check for accidentally included credentials or personal data.
- Confirm environment files are excluded.
- Run available security and hygiene checks.

Do not use destructive Git operations without explicit approval.

## 15. Definition of Done

A task is complete when:

- Its acceptance criteria are satisfied.
- The implementation is within scope.
- Relevant tests have actually run.
- Known limitations are reported.
- Security rules are satisfied.
- Documentation is current.
- The diff has been reviewed.
- A focused commit has been created if authorized.
- The PR has been reviewed and merged when integration is part of the task.

A task is not considered deployed until the deployment is actually verified.

## 16. Agent completion report

Every delegated task must report:

1. Task and issue.
2. Actual branch.
3. Files changed.
4. Implementation summary.
5. Commands executed.
6. Actual test and check results.
7. Security checks performed.
8. Limitations.
9. Commit hash, if applicable.
10. Next developer action.

Do not report intended actions as completed actions.

## 17. Release workflow

Before proposing `dev` → `main`:

- Confirm all intended features are integrated.
- Run relevant automated checks.
- Verify the application locally.
- Verify deployment-specific configuration.
- Review documentation and licensing.
- Check for exposed secrets.
- Verify the public demo against the submission description.
- Document any known limitations.

The release PR must be reviewed before merging.
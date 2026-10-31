# AGENTS.md — AccessAtlas Engineering Contract

This file defines the permanent operating rules for AI coding agents and automated development assistants working in the AccessAtlas repository.

**All agents must read this file before making changes.**

These rules apply to the entire repository unless a more specific, compatible `AGENTS.md` exists in a subdirectory.

---

## 1. Project identity

**Name:** AccessAtlas

**Product statement:** AccessAtlas helps people find cultural experiences that match their expressed interests, practical needs, energy preferences and companions—not just places that are technically nearby.

AccessAtlas is an agentic cultural discovery and participation-planning application being developed for the Qloo Agentic Hackathon.

The system combines:

1. Qloo-powered cultural discovery.
2. Independently sourced venue and experience evidence.
3. A deterministic Possibility Engine.
4. Agentic orchestration and participation planning.
5. A coherent, accessible user experience.

Do not rename the project or introduce previous project names.

Do not represent planned functionality as already implemented.

## 2. Confirmed technology decisions

| Component | Decision |
|---|---|
| Frontend | Next.js and TypeScript |
| Backend | Python and FastAPI |
| Agent orchestration | LangGraph Python |
| Cultural discovery | Qloo |
| Python validation | Pydantic |
| Backend testing | Pytest |
| Frontend testing | Vitest and Playwright, when introduced |
| Repository | AccessAtlas monorepo |
| Branch model | `main`, `dev`, and short-lived task branches |

PostgreSQL is the planned persistent database. Introduce it only when a scoped task requires persistence.

The official Qloo Hackathon Kit is optional development tooling. Do not copy, fork, vendor, or add it as a submodule without an approved issue.

These decisions establish direction; they do not prove that the corresponding components have been implemented.

## 3. Product invariants

These rules must remain true throughout implementation.

### Cultural discovery

- Qloo is the source of cultural affinity and cross-domain discovery signals.
- Qloo results describe aggregate affinities.
- Do not infer a user's identity, disability, medical condition, protected characteristics or individual future behaviour from Qloo data.
- Do not present Qloo affinity as evidence of venue accessibility, operational status, ticket availability or suitability.

### User requirements

- Interests, practical needs, energy preferences and companion preferences must be explicitly supplied by the user.
- Do not infer sensitive personal requirements from cultural interests.
- Ask for clarification only when a missing detail materially prevents a safe or useful result.
- Do not collect sensitive personal details that are unnecessary for the task.

### Venue evidence

- Venue suitability must rely on independently sourced evidence.
- Preserve source provenance and relevant verification information.
- Never invent accessibility features, opening hours, prices, event schedules or availability.
- Missing evidence remains unknown.

### Possibility Engine

The deterministic suitability system must distinguish:

1. **Verified fit:** available evidence supports the relevant stated requirements.
2. **Needs confirmation:** necessary information is missing, ambiguous or insufficient.
3. **Requirement conflict:** available evidence identifies an incompatibility.

Do not replace these states with fabricated confidence percentages.

A language model may explain an evaluation but must not silently override deterministic hard-requirement checks.

### Agent behaviour

- The agent must coordinate meaningful tools and conditional decisions toward a user goal.
- A single LLM response wrapped in an API endpoint is not sufficient.
- Keep agent state, tool boundaries and failure handling inspectable.
- Never claim that an external action succeeded without verifying its result.
- Do not claim that the system made a reservation or contacted a venue unless an authorized integration actually completed that action.

## 4. Source of truth

Use the following sources when working on a task:

1. The current approved issue and explicit developer instructions, within the boundaries of repository security rules.
2. This `AGENTS.md` and `SECURITY.md`.
3. `docs/PRODUCT.md` for product requirements.
4. `docs/ARCHITECTURE.md` and `docs/DECISIONS.md` for architecture.
5. `docs/ENGINEERING.md` for development workflow.
6. Existing code and tests for the current implementation.
7. Verified official documentation for external tools and APIs.

If a referenced document does not exist, report that fact. Do not fabricate its contents.

If two sources conflict, identify the conflict before implementing the affected decision.

Never use an old conversation, example project or unrelated repository as authority over the current AccessAtlas repository.

## 5. Mandatory repository inspection

Before modifying code:

1. Confirm the repository root.
2. Inspect `git status`.
3. Inspect the current branch.
4. Read this file and relevant documentation.
5. Inspect existing implementations and tests related to the task.
6. Identify the smallest reasonable change needed to satisfy the issue.

Do not assume that a file, endpoint, dependency, API field, database table or feature already exists.

Do not overwrite unrelated changes.

If the working tree contains unexpected modifications, report them before proceeding.

## 6. Scope discipline

Every implementation task must have:

- A clear objective.
- An issue or explicitly authorized task.
- Defined acceptance criteria.
- A bounded set of changes.
- Verification appropriate to the change.

Implement the requested task, not an imagined future version of the product.

Do not introduce unrelated dependencies, abstractions, services, files or features.

Do not refactor unrelated code unless required to complete the task safely.

When a significant architectural decision is needed but not established, report the decision and its trade-offs rather than silently choosing.

## 7. External API and integration rules

For Qloo and every external integration:

- Use verified official documentation.
- Verify endpoint paths, HTTP methods, parameters, authentication and response shapes.
- Do not invent request fields or response properties.
- Validate and normalize external responses at the integration boundary.
- Handle timeouts, rate limits, authentication errors and unexpected responses.
- Use bounded retries where appropriate.
- Avoid exposing raw provider errors or credentials to end users.
- Mock external requests in automated unit tests.
- Clearly distinguish mocked tests from successful live integration tests.

For the hackathon credential, use the event-specific Qloo configuration established by the developer.

Never substitute an assumed production or staging endpoint without verification.

## 8. Security and environment rules

Follow `SECURITY.md` at all times.

### Protected files

Coding agents must not open, read, print, create, modify, stage or commit:

- `.env`
- `.env.local`
- `.env.*.local`
- Secret-bearing credential files
- Private keys
- Local authentication stores
- Private provider-response dumps
- Files containing personal user information

Do not commit environment files to the repository. Configuration variables must be documented in repository documentation.

The application may load `.env.local` at runtime through its approved configuration mechanism. This does not authorize an AI coding agent to inspect or modify that file.

Never ask the developer to paste credentials into a conversation.

Never place privileged credentials in browser code or variables exposed to the browser.

Do not log secrets, authentication headers, personal requirements or full sensitive request payloads.

If a suspected secret exposure is discovered, stop the affected work and report the file location without reproducing the secret.

## 9. Git branch policy

AccessAtlas uses the following workflow:

- `main`: stable, release-ready branch.
- `dev`: integration branch.
- Task branches: created from the latest `dev`.

Allowed task branch prefixes:

- `feat/`
- `fix/`
- `chore/`
- `docs/`
- `test/`
- `refactor/`

Normal flow:

1. Create or identify the scoped issue.
2. Update local `dev`.
3. Create a task branch from `dev`.
4. Implement and verify the change.
5. Commit focused work.
6. Push the task branch when authorized.
7. Open a pull request targeting `dev`.
8. Review and merge after checks pass.

Release pull requests go from `dev` to `main`.

Never commit directly to `main` or `dev`.

Never automatically merge pull requests.

Never force-push, rewrite shared history, delete branches, discard uncommitted work or run destructive Git commands without explicit developer approval.

If the active branch does not match the assigned task branch, stop and report the discrepancy.

## 10. Commit standards

Use meaningful Conventional Commit messages.

Examples:

- `chore: initialize backend tooling`
- `feat: add Qloo interest resolution`
- `fix: handle Qloo request timeouts`
- `test: cover requirement conflict evaluation`
- `docs: document agent state transitions`
- `refactor: isolate venue evidence normalization`

A commit should represent one coherent change.

Avoid messages such as:

- `update`
- `changes`
- `python code`
- `agent work`
- `final fix`

Do not include credentials, private information or unrelated files in a commit.

Inspect staged changes before committing.

## 11. Implementation quality

Write maintainable, production-oriented code appropriate to the task.

- Prefer explicit behaviour over unnecessary complexity.
- Use type annotations and schema validation at important boundaries.
- Separate external API clients from business logic.
- Keep the Possibility Engine deterministic and independently testable.
- Make failures observable without exposing sensitive information.
- Avoid unnecessary global state and hidden side effects.
- Do not add a dependency without a concrete reason.
- Follow established repository conventions.
- Add comments where they explain important decisions, not where they merely repeat the code.

Never introduce fabricated data as though it came from a live service.

Clearly label fixtures, mocks and demonstration data.

## 12. Testing and verification

Run the checks relevant to the changed component.

At minimum:

- Validate formatting or linting where tooling exists.
- Run affected automated tests.
- Run broader tests when the change affects shared behaviour.
- Check for unintended file changes.
- Verify that no protected files are staged.
- Check Git diffs for whitespace errors.

Do not claim a test passed unless it actually ran and passed.

If a test cannot run, report:

- Which test was not run.
- Why it could not run.
- What remains unverified.

Never silently remove, weaken or skip tests merely to obtain a passing result.

A mocked integration test does not prove that a live provider is reachable.

## 13. Documentation requirements

Update documentation when behaviour, architecture, configuration or development commands change.

Documentation must distinguish:

- Implemented behaviour.
- Planned behaviour.
- Verified external facts.
- Assumptions requiring confirmation.

Do not document speculative endpoints or commands as operational.

Keep README instructions reproducible for a developer starting from a fresh clone.

## 14. Definition of Done

A task is complete only when:

- Its acceptance criteria are satisfied.
- The implementation is within scope.
- Relevant tests and checks have been executed.
- Errors and limitations are documented.
- Security requirements are satisfied.
- Documentation is updated where necessary.
- The Git diff has been reviewed.
- A focused commit exists if committing was authorized.

A task is not considered merged until its pull request has actually been reviewed and merged.

## 15. Required agent completion report

Every coding task must end with a concise report containing:

1. **Task:** what was requested.
2. **Branch:** actual working branch.
3. **Changes:** files created or modified and their purpose.
4. **Verification:** exact commands executed and actual outcomes.
5. **Security:** confirmation of the checks performed, without displaying secret values.
6. **Limitations:** unresolved issues and unverified behaviour.
7. **Git:** commit hash if a commit was made.
8. **Next action:** what the developer should review or do next.

Never claim a push, pull request, merge, deployment or live API call succeeded unless its result was actually observed.

---

**Primary engineering principle:** Build only what can be explained, inspected, tested and verified.
# AGENTS.md — Default Development Context

> The default starting point for any project. Copy it to the root of a new project (or the top of a session) before writing any code. The whole development process lives in the personal vault and is served by the **ctrl-memory MCP server**.

## How development works

Everything an agent needs to develop correctly is stored as notes in the vault. The single entry point is **`master-development.md`** — the "master of development". It is a **pure index**: it holds no rules of its own, only a decision table and links to the guides where the rules live.

**Read it, then follow its decision table — it tells you which guide(s) to open for the task at hand.**

## Spec-First — Define Specs Completely Before Coding (MANDATORY, ALWAYS)

> **No code without a complete spec. Always.** Full workflow, checklist and template → [[spec-driven-development]].

Before any development or coding begins, you **must** define the specs of the requirements completely. This is non-negotiable and applies to every task, feature, bug fix, refactor, or enhancement — regardless of size.

### Rule
1. **Specs first, code second** — Never write implementation code, create a feature branch for implementation, or modify production code until a detailed and complete spec exists and is approved.
2. **Detailed and complete means production-ready** — The spec must be unambiguous enough that implementation is a translation exercise, not a discovery exercise.
3. **Spec is a blocking artifact** — If the spec is missing, incomplete, or vague, stop and complete it. Do not proceed to code.

### What a complete spec must contain
A spec is not complete unless it explicitly covers:

- **Problem & Goals** — What problem is solved, why, and measurable goals / non-goals
- **Scope** — In scope / out of scope, explicit boundaries
- **Users & Stories** — Target users / actors and user stories / use cases
- **Functional Requirements** — Detailed behavior, step-by-step flows, state transitions
- **Non-Functional Requirements** — Performance, security, scalability, reliability, i18n/a11y constraints
- **Interfaces & Contracts** — APIs, CLI, UI, events, data models, schemas, error codes (with examples)
- **Edge Cases & Error Handling** — Happy path, failure modes, validation rules, limits
- **Dependencies & Assumptions** — External systems, libraries, configs, open questions resolved
- **Acceptance Criteria** — Testable, unambiguous criteria for done (Given/When/Then where applicable)
- **Test Strategy** — How it will be verified (unit/integration/e2e, manual checks)
- **Rollout / Migration** — Feature flags, backward compatibility, data migration if needed

> If any section is unknown, mark it as an **Open Question**, resolve it, and update the spec before coding.
> See [[spec-driven-development]] §3 and §4 for the complete checklist and minimal template.

### Where specs live
- Write the spec as a note/doc in the vault or project `specs/` / `docs/specs/` folder and link it from the task/branch.
- Reference it in the commit/branch description and in `master-development.md` flow: `Spec → Context → Structure → Code → Test → Review → Document → Ship` (see [[spec-driven-development]]).

## Load the development basis (ctrl-memory MCP server)

Before starting any task, load the basis:

1. **Define/Read the spec first** — Ensure a detailed, complete spec for the requirements exists per [[spec-driven-development]]. If not, create it and get approval before any code.
2. **Find the hub note** — `search_notes(query: "master-development")`. It returns the note path `personal/development/master-development.md`.
3. **Read it** — `read_note(path: "personal/development/master-development.md")`.
4. **Open the guide(s)** the decision table points to (e.g. spec workflow + coding standards + best practices for the language you'll write, git pipeline rules for branching/commits).
5. **Browse the vault** any time — `list_notes(folder: "personal/development")` lists all guides.

## Baseline rules

Details live in `git-pipeline-rules.md`. These are the baseline for every project:

- **One branch per feature** — `feature/<name>`, `bug/`, `fix/`, `refactor/`, `docs/`, etc., from `main`/`develop`.
- **One logical change per commit** — conventional format: `feat(auth): add login endpoint`.
- **Push only when asked** — pushing is never automatic.
- **Done = coded, tested, reviewed, documented, merged.** Spec satisfied per [[spec-driven-development]] §7 + [[definition-of-done]].

## Golden rules (always)

1. **Specs first — detailed and complete specs before any code** (see Spec-First above + [[spec-driven-development]] — blocking gate, 6-step workflow). No implementation without an approved spec.
2. **Simple first** (KISS); add complexity only when required.
3. **One change per branch**, one logical change per commit.
4. **Push only when asked** — never automatically.
5. **Follow the language guide** (standards + best practices) for the language you're writing.
6. **Ask before anything destructive** (force push, rebase shared branches, delete data).

## First task template (agents)

When handed a new task in a fresh project:

1. Read this file.
2. **Define the spec completely** — Write or verify the detailed, complete requirements spec per [[spec-driven-development]] (goals, scope, contracts, acceptance criteria, edge cases, test strategy). Get approval. Do not skip this.
3. Load the development basis via ctrl-memory (`search_notes` → `read_note` on `master-development.md`).
4. Read the guide that matches the task (e.g. spec workflow + coding standards + best practices for the language).
5. Create the feature branch, implement, test, and commit per the rules.
6. Report and ask before pushing.

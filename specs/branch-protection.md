# Spec: Protect `main` on GitHub

## 1. Problem & Goals

- **Problem:** Anyone with write access can push, force-push, or delete `main`. Production deploy runs on that branch.
- **Goals:**
  1. `main` cannot be force-pushed or deleted.
  2. Normal changes land via pull request (admins may bypass for a hotfix).
  3. PRs run a Docker **build** only. Image push + VM deploy stay on `push` / `workflow_dispatch` to `main`.

## 2. Non-Goals

- CODEOWNERS, signed commits, or a second human reviewer (0 approvals so a solo maintainer can self-merge).
- Org-wide rulesets.

## 3. Functional Requirements

1. Repository ruleset `Protect main`, target `refs/heads/main`, enforcement `active`.
2. Rules: `deletion`, `non_fast_forward`, `pull_request` (0 approving reviews).
3. Bypass: repository Admin role (`RepositoryRole` id 5) and `OrganizationAdmin`, mode `always`.
4. Workflow triggers: `push` + `pull_request` to `main`, plus `workflow_dispatch`.
5. Job `build` always `docker build`. GCP auth, push, and `deploy-to-vm` only when `github.ref == refs/heads/main` and event is `push` or `workflow_dispatch`.

## 4. Acceptance Criteria

- [ ] GitHub → Settings → Rules → Rulesets shows `Protect main`.
- [ ] A non-admin cannot `git push --force origin main`.
- [ ] Opening a PR against `main` runs `build` and does not SSH to the VM.

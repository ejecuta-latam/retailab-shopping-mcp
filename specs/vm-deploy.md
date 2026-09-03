# Spec: Deploy shopping-mcp to the RealsLab VM

## 1. Problem & Goals

- **Problem:** Judges need a working live HTTPS URL. This site only runs locally. RealsLab already deploys Astro apps to a GCE VM via GitHub Actions → Artifact Registry → SSH `docker run`.
- **Why now:** The [WebMCP Challenge](https://webmcp.devpost.com/) requires a live URL. The GitHub remote is `ejecuta-latam/retailab-shopping-mcp`.
- **Goals:**
  1. `Dockerfile` builds the Astro static site and serves it with nginx on port 80.
  2. Push to `main` (or `workflow_dispatch`) builds, pushes `…/reals-lab-repo/retailab-shopping-mcp:latest`, SSH-deploys on the VM.
  3. Same secrets and GCP project as `realslab-application`.
  4. Container joins `risks-vision-network` so `nginx-proxy` can reach it by name.
  5. Nav/docs/package GitHub URLs use `ejecuta-latam/retailab-shopping-mcp`.

## 2. Non-Goals

- Changing nginx-proxy or DNS from CI (one-time VM step, documented).
- Node SSR adapter (this site is static).
- Cloud SQL, Secret Manager, or extra env vars.
- Recording the Devpost video.

## 3. Users & Stories

- As a **maintainer**, I push `main` and the VM serves the new static files.
- As a **judge**, I open the public HTTPS host and use `/demo` with WebMCP.

## 4. Scope

- **In:** `Dockerfile`, `.dockerignore`, `deploy/nginx.conf` (container), `deploy/nginx-proxy.snippet.conf` (paste onto VM), `.github/workflows/main.yml`, GitHub URL updates, README live-URL / judge notes.
- **Out:** certbot, DNS A record (manual).

## 5. Functional Requirements

1. Workflow triggers: `push` to `main`, `workflow_dispatch`.
2. Build job: checkout → `google-github-actions/auth` with `GCP_SA_KEY` → `setup-gcloud` → docker auth `us-central1-docker.pkg.dev` → `docker build` + tag sha + `latest` + push `latest`.
3. Image: `us-central1-docker.pkg.dev/sonic-totem-447414-t7/reals-lab-repo/retailab-shopping-mcp`.
4. Deploy job (needs build): `appleboy/ssh-action@v1.2.0` with `GCP_VM_IP`, `GCP_VM_USER`, `SSH_PRIVATE_KEY`; `envs: IMAGE`.
5. SSH script: `gcloud auth configure-docker … --quiet`; `docker pull $IMAGE:latest`; stop/rm `retailab-shopping-mcp`; `docker run -d --name retailab-shopping-mcp --network risks-vision-network --restart always -p 127.0.0.1:8092:80 $IMAGE:latest`.
6. Container nginx listens on 80; `try_files` for Astro multi-page (`/demo`, `/docs`).
7. Intended public host: `shopping.realslab.xyz` (DNS + nginx-proxy + cert SAN are a one-time VM step; snippet in `deploy/nginx-proxy.snippet.conf`).
8. Loopback 8092 is free: 8087/8088/8089/8091 are taken.

## 6. Interfaces

- Secrets (same names as RealsLab frontend): `GCP_SA_KEY`, `GCP_VM_IP`, `GCP_VM_USER`, `SSH_PRIVATE_KEY`.
- Public URL after nginx: `https://shopping.realslab.xyz/` and `/demo`.

## 7. Edge Cases

- Missing secrets: Actions fails; document copy from `realslab-application`.
- nginx-proxy not updated: container is healthy on `:8092` but not on the public host.
- `npm ci` in Docker must see the `shopping-mcp` workspace package.

## 8. Non-Functional

- Image is static files only; no Node in production.
- Site stays up through judging (21 Sep 2026).

## 9. Dependencies

- GCP project `sonic-totem-447414-t7`, Artifact Registry `reals-lab-repo`, VM `risks-vision-instance`, docker network `risks-vision-network`.
- Node 22 build (matches `engines`).

## 10. Acceptance Criteria

- [ ] Given a push to `main` with secrets set, when the workflow finishes, then `docker ps` on the VM shows `retailab-shopping-mcp` Up.
- [ ] Given `curl -sI http://127.0.0.1:8092/demo`, when the container is running, then the response is 200.
- [ ] Given nginx-proxy + DNS, when a browser opens `https://shopping.realslab.xyz/demo`, then NileMart loads.
- [ ] Given Nav GitHub, when clicked, then the URL is `https://github.com/ejecuta-latam/retailab-shopping-mcp`.

## 11. Test Strategy

- Local: `docker build -t retailab-shopping-mcp .` and `docker run -p 8080:80`.
- After first Actions run: SSH curl loopback `/` and `/demo`.

## 12. Rollout

- One-time: copy Actions secrets; add DNS A for `shopping.realslab.xyz`; paste nginx snippet; expand TLS SAN; reload nginx-proxy.
- Recurring: push `main`.

## 13. Open Questions

- None. Resolved: same pipeline as RealsLab frontend; static nginx instead of Node because this Astro app has no server adapter. Host `shopping.realslab.xyz`. Port `8092`.

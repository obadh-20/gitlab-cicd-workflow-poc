# Multi-service CI/CD migration POC

A **safe, fictional test repository** modeled on a real multi-service Kubernetes + GHCR deployment workflow. This repository contains no company credentials, real application code, or production infrastructure access.

## Architecture

| Service | Location | Port | Dockerfile build context | Dockerfile path |
|---|---|---:|---|---|
| Gateway | `backend/gateway` | 8000 | `./backend` | `gateway/Dockerfile` |
| Administration | `backend/administration` | 8010 | `./backend` | `administration/Dockerfile` |
| AI Control | `backend/ai-control-panel` | 8017 | `./backend` | `ai-control-panel/docker/Dockerfile` |
| Frontend | `frontend` | 80 | `./frontend` | `docker/Dockerfile` |

Gateway forwards `GET /api/admin/info` to Administration and `GET /api/ai/info` to AI Control. The frontend uses NGINX to proxy `/api/` requests to Gateway.

## Run locally (Docker Compose)

```bash
docker compose up --build -d
docker compose ps
curl http://localhost:8000/healthz
curl http://localhost:8000/api/admin/info
curl http://localhost:8000/api/ai/info
# Open http://localhost:8080/
docker compose down
```

Each service has a **separate Dockerfile**, and Compose builds each one using the same kind of per-service Dockerfile/context separation used by monorepos.

## Run tests without Docker

```bash
cd backend/gateway && npm test
cd ../administration && npm test
cd ../ai-control-panel && npm test
```

Tests use the Node.js built-in test runner (Node.js 22 recommended); no external runtime dependencies.

## Independent service releases

Your developers can continue creating **GitHub Releases**, with a separate Git tag for each service/environment. See [docs/release-conventions.md](docs/release-conventions.md) for the release matrix and sample tagging procedure.

For example:

```bash
bash scripts/parse-release-tag.sh dev-gateway/0.0.1
bash scripts/parse-release-tag.sh ai-control/0.0.2
bash scripts/parse-release-tag.sh stg-gateway/0.0.1
```

The script maps a tag to **one** service, environment, version and matching Dockerfile. It does **not** deploy or push anything; we will use it when we create GitLab CI/CD in phase 2.

## Migration plan

**Phase 1 (this archive):** Build a representative repository. Verify the independent Dockerfiles, shared Docker Compose setup, and release conventions.

**Phase 2 (next):** Add `.gitlab-ci.yml` to this **GitHub repository** to run tests and build only the tagged service on GitLab-hosted runners; push a versioned image to a **dedicated test GHCR package**. Validate GitHub tag → GitLab mirror → tag pipeline.

**Phase 3:** Add a separate `infrastructure` repository with Helm charts/values, connect a disposable Kubernetes test namespace, and use approvals for staging/production. Do not attach production Vault credentials or cluster access during the POC.

> This template deliberately has **no active GitHub Actions workflow or GitLab build/deploy pipeline yet**. That prevents accidental duplicate releases while we test the migration in stages. The `docs/` folder explains how the old release model will map to GitLab.

## Publish to a new GitHub repository

Create a **new empty, private repository** in GitHub, for example `gitlab-cicd-workflow-poc`, with no auto-generated README or `.gitignore`. Extract the ZIP archive, then run:

```bash
cd gitlab-cicd-work-repo-poc
git init -b main
git add .
git commit -m "Initial multi-service CI/CD POC"
git remote add origin https://github.com/YOUR_USERNAME/gitlab-cicd-workflow-poc.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub owner. Connect this new repository in GitLab using **Run CI/CD for external repository → GitHub**, under the GitLab group holding your trial. Keep GitHub as the only writable source of truth.

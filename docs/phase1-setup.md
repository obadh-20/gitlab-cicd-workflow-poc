# GitLab CI POC — Phase 1: Per-service release builds

This adds `infra/.gitlab-ci.yml` to the existing GitHub repository `obadh-20/gitlab-cicd-workflow-poc`.

## Expected behavior
- Push to `main`: `main_checks` tests all three backend services and checks that frontend HTML exists. No images are published.
- Create GitHub Release tag `dev-gateway/0.0.2`: after GitHub -> GitLab mirroring, `release_tests` tests only Gateway. `publish_to_ghcr` builds the Dockerfile in `backend/gateway/Dockerfile` using build context `backend/` and pushes a version- and commit-specific image to GHCR.
- The same pipeline supports dev tags for Administration, AI Control, and Frontend, using `scripts/parse-release-tag.sh`.
- STAGING and PRODUCTION are deliberately **disabled** in Phase 1.

## Configure GitLab
1. Keep GitHub as source of truth; commit `infra/.gitlab-ci.yml` in GitHub, not the GitLab mirror.
2. In the GitLab project's Settings > CI/CD > General pipelines, set **CI/CD configuration file** to `infra/.gitlab-ci.yml`.
3. In Settings > Repository > Mirroring repositories, confirm **Trigger pipelines for mirror updates** is enabled.
4. In Settings > Repository > Protected tags, create wildcard protections for `dev-gateway/*`, `dev-administration/*`, `dev-frontend/*`, `ai-control/*`; allow only trusted releasers to create them. Since GitHub is upstream, separately protect release-tag creation in GitHub with an appropriate ruleset. Verify that mirrored tag pipelines are recognized as protected.
5. In Settings > CI/CD > Variables, set:
   - `GHCR_USERNAME`: `obadh-20` (nonsecret).
   - `GHCR_TOKEN`: short-lived GitHub PAT (classic) with `write:packages`; mask and hide this value. Prefer **Protected** when tags are protected and verified to receive the variable. Do not put it in YAML or commit it.
6. Use GitLab-hosted runner. Docker-in-Docker requires a runner supporting privileged services and shared TLS certificates, which GitLab.com instance runners support. This setup uses TLS.
7. Create the next GitHub Release on the current main commit with tag `dev-gateway/0.0.2`. See `Build > Pipelines` in GitLab.
8. Look for `ghcr.io/obadh-20/gitlab-cicd-poc-gateway:dev-0.0.2-<shortsha>` in GitHub Packages.

## Troubleshooting
- Pipeline not created: verify GitLab CI configuration path and mirror-update triggers, then check the tag in the mirrored repository.
- GHCR credentials missing: check GitLab variable name, environment scope, tag protection, and whether protected variables are available to mirrored tag pipelines.
- Cannot connect to Docker daemon: verify job runner supports Docker-in-Docker and TLS; GitLab.com instance runners do, but custom runners need configuration.
- `denied: permission_denied: write_package`: verify GHCR PAT scope, username, package ownership and package write permissions.

## Next phases
Security scanning -> Helm/Kubernetes CD -> one-time Vault fetch Job -> approvals -> rollout checks/rollback -> GitLab Duo agent experiments.

# GitHub Releases → GitLab CI/CD: per-service release contract

## Keep the existing developer experience

Developers create a **GitHub Release** in the source GitHub repository and choose a **new Git tag**. GitLab does not monitor the GitHub Release description or release assets; it will later react to the Git **tag** when GitHub-to-GitLab pull mirroring updates it and triggers a tag pipeline.

| GitHub release tag example | Service | Environment | Example image tag to build later |
|---|---|---|---|
| `dev-gateway/0.0.1` | gateway | dev | `gateway:0.0.1` |
| `stg-gateway/0.0.1` | gateway | staging | `gateway:stg-0.0.1` |
| `prod-gateway/0.0.1` | gateway | production | `gateway:prod-0.0.1` |
| `dev-administration/0.0.2` | administration | dev | `administration:0.0.2` |
| `ai-control/0.0.3` | ai-control | dev | `ai-control:0.0.3` |
| `stg-ai-control/0.0.3` | ai-control | staging | `ai-control:stg-0.0.3` |
| `dev-frontend/0.0.4` | frontend | dev | `frontend:0.0.4` |

These are POC examples based on the existing **non-uniform** per-service naming patterns: Gateway uses `dev-gateway`, while AI Control uses `ai-control` for dev. We preserve those differences intentionally. The `scripts/parse-release-tag.sh` script supports corresponding staging and production tags for all four services. Its mapping is centralized so future CI scripts don't have to guess.

### Sample release flow

1. Merge a service change into **GitHub `main`**.
2. On GitHub, open **Releases → Draft a new release** and create tag `dev-gateway/0.0.1` from the chosen commit.
3. GitLab pulls the tag from GitHub. We will verify that **Trigger pipelines for mirror updates** is enabled and that the tag pipeline starts; if a specific connection doesn't trigger tags reliably, we will add a scoped release webhook/API trigger.
4. GitLab's release job parses the tag and builds **only Gateway**. CI pushes an image to test GHCR, then deploys to a disposable test namespace.
5. Staging and production releases require explicit approval. We will not connect production during the POC.

**Do not deploy based only on `main` pushes** if you want to preserve release-driven deployments. Run tests on pushes, then reserve release builds/deploys for service tags.

## Manual test without a release

```bash
sh scripts/parse-release-tag.sh dev-gateway/0.0.1
sh scripts/parse-release-tag.sh stg-gateway/0.0.1
sh scripts/parse-release-tag.sh ai-control/0.0.3
```

Invalid tags should exit nonzero and cannot select arbitrary paths. That is deliberate; the later CI job must never treat untrusted tag content as a shell command or file path.

## Security and source-of-truth

- Keep GitHub as the canonical code repository; do not merge changes in its GitLab pull mirror.
- Use test-only, least-privilege GHCR credentials in protected/masked GitLab CI/CD variables.
- Never paste Vault keys, kubeconfigs, access tokens, or GitHub PATs into this repository.
- Never let a CI tag from an untrusted branch deploy directly into production.
- Avoid `latest` as a deployment image tag. Prefer immutable image digests, with semantic release labels for discoverability.
- For production, prefer building once and promoting the exact tested image digest rather than rebuilding that release for each environment. Staging-tag rebuilds are shown only to reflect the **current** legacy convention for evaluation.

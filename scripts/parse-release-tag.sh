#!/bin/sh
# Map the existing GitHub release-tag convention to exactly one service.
set -eu
TAG="${1:-}"
case "$TAG" in
  dev-gateway/*)       SERVICE=gateway; ENVIRONMENT=dev ;;
  stg-gateway/*)       SERVICE=gateway; ENVIRONMENT=stg ;;
  prod-gateway/*)      SERVICE=gateway; ENVIRONMENT=prod ;;
  dev-administration/*) SERVICE=administration; ENVIRONMENT=dev ;;
  stg-administration/*) SERVICE=administration; ENVIRONMENT=stg ;;
  prod-administration/*) SERVICE=administration; ENVIRONMENT=prod ;;
  ai-control/*)        SERVICE=ai-control; ENVIRONMENT=dev ;;
  stg-ai-control/*)    SERVICE=ai-control; ENVIRONMENT=stg ;;
  prod-ai-control/*)   SERVICE=ai-control; ENVIRONMENT=prod ;;
  dev-frontend/*)      SERVICE=frontend; ENVIRONMENT=dev ;;
  stg-frontend/*)      SERVICE=frontend; ENVIRONMENT=stg ;;
  prod-frontend/*)     SERVICE=frontend; ENVIRONMENT=prod ;;
  *) echo "Unsupported release tag: $TAG" >&2; exit 2 ;;
esac
VERSION="${TAG#*/}"
if ! printf '%s' "$VERSION" | grep -Eq '^[0-9]+\.[0-9]+\.[0-9]+$'; then
  echo "Invalid release version: $VERSION (expected major.minor.patch)" >&2
  exit 2
fi
case "$SERVICE" in
  gateway)        BUILD_CONTEXT=backend; DOCKERFILE=gateway/Dockerfile ;;
  administration) BUILD_CONTEXT=backend; DOCKERFILE=administration/Dockerfile ;;
  ai-control)     BUILD_CONTEXT=backend; DOCKERFILE=ai-control-panel/docker/Dockerfile ;;
  frontend)       BUILD_CONTEXT=frontend; DOCKERFILE=docker/Dockerfile ;;
esac
# Output is deliberately safe key=value lines with validated values.
printf 'SERVICE=%s\nENVIRONMENT=%s\nVERSION=%s\nBUILD_CONTEXT=%s\nDOCKERFILE=%s\n' "$SERVICE" "$ENVIRONMENT" "$VERSION" "$BUILD_CONTEXT" "$DOCKERFILE"

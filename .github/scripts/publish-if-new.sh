#!/usr/bin/env bash
# Publish one workspace package to npm unless its version is already there.
# Usage: publish-if-new.sh <package dir>
#   DIST_TAG=<tag>  npm dist-tag (default: `next` for a prerelease version, `latest` otherwise)
#   DRY_RUN=1       run `pnpm publish --dry-run` instead of uploading
set -euo pipefail

dir="$1"
name="$(node -p "require('./$dir/package.json').name")"
version="$(node -p "require('./$dir/package.json').version")"

# `npm view` prints the version when it exists. When the version or the whole
# package is missing it exits 1 (E404); older npm prints nothing and exits 0.
published="$(npm view "$name@$version" version 2>/dev/null || true)"
if [ -n "$published" ]; then
  echo "$name@$version is already on npm; skipping"
  exit 0
fi

flags=(--access public --provenance --no-git-checks)
tag="${DIST_TAG:-}"
if [ -z "$tag" ]; then
  case "$version" in
    *-*) tag=next ;; # a prerelease must never become `latest`
    *) tag=latest ;;
  esac
fi
flags+=(--tag "$tag")
if [ -n "${DRY_RUN:-}" ]; then
  flags+=(--dry-run)
  echo "Dry run: would publish $name@$version"
fi

echo "Publishing $name@$version to dist-tag $tag"
(cd "$dir" && pnpm publish "${flags[@]}")

#!/usr/bin/env bash
# Publish one workspace package to npm unless its version is already there.
# Usage: publish-if-new.sh <package dir>   (DRY_RUN=1 runs `pnpm publish --dry-run`)
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
case "$version" in
  *-*) flags+=(--tag next) ;; # prereleases (1.2.0-beta.1) must not become `latest`
esac
if [ -n "${DRY_RUN:-}" ]; then
  flags+=(--dry-run)
  echo "Dry run: would publish $name@$version"
fi

echo "Publishing $name@$version"
(cd "$dir" && pnpm publish "${flags[@]}")

#!/usr/bin/env bash
# Decide the next version for release.yml and write it to the package manifests with nx release.
# Env: MODE (canary|rc|stable), SHA, PR_NUMBER (canary), GH_TOKEN. Writes GITHUB_OUTPUT:
#   version   the new version, or empty when there is nothing to release
#   dist-tag  npm dist-tag for the publish (canary | next | latest)
#   last-stable  latest stable tag reachable from HEAD (stable only; changelog --from)
set -euo pipefail

out() { echo "$1=$2" >> "${GITHUB_OUTPUT:-/dev/stdout}"; }
disk_version() { node -p "require('./packages/ui/package.json').version"; }

current_tag="$(git describe --tags --abbrev=0 --match 'v*' 2>/dev/null || true)"
last_stable="$(git tag -l 'v*' --merged HEAD | grep -v -- '-' | sort -V | tail -n1 || true)"

if [ "$MODE" != canary ] && [ -z "$current_tag" ]; then
  echo "::error::No v* tag reachable from HEAD. Tag the last published version once (docs/releasing.md, one-time setup)."
  exit 1
fi

case "$MODE" in
  canary)
    version="0.0.0-canary.${SHA:0:7}"
    pnpm exec nx release version "$version"
    out version "$version"
    out dist-tag canary
    ;;

  rc)
    current="${current_tag#v}"
    # Release intent from the merged PR's labels (release:major|minor|patch|none) overrides
    # conventional commits; this is the Auto behaviour we keep.
    label="$(gh api "repos/${GITHUB_REPOSITORY}/commits/${SHA}/pulls" \
      --jq '[.[] | select(.merged_at != null)][0].labels[].name | select(startswith("release:"))' 2>/dev/null | head -n1 || true)"
    if [ "$label" = "release:none" ]; then
      echo "release:none on the merged PR; not cutting an rc"
      out version ""; exit 0
    fi
    before="$(disk_version)"
    if [[ "$current" == *-* ]]; then
      # Already on an rc line: only the prerelease number moves (a label cannot re-bump it).
      pnpm exec nx release version prerelease --preid rc
    elif [ -n "$label" ]; then
      pnpm exec nx release version "pre${label#release:}" --preid rc
    else
      pnpm exec nx release version --preid rc # bump from conventional commits since $current_tag
    fi
    after="$(disk_version)"
    if [ "$after" = "$before" ]; then
      echo "No releasable commits since $current_tag; nothing to publish"
      out version ""; exit 0
    fi
    out version "$after"
    out dist-tag next
    ;;

  stable)
    current="${current_tag#v}"
    if [[ "$current" != *-* ]]; then
      echo "Latest tag $current_tag is already stable; nothing new to release"
      out version ""; exit 0
    fi
    version="${current%%-*}" # 0.2.0-rc.3 -> 0.2.0
    pnpm exec nx release version "$version"
    out version "$version"
    out dist-tag latest
    out last-stable "$last_stable"
    ;;

  *) echo "::error::unknown MODE '$MODE'"; exit 1 ;;
esac

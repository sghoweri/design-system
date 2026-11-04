#!/usr/bin/env bash
# Decide the next version for release.yml and write it to the package manifests with nx release.
# Env: MODE (canary|rc|stable), SHA, PR_NUMBER (canary), GH_TOKEN, RELEASE_LABELS (tests only).
# Writes GITHUB_OUTPUT:
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
    # Release intent comes from the merged PR's label, Auto style: exactly one of
    # major | minor | patch | skip-release (release-label.yml gates merges on it).
    # Conventional commits only shape the changelog.
    # RELEASE_LABELS (space-separated) stands in for the lookup in local tests.
    labels="${RELEASE_LABELS-$(gh api "repos/${GITHUB_REPOSITORY}/commits/${SHA}/pulls" \
      --jq '[.[] | select(.merged_at != null)][0].labels[].name' 2>/dev/null | tr '\n' ' ' || true)}"
    intent=""
    for l in $labels; do
      case "$l" in
        major|minor|patch|skip-release)
          if [ -n "$intent" ]; then
            echo "::error::The merged PR carries both '$intent' and '$l'; keep exactly one of major, minor, patch, skip-release"
            exit 1
          fi
          intent="$l" ;;
      esac
    done
    if [ "$intent" = skip-release ]; then
      echo "skip-release on the merged PR; not cutting an rc"
      out version ""; exit 0
    fi
    before="$(disk_version)"
    if [[ "$current" == *-* ]]; then
      # Already on an rc line: only the prerelease number moves; the label cannot re-bump it.
      pnpm exec nx release version prerelease --preid rc
    else
      if [ -z "$intent" ]; then
        # The release-label check keeps this from happening on a PR merge; a direct push or
        # a bypassed gate lands here. Smallest bump rather than a red release.
        echo "::warning::No release label on the PR merged as ${SHA:0:7} (major, minor, patch or skip-release); defaulting to patch"
        intent=patch
      fi
      pnpm exec nx release version "pre${intent}" --preid rc
    fi
    after="$(disk_version)"
    if [ "$after" = "$before" ]; then
      echo "Version unchanged after nx release version; nothing to publish"
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

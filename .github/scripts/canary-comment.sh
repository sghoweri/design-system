#!/usr/bin/env bash
# Upsert ONE comment on the PR with the canary install line. Env: VERSION, PR_NUMBER, GH_TOKEN.
set -euo pipefail

marker="<!-- release.yml canary -->"
body="$(cat <<MD
$marker
**Canary published:** \`$VERSION\` (npm dist-tag \`canary\`)

\`\`\`sh
pnpm add @salemcobalt/tokens@$VERSION @salemcobalt/ui@$VERSION
\`\`\`

Updated on every push while the \`canary\` label is on this PR. Nothing is tagged or released.
MD
)"

existing="$(gh api "repos/${GITHUB_REPOSITORY}/issues/${PR_NUMBER}/comments" --paginate \
  --jq ".[] | select(.body | startswith(\"$marker\")) | .id" | head -n1 || true)"
if [ -n "$existing" ]; then
  gh api -X PATCH "repos/${GITHUB_REPOSITORY}/issues/comments/${existing}" -f body="$body" >/dev/null
else
  gh api "repos/${GITHUB_REPOSITORY}/issues/${PR_NUMBER}/comments" -f body="$body" >/dev/null
fi
echo "commented on #$PR_NUMBER"

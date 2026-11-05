# Releasing

`@salemcobalt/tokens` and `@salemcobalt/ui` share one version and are released by
[`.github/workflows/release.yml`](../.github/workflows/release.yml). Versions come from
[nx release](https://nx.dev/docs/guides/nx-release) in fixed mode (configuration in
[`nx.json`](../nx.json)); the bump is decided by a label on the merged PR, Auto style; npm authentication is
[Trusted Publishing](https://docs.npmjs.com/trusted-publishers) (OpenID Connect), so there is no
`NPM_TOKEN`, and every version ships with a provenance attestation. Every action in the workflow is
pinned to a commit SHA, and Dependabot (`.github/dependabot.yml`) opens a weekly PR when a pin falls
behind; `ci.yml` runs actionlint and zizmor over the workflows on every PR.

## The model

```
feature branch ──PR──▶ main ──PR──▶ release
                        │             │
                        ▼             ▼
                 vX.Y.Z-rc.N        vX.Y.Z           then CI merges release back into main
                 npm `next`         npm `latest`
                 GitHub prerelease  GitHub release + CHANGELOG.md entry
```

- **Every merge to `main` cuts a release candidate.** The merged PR's label picks the bump (`major`,
  `minor` or `patch`), the new version is tagged on the merge commit itself, published under the npm
  dist-tag `next`, and given a GitHub prerelease. `main` carries no version commits: rc versions live in
  tags. Merging again while an rc line is open only bumps the rc number (`0.2.0-rc.0` → `0.2.0-rc.1`),
  whatever the label says.
- **Merging `main` into `release` cuts the stable version.** The rc suffix is dropped (`0.2.0-rc.3` →
  `0.2.0`), `CHANGELOG.md` gets an entry covering everything since the previous stable tag, the version
  commit is tagged and pushed to `release`, both packages are published under `latest`, a GitHub release
  is created, and the workflow merges `release` back into `main` with a merge commit. A conflict fails
  the run and is resolved by hand; nothing is ever force-pushed.
- **A PR labeled `canary` publishes `0.0.0-canary.<sha7>`** under the dist-tag `canary` on every push,
  and keeps one comment on the PR with the install line. No tag, no release. Remove the label to stop.
- **The label is the only source of the bump.** Every PR into `main` carries exactly one of `major`,
  `minor`, `patch` or `skip-release` (the names Intuit's Auto uses). The `release-label` check
  ([`release-label.yml`](../.github/workflows/release-label.yml)) fails while a PR has none or several,
  and the `main` ruleset requires it, so an unlabeled PR cannot merge. `skip-release` publishes nothing
  for that merge. Should a commit reach `main` without a label anyway (a direct push, a bypassed gate),
  the release run warns and treats it as `patch`; two or more labels still fail the run. Conventional
  commits are not read for the bump; they still shape the changelog and the release notes. Limitation:
  while an rc line is open the label is ignored and only the rc number moves, so a `major` merged on
  top of an open `0.2.0-rc.N` line still lands in `0.2.0-rc.N+1`; cut the stable first when a bigger
  bump is intended. The `release` ruleset requires only `check`: a `main` → `release` PR merges work
  that was already labeled on its way into `main`.
- **Zero-major note.** The label means what it says on `0.x` too: `minor` on `0.1.1` gives `0.2.0-rc.0`
  and `major` gives `1.0.0-rc.0`. Nx's default demotion for zero-major versions is switched off in
  `nx.json` (`adjustSemverBumpsForZeroMajorVersion: false`) because the intent is explicit.
- A version that is already on the registry is skipped, so re-running a job after a partial failure
  publishes only what is missing. Prereleases never become `latest`.

## One-time setup (Salem)

### 1. npm: Trusted Publisher for each package

Both packages exist on npm (`0.1.0` was published by hand as `sghoweri` on 2026-11-03), so this can be
done now. For **each** of `@salemcobalt/tokens` and `@salemcobalt/ui`: package page on npmjs.com →
**Settings** → **Trusted Publisher** → **GitHub Actions**:

- Organization or user: `sghoweri`
- Repository: `design-system`
- Workflow filename: `release.yml`
- Environment name: leave empty

Optionally set **Publishing access** to _Require two-factor authentication and disallow tokens_, so
the workflow is the only publisher. npm accepts one workflow file per package, which is why canary,
rc and stable all live in `release.yml`.

### 2. git: baseline tag and the `release` branch

nx release reads the current version from the latest `v*` tag, so the version already on npm needs a
tag once, on the `main` commit whose package contents match it. Use the newest version published by
hand (`0.1.0` at `a7d1aa0`; `0.1.1` at the merge commit of the `'use client'` fix, PR #6, if that was
published by hand too), and start `release` from the same commit:

```sh
git tag v0.1.1 <merge commit of PR #6>   # or: git tag v0.1.0 a7d1aa0
git push origin v0.1.1
git branch release <the same commit>
git push -u origin release
```

The workflow refuses to run until a `v*` tag exists. From then on both packages move together: the next
rc after `v0.1.1` is `0.1.2-rc.0` for `tokens` as well as `ui`, even though `tokens` never shipped a
`0.1.1`. (The stray `0.0.0-stage` on npm can be hidden with
`npm deprecate @salemcobalt/tokens@0.0.0-stage "staging artefact"`, same for `ui`.)

### 3. GitHub App for the stable path

Pushing the version commit to `release` and the merge-back to `main` has to pass branch protection, and
commits made with `GITHUB_TOKEN` trigger no workflows. A GitHub App is the identity for that; rc and
canary runs need none.

1. **Settings → Developer settings → GitHub Apps → New GitHub App.** Name it (for example
   `salemcobalt-release`), any homepage URL, untick _Webhook → Active_. Repository permissions:
   **Contents: Read and write**, **Metadata: Read-only**. _Only on this account._
2. **Generate a private key** (a `.pem` download) and note the **App ID**.
3. **Install App** on `sghoweri/design-system` only.
4. In the repository: **Settings → Secrets and variables → Actions**: variable `RELEASE_APP_ID` = the App
   ID, secret `RELEASE_APP_PRIVATE_KEY` = the full contents of the `.pem` file.
5. **Settings → Rules → Rulesets**: on the `main` ruleset add the App under **Bypass list**
   (_Always allow_) and require the status checks `check` and `release-label`; the `release` ruleset
   requires `check` only (block force pushes and deletion on both; the App in both bypass lists).

Until the App exists, a push to `release` fails at the first step with a message naming the missing
variable; nothing is published half-way.

## Each release

1. Open PRs against `main` with conventional-commit titles or commits (`feat(ui): …`, `fix(tokens): …`)
   for the changelog, and put exactly one label on each: `major`, `minor`, `patch` or `skip-release`.
   The `release-label` check stays red, and the PR cannot merge, until exactly one is there.
2. Merge. The `release` run under **Actions** publishes `X.Y.Z-rc.N` to `next` within a few minutes:

   ```sh
   pnpm add @salemcobalt/tokens@next @salemcobalt/ui@next
   ```

   **Stacked PRs: merge one at a time and wait for GitHub to retarget the next.** A PR whose base is
   another PR's branch is retargeted to `main` only after that branch is merged *and deleted*, and the
   retarget takes a moment. Merging the second PR before its base line reads `into main` lands its
   commits on the first PR's branch, not on `main`: no release runs, and the branch deletion then
   auto-closes every PR further up the stack. If that happens, open a fresh PR against `main` from the
   topmost branch (it carries the whole stack) and label it once; nothing needs reverting. Only the
   release run reads `main`, so squash and merge commits both work, but the base must be `main`.

3. When `main` is ready, open a PR from `main` into `release` and merge it **with a merge commit** (not
   squash), so `release` keeps `main`'s history and the merge-back only adds the version commit.
4. The `release` run tags `vX.Y.Z`, publishes to `latest`, writes `CHANGELOG.md`, creates the GitHub
   release and merges back into `main`.

### Try it without publishing

**Actions → release → Run workflow**, choose `main` (rc path) or `release` (stable path) and leave
_dry-run_ ticked. The version is computed and printed, `CHANGELOG.md` is previewed, and each package
goes through `pnpm publish --dry-run`; nothing is pushed or uploaded. Locally, the same preview is:

```sh
pnpm exec nx release version --preid rc --dry-run
```

### If something fails

- **Stable published `tokens` but not `ui`:** re-run the job. `tokens` is detected on the registry and
  skipped; `ui` publishes; the merge-back runs.
- **Merge-back conflict:** `git switch main && git merge release`, resolve, push. The release itself is
  complete.
- **An rc that should not have gone out:** `npm deprecate` the version. Tags and versions are never
  republished; the next merge to `main` cuts the next rc.

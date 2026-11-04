# Releasing

`@salemcobalt/tokens` and `@salemcobalt/ui` share one version and are released by
[`.github/workflows/release.yml`](../.github/workflows/release.yml). Versions come from
[nx release](https://nx.dev/docs/guides/nx-release) in fixed mode, driven by conventional commits
(configuration in [`nx.json`](../nx.json)); npm authentication is
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

- **Every merge to `main` cuts a release candidate.** The version is computed from the conventional
  commits since the last tag (`feat:` → minor, `fix:` → patch, `feat!:` → major), tagged on the merge
  commit itself, published under the npm dist-tag `next`, and given a GitHub prerelease. `main` carries
  no version commits: rc versions live in tags. Merging again while an rc line is open only bumps the
  rc number (`0.2.0-rc.0` → `0.2.0-rc.1`), whatever the commits say.
- **Merging `main` into `release` cuts the stable version.** The rc suffix is dropped (`0.2.0-rc.3` →
  `0.2.0`), `CHANGELOG.md` gets an entry covering everything since the previous stable tag, the version
  commit is tagged and pushed to `release`, both packages are published under `latest`, a GitHub release
  is created, and the workflow merges `release` back into `main` with a merge commit. A conflict fails
  the run and is resolved by hand; nothing is ever force-pushed.
- **A PR labeled `canary` publishes `0.0.0-canary.<sha7>`** under the dist-tag `canary` on every push,
  and keeps one comment on the PR with the install line. No tag, no release. Remove the label to stop.
- **Labels override the bump.** `release:major`, `release:minor` or `release:patch` on the merged PR
  replaces the conventional-commit bump when a new rc line starts; `release:none` skips the rc.
- **Zero-major rule.** While the version is `0.x`, nx treats `feat:` as a patch bump and a breaking
  change as a minor bump (`adjustSemverBumpsForZeroMajorVersion`, the default). Put `release:minor` on
  the PR when a feature should move the minor.
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
   (_Always allow_), and create the same ruleset for `release` (required status check `check`, or `ci-ok`
   once that lands; block force pushes and deletion; the App in the bypass list).

Until the App exists, a push to `release` fails at the first step with a message naming the missing
variable; nothing is published half-way.

## Each release

1. Open PRs against `main` with conventional-commit titles or commits (`feat(ui): …`, `fix(tokens): …`).
   Add `release:minor` when a feature should move the minor while the version is `0.x`.
2. Merge. The `release` run under **Actions** publishes `X.Y.Z-rc.N` to `next` within a few minutes:

   ```sh
   pnpm add @salemcobalt/tokens@next @salemcobalt/ui@next
   ```

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

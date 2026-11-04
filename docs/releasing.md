# Releasing

`@salemcobalt/tokens` and `@salemcobalt/ui` are published to npm by
[`.github/workflows/release.yml`](../.github/workflows/release.yml) whenever a `vX.Y.Z` tag is pushed. The
workflow authenticates with [npm Trusted Publishing](https://docs.npmjs.com/trusted-publishers) (OpenID
Connect): npm verifies the GitHub Actions run itself, so there is no `NPM_TOKEN` or any other secret in
the repo, and every version ships with a provenance attestation that links it back to the commit and
workflow run.

Versions and `CHANGELOG.md` are still bumped by hand. There is no Changesets, Lerna, Auto or canary
pipeline, by decision.

## One-time setup (Salem, on npmjs.com)

Trusted Publishing is configured per package and can only be added to a package that already exists. Both
packages exist: `0.1.0` was published by hand as `sghoweri` on 2026-11-03 (with `--no-provenance`), so this
can be done right away. For **each** of `@salemcobalt/tokens` and `@salemcobalt/ui`:

1. Open the package on npmjs.com → **Settings** → **Trusted Publisher** → **GitHub Actions**.
2. Fill in:
   - Organization or user: `sghoweri`
   - Repository: `design-system`
   - Workflow filename: `release.yml`
   - Environment name: leave empty (the workflow does not use a GitHub environment)
3. Save. Optionally set **Publishing access** to _Require two-factor authentication and disallow tokens_ so
   the workflow is the only thing that can publish.

Nothing has to be added on the GitHub side: the workflow already requests `id-token: write`, and the
`repository` field in each `package.json` points at `sghoweri/design-system`, which the provenance
attestation requires.

Until the publisher is configured on npm, a release run fails at the publish step with an auth error from
the registry; nothing else in the workflow depends on it. A `v0.1.0` tag would publish nothing, because
both packages are already on the registry at that version; the first release through the workflow is the
next version bump.

## Each release

Both packages share one version, and the workflow refuses a tag that does not match it.

1. Bump `version` in `packages/tokens/package.json` and `packages/ui/package.json` to the same `X.Y.Z`.
2. Move the entries under `## X.Y.Z — unreleased` in `CHANGELOG.md` to a dated heading.
3. Commit, open a PR, merge to `main`.
4. Tag the merge commit and push the tag:

   ```sh
   git switch main && git pull
   git tag vX.Y.Z
   git push origin vX.Y.Z
   ```

5. Watch the `release` run under **Actions**. It lints, builds, typechecks and tests, then publishes
   `@salemcobalt/tokens` and `@salemcobalt/ui` in that order with `pnpm publish --provenance`.

Each package is skipped when its version is already on the registry, so re-running the workflow (for
example after `ui` failed once `tokens` had gone out) only publishes what is missing. A tag can never
republish an existing version; bump and tag again instead. A prerelease version such as `0.2.0-beta.1` is
published under the `next` dist-tag so `latest` keeps pointing at the last stable release.

## Dry run

**Actions → release → Run workflow**, pick the tag, tick _dry-run_. Every check runs and each package goes
through `pnpm publish --dry-run`, which prints the file list and uploads nothing. Running the workflow by
hand from a branch instead of a tag fails on purpose.

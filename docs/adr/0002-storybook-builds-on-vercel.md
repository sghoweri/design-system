# ADR 0002: The Storybook is built by Vercel's Git integration

Date: 2026-11-03
Status: accepted (Salem, 2026-11-03)

## Context

Salem's CI/CD guideline (frontend-architecture, guideline 11, rules 15, 25 and 27) says a commit is
built once: CI builds, and deployments ship that prebuilt output (`vercel deploy --prebuilt`), so Vercel
spends no build minutes repeating work. In this repo `ci.yml` builds the packages and the Storybook on
every push, and the Vercel Git integration (`vercel.json`) builds them again to deploy the Storybook to
<https://designsystem.salemcobalt.com> and to a preview URL per pull request.

Deploying prebuilt output from GitHub Actions needs a Vercel token stored as a GitHub secret, and this
repo keeps no long-lived tokens. The Storybook build takes about a minute, the repository is a public
personal project on GitHub's free Actions minutes, and `vercel.json`'s `ignoreCommand` already skips the
Vercel build when nothing under `packages/`, `apps/storybook/`, `pnpm-lock.yaml` or `vercel.json`
changed.

## Decision

Keep the Vercel Git integration for the Storybook. This is a recorded exception to the build-once rule.

## When this ends

Switch to a prebuilt deploy from CI (and drop `build-storybook` from `ci.yml`, or make Vercel the only
builder) when either happens:

- an application in this repository consumes the design system, so there is more than one deployable
  and the duplicated build is no longer one minute; or
- the Storybook build or Vercel build minutes grow enough to matter on the plan in use.

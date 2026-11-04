# Changelog

Hand-written; the release pipeline is deferred.

## 0.1.1 — unreleased

- `@salemcobalt/ui`: the built entry now starts with `'use client'`, so Button, Card and the rest can be imported straight from a Next.js Server Component (0.1.0 needed a client barrel in the app). Tokens are unchanged and stay at 0.1.0.

## 0.1.0 — 2026-11-03

- `@salemcobalt/tokens`: color primitives and semantic tokens (light and dark), fluid type scale, spacing, radius, elevation, motion, z-index, size and density. Built with Style Dictionary into CSS custom properties, Sass, TypeScript and JSON.
- `@salemcobalt/ui`: Button, Badge, Card, Stack, Inline, Kbd, Dialog, with Vitest coverage and a `fonts` entry that self-hosts IBM Plex Sans (variable) and Plex Mono via Fontsource.
- Spacing scale uses t-shirt names on a modular scale (`spacing-3xs` 2px … `spacing-4xl` 96px); `teal-*` primitives added and used by the new `info` status (`info-subtle`, `info-text`, `info-solid`) and Badge `tone="info"`.
- Storybook with the a11y addon on every story, hosted on Vercel at <https://designsystem.salemcobalt.com> with a preview deployment per pull request.

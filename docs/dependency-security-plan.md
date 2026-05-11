# Dependency Security Remediation Plan

Living plan for clearing the security advisories surfaced by `yarn audit`.
Build-time-only vulnerabilities (e.g., via `node-sass`, `request`, `storybook`,
`eslint`, `jest`, `webpack-*`) are deprioritised because they are not reachable
by users of the deployed app — they only matter for supply-chain hygiene and CI
image scanning, addressed separately when convenient.

The PRs below are ordered low-risk → high-risk so each one is independently
shippable.

## PR 1 — Add `resolutions` for transitive vulns

Pin patched versions of transitive deps via the `resolutions` block in
`package.json`. Targets where a patched version exists and the bump is safe:

- `nanoid` ≥ 3.3.8
- `qs` ≥ 6.14.1
- `brace-expansion` ≥ 2.0.2
- `flatted` ≥ 3.3.3
- `tar` ≥ 6.2.1
- `tar-fs` ≥ 2.1.2

Skipped:

- `lodash-es` — the `_.template` code-injection advisory has no upstream fix;
  mitigation is "don't pass user input to `_.template`".
- `mdast-util-to-hast`, `tough-cookie`, `postcss`, `serialize-javascript` —
  already resolved at a patched version in the lockfile.
- `picomatch` v4 is a major bump that may break webpack-dev-server / micromatch;
  evaluate separately.

## PR 2 — Bump `react-markdown` to latest 9.x

Four call sites; API stable within 9.x. Verifies markdown surfaces (changelogs,
app detail pages).

## PR 3 — Bump `mermaid` to latest 10.x

Single call site (`src/components/UI/Display/Documentation/Mermaid.tsx`).

## PR 4 — Bump `@rjsf/core`, `@rjsf/utils`, `@rjsf/validator-ajv8` to latest 5.x

Heavy use in `src/utils/schema/` but a 5.17 → 5.x patch should be drop-in.
Run schema-related tests deliberately.

## PR 5 — Replace `validate.js`

One file (`src/utils/helpers.ts`). AJV is already a direct dependency and is
the natural replacement. Removes an unfixable ReDoS in an unmaintained package.

## PR 6 — Replace `connected-react-router`

Migrate to `redux-first-history`. Touches ~20 files; mostly import swaps and
store-config tweaks. Independent of the others.

## PR 7 — Bootstrap 3 → 5

Largest item. Remove the Renovate exception in `renovate.json5` (currently
disables `bootstrap` updates). May need to be split into multiple sub-PRs by
layout area.

## Out of scope for this plan

Build-time vulnerabilities (e.g., `node-sass`, `request`, `@storybook/*`,
`eslint`, `jest`, `webpack-*`). These are real but only surface during build
and CI, not in user traffic. Worth cleaning up eventually for supply-chain
hygiene.

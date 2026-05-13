# Dependency Security Remediation — Sweep Record

Record of the runtime-dependency security sweep run in May 2026. Build-time
vulnerabilities (e.g., via `node-sass`, `request`, `@storybook/*`, `eslint`,
`jest`, `webpack-*`) were deliberately left out: they are not reachable by
users of the deployed app and only matter for supply-chain hygiene and CI
image scanning.

`yarn audit` went from 465 findings before the sweep to 362 after.

| PR | Subject | Outcome |
| --- | --- | --- |
| 1 | Pin patched versions of vulnerable transitive deps via `resolutions` | shipped (#4742, #4743) |
| 2 | Bump `react-markdown` to 9.1.0 | shipped (#4744) |
| 3 | Bump `mermaid` | dropped (see below) |
| 4 | Bump `@rjsf/{core,utils,validator-ajv8}` to 5.24.13 | shipped (#4745) |
| 5 | Remove `validate.js` (dead code) | shipped (#4748) |
| 6 | Replace `connected-react-router` with `redux-first-history` | shipped (#4750) |
| 7 | Bootstrap | kept; reasoning below |

## PR 1 — Add `resolutions` for transitive vulns

Pinned patched versions of transitive deps via the `resolutions` block in
`package.json`:

- `nanoid` ≥ 3.3.8
- `qs` ≥ 6.14.1
- `brace-expansion` ≥ 2.0.2
- `flatted` ≥ 3.3.3
- `tar` ≥ 6.2.1 (later bumped to v7 in #4743)
- `tar-fs` ≥ 2.1.2

Skipped:

- `lodash-es` — the `_.template` code-injection advisory has no upstream fix;
  mitigation is "don't pass user input to `_.template`".
- `mdast-util-to-hast`, `tough-cookie`, `postcss`, `serialize-javascript` —
  already resolved at a patched version in the lockfile.
- `picomatch` v4 is a major bump that may break webpack-dev-server / micromatch;
  evaluate separately.

## PR 2 — Bump `react-markdown` to latest 9.x

Four call sites; API stable within 9.x. Verified the markdown surfaces
(changelogs, app detail pages). Also added a `mdast-util-to-hast` resolution
since the bump alone did not move the transitive.

## PR 3 — Bump `mermaid` (dropped)

`mermaid@10.9.5` is already the latest 10.x. The reported vuln is the
`lodash-es` `_.template` code-injection advisory, which has no upstream fix in
any lodash version. `mermaid@11.x` would swap `lodash-es` for `es-toolkit` —
but `lodash-es` is also pulled by `@rjsf/*`, `redux@^3` (transitive via
`connected-react-router`), and `dagre-d3-es`, so the advisory would persist
anyway. Additionally, `mermaid@11` requires `@braintree/sanitize-url ^7.1.1`,
which conflicts with the existing resolution at `6.0.4`. Revisit as a
standalone effort if/when we're ready for the major bump.

## PR 4 — Bump `@rjsf/{core,utils,validator-ajv8}` to latest 5.x

5.17 → 5.24.13 was drop-in apart from one tightened type on
`ArrayFieldTemplateItemType.disabled` (`boolean | undefined`), fixed at the
single affected call site.

## PR 5 — Remove `validate.js`

`validate.js` was used by a single helper, `validateOrRaise`, in
`src/utils/helpers.ts`. The helper was dead code — defined and exported but
only consumed by its own unit test. Deleted the helper, its test, and the
`validate.js` direct dependency outright. No replacement needed.

## PR 6 — Replace `connected-react-router`

Migrated to `redux-first-history`. `connected-react-router` is unmaintained and
pulls in old `history@4.x` and `prop-types`. The replacement keeps the same
Redux action shape (`@@router/LOCATION_CHANGE`, `@@router/CALL_HISTORY_METHOD`)
and re-exports `push` / `replace`, so call sites only needed an import path
swap.

Touched ~30 files: `configureStore`, `rootReducer`, `router/types`,
`main/actions`, `modal/reducer`, `App.tsx`, the entry point, and 22 leaf
components using `push` / `replace`. Behavior change: the dropped
`isFirstRendering` flag on `LOCATION_CHANGE` is harmless because the modal
reducer's initial state is already `visible: false`.

## PR 7 — Bootstrap (kept as-is)

Two advisories apply to `bootstrap@3.4.1`:

- CVE-2024-6485 — XSS in the button plugin's `data-loading-text` attribute
- CVE-2025-1647 — XSS in the Popover and Tooltip plugins

Both are in the JS plugins. We only import
`bootstrap/dist/css/bootstrap.min.css` (see `src/components/index.tsx`); none
of the affected JS is loaded at runtime, so neither advisory is reachable in
the deployed app.

Bootstrap usage is also already minimal — roughly 19 class references across
the codebase, mostly `.well`, `.caret`, `.row`, `.table`. Bumping to v5 would
still require replacing `.well` and `.caret` (both removed in v4+), so the
"upgrade" path is effectively the same amount of work as ripping Bootstrap out
entirely. Neither is justified by the (non-reachable) advisories.

A `//bootstrap` note in `package.json` points at this entry; the Renovate
exception in `renovate.json5` stays in place.

Revisit if either of the following changes: (a) a Bootstrap JS plugin gets
imported anywhere, or (b) `yarn audit` flags a Bootstrap CSS issue.

## Not addressed in this sweep

Build-time vulnerabilities (e.g., `node-sass`, `request`, `@storybook/*`,
`eslint`, `jest`, `webpack-*`). These are real but only surface during build
and CI, not in user traffic. Worth picking up as a follow-up supply-chain
hygiene effort.

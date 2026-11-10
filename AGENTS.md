<!-- BEGIN devctl-managed: edits in this block are overwritten -->
<!-- markdownlint-disable-file MD041 -->

## Giant Swarm conventions

devctl maintains this block from [its template][devctl-agents-block] and
overwrites changes to it. Instructions for this repository go in the section
below. Where they differ from this block, they take precedence.

[devctl-agents-block]: https://github.com/giantswarm/devctl/blob/main/pkg/gen/input/llm/internal/file/agents_block.md.template

- Never put customer names or other customer information in code, commit
  messages, issues or pull requests. Most Giant Swarm repositories are public,
  and private ones are kept ready to become public.
- Giant Swarm's style guides are in <https://github.com/giantswarm/fmt>, one
  directory per topic (go, helm, kubernetes, prometheus, …). Read the relevant
  guide before you write or review that kind of code.
- Use conventional commits for commit messages and pull request titles.
- If `.github/workflows/zz_generated.auto_release.yaml` exists, GitHub Releases
  are written from pull request titles: do not edit CHANGELOG.md. Otherwise,
  add your change to CHANGELOG.md as described in
  <https://github.com/giantswarm/fmt/blob/main/releases/changelog.md>.
- If `.pre-commit-config.yaml` exists, run
  `pre-commit run --files <changed files>` before committing; not every clone
  has the hooks installed.
- Do not add linters, formatters or other tooling unless asked; use what the
  repository already has.
- Put documentation in `docs/` rather than growing README.md, which gives an
  overview and links into `docs/`. When a change affects documented behaviour,
  update the documentation in the same pull request.
- If the skills of the `giantswarm/claude-code` plugin marketplace are not
  available to you and the user works at Giant Swarm, tell them once that
  they can install the `gs-base`, `gs-dev` and `gs-appdev`
  plugins from it.

<!-- END devctl-managed -->

# happa — notes for Claude Code

happa is the Giant Swarm web UI: a React 18 SPA (TypeScript, Redux + redux-thunk,
styled-components, OIDC via `oidc-client-ts`, Sentry for error reporting). The
notes below are non-obvious things that are easy to get wrong — read them before
adding code or tests.

## Package management / Node

- **Package manager is yarn 1 (classic)** (`yarn.lock`). Don't use npm.
- `package.json` pins **`engines.node: "20"`**. On any other local Node version,
  `yarn add`/`yarn install` fail the engine check — add `--ignore-engines`
  (local only; don't change the pin).
- Dependencies are pinned **exact** (no `^`), e.g. `"react": "18.3.1"`. Install
  new deps with `yarn add --exact <pkg>@<version>`.

## Imports

- Absolute imports resolve from **both `src/` and `src/components/`**
  (tsconfig `paths: "*": ["src/components/*", "src/*"]`, plus jest
  `moduleDirectories`). So `model/...`, `utils/...` are `src`-rooted, while
  `Route`, `UI/...`, `Auth/...`, `MAPI/...` are `src/components`-rooted. Both
  forms are correct — match the surrounding file.

## Tests (jest)

- **Test files are named after the module under test**, inside a `__tests__/`
  dir — e.g. `src/utils/errors/__tests__/ErrorReporter.ts`, NOT
  `ErrorReporter.test.ts`. Jest's default `testMatch` picks up everything under
  `__tests__/`.
- `window.config` and `window.featureFlags` are injected into **every** test via
  `globals` in `jest.config.ts`, with **`environment: 'development'`**. Code
  gated on the environment therefore runs in *dev* mode by default in tests;
  override `window.config.environment` per-test to exercise other branches.
- Useful scripts: `yarn test`, `yarn typecheck` (`tsc`), `yarn lint`
  (`eslint --ext .js,.ts,.tsx ./src/`), `yarn lint:fix`.

## Environment & config

- `GlobalEnvironment` (`src/@types/global.d.ts`) is
  **`'development' | 'kubernetes' | 'docker-container'`** — there is no
  `'production'`/`'staging'`. Runtime config (`apiEndpoint`, `environment`,
  installation info, feature flags, Sentry DSN, …) is injected into
  `window.config` / `window.featureFlags` by the EJS template at serve time.

## Routing & auth state

- **React Router v5** (not v6), integrated with `redux-first-history`. Current
  location is in Redux at `state.router.location`; routing hooks/`matchPath`
  come from `react-router`.
- Auth lives in Redux at `state.main.loggedInUser` (selector `getLoggedInUser`).
  `components/Layout.tsx` is the authenticated root (redirects to `/login` when
  there's no user); `/login`, `/admin-login`, `/logout` render outside it.

## Build artifacts

- The app shell is `src/index.ejs`, rendered by webpack's `HtmlWebpackPlugin`.
  **`dist/` is a gitignored build artifact** — never edit files in `dist/`
  (e.g. a stale `dist/index.ejs`); only change `src/index.ejs`.

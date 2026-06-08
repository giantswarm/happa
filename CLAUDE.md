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

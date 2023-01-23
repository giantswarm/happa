[![CircleCI](https://circleci.com/gh/giantswarm/happa/tree/main.svg?style=shield&circle-token=6e98ba111259986b590f228cd20e20fcea3dd2e5)](https://circleci.com/gh/giantswarm/happa/tree/master)
[![Docker Repository on Quay](https://quay.io/repository/giantswarm/happa/status 'Docker Repository on Quay')](https://quay.io/repository/giantswarm/happa)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=shield)](https://github.com/prettier/prettier)
[![Known Vulnerabilities](https://snyk.io/test/github/giantswarm/happa/badge.svg?targetFile=package.json)](https://snyk.io/test/github/giantswarm/happa?targetFile=package.json)

# Happa

The Giant Swarm web user interface. It lets users:

- View and manage clusters
- Install and manage applications from an app catalog
- Manage their account
- Add / remove organizations
- Add / remove members from organizations
- Learn how to get started with their kubernetes clusters by following a guide

Happa is intended to be deployed to Giant Swarm management clusters and acts as a client to the Giant Swarm API.

![Screenshot of Happa](https://user-images.githubusercontent.com/273727/117794608-aecf9e00-b24d-11eb-8d3d-7a7b9a9f270f.png)

Happa is a single page JavaScript application using React+Redux and runs in modern browsers.

## Getting started with development

### Prerequisites

To run happa locally, you need:

- [NodeJS 16](https://nodejs.org/)
- [`yarn`](https://yarnpkg.com/)
- [`kubectl`](https://github.com/giantswarm/kubectl) - Necessary to use happa against a Giant Swarm installation.

### Quick start

Install dependencies:

```nohighlight
yarn install
```

Some warnings regarding unmatched dependency versions are expected and can be ignored.

Then, to bring up Happa connected to an installation, you need to have a `kubectl` context that points to the installation's management cluster. You also need to have `get` permissions for the `happa-configmap` `ConfigMap`, in the `giantswarm` namespace.

You can log into the installation's management cluster using the [kubectl gs](https://github.com/giantswarm/kubectl-gs) plugin. Here's how you would start Happa after using the plugin to log into the `gauss` installation:

```nohighlight
HAPPA_KUBECTL_CONTEXT=gs-gauss yarn start
```

### Running tests

Execute the test suite using

```nohighlight
yarn test
```

## Releasing

Tagged releases are continuously deployed to all installations, both test and production.
For details see [Release.md](docs/Release.md)

## User interface components

We are maintaining a [Storybook](https://fe-docs.giantswarm.io/) showcasing more and more of our UI components.

## Configuration

Use environment variables or a configuration file to adjust the behaviour of the application in production.

These configuration values affect the config object in `index.html` (which is
created from `index.ejs`).
A configuration script (`prepare.ts`) applies the values from the configuration values
to `index.html` by templating `index.ejs` and creating the `index.html` file. This way Happa remains a fully static website
that can be served by `nginx`.

In development, these configuration values are applied using the `ConfigurationPlugin` via `webpack`, which generates index.html.

## Redux in a nutshell

```
╔═════════╗       ╔══════════╗       ╔═══════════╗       ╔═════════════════╗
║ Actions ║──────>║ Reducers ║──────>║   Store   ║──────>║ View Components ║
╚═════════╝       ╚══════════╝       ╚═══════════╝       ╚═════════════════╝
     ^                                                           │
     └───────────────────────────────────────────────────────────┘
```

Components should only emit actions.

Reducers listen for actions and emit a new state.

The view listens for changes to the state and renders.

By following these guidelines we should get some benefits in keeping component
logic focused on rendering, and not on doing the actual work of manipulating
state.

## Icons

Happa uses a custom icon pack which we can manage at https://fortawesome.com
Login details are in keypass, search for 'fortawesome'.
The line

```html
<script src="https://use.fonticons.com/d940f7eb.js"></script>
```

in `src/index.ejs` is what includes the fonts for us.

More information about our font kit and how to use it can be found here:
https://fortawesome.com/kits/d940f7eb/docs

## Updating dependencies

Dependabot is configured to automatically create pull requests (PRs) that update our dependencies
when they go stale. After approval and a `@dependabot merge` comment, dependabot
automatically merges open PRs.

## Coding style

Happa's code style is determined by `prettier`. There is a pre-commit hook enforcing that
the coding style rules are met. A CI step will also avoid building any code that does not
match expectations, which then surfaces in the pull request checks in Github.

You can run `prettier` on the whole codebase using `yarn prettier`.

We use the following config params:

- `--jsx-single-quote`
- `--single-quote`
- `--trailing-comma es5`

## Pre-commit hooks

To avoid pushing code that will fail the CI due to codestyle issues, we've added a pre-commit hook using [`husky`](https://github.com/typicode/husky/).

This runs before every commit, and it will not let commits go through if the `prettier` check has not passed.

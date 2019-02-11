[![CircleCI](https://circleci.com/gh/giantswarm/happa/tree/master.svg?style=shield&circle-token=6e98ba111259986b590f228cd20e20fcea3dd2e5)](https://circleci.com/gh/giantswarm/happa/tree/master)
[![Docker Repository on Quay](https://quay.io/repository/giantswarm/happa/status?token=f90886ab-d4af-4c3f-b814-45bc317c2cd6 "Docker Repository on Quay")](https://quay.io/repository/giantswarm/happa)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=shield)](https://github.com/prettier/prettier)

# Happa

The Giant Swarm web user interface. It lets users:

- View and manage clusters
- Manage their account
- Add / remove organizations
- Add / remove members from organizations
- Learn how to get started with their kubernetes clusters by following a guide

Happa is intended to be deployed to Giant Swarm control planes and acts as a client to the Giant Swarm API.

![Screenshot of Happa](https://user-images.githubusercontent.com/455309/51164968-a5320780-18d9-11e9-91c5-10ad144d7ada.png)

Happa is a single page JavaScript application using React and runs in modern browsers.

## Getting started with development / demoing

Happa has to be configured for an API endpoint. There are two alternative methods
when running happa locally:

- (A) Bring up the API suite locally. See [giantswarm/api/](https://github.com/giantswarm/api/tree/master/testing) for details.
- (B) Modify the base config in [index.html](https://github.com/giantswarm/happa/blob/master/src/index.html) to point to a test installation.

### For (A) – Bring up the API suite locally

This requires Docker and `docker-compose`.

Start the `api` and dependencies first by going to the `api` repo and running
the dockercompose file there:

```nohighlight
cd $GOPATH/src/github.com/giantswarm/api/testing
make up
```

As part of `make up`, `./fixtures.sh` will run and create the initial user and
organization you can log in with.

### For (B)

Find the `apiEndpoint` setting and set it to the API endpoit of the test
installation you want to use.

If you want to test password resetting and other user account transactions,
also adapt `passageEndpoint`.

### For (A) and (B)

You should now be able to start happa's development server from within this
(giantswarm/happa) repo like so:

```nohighlight
docker-compose up --build
```
It can take a minute or two for dependencies to be available.
Wait for a line like `: Compiled successfully.` to appear in the console.
This shows that the dev server is ready to handle requests.

Then visit http://localhost:7000/

Any code changes should cause the browser to reload automatically.

Once everything is up you can log in as `developer@giantswarm.io` with
`password` as your password.

If you want to test out things like the forgot password feature, all e-mail ends up in
the mailcatcher app running at http://localhost:1080/

## Tear down the dev / demo environment

Hit `Ctrl-C` to escape from `docker-compose` log output.

Use `docker-compose stop` to stop containers or `docker-compose down` to remove them.

Running tests
-------------

There are no automated tests for Happa at the moment.

Deploying
---------

This project is continuously deployed to our installations using CircleCI.

Building / Running locally
--------------------------

If you want to test locally `make production` will build and run
Happa's production container.

Happa makes use of the development container to produce production assets.
The production container then takes those assets and serves them using nginx.

The build process is as follows:

0. Build the development container `make docker-build-dev`

1. Create production assets using the development container (`grunt build`), save them in the
dist folder. `make dist`

2. Create the production container `make docker-build-prod`

Configuration
-------------

Use environment variables to adjust the behavior of this application in production.

|Variable Name|Description|Default|
|-------------|-----------|-------|
|API_ENDPOINT |URL to Giant Swarm's API.|http://docker.dev:9000|
|PASSAGE_ENDPOINT|URL to Passage, which helps users when they lose their password or have been invited to create an account.|http://docker.dev:5001|
|INGRESS_BASE_DOMAIN|The ingress base domain of the installation that Happa is on. This affects the getting started guide.|k8s.sample.io|
|AWS_CAPABILITIES_JSON|A JSON array representing all the details of AWS instance types. This has been extracted so that we have a single point of truth for this information||
|AZURE_CAPABILITIES_JSON|A JSON array representing all the details of Azure vm sizes. This has been extracted so that we have a single point of truth for this information||
|ENVIRONMENT  |A string that indicates where Happa is running. |development|

These environment variables affect the config object in `index.html`.
A startup script (`start.sh`) applies the values from the environment variables
to `index.html` by editing the file. This way Happa remains a fully static website
that can be served by nginx.

In development, environment variables are not applied. This is because the development container
does not start in the same way that the production container does.

Redux in a nutshell
--------------------
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

Icons
-----

Happa uses a custom icon pack which we can manage at https://fortawesome.com
Login details are in keypass, search for 'fortawesome'.
The `<script src="https://use.fonticons.com/d940f7eb.js"></script>` line in
index.html is what includes the file for us.

More information about our font kit and how to use it can be found here:
https://fortawesome.com/kits/d940f7eb/docs


Checking for outdated dependencies
----------------------------------

To see what dependencies have updates run `make npm-check-updates`


Code Style
----------

Happa's Code Style is determined by `prettier`. Please make sure files in the
`src` directory have passed through `prettier` before committing them to the repo.

A CI step will enforce that this has happened, failing the CI if it detects that
`prettier` would make any changes.

You can run `prettier` on the whole codebase using `yarn run prettier`.

We use the following config params:
- `--jsx-single-quote`
- `--single-quote`
- `--trailing-comma es5`


### Pre commit hooks

To avoid pushing code that will fail the CI due to codestyle issues, you can add
the following as a pre-commit hook.

```bash
#!/bin/bash

git diff --name-only --cached | grep "\.js$"

if [ $? -eq 0 ]; then
  make validate-prettier
fi
```

To add a pre-commit hook, save the above as a file called `pre-commit` in the
`.git/hooks` folder.

Make sure it has has `0755` as the permission.

[![CircleCI](https://circleci.com/gh/giantswarm/happa/tree/master.svg?style=shield&circle-token=6e98ba111259986b590f228cd20e20fcea3dd2e5)](https://circleci.com/gh/giantswarm/happa/tree/master)
[![Docker Repository on Quay](https://quay.io/repository/giantswarm/happa/status?token=f90886ab-d4af-4c3f-b814-45bc317c2cd6 "Docker Repository on Quay")](https://quay.io/repository/giantswarm/happa)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=shield)](https://github.com/prettier/prettier)

# Happa

Giant Swarm's web interface. It lets users:

- View and manage clusters
- Manage their account
- Add / remove organizations
- Add / remove members from organizations
- Learn how to get started with their kubernetes clusters by following a guide

You can see it in action at: https://happa-g8s.giantswarm.io

![Screenshot of Happa](https://cloud.githubusercontent.com/assets/455309/22954790/c31fb514-f318-11e6-8ca3-33cece9e9094.png)

It is a Single Page React Application that runs in modern browsers.

It currently depends on `api` and `passage`.

## Getting started with development / demoing

Requirements:
 - `docker`,
 - `giantswarm/api`


Start the `api` and dependencies first by going to the `api` repo and running
the dockercompose file there:

```
cd $GOPATH/src/github.com/giantswarm/api/testing
docker-compose up -d
docker-compose up -d cluster-service userd companyd    # sometimes these services start too soon and crash
./fixtures.sh
```

`./fixtures.sh` will create the initial user and organization you can log in with.

You should now be able to start happa's development server with:

```
# From this repo, so no longer in api/testing
make develop
```

Then visit `localhost:7000`

Any changes should cause the browser to reload automatically.

Once everything is up you can log in as `developer@giantswarm.io` with
`password` as your password.

If you want to test out things like the forgot password feature, all e-mail ends up in
the mailcatcher app running at `localhost:1080`

## Tear down the dev / demo environment

Pressing `ctrl-c` after `make develop` will not stop the development environment.
You should `docker-compose down && docker-compose rm` to fully clean up
after yourself.

Running tests
-------------

There are no automated tests for Happa at the moment.

Deploying
---------

This project is continuously deployed to G8S using CircleCI.

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
|ENVIRONMENT  |A string that indicates where Happa is running. |development|

In development, environment variables are not applied. This is because the development container does not start in the same way
that the production container does.

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

Happa
=====

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

Requirements: `docker`

You should be able to start the development server with:

`make develop`

Then visit `localhost:8000/webpack-dev-server/`

Any changes should cause the browser to reload automatically.

Happa will also be up at: `docker.dev:8000`, without the auto reloading feature.
You can use this to demo Happa and features like cluster creation.

It is important that you have a entry in your `hosts` file that points `docker.dev`
to your docker host.

Once everything is up you can log in as `developer@example.com` with
`correct_password` as your password.

If you want to test out things like the forgot password feature, all e-mail ends up in
the mailcatcher app running at `docker.dev:1080`

## Tear down the dev / demo environment

Pressing `ctrl-c` after `make develop` will not stop the development environment.
You should `docker-compose down && docker-compose rm` to fully clean up
after yourself.

Running tests
-------------

`make test`

There is only one sanity test at the moment though.

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
|DOMAIN_VALIDATOR_ENDPOINT|URL to the Domain Validator service, which helps in the custom domains feature .|http://docker.dev:5001|
|INTERCOM_APP_ID|The ID of Giant Swarm's intercom app. The default is our development intercom account.|bdvx0cb8|
|ENVIRONMENT  |A string that indicates where Happa is running. It'll be present in any exception notifications|development|
|CREATE_CLUSTER_WORKER_TYPE|A string that indicates what kind of workers the cluster that this instance of Happa is deployed is making. Must be either 'aws' or 'kvm'| kvm|

In development, environment variables are not applied. This is because the development container does not start in the same way
that the production container does.

If you want to for example test creating clusters in an aws environment in development, you'll have to edit `createClusterWorkerType` in index.html manually while testing your changes.

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

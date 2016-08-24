Happa Interface Prototype
-------------------------

This is Giant Swarm's interface. It lets users:

- View and manage clusters
- Manage their account
- Manage billing information


Getting started
---------------

Requirements: docker

You should be able to start the development server with:

`make develop`

Then visit `docker.dev:8000/webpack-dev-server/`

Any changes should cause the browser to reload automatically

Running tests
-------------

`make test`

No tests at the moment though

Building / Running for production
----------------------------------

`make production` will build and run happa's production container.

Happa makes use of a development container to produce production assets.
A production container then takes those assets and serves them using nginx.

The build process is as follows:

0. Build the development container `make docker-build-dev`

1. Create production assets using the development container, save them in the
dist folder. `make dist`

2. Create the production container `make docker-build-prod`


Configuration
-------------

Use environment variables to adjust the behavior of this application.


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
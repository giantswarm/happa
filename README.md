Happa Interface Prototype
-------------------------

This is Giant Swarm's interface prototype / experiment. It is meant to help us
get feedback on the types of complex interactions we are going to make and how
best to implement them.


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


Configuration
-------------

Use environment variables to adjust the behavior of this application.


ReFlux in a nutshell
--------------------
```
╔═════════╗       ╔════════╗       ╔═════════════════╗
║ Actions ║──────>║ Stores ║──────>║ View Components ║
╚═════════╝       ╚════════╝       ╚═════════════════╝
     ^                                      │
     └──────────────────────────────────────┘
```
Components should only emit actions.

Actions affect the store.

The store emits the newly changed object.

The view listens for changes to the store and updates its state.

By following these guidelines we should get some benefits in keeping component
logic focused on rendering, and not on doing the actual work of manipulating
state.
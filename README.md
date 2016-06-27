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

Building for production
-----------------------

Build the production docker container with:

`make production`

You'll want to do this if you want to test the production container locally.
It creates a container called `happa`

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


Icons
-----

Happa uses a custom icon pack which we can manage at https://fortawesome.com
Login details are in keypass, search for 'fortawesome'.
The `<script src="https://use.fonticons.com/d940f7eb.js"></script>` line in
index.html is what includes the file for us.

More information about our font kit and how to use it can be found here:
https://fortawesome.com/kits/d940f7eb/docs
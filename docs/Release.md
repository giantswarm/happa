# How to publish a release

TL;DR: Releasing involves pushing a tag to the GitHub repository. Our CI takes
over from there and auto deploys the release to our installations.

## Prerequisites

CircleCI must be set up with certain environment variables:

- `RELEASE_TOKEN` - A GitHub token with the permission to write to repositories
  - [giantswarm/happa](https://github.com/giantswarm/gsctl/)
- `GITHUB_USER_EMAIL` - Email address of the github user owning the personal token above
- `GITHUB_USER_NAME` - Username of the above github user

## Create and push a new release

All you have to do is push a tag. CI will take care of it from there.

Follow CircleCI's progress in https://circleci.com/gh/giantswarm/happa/.

### Semantic versioning (semver) semantics

Releases are numbered after the semver system. As the notion of a breaking bs. non-breaking change isn't very meaningful for a GUI application, here is the system we apply:

- Patch bump for smallest changes or fixes that will apply without the user knowing about them
- Minor bump for changes (usually additions) in functionality that will require users to know about them in order to benefit from them
- Major bump for releases that combine several changes that would normally cause minor bumps, but in sum are so significant that we think every user should know about them. Like a major design change, or a change in the information architecture.

## Edit and publish the release

Open the [release draft](https://github.com/giantswarm/happa/releases/) on Github.

Edit the description to inform about what has changed since the last release.
Save and publish the release.

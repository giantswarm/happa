# How to publish a release

TL;DR: Releasing is done via the GitHub release functions. Our CI takes
over from there and auto deploys the release to our installations.

## Create and push a new release

Read [here](https://intranet.giantswarm.io/docs/dev-and-releng/happa-release/) for the explanation of the manual steps to take.

## Prerequisites

CircleCI must be set up with certain environment variables:

- `RELEASE_TOKEN` - A GitHub token with the permission to write to repositories
  - [giantswarm/happa](https://github.com/giantswarm/gsctl/)
- `GITHUB_USER_EMAIL` - Email address of the github user owning the personal token above
- `GITHUB_USER_NAME` - Username of the above github user

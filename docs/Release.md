# How to publish a release

TL;DR: Releasing is done via the GitHub release functionality. Our CI takes
over from there and auto deploys the release to our installations.

## Create and push a new release

Read [here](https://intranet.giantswarm.io/docs/dev-and-releng/releases/happa/) for the explanation of the manual steps to take.

## Prerequisites

CircleCI must be set up with certain environment variables:

- `RELEASE_TOKEN` - A GitHub token with the permission to write to repositories
- `SENTRY_API_KEY` - A Sentry token with admin access to releases and read access to organizations

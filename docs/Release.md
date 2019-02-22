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

## Edit and publish the release

Open the [release draft](https://github.com/giantswarm/happa/releases/) on Github.

Edit the description to inform about what has changed since the last release.
Save and publish the release.

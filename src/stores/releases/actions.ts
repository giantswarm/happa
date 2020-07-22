import GiantSwarm from 'giantswarm';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import { IState } from 'reducers/types';
import cmp from 'semver-compare';

import { createAsynchronousAction } from '../asynchronousAction';
import { IReleaseActionResponse } from './types';

export const loadReleases = createAsynchronousAction<
  void,
  IState,
  IReleaseActionResponse
>({
  actionTypePrefix: 'RELEASES_LOAD',
  perform: async (state) => {
    const releases: IReleases = {};
    let sortedReleaseVersions: string[] = [];

    const api = new GiantSwarm.ReleasesApi();
    const response = await api.getReleases();

    for (const release of response) {
      const kubernetesVersion = release.components.find(
        (component) => component.name === 'kubernetes'
      )?.version;

      const releaseNotesURL = release.changelog[0].description;

      if (kubernetesVersion) {
        releases[release.version] = {
          ...release,
          kubernetesVersion,
          releaseNotesURL,
        };
      }
    }

    sortedReleaseVersions = Object.keys(releases).sort(cmp).reverse();

    const userIsAdmin = state.main.loggedInUser.isAdmin;

    if (sortedReleaseVersions.length === 0 && !userIsAdmin) {
      new FlashMessage(
        'No active releases available at the moment.',
        messageType.INFO,
        messageTTL.FOREVER,
        'There is no active release yet. To create a cluster you will need admin permissions.'
      );
    }

    return { releases, sortedReleaseVersions };
  },
  shouldPerform: () => true,
  throwOnError: false,
});

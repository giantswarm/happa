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
    const allReleases: IReleases = {};
    let sortedReleaseVersions: string[] = [];

    const api = new GiantSwarm.ReleasesApi();
    const response = await api.getReleases();

    const userIsAdmin = state.main.loggedInUser.isAdmin;

    for (const release of response) {
      const kubernetesVersion = release.components.find(
        (component) => component.name === 'kubernetes'
      )?.version;

      const releaseNotesURL = release.changelog[0].description;

      if (kubernetesVersion) {
        const r = {
          ...release,
          kubernetesVersion,
          releaseNotesURL,
        };

        if (userIsAdmin || release.active) {
          releases[release.version] = r;
        }
        allReleases[release.version] = r;
      }
    }

    sortedReleaseVersions = Object.keys(releases).sort(cmp).reverse();

    if (sortedReleaseVersions.length === 0 && !userIsAdmin) {
      new FlashMessage(
        'No active releases available at the moment.',
        messageType.INFO,
        messageTTL.FOREVER,
        'There is no active release yet. To create a cluster you will need admin permissions.'
      );
    }

    return { releases, allReleases, sortedReleaseVersions };
  },
  shouldPerform: () => true,
  throwOnError: false,
});

import GiantSwarm from 'giantswarm';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import { getUserIsAdmin } from 'stores/main/selectors';
import { RELEASES_LOAD } from 'stores/releases/constants';
import { IState } from 'stores/state';

import { createAsynchronousAction } from '../asynchronousAction';
import { IReleaseLoadActionResponse } from './types';

export const loadReleases = createAsynchronousAction<
  void,
  IState,
  IReleaseLoadActionResponse
>({
  actionTypePrefix: RELEASES_LOAD,
  perform: async (state) => {
    const releases: IReleases = {};

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

    const userIsAdmin = getUserIsAdmin(state);

    if (Object.keys(releases).length === 0 && !userIsAdmin) {
      new FlashMessage(
        'No active releases available at the moment.',
        messageType.INFO,
        messageTTL.FOREVER,
        'There is no active release yet. To create a cluster you will need admin permissions.'
      );
    }

    return { releases };
  },
  shouldPerform: () => true,
  throwOnError: false,
});

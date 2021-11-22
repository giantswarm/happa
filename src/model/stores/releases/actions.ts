import GiantSwarm from 'giantswarm';
import { getUserIsAdmin } from 'model/stores/main/selectors';
import { RELEASES_LOAD } from 'model/stores/releases/constants';
import { IState } from 'model/stores/state';
import { getK8sVersionEOLDate } from 'utils/config';
import { FlashMessage, messageTTL, messageType } from 'utils/flashMessage';

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
      const releasePatch: Partial<IRelease> = {};

      const kubernetesVersion = release.components.find(
        (component) => component.name === 'kubernetes'
      )?.version;
      if (kubernetesVersion) {
        releasePatch.kubernetesVersion = kubernetesVersion;
        releasePatch.k8sVersionEOLDate =
          getK8sVersionEOLDate(kubernetesVersion) ?? undefined;
      }

      releasePatch.releaseNotesURL = release.changelog[0].description;

      releases[release.version] = {
        ...release,
        ...releasePatch,
      };
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

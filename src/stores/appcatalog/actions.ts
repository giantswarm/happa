import GiantSwarm from 'giantswarm';
import CPAuth from 'lib/CPAuth';
import CPClient from 'model/clients/CPClient';
import { getAppCatalogs } from 'model/services/controlplane/appcatalogs/appcatalogs';
import { IAppCatalog } from 'model/services/controlplane/appcatalogs/types';

import { createAsynchronousAction } from '../asynchronousAction';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const listCatalogs = createAsynchronousAction<any, any, any>({
  actionTypePrefix: 'LIST_CATALOGS',

  perform: async () => {
    const isCPOn = true;

    let catalogs: IAppCatalog[] = [];

    if (isCPOn) {
      const cpAuth = CPAuth.getInstance();
      const user = await cpAuth.getLoggedInUser();
      if (!user) {
        throw new Error('You are not allowed to use this command.');
      }

      const client = new CPClient(user.idToken, user.authorizationType);

      catalogs = await getAppCatalogs(client);
    } else {
      const appsApi = new GiantSwarm.AppsApi();
      const catalogsIterable = await appsApi.getAppCatalogs(); // Use model layer?
      catalogs = Array.from(catalogsIterable);
    }

    // Turn the array response into a hash where the keys are the catalog names.
    const catalogsHash = catalogs.reduce(
      (agg: Record<string, IAppCatalog>, currCatalog) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (currCatalog as any).isFetchingIndex = false;

        agg[currCatalog.metadata.name] = currCatalog;

        return agg;
      },
      {}
    );

    return catalogsHash;
  },
  shouldPerform: () => true,
});

import GiantSwarm from 'giantswarm';
import CPAuth from 'lib/CPAuth';
import CPClient from 'model/clients/CPClient';
import { getAppCatalogs } from 'model/services/controlplane/appcatalogs/appcatalogs';
import { IAppCatalog } from 'model/services/controlplane/appcatalogs/types';
import { IState } from 'reducers/types';
import { IAppCatalogsState, IStoredAppCatalog } from 'stores/appcatalog/types';

import { createAsynchronousAction } from '../asynchronousAction';

export const listCatalogs = createAsynchronousAction<
  undefined,
  IState,
  IAppCatalogsState
>({
  actionTypePrefix: 'LIST_CATALOGS',

  perform: async (): Promise<IAppCatalogsState> => {
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
      (agg: IAppCatalogsState, currCatalog) => {
        const catalog: IStoredAppCatalog = currCatalog as IStoredAppCatalog;
        catalog.isFetchingIndex = false;

        agg[currCatalog.metadata.name] = catalog;

        return agg;
      },
      {}
    );

    return catalogsHash;
  },
  shouldPerform: () => true,
});

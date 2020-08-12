import GiantSwarm from 'giantswarm';
import { IOAuth2User } from 'lib/OAuth2/OAuth2User';
import CPClient from 'model/clients/CPClient';
import { getAppCatalogs } from 'model/services/controlplane/appcatalogs/appcatalogs';
import { IAppCatalog } from 'model/services/controlplane/appcatalogs/types';
import { IState } from 'reducers/types';
import FeatureFlags from 'shared/FeatureFlags';
import { IAppCatalogsMap, IStoredAppCatalog } from 'stores/appcatalog/types';
import { getCPAuthUser } from 'stores/cpauth/selectors';

import { createAsynchronousAction } from '../asynchronousAction';

export const listCatalogs = createAsynchronousAction<
  undefined,
  IState,
  IAppCatalogsMap
>({
  actionTypePrefix: 'LIST_CATALOGS',

  perform: async (currentState: IState): Promise<IAppCatalogsMap> => {
    let catalogs: IAppCatalog[] = [];

    let cpAuthUser: IOAuth2User | null = null;
    if (FeatureFlags.FEATURE_CP_ACCESS) {
      cpAuthUser = getCPAuthUser(currentState);
    }

    if (cpAuthUser) {
      const client = new CPClient(
        cpAuthUser.idToken,
        cpAuthUser.authorizationType
      );

      catalogs = await getAppCatalogs(client);
    } else {
      const appsApi = new GiantSwarm.AppsApi();
      const catalogsIterable = await appsApi.getAppCatalogs(); // Use model layer?
      catalogs = Array.from(catalogsIterable);
    }

    // Turn the array response into a hash where the keys are the catalog names.
    const catalogsHash = catalogs.reduce(
      (agg: IAppCatalogsMap, currCatalog: IAppCatalog) => {
        (currCatalog as IStoredAppCatalog).isFetchingIndex = false;

        agg[currCatalog.metadata.name] = currCatalog as IStoredAppCatalog;

        return agg;
      },
      {}
    );

    return catalogsHash;
  },
  shouldPerform: () => true,
  throwOnError: false,
});

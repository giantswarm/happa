import GiantSwarm from 'giantswarm';

import { createAsynchronousAction } from '../asynchronousAction';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const listCatalogs = createAsynchronousAction<any, any, any>({
  actionTypePrefix: 'LIST_CATALOGS',

  perform: async (_state) => {
    const appsApi = new GiantSwarm.AppsApi();
    const catalogs = await appsApi.getAppCatalogs(); // Use model layer?

    // Turn the array response into a hash where the keys are the catalog names.
    const catalogsHash = Array.from(catalogs).reduce((agg, currCatalog) => {
      currCatalog.isFetchingIndex = false;
      agg[currCatalog.metadata.name] = currCatalog;

      return agg;
    }, {});

    return catalogsHash;
  },
  shouldPerform: () => true,
  throwOnError: false,
});

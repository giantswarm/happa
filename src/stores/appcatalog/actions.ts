import GiantSwarm from 'giantswarm';

import { createAsynchronousAction } from '../asynchronousAction';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const listCatalogs = createAsynchronousAction<any, any, any>({
  actionTypePrefix: 'LIST_CATALOGS',

  perform: async (_state) => {
    const appsApi = new GiantSwarm.AppsApi();
    const catalogs = await appsApi.getAppCatalogs(); // Use model layer?

    // Filter out 'internal' catalogs and turn it into a hash where the keys
    // are catalog names.
    const catalogsHash = Array.from(catalogs).reduce((agg, currCatalog) => {
      const labels = currCatalog?.metadata?.labels;
      const catalogType = labels?.['application.giantswarm.io/catalog-type'];

      // Skip if the catalog is internal.
      if (catalogType === 'internal') {
        return agg;
      }

      currCatalog.isFetchingIndex = false;
      agg[currCatalog.metadata.name] = currCatalog;

      return agg;
    }, {});

    return catalogsHash;
  },
  shouldPerform: () => true,
});

import { catalogLoadIndex } from 'actions/catalogActions';
import GiantSwarm from 'giantswarm';
import { IState } from 'reducers/types';
import { selectIngressCatalog } from 'selectors/ingressTabSelectors';
import { Constants } from 'shared';
import { IInstallIngress } from 'stores/appcatalog/types';
import { installApp, loadClusterApps } from 'stores/clusterapps/actions';

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

export const installLatestIngress = createAsynchronousAction<
  IInstallIngress,
  IState,
  void
>({
  actionTypePrefix: 'INSTALL_INGRESS_APP',
  perform: async (state, dispatch, payload) => {
    if (payload?.clusterId) {
      const gsCatalog = selectIngressCatalog(state);

      const { name, version } = gsCatalog.apps[
        Constants.INSTALL_INGRESS_TAB_APP_NAME
      ][0];

      const appToInstall = {
        name,
        chartName: name,
        version,
        catalog: Constants.INSTALL_INGRESS_TAB_APP_CATALOG_NAME,
        namespace: 'kube-system',
        valuesYAML: '',
        secretsYAML: '',
      };

      await dispatch(
        installApp({ app: appToInstall, clusterId: payload.clusterId })
      );
      await dispatch(loadClusterApps({ clusterId: payload.clusterId }));
    }
  },
  shouldPerform: (state) => {
    // only allow performing if we have loaded the catalog and have a version
    const gsCatalog = selectIngressCatalog(state);

    const app = gsCatalog?.apps?.[Constants.INSTALL_INGRESS_TAB_APP_NAME]?.[0];

    return gsCatalog && app;
  },
  throwOnError: false,
});

export const prepareIngressTabData = createAsynchronousAction<
  IInstallIngress,
  IState,
  void
>({
  actionTypePrefix: 'PREPARE_INGRESS_TAB_DATA',
  perform: async (state, dispatch, payload) => {
    if (payload?.clusterId) {
      const gsCatalog = selectIngressCatalog(state);

      await Promise.all([
        dispatch(loadClusterApps({ clusterId: payload.clusterId })),
        catalogLoadIndex(gsCatalog)(dispatch, () => state),
      ]);
    }
  },
  shouldPerform: () => true,
  throwOnError: false,
});

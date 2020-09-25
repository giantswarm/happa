import GiantSwarm from 'giantswarm';
import yaml from 'js-yaml';
import ErrorReporter from 'lib/errors/ErrorReporter';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import { IOAuth2User } from 'lib/OAuth2/OAuth2User';
import CPClient from 'model/clients/CPClient';
import { getAppCatalogs } from 'model/services/controlplane/appcatalogs/appcatalogs';
import { IState } from 'reducers/types';
import { ThunkAction } from 'redux-thunk';
import { Constants, StatusCodes } from 'shared/constants';
import FeatureFlags from 'shared/FeatureFlags';
import {
  CATALOG_LOAD_INDEX_ERROR,
  CATALOG_LOAD_INDEX_REQUEST,
  CATALOG_LOAD_INDEX_SUCCESS,
  CATALOGS_LIST,
  CATALOGS_LOAD_ERROR,
  CATALOGS_LOAD_REQUEST,
  CATALOGS_LOAD_SUCCESS,
  INSTALL_INGRESS_APP,
  PREPARE_INGRESS_TAB_DATA,
} from 'stores/appcatalog/constants';
import { selectIngressCatalog } from 'stores/appcatalog/selectors';
import {
  AppCatalogActions,
  IAppCatalogsMap,
  IInstallIngress,
} from 'stores/appcatalog/types';
import { installApp, loadClusterApps } from 'stores/clusterapps/actions';
import { getCPAuthUser } from 'stores/cpauth/selectors';

import { createAsynchronousAction } from '../asynchronousAction';

export const listCatalogs = createAsynchronousAction<
  undefined,
  IState,
  IAppCatalogsMap
>({
  actionTypePrefix: CATALOGS_LIST,

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
        currCatalog.isFetchingIndex = false;

        agg[currCatalog.metadata.name] = currCatalog;

        return agg;
      },
      {}
    );

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
  actionTypePrefix: INSTALL_INGRESS_APP,
  perform: async (state, dispatch, payload) => {
    if (payload?.clusterId) {
      try {
        // These type casts are safe due to the checks in `shouldPerform()`.
        const gsCatalog = selectIngressCatalog(state) as IAppCatalog;
        const { name, version } = (gsCatalog.apps as IAppCatalogAppMap)[
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
      } catch (e) {
        // report the error
        const errorReporter = ErrorReporter.getInstance();
        errorReporter.notify(e);

        // show error
        let errorMessage =
          'Something went wrong while trying to install Ingress Controller App.';
        if (e.response?.message || e.message) {
          errorMessage = `There was a problem trying to install Ingress Controller App: ${
            e.response?.message ?? e.message
          }`;
        }

        new FlashMessage(
          errorMessage,
          messageType.ERROR,
          messageTTL.LONG,
          'Please try again later or contact support: support@giantswarm.io'
        );
      }
    }
  },
  shouldPerform: (state): boolean => {
    // only allow performing if we have loaded the catalog and have a version
    const gsCatalog = selectIngressCatalog(state);
    const app = gsCatalog?.apps?.[Constants.INSTALL_INGRESS_TAB_APP_NAME]?.[0];

    return typeof gsCatalog !== 'undefined' && typeof app !== 'undefined';
  },
  throwOnError: false,
});

export const prepareIngressTabData = createAsynchronousAction<
  IInstallIngress,
  IState,
  void
>({
  actionTypePrefix: PREPARE_INGRESS_TAB_DATA,
  perform: async (state, dispatch, payload) => {
    if (payload?.clusterId) {
      try {
        const gsCatalog = selectIngressCatalog(state) as IAppCatalog;

        await Promise.all([
          dispatch(loadClusterApps({ clusterId: payload.clusterId })),
          dispatch(catalogLoadIndex(gsCatalog)),
        ]);
      } catch (e) {
        // report the error
        const errorReporter = ErrorReporter.getInstance();
        errorReporter.notify(e);

        // show error
        let errorMessage =
          'Something went wrong while preparing data for Ingress Controller App installation.';
        if (e.response?.message || e.message) {
          errorMessage = `There was a problem preparing data for Ingress Controller App installation: ${
            e.response?.message ?? e.message
          }`;
        }

        new FlashMessage(
          errorMessage,
          messageType.ERROR,
          messageTTL.LONG,
          'Please try again later or contact support: support@giantswarm.io'
        );
      }
    }
  },
  shouldPerform: (state: IState): boolean => {
    const gsCatalog = selectIngressCatalog(state);

    return typeof gsCatalog !== 'undefined';
  },
  throwOnError: false,
});

export function catalogsLoad(): ThunkAction<
  Promise<IAppCatalogsMap>,
  IState,
  void,
  AppCatalogActions
> {
  return async (dispatch) => {
    try {
      dispatch({ type: CATALOGS_LOAD_REQUEST });

      const appsApi = new GiantSwarm.AppsApi();
      const response = await appsApi.getAppCatalogs();
      const catalogs = Array.from(response).reduce(
        (agg: IAppCatalogsMap, currCatalog: IAppCatalog) => {
          const { labels } = currCatalog.metadata;

          if (
            labels &&
            labels['application.giantswarm.io/catalog-type'] !== 'internal'
          ) {
            currCatalog.isFetchingIndex = true;
            agg[currCatalog.metadata.name] = currCatalog;
          }

          return agg;
        },
        {}
      );

      dispatch({
        type: CATALOGS_LOAD_SUCCESS,
        catalogs,
      });

      return catalogs;
    } catch (err) {
      const message = (err as Error).message ?? (err as string);
      dispatch({
        type: CATALOGS_LOAD_ERROR,
        error: message,
      });

      return Promise.reject(err);
    }
  };
}

export function catalogLoadIndex(
  catalog: IAppCatalog
): ThunkAction<Promise<void>, IState, void, AppCatalogActions> {
  return async (dispatch, getState) => {
    try {
      const currCatalog: IAppCatalog | undefined = getState().entities.catalogs
        .items[catalog.metadata.name];
      if (currCatalog?.apps || currCatalog?.isFetchingIndex) {
        // Skip if we already have apps loaded.
        return Promise.resolve();
      }

      dispatch({
        type: CATALOG_LOAD_INDEX_REQUEST,
        catalogName: catalog.metadata.name,
        id: catalog.metadata.name,
      });

      const catalogWithApps = await loadIndexForCatalog(catalog);
      dispatch({
        type: CATALOG_LOAD_INDEX_SUCCESS,
        catalog: catalogWithApps,
        id: catalog.metadata.name,
      });

      return Promise.resolve();
    } catch (err: unknown) {
      const message = (err as Error).message ?? (err as string);
      dispatch({
        type: CATALOG_LOAD_INDEX_ERROR,
        error: message,
        catalogName: catalog.metadata.name,
        id: catalog.metadata.name,
      });

      return Promise.resolve();
    }
  };
}

async function loadIndexForCatalog(catalog: IAppCatalog): Promise<IAppCatalog> {
  let indexURL = `${catalog.spec.storage.URL}index.yaml`;

  if (
    catalog.spec.storage.URL ===
    'https://kubernetes-charts.storage.googleapis.com/'
  ) {
    indexURL = `/catalogs?url=${indexURL}`;
  }

  const response = await fetch(indexURL, { mode: 'cors' });
  if (response.status !== StatusCodes.Ok) {
    return Promise.reject(
      new Error(
        `Could not fetch ${indexURL}. (Host '${catalog.spec.storage.URL}' Status ${response.status}`
      )
    );
  }

  const responseText = await response.text();
  const rawCatalog = yaml.safeLoad(responseText) as IAppCatalogYAML;
  const catalogWithApps: IAppCatalog = Object.assign({}, catalog, {
    apps: rawCatalog.entries,
  });

  return catalogWithApps;
}

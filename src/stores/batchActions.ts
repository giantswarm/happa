import { filterFunc } from 'components/Apps/AppsList/utils';
import { push } from 'connected-react-router';
import ErrorReporter from 'lib/errors/ErrorReporter';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import { IOAuth2Provider } from 'lib/OAuth2/OAuth2';
import RoutePath from 'lib/routePath';
import { AnyAction } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { MainRoutes, OrganizationsRoutes } from 'shared/constants/routes';
import { supportsMapiApps, supportsMapiClusters } from 'shared/featureSupport';
import { INodePool } from 'shared/types';
import {
  enableCatalog,
  listCatalogs,
  loadClusterApps,
} from 'stores/appcatalog/actions';
import { IAsynchronousDispatch } from 'stores/asynchronousAction';
import {
  clusterCreate,
  clusterDelete,
  clusterLoadDetails,
  clusterLoadKeyPairs,
  clustersDetails,
  clustersList,
  refreshClustersList,
} from 'stores/cluster/actions';
import {
  BATCHED_CLUSTER_CREATION_ERROR,
  BATCHED_CLUSTER_CREATION_REQUEST,
  BATCHED_CLUSTER_CREATION_SUCCESS,
  CLUSTER_LOAD_DETAILS_REQUEST,
} from 'stores/cluster/constants';
import {
  fetchPermissions,
  globalLoadError,
  globalLoadFinish,
  globalLoadStart,
  refreshUserInfo,
} from 'stores/main/actions';
import { getInfo, resumeLogin } from 'stores/main/actions';
import { getLoggedInUser } from 'stores/main/selectors';
import { LoggedInUserTypes } from 'stores/main/types';
import { modalHide } from 'stores/modal/actions';
import {
  clusterNodePoolsLoad,
  nodePoolsCreate,
  nodePoolsLoad,
} from 'stores/nodepool/actions';
import {
  organizationCredentialsLoad,
  organizationDeleteConfirmed,
  organizationSelect,
  organizationsLoad,
  organizationsLoadMAPI,
} from 'stores/organization/actions';
import { loadReleases } from 'stores/releases/actions';
import { IState } from 'stores/state';
import { extractMessageFromError } from 'utils/errorUtils';

export function batchedLayout(
  auth: IOAuth2Provider
): ThunkAction<Promise<void>, IState, void, AnyAction> {
  return async (dispatch: IAsynchronousDispatch<IState>, getState) => {
    dispatch(globalLoadStart());

    try {
      await dispatch(resumeLogin(auth));

      const user = getLoggedInUser(getState())!;
      if (user.type === LoggedInUserTypes.MAPI) {
        await dispatch(organizationsLoadMAPI(auth));
        await dispatch(fetchPermissions(auth));
      } else {
        await dispatch(organizationsLoad());
      }

      await dispatch(refreshUserInfo());

      // TODO(axbarsan): Remove this once [this](https://github.com/giantswarm/roadmap/issues/336) is done.
      if (user.type === LoggedInUserTypes.GS) {
        await dispatch(getInfo());
      }
    } catch (err) {
      dispatch(push(MainRoutes.Login));
      dispatch(globalLoadError());

      new FlashMessage(
        'Please log in again, as your previously saved credentials appear to be invalid.',
        messageType.WARNING,
        messageTTL.MEDIUM
      );

      ErrorReporter.getInstance().notify(err);

      return;
    }

    try {
      const user = getLoggedInUser(getState())!;
      const provider = window.config.info.general.provider;

      if (!supportsMapiApps(user, provider)) {
        const catalogs = await dispatch(listCatalogs());

        Object.entries(catalogs)
          .filter(filterFunc(user.isAdmin))
          .forEach(([key]) => {
            if (key !== 'helm-stable') {
              dispatch(enableCatalog(key));
            }
          });
      }

      if (!supportsMapiClusters(user, provider)) {
        dispatch(loadReleases());
        await dispatch(
          clustersList({
            withLoadingFlags: true,
          })
        );
      }

      dispatch(globalLoadFinish());

      if (!supportsMapiClusters(user, provider)) {
        await dispatch(
          clustersDetails({
            filterBySelectedOrganization: true,
            withLoadingFlags: true,
            initializeNodePools: true,
          })
        );
        await dispatch(
          nodePoolsLoad({
            filterBySelectedOrganization: true,
            withLoadingFlags: true,
          })
        );
      }
    } catch (err) {
      dispatch(globalLoadError());
      ErrorReporter.getInstance().notify(err);
    }
  };
}

export function batchedRefreshClusters(): ThunkAction<
  Promise<void>,
  IState,
  void,
  AnyAction
> {
  return async (dispatch) => {
    try {
      await dispatch(refreshClustersList());
      await dispatch(
        clustersDetails({
          filterBySelectedOrganization: true,
          withLoadingFlags: false,
          initializeNodePools: false,
          refreshPaths: true,
        })
      );
      dispatch(
        nodePoolsLoad({
          filterBySelectedOrganization: true,
          withLoadingFlags: false,
        })
      );
    } catch (err) {
      ErrorReporter.getInstance().notify(err);
    }
  };
}

export function batchedClusterCreate(
  cluster: Cluster,
  isV5Cluster: boolean,
  nodePools: INodePool[] = []
): ThunkAction<Promise<void>, IState, void, AnyAction> {
  return async (dispatch) => {
    let redirectPath = '';

    try {
      dispatch({ type: BATCHED_CLUSTER_CREATION_REQUEST });

      const creationResponse = await dispatch(
        clusterCreate(cluster, isV5Cluster)
      );
      if (!creationResponse) {
        dispatch({
          type: BATCHED_CLUSTER_CREATION_ERROR,
          error: 'Something went wrong while trying to create the cluster.',
        });

        return Promise.resolve();
      }
      const { clusterId, owner } = creationResponse;

      // TODO We can avoid this call by computing capabilities in the call above and storing the cluster
      await dispatch(
        clusterLoadDetails(clusterId, {
          withLoadingFlags: true,
          initializeNodePools: true,
        })
      );

      redirectPath = RoutePath.createUsablePath(
        OrganizationsRoutes.Clusters.Detail.Home,
        {
          orgId: owner,
          clusterId,
        }
      );

      if (isV5Cluster) {
        // Check nodePools instead?
        await dispatch(
          nodePoolsCreate(clusterId, nodePools, { withFlashMessages: true })
        );
        await dispatch(
          clusterNodePoolsLoad(clusterId, {
            withLoadingFlags: true,
          })
        );
      }

      dispatch({ type: BATCHED_CLUSTER_CREATION_SUCCESS });

      return Promise.resolve();
    } catch (err) {
      dispatch({
        type: BATCHED_CLUSTER_CREATION_ERROR,
        error: extractMessageFromError(
          err,
          'Something went wrong while trying to create the cluster.'
        ),
      });

      ErrorReporter.getInstance().notify(err);

      return Promise.resolve();
    } finally {
      if (redirectPath) {
        dispatch(push(redirectPath));
      }
    }
  };
}

export function batchedClusterDetailView(
  organizationId: string,
  clusterId: string,
  isV5Cluster: boolean
): ThunkAction<Promise<void>, IState, void, AnyAction> {
  return async (dispatch, getState) => {
    try {
      dispatch({
        type: CLUSTER_LOAD_DETAILS_REQUEST,
        id: clusterId,
      });

      dispatch(loadReleases());

      const user = getLoggedInUser(getState())!;
      const provider = window.config.info.general.provider;
      if (!supportsMapiApps(user, provider)) {
        dispatch(loadClusterApps({ clusterId }));
      }

      await Promise.all([
        dispatch(organizationCredentialsLoad(organizationId)),
        dispatch(clusterLoadKeyPairs(clusterId)),
      ]);

      await dispatch(
        clusterLoadDetails(clusterId, {
          withLoadingFlags: true,
          initializeNodePools: true,
        })
      );

      if (isV5Cluster) {
        await dispatch(
          clusterNodePoolsLoad(clusterId, {
            withLoadingFlags: true,
          })
        );
      }
    } catch (err) {
      ErrorReporter.getInstance().notify(err);
    }
  };
}

export function batchedRefreshClusterDetailView(
  clusterId: string
): ThunkAction<Promise<void>, IState, void, AnyAction> {
  return async (dispatch, getState) => {
    try {
      const cluster = await dispatch(
        clusterLoadDetails(clusterId, {
          withLoadingFlags: false,
          initializeNodePools: false,
          refreshPath: true,
        })
      );

      const isV5Cluster = getState().entities.clusters.v5Clusters.includes(
        clusterId
      );
      if (isV5Cluster) {
        await dispatch(
          clusterNodePoolsLoad(clusterId, {
            withLoadingFlags: false,
          })
        );
      }

      const user = getLoggedInUser(getState())!;
      const provider = window.config.info.general.provider;

      if (
        !supportsMapiApps(user, provider) &&
        Object.keys(cluster).length > 0
      ) {
        dispatch(loadClusterApps({ clusterId }));
      }
    } catch (err) {
      ErrorReporter.getInstance().notify(err);
    }
  };
}

export function batchedClusterDelete(
  cluster: Cluster
): ThunkAction<Promise<void>, IState, void, AnyAction> {
  return async (dispatch) => {
    try {
      await dispatch(clusterDelete(cluster));

      dispatch(push(MainRoutes.Home));
    } catch (err) {
      ErrorReporter.getInstance().notify(err);
    }
  };
}

export function batchedOrganizationDeleteConfirmed(
  organizationID: string
): ThunkAction<Promise<void>, IState, void, AnyAction> {
  return async (dispatch) => {
    try {
      const orgDeleted = await dispatch(
        organizationDeleteConfirmed(organizationID)
      );
      dispatch(modalHide());
      if (!orgDeleted) return;

      dispatch(push(OrganizationsRoutes.Home));
    } catch (err) {
      ErrorReporter.getInstance().notify(err);
    }
  };
}

export function batchedOrganizationSelect(
  orgId: string,
  withLoadingFlags: boolean
): ThunkAction<Promise<void>, IState, void, AnyAction> {
  return async (dispatch, getState) => {
    try {
      dispatch(organizationSelect(orgId));

      const user = getLoggedInUser(getState())!;
      const provider = window.config.info.general.provider;

      if (!supportsMapiClusters(user, provider)) {
        dispatch(
          clustersDetails({
            filterBySelectedOrganization: true,
            withLoadingFlags: withLoadingFlags,
          })
        );
        await dispatch(
          nodePoolsLoad({
            filterBySelectedOrganization: true,
            withLoadingFlags: withLoadingFlags,
          })
        );
      }
    } catch (err) {
      ErrorReporter.getInstance().notify(err);
    }
  };
}

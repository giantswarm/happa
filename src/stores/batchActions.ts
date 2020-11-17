import { push } from 'connected-react-router';
import CPAuth from 'lib/CPAuth/CPAuth';
import ErrorReporter from 'lib/errors/ErrorReporter';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import RoutePath from 'lib/routePath';
import { AnyAction } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { AppRoutes, OrganizationsRoutes } from 'shared/constants/routes';
import FeatureFlags from 'shared/FeatureFlags';
import { INodePool } from 'shared/types';
import { listCatalogs } from 'stores/appcatalog/actions';
import { loadClusterApps } from 'stores/appcatalog/actions';
import {
  clusterCreate,
  clusterDeleteConfirmed,
  clusterLoadDetails,
  clusterLoadKeyPairs,
  clustersDetails,
  clustersList,
  refreshClustersList,
} from 'stores/cluster/actions';
import { CLUSTER_LOAD_DETAILS_REQUEST } from 'stores/cluster/constants';
import { loadUser } from 'stores/cpauth/actions';
import {
  globalLoadError,
  globalLoadFinish,
  globalLoadStart,
  refreshUserInfo,
} from 'stores/main/actions';
import { getInfo } from 'stores/main/actions';
import { modalHide } from 'stores/modal/actions';
import {
  clusterNodePoolsLoad,
  nodePoolsCreate,
  nodePoolsLoad,
} from 'stores/nodepool/actions';
import {
  organizationCredentialsLoad,
  organizationSelect,
  organizationsLoad,
} from 'stores/organization/actions';
import { loadReleases } from 'stores/releases/actions';
import { IState } from 'stores/state';

export function batchedLayout(): ThunkAction<
  Promise<void>,
  IState,
  void,
  AnyAction
> {
  return async (dispatch) => {
    dispatch(globalLoadStart());

    try {
      await dispatch(refreshUserInfo());
      await dispatch(getInfo());
    } catch (err) {
      dispatch(globalLoadError());

      new FlashMessage(
        'Please log in again, as your previously saved credentials appear to be invalid.',
        messageType.WARNING,
        messageTTL.MEDIUM
      );
      dispatch(push(AppRoutes.Login));
      ErrorReporter.getInstance().notify(err);

      return;
    }

    if (FeatureFlags.FEATURE_CP_ACCESS) {
      try {
        dispatch(loadUser(CPAuth.getInstance()));
      } catch (err) {
        dispatch(globalLoadError());
        ErrorReporter.getInstance().notify(err);
      }
    }

    try {
      await dispatch(organizationsLoad());
      dispatch(listCatalogs());
      dispatch(loadReleases());
      await dispatch(
        clustersList({
          withLoadingFlags: true,
        })
      );

      dispatch(globalLoadFinish());

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
      const creationResponse = await dispatch(
        clusterCreate(cluster, isV5Cluster)
      );
      if (!creationResponse) {
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

      return Promise.resolve();
    } catch (err) {
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
  return async (dispatch) => {
    try {
      dispatch({
        type: CLUSTER_LOAD_DETAILS_REQUEST,
        id: clusterId,
      });

      // Lets use Promise.all when we have a series of async calls that not depend
      // on each another. It's faster and it's best from an error handling perspective.
      await Promise.all([
        dispatch(organizationCredentialsLoad(organizationId)),
        dispatch(loadReleases()),
        dispatch(loadClusterApps({ clusterId: clusterId })),
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

      // If cluster is an empty object, it means that it has been removed.
      // We don't want to load apps in this scenario.
      if (Object.keys(cluster).length > 0) {
        dispatch(loadClusterApps({ clusterId: clusterId }));
      }
    } catch (err) {
      ErrorReporter.getInstance().notify(err);
    }
  };
}

export function batchedClusterDeleteConfirmed(
  cluster: Cluster
): ThunkAction<Promise<void>, IState, void, AnyAction> {
  return async (dispatch) => {
    try {
      await dispatch(clusterDeleteConfirmed(cluster));
      dispatch(push(AppRoutes.Home));
      dispatch(modalHide());
    } catch (err) {
      ErrorReporter.getInstance().notify(err);
    }
  };
}

export function batchedOrganizationSelect(
  orgId: string
): ThunkAction<Promise<void>, IState, void, AnyAction> {
  return async (dispatch) => {
    try {
      dispatch(organizationSelect(orgId));
      dispatch(
        clustersDetails({
          filterBySelectedOrganization: true,
          withLoadingFlags: true,
        })
      );
      await dispatch(
        nodePoolsLoad({
          filterBySelectedOrganization: true,
          withLoadingFlags: true,
        })
      );
    } catch (err) {
      ErrorReporter.getInstance().notify(err);
    }
  };
}

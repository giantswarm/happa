import { filterFunc } from 'components/Apps/AppsList/utils';
import { push } from 'connected-react-router';
import { GenericResponseError } from 'model/clients/GenericResponseError';
import { StatusCodes } from 'model/constants';
import { MainRoutes, OrganizationsRoutes } from 'model/constants/routes';
import { supportsMapiApps, supportsMapiClusters } from 'model/featureSupport';
import {
  enableCatalog,
  listCatalogs,
  loadClusterApps,
} from 'model/stores/appcatalog/actions';
import { IAsynchronousDispatch } from 'model/stores/asynchronousAction';
import {
  clusterCreate,
  clusterDelete,
  clusterLoadDetails,
  clusterLoadKeyPairs,
  clustersDetails,
  clustersList,
  refreshClustersList,
} from 'model/stores/cluster/actions';
import {
  BATCHED_CLUSTER_CREATION_ERROR,
  BATCHED_CLUSTER_CREATION_REQUEST,
  BATCHED_CLUSTER_CREATION_SUCCESS,
  CLUSTER_LOAD_DETAILS_REQUEST,
} from 'model/stores/cluster/constants';
import {
  globalLoadError,
  globalLoadFinish,
  globalLoadStart,
  refreshUserInfo,
} from 'model/stores/main/actions';
import { resumeLogin } from 'model/stores/main/actions';
import { getLoggedInUser } from 'model/stores/main/selectors';
import { LoggedInUserTypes } from 'model/stores/main/types';
import { modalHide } from 'model/stores/modal/actions';
import {
  clusterNodePoolsLoad,
  nodePoolsCreate,
  nodePoolsLoad,
} from 'model/stores/nodepool/actions';
import {
  organizationCredentialsLoad,
  organizationDeleteConfirmed,
  organizationSelect,
  organizationsLoad,
  organizationsLoadMAPI,
} from 'model/stores/organization/actions';
import { loadReleases } from 'model/stores/releases/actions';
import { IState } from 'model/stores/state';
import { AnyAction } from 'redux';
import { ThunkAction } from 'redux-thunk';
import ErrorReporter from 'utils/errors/ErrorReporter';
import { extractMessageFromError } from 'utils/errorUtils';
import { FlashMessage, messageTTL, messageType } from 'utils/flashMessage';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';
import RoutePath from 'utils/routePath';

export function batchedLayout(
  auth: IOAuth2Provider
): ThunkAction<Promise<void>, IState, void, AnyAction> {
  return async (dispatch: IAsynchronousDispatch<IState>, getState) => {
    dispatch(globalLoadStart());

    try {
      const user = await dispatch(resumeLogin(auth));
      if (user.type === LoggedInUserTypes.MAPI) {
        await dispatch(organizationsLoadMAPI(auth));
      } else {
        await dispatch(organizationsLoad());
      }

      await dispatch(refreshUserInfo());
    } catch (err) {
      dispatch(push(MainRoutes.Login));
      dispatch(globalLoadError());

      if (
        (err as GenericResponseError).status === StatusCodes.BadRequest &&
        (err as GenericResponseError).message.includes(
          'Your request appears to be invalid'
        )
      ) {
        new FlashMessage(
          `We couldn't execute a request. Please try again later, and contact support at support@giantswarm.io if the problem persists.`,
          messageType.ERROR,
          messageTTL.LONG
        );
      } else {
        new FlashMessage(
          'Please log in again, as your previously saved credentials appear to be invalid.',
          messageType.WARNING,
          messageTTL.MEDIUM
        );
      }

      ErrorReporter.getInstance().notify(err as Error);

      return;
    }

    try {
      const user = getLoggedInUser(getState());
      if (!user) return;

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
      ErrorReporter.getInstance().notify(err as Error);
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
      ErrorReporter.getInstance().notify(err as Error);
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

      ErrorReporter.getInstance().notify(err as Error);

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

      const user = getLoggedInUser(getState());
      if (!user) return;

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
      ErrorReporter.getInstance().notify(err as Error);
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

      const isV5Cluster =
        getState().entities.clusters.v5Clusters.includes(clusterId);
      if (isV5Cluster) {
        await dispatch(
          clusterNodePoolsLoad(clusterId, {
            withLoadingFlags: false,
          })
        );
      }

      const user = getLoggedInUser(getState());
      if (!user) return;

      const provider = window.config.info.general.provider;

      if (
        !supportsMapiApps(user, provider) &&
        Object.keys(cluster).length > 0
      ) {
        dispatch(loadClusterApps({ clusterId }));
      }
    } catch (err) {
      ErrorReporter.getInstance().notify(err as Error);
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
      ErrorReporter.getInstance().notify(err as Error);
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
      ErrorReporter.getInstance().notify(err as Error);
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

      const user = getLoggedInUser(getState());
      if (!user) return;

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
      ErrorReporter.getInstance().notify(err as Error);
    }
  };
}

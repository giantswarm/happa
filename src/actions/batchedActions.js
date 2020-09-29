

import { push } from 'connected-react-router';
import CPAuth from 'lib/CPAuth/CPAuth';
import ErrorReporter from 'lib/errors/ErrorReporter';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import RoutePath from 'lib/routePath';
import { AppRoutes, OrganizationsRoutes } from 'shared/constants/routes';
import FeatureFlags from 'shared/FeatureFlags';
import { listCatalogs } from 'stores/appcatalog/actions';
import { loadClusterApps } from 'stores/clusterapps/actions';
import { loadUser } from 'stores/cpauth/actions';
import {
  globalLoadError,
  globalLoadFinish,
  globalLoadStart,
} from 'stores/global/actions';
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
import { getInfo, refreshUserInfo } from 'stores/user/actions';

import * as clusterActions from './clusterActions';
import { CLUSTER_LOAD_DETAILS_REQUEST } from 'stores/cluster/constants';

export const batchedLayout = () => async (dispatch) => {
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
      await dispatch(loadUser(CPAuth.getInstance()));
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
      clusterActions.clustersList({
        withLoadingFlags: true,
      })
    );

    dispatch(globalLoadFinish());

    await dispatch(
      clusterActions.clustersDetails({
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

export const batchedRefreshClusters = () => async (dispatch) => {
  try {
    await dispatch(clusterActions.refreshClustersList());
    await dispatch(
      clusterActions.clustersDetails({
        filterBySelectedOrganization: true,
        withLoadingFlags: false,
        initializeNodePools: false,
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

export const batchedClusterCreate = (
  cluster,
  isV5Cluster,
  nodePools = []
) => async (dispatch) => {
  try {
    const { clusterId, owner } = await dispatch(
      clusterActions.clusterCreate(cluster, isV5Cluster)
    );
    const clusterDetailPath = RoutePath.createUsablePath(
      OrganizationsRoutes.Clusters.Detail.Home,
      {
        orgId: owner,
        clusterId: clusterId,
      }
    );

    // TODO We can avoid this call by computing capabilities in the call above and storing the cluster
    await dispatch(
      clusterActions.clusterLoadDetails(clusterId, {
        withLoadingFlags: true,
        initializeNodePools: true,
      })
    );

    if (isV5Cluster) {
      // Check nodePools instead?
      await dispatch(nodePoolsCreate(clusterId, nodePools));
      await dispatch(
        clusterNodePoolsLoad(clusterId, {
          withLoadingFlags: true,
        })
      );
    }

    dispatch(push(clusterDetailPath));
  } catch (err) {
    ErrorReporter.getInstance().notify(err);
  }
};

export const batchedClusterDetailView = (
  organizationId,
  clusterId,
  isV5Cluster
) => async (dispatch) => {
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
      dispatch(clusterActions.clusterLoadKeyPairs(clusterId)),
    ]);

    await dispatch(
      clusterActions.clusterLoadDetails(clusterId, {
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

export const batchedRefreshClusterDetailView = (
  clusterId,
  isV5Cluster
) => async (dispatch) => {
  try {
    const cluster = await dispatch(
      clusterActions.clusterLoadDetails(clusterId, {
        withLoadingFlags: false,
        initializeNodePools: false,
      })
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

export const batchedClusterDeleteConfirmed = (cluster) => async (dispatch) => {
  try {
    await dispatch(clusterActions.clusterDeleteConfirmed(cluster));
    dispatch(push(AppRoutes.Home));
    dispatch(modalHide());
  } catch (err) {
    ErrorReporter.getInstance().notify(err);
  }
};

export const batchedOrganizationSelect = (orgId) => async (dispatch) => {
  try {
    await dispatch(organizationSelect(orgId));
    dispatch(
      clusterActions.clustersDetails({
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

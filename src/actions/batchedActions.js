import { push } from 'connected-react-router';
import CPAuth from 'lib/CPAuth/CPAuth';
import { ErrorReporter } from 'lib/errors';
import RoutePath from 'lib/routePath';
import { OrganizationsRoutes } from 'shared/constants/routes';
import FeatureFlags from 'shared/FeatureFlags';
import { listCatalogs } from 'stores/appcatalog/actions';
import { loadUser } from 'stores/cpauth/actions';

import * as appActions from './appActions';
import * as clusterActions from './clusterActions';
import * as modalActions from './modalActions';
import * as nodePoolActions from './nodePoolActions';
import * as organizationActions from './organizationActions';
import * as releaseActions from './releaseActions';
import * as userActions from './userActions';

export const batchedLayout = () => async (dispatch) => {
  try {
    await dispatch(userActions.refreshUserInfo());

    if (FeatureFlags.FEATURE_CP_ACCESS) {
      await dispatch(loadUser(CPAuth.getInstance()));
    }

    await dispatch(userActions.getInfo());
    await dispatch(organizationActions.organizationsLoad());
    dispatch(listCatalogs());
    dispatch(releaseActions.loadReleases());
    await dispatch(
      clusterActions.clustersList({
        withLoadingFlags: true,
      })
    );
    await dispatch(
      clusterActions.clustersDetails({
        filterBySelectedOrganization: true,
        withLoadingFlags: true,
        initializeNodePools: true,
      })
    );
    await dispatch(
      nodePoolActions.nodePoolsLoad({
        filterBySelectedOrganization: true,
        withLoadingFlags: true,
      })
    );
  } catch (err) {
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
      nodePoolActions.nodePoolsLoad({
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
      await dispatch(nodePoolActions.nodePoolsCreate(clusterId, nodePools));
      await dispatch(
        nodePoolActions.clusterNodePoolsLoad(clusterId, {
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
    // Lets use Promise.all when we have a series of async calls that not depend
    // on each another. It's faster and it's best from an error handling perspective.
    await Promise.all([
      dispatch(
        organizationActions.organizationCredentialsLoad(
          organizationId,
          clusterId
        )
      ),
      dispatch(releaseActions.loadReleases()),
      dispatch(appActions.loadApps(clusterId)),
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
        nodePoolActions.clusterNodePoolsLoad(clusterId, {
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
        nodePoolActions.clusterNodePoolsLoad(clusterId, {
          withLoadingFlags: false,
        })
      );
    }
    // If cluster is an empty object, it means that it has been removed.
    // We don't want to load apps in this scenario.
    if (!Object.keys(cluster).length === 0) {
      dispatch(appActions.loadApps(clusterId));
    }
  } catch (err) {
    ErrorReporter.getInstance().notify(err);
  }
};

export const batchedClusterDeleteConfirmed = (cluster) => async (dispatch) => {
  try {
    const organizationDetailPath = RoutePath.createUsablePath(
      OrganizationsRoutes.Detail,
      {
        orgId: cluster.owner,
      }
    );

    await dispatch(clusterActions.clusterDeleteConfirmed(cluster));
    dispatch(push(organizationDetailPath));
    dispatch(modalActions.modalHide());
  } catch (err) {
    ErrorReporter.getInstance().notify(err);
  }
};

export const batchedOrganizationSelect = (orgId) => async (dispatch) => {
  try {
    await dispatch(organizationActions.organizationSelect(orgId));
    dispatch(
      clusterActions.clustersDetails({
        filterBySelectedOrganization: true,
        withLoadingFlags: true,
      })
    );
    await dispatch(
      nodePoolActions.nodePoolsLoad({
        filterBySelectedOrganization: true,
        withLoadingFlags: true,
      })
    );
  } catch (err) {
    ErrorReporter.getInstance().notify(err);
  }
};

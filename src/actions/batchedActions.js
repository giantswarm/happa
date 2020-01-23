import { push } from 'connected-react-router';
import RoutePath from 'lib/routePath';
import { OrganizationsRoutes } from 'shared/constants/routes';

import * as appActions from './appActions';
import * as catalogActions from './catalogActions';
import * as clusterActions from './clusterActions';
import * as modalActions from './modalActions';
import * as nodePoolActions from './nodePoolActions';
import * as organizationActions from './organizationActions';
import * as releaseActions from './releaseActions';
import * as userActions from './userActions';

export const batchedLayout = () => async dispatch => {
  try {
    await dispatch(userActions.refreshUserInfo());
    await dispatch(userActions.getInfo());
    await dispatch(organizationActions.organizationsLoad());
    dispatch(catalogActions.catalogsLoad());
    await dispatch(
      clusterActions.clustersList({
        withLoadingFlags: true,
      })
    );
    await dispatch(
      clusterActions.clustersDetails({
        filterBySelectedOrganization: true,
        withLoadingFlags: true,
        withNodePools: true,
      })
    );
    await dispatch(
      nodePoolActions.nodePoolsLoad({
        filterBySelectedOrganization: true,
        withLoadingFlags: true,
      })
    );
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error in batchedLayout', err);
  }
};

export const batchedRefreshClusters = () => async dispatch => {
  try {
    // Removed clustersList() cause it overwrites the store and triggers new rerenders.
    await dispatch(
      clusterActions.clustersDetails({
        filterBySelectedOrganization: true,
        withLoadingFlags: false,
        withNodePools: false,
      })
    );
    dispatch(
      nodePoolActions.nodePoolsLoad({
        filterBySelectedOrganization: true,
        withLoadingFlags: false,
      })
    );
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error in batchedRefreshClusters', err);
  }
};

export const batchedClusterCreate = (
  cluster,
  isV5Cluster,
  nodePools = []
) => async dispatch => {
  try {
    const { clusterId, owner } = await dispatch(
      clusterActions.clusterCreate(cluster, isV5Cluster)
    );
    const clusterDetailPath = RoutePath.createUsablePath(
      OrganizationsRoutes.Clusters.Detail,
      {
        orgId: owner,
        clusterId: clusterId,
      }
    );

    // TODO We can avoid this call by computing capabilities in the call above and storing the cluster
    await dispatch(
      clusterActions.clusterLoadDetails(clusterId, {
        withLoadingFlags: true,
        withNodePools: true,
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
    // eslint-disable-next-line no-console
    console.error('Error in batchedCreateCluster', err);
  }
};

export const batchedClusterDetailView = (
  organizationId,
  clusterId,
  isV5Cluster
) => async dispatch => {
  try {
    await dispatch(
      organizationActions.organizationCredentialsLoad(organizationId, clusterId)
    );

    await dispatch(releaseActions.loadReleases());
    await dispatch(
      clusterActions.clusterLoadDetails(clusterId, {
        withLoadingFlags: true,
        withNodePools: true,
      })
    );
    if (isV5Cluster) {
      await dispatch(
        nodePoolActions.clusterNodePoolsLoad(clusterId, {
          withLoadingFlags: true,
        })
      );
    }
    await dispatch(appActions.loadApps(clusterId));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error in batchedClusterDetailView', err);
  }
};

export const batchedRefreshClusterDetailView = (
  clusterId,
  isV5Cluster
) => async dispatch => {
  try {
    await dispatch(
      clusterActions.clusterLoadDetails(clusterId, {
        withLoadingFlags: false,
        withNodePools: true,
      })
    );
    if (isV5Cluster) {
      await dispatch(
        nodePoolActions.clusterNodePoolsLoad(clusterId, {
          withLoadingFlags: false,
        })
      );
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error in batchedRefreshClusterDetailView', err);
  }
};

export const batchedClusterDeleteConfirmed = cluster => async dispatch => {
  try {
    const organizationDetailPath = RoutePath.createUsablePath(
      OrganizationsRoutes.Detail,
      {
        orgId: cluster.owner,
      }
    );
    dispatch(push(organizationDetailPath));

    await dispatch(clusterActions.clusterDeleteConfirmed(cluster));
    dispatch(modalActions.modalHide());
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error in batchedClusterDeleteConfirmed', err);
  }
};

export const batchedOrganizationSelect = orgId => async dispatch => {
  try {
    await dispatch(organizationActions.organizationSelect(orgId));
    dispatch(
      clusterActions.clustersDetails({
        filterBySelectedOrganization: false,
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
    // eslint-disable-next-line no-console
    console.error('Error in batchedOrganizationSelect', err);
  }
};

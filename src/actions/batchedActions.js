import { push } from 'connected-react-router';

// actions
import * as appActions from './appActions';
import * as clusterActions from './clusterActions';
import * as catalogActions from './catalogActions';
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
    await dispatch(clusterActions.clustersList({ withLoadingFlags: true }));
    await dispatch(clusterActions.clustersDetails({ withLoadingFlags: true }));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error in batchedLayout', err);
  }
};

export const batchedRefreshClusters = () => async dispatch => {
  try {
    await dispatch(clusterActions.clustersList({ withLoadingFlags: false }));
    dispatch(clusterActions.clustersDetails({ withLoadingFlags: false }));
  } catch (err) {
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

    // TODO We can avoid this call by computing capabilities in the call above abd storing the cluster
    await dispatch(clusterActions.clusterLoadDetails(clusterId));

    if (isV5Cluster) {
      // Check nodePools instead?
      await dispatch(nodePoolActions.nodePoolsCreate(clusterId, nodePools));
      await dispatch(nodePoolActions.clusterNodePoolsLoad(clusterId));
    }

    await dispatch(clusterActions.clusterLoadDetails(clusterId));

    if (isV5Cluster) {
      await dispatch(nodePoolActions.nodePoolsLoad(clusterId));
    }

    dispatch(push(`/organizations/${owner}/clusters/${clusterId}`));
  } catch (err) {
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
    await clusterActions.clusterLoadDetails(clusterId);
    await appActions.loadApps(clusterId);

    if (isV5Cluster) {
      await dispatch(nodePoolActions.clusterNodePoolsLoad(clusterId));
    }
  } catch (err) {
    console.error('Error in batchedClusterDetailView', err);
  }
};

export const batchedClusterDeleteConfirmed = cluster => async dispatch => {
  try {
    dispatch(push(`/organizations/${cluster.owner}`));
    await dispatch(clusterActions.clusterDeleteConfirmed(cluster));
    dispatch(modalActions.modalHide());
    // ensure refreshing of the clusters list
    await dispatch(clusterActions.clustersList({ withLoadingFlags: false }));
  } catch (err) {
    console.error('Error in batchedClusterDeleteConfirmed', err);
  }
};

export const batchedOrganizationSelect = orgId => async dispatch => {
  try {
    await dispatch(organizationActions.organizationSelect(orgId));
    dispatch(clusterActions.clustersDetails());
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error in batchedOrganizationSelect', err);
  }
};

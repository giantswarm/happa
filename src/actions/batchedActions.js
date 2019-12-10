import * as types from './actionTypes';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import GiantSwarm from 'giantswarm';
import { push } from 'connected-react-router';

// actions
import * as userActions from './userActions';
import * as organizationActions from './organizationActions';
import * as clusterActions from './clusterActions';
import * as catalogActions from './catalogActions';

export const batchedLayout = () => async dispatch => {
  try {
    await dispatch(userActions.refreshUserInfo());
    await dispatch(userActions.getInfo());
    await dispatch(organizationActions.organizationsLoad());
    dispatch(catalogActions.catalogsLoad());
    await dispatch(clusterActions.clustersList({ withLoadingFlags: true }));
    dispatch(clusterActions.clustersDetails({ withLoadingFlags: true }));
  } catch (err) {
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
  isV5Cluster
) => async dispatch => {
  try {
    const { clusterId, owner } = await dispatch(
      clusterActions.clusterCreate(cluster, isV5Cluster)
    );
    await dispatch(clusterActions.clusterLoadDetails(clusterId));
    dispatch(push(`/organizations/${owner}/clusters/${clusterId}`));
  } catch (err) {
    console.error('Error in batchedCreateCluster', err);
  }
};

export const batchedOrganizationSelect = orgId => async dispatch => {
  try {
    await dispatch(organizationActions.organizationSelect(orgId));
    dispatch(clusterActions.clustersDetails());
  } catch (err) {
    console.error('Error in batchedOrganizationSelect', err);
  }
};

import * as types from './actionTypes';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import GiantSwarm from 'giantswarm';

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
    dispatch(clusterActions.clustersLoad());
  } catch (err) {
    console.error('Error in batchedLayout', err);
  }
};

export const batchedOrganizationSelect = orgId => async dispatch => {
  try {
    await dispatch(organizationActions.organizationSelect(orgId));
    dispatch(clusterActions.clustersLoad());
  } catch (err) {
    console.error('Error in batchedOrganizationSelect', err);
  }
};

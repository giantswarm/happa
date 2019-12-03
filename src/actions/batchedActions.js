import * as types from './actionTypes';
import { FlashMessage, messageTTL, messageType } from 'lib/flash_message';
import GiantSwarm from 'giantswarm';

// actions
import * as userActions from './userActions';
import * as organizationActions from './organizationActions';
import * as clusterActions from './clusterActions';
import * as catalogActions from './catalogActions';

export function batchedLayout() {
  return async (dispatch, getState) => {
    try {
      await dispatch(userActions.refreshUserInfo());
      await dispatch(organizationActions.organizationsLoad());
      await dispatch(clusterActions.clustersLoad());
      await dispatch(catalogActions.catalogsLoad());
    } catch (err) {
      console.error('Error in batchedLayout', err);
    }
  };
}

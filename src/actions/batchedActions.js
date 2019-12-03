import * as types from './actionTypes';
import { FlashMessage, messageTTL, messageType } from 'lib/flash_message';
import GiantSwarm from 'giantswarm';

// actions
import { refreshUserInfo } from './userActions';
import { organizationsLoad } from './organizationActions';
import { clustersLoad } from './clusterActions';
import { catalogsLoad } from './catalogActions';

// This is the first component that loads,
// and refreshUserInfo and the subsequent organisationsLoad() are the
// first calls happa makes to the API.
export function batchedLayout() {
  return async (dispatch, getState) => {
    try {
      await dispatch(refreshUserInfo());
      await dispatch(organizationsLoad());
      await dispatch(clustersLoad());
      await dispatch(catalogsLoad());
    } catch (err) {
      console.error('Error in batchedLayout', err);
    }
  };
}

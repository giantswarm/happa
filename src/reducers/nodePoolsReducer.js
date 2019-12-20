/* eslint-disable no-fallthrough */
import * as types from 'actions/actionTypes';
import produce from 'immer';

const initialState = {
  items: {},
  isFetching: false,
};

// With immer the idea is you put your state inside the draft and immer will take
// care of everything else. Draft is mutable, so we can use push(), splice(), etc.

// From the docs: "Notice that it is not needed to handle the default case, a producer
// that doesn't do anything will simply return the original state."

const nodePools = produce((draft, action) => {
  switch (action.type) {
    // TODO Find a better/simpler approach.
    case types.NODEPOOLS_LOAD:
    case types.CLUSTERS_LOAD:
    case types.NODEPOOL_DELETE_CONFIRMED:
    case types.V5_CLUSTER_CREATE_SUCCESS:
    case types.NODEPOOLS_CREATE:
    case types.RELEASES_LOAD:
      draft.isFetching = true;
      return;

    case types.CLUSTER_LOAD_DETAILS_SUCCESS:
      draft.isFetching = false;
      return;

    case types.NODEPOOLS_LOAD_SUCCESS:
    case types.NODEPOOLS_CREATE_SUCCESS:
      draft.items = action.nodePools;
      draft.isFetching = false;
      return;

    case types.NODEPOOLS_LOAD_ERROR:
    case types.NODEPOOL_DELETE_ERROR:
      draft.errorLoading = true;
      draft.isFetching = false;
      return;

    case types.NODEPOOL_PATCH:
      Object.keys(action.payload).forEach(key => {
        draft.items[action.nodePool.id][key] = action.payload[key];
      });
      return;

    case types.NODEPOOL_PATCH_ERROR:
      draft.items[action.nodePool.id] = action.nodePool;
      return;

    case types.NODEPOOL_DELETE_SUCCESS:
      delete draft.items[action.nodePoolId];
      draft.lastUpdated = Date.now();
      draft.isFetching = false;
      return;

    case types.NODEPOOL_CREATE_SUCCESS:
      draft.items[action.nodePool.id] = action.nodePool;
      return;

    case types.NODEPOOL_CREATE_ERROR:
    case types.NODEPOOLS_CREATE_ERROR:
      delete draft.items[action.nodePoolId];
      draft.errorCreating = true;
      draft.isFetching = false;
      
  }
  // This empty object is the default state.
}, initialState);

export default nodePools;

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
    case types.NODEPOOLS_LOAD:
      draft.isFetching = true;
      return;

    case types.NODEPOOLS_LOAD_SUCCESS:
      draft.items = action.nodePools;
      draft.isFetching = false;
      draft.isFetching = false;
      return;

    case types.NODEPOOLS_LOAD_ERROR:
      draft.errorLoading = true;
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
      return;

    case types.NODEPOOL_CREATE_SUCCESS:
      draft.items[action.nodePool.id] = action.nodePool;
      return;

    case types.NODEPOOL_CREATE_ERROR:
      delete draft.items[action.nodePoolId];
      draft.errorCreating = true;
      return;
  }
  // This empty object is the default state.
}, initialState);

export default nodePools;

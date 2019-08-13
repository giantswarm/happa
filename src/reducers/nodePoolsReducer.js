/* eslint-disable no-fallthrough */
import * as types from 'actions/actionTypes';
import produce from 'immer';

// With immer the idea is you put your state inside the draft and immer will take
// care of everything else. Draft is mutable, so we can use push(), splice(), etc.

// From the docs: "Notice that it is not needed to handle the default case, a producer
// that doesn't do anything will simply return the original state."

export const nodePools = produce((draft, action) => {
  switch (action.type) {
    case types.NODEPOOLS_LOAD_SUCCESS:
      draft = action.nodePools;
    
    case types.NODEPOOLS_LOAD_ERROR:
      draft.errorLoading = true;

    case types.NODEPOOL_PATCH:
      Object.keys(action.payload).forEach(key => {
        draft[action.nodePool.id][key] = action.payload[key];
      });

    case types.NODEPOOL_PATCH_ERROR:
        draft[action.nodePool.id] = action.nodePool;
  
  }
  // This empty obeject is the default state.
}, {}); 

export default nodePools;

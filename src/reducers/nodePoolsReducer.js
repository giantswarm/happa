import * as types from 'actions/actionTypes';

export const nodePools = (state = {}, action) => {
  switch (action.type) {
    case types.NODEPOOLS_LOAD_SUCCESS: {
      return {
        ...action.nodePools,
      };
    }

    case types.NODEPOOLS_LOAD_ERROR:
      return {
        ...state,
        errorLoading: true,
      };

    case types.NODEPOOL_PATCH:
      return {
        ...state,
        [action.nodePool.id]: {
          ...action.nodePool,
          ...action.payload,
        },
      };

    case types.NODEPOOL_PATCH_ERROR:
      return {
        ...state,
        [action.nodePool.id]: {
          ...action.nodePool,
        },
      };

    default:
      return state;
  }
};

export default nodePools;

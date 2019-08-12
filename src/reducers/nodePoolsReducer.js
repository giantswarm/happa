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

    case types.NODEPOOL_PATCH: {
      // Find the node pool we want to modify.
      const oldNodePool = { ...state.items.nodePools[action.nodePool.id] };

      // Merge node pool with new data coming from the action (payload).
      const newNodePool = { ...oldNodePool, ...action.payload };

      return {
        ...state.items.nodePools,
        [action.nodePool.id]: newNodePool,
      };
    }

    // case types.NODEPOOL_PATCH_ERROR: {
    //   // Node pools in state.
    //   const nodePools = [...state.items[action.clusterId].nodePools];

    //   // Find the index of the node pool we want to modify
    //   const indexOfOldNodePool = nodePools.findIndex(
    //     np => np.id === action.nodePool.id
    //   );

    //   // Remove old new pool and add new one.
    //   const newNodePools = (nodePools, index) => {
    //     return [
    //       ...nodePools.slice(0, index),
    //       ...nodePools.slice(index + 1),
    //       action.nodePool,
    //     ];
    //   };

    //   return {
    //     ...state,
    //     lastUpdated: Date.now(),
    //     items: {
    //       ...state.items,
    //       [action.clusterId]: {
    //         ...state.items[action.clusterId],
    //         nodePools: newNodePools(nodePools, indexOfOldNodePool),
    //       },
    //     },
    //   };
    // }

    default:
      return state;
  }
};

export default nodePools;

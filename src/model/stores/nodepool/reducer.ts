import produce from 'immer';
import {
  CLUSTER_NODEPOOLS_LOAD_SUCCESS,
  NODEPOOL_CREATE_ERROR,
  NODEPOOL_CREATE_SUCCESS,
  NODEPOOL_DELETE_SUCCESS,
  NODEPOOL_PATCH,
  NODEPOOL_PATCH_ERROR,
} from 'model/stores/nodepool/constants';
import { INodePoolState, NodePoolActions } from 'model/stores/nodepool/types';

const initialState: INodePoolState = {
  items: {},
  isFetching: false,
};

const nodePoolReducer = produce(
  (draft: INodePoolState, action: NodePoolActions) => {
    switch (action.type) {
      case CLUSTER_NODEPOOLS_LOAD_SUCCESS:
        for (const np of action.nodePools) {
          draft.items[np.id] = np;
        }

        break;

      case NODEPOOL_PATCH:
        draft.items[action.nodePool.id] = Object.assign(
          {},
          action.nodePool,
          action.payload
        );

        break;

      case NODEPOOL_PATCH_ERROR:
        draft.items[action.nodePool.id] = action.nodePool;

        break;

      case NODEPOOL_DELETE_SUCCESS:
      case NODEPOOL_CREATE_ERROR:
        delete draft.items[action.nodePool.id];

        break;

      case NODEPOOL_CREATE_SUCCESS:
        draft.items[action.nodePool.id] = action.nodePool;

        break;
    }
  },
  initialState
);

export default nodePoolReducer;

import produce from 'immer';

import { updateClusterLabels } from './actions';

interface IState {
  requestInProgress: boolean;
  error: Error | null;
}

const initialState: IState = {
  requestInProgress: false,
  error: null,
};

const clusterLabelsReducer = produce((draft: IState, action) => {
  const { types } = updateClusterLabels();
  switch (action.type) {
    case types.request:
      draft.requestInProgress = true;
      draft.error = null;

      break;

    case types.success:
      draft.requestInProgress = false;
      draft.error = null;

      break;

    case types.error:
      draft.requestInProgress = false;
      draft.error = action.error;
  }
}, initialState);

export default clusterLabelsReducer;

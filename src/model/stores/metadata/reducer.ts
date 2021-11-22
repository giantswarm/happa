import produce from 'immer';
import * as actions from 'model/stores/metadata/actions';
import {
  METADATA_UPDATE_CHECK,
  METADATA_UPDATE_SCHEDULE,
  METADATA_UPDATE_SET_TIMER,
  METADATA_UPDATE_SET_VERSION_SUCCESS,
} from 'model/stores/metadata/constants';
import { IMetadataState, MetadataAction } from 'model/stores/metadata/types';

const initialState: IMetadataState = {
  version: {
    current: '',
    new: null,
    lastCheck: 0,
    timer: 0,
  },
};

const metadataReducer = produce(
  (draft: IMetadataState, action: MetadataAction) => {
    switch (action.type) {
      case METADATA_UPDATE_SET_TIMER:
        draft.version.timer = action.timer;

        break;

      case actions.setInitialVersion().types
        .success as typeof METADATA_UPDATE_SET_VERSION_SUCCESS:
        draft.version.current = action.response;

        break;

      case METADATA_UPDATE_CHECK:
        draft.version.lastCheck = action.timestamp;

        break;

      case METADATA_UPDATE_SCHEDULE:
        draft.version.new = action.version;

        break;
    }
  },
  initialState
);

export default metadataReducer;

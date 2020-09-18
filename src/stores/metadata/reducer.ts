import produce from 'immer';
import {
  METADATA_UPDATE_CHECK,
  METADATA_UPDATE_EXECUTE,
  METADATA_UPDATE_SCHEDULE,
  METADATA_UPDATE_SET_TIMER,
  METADATA_UPDATE_SET_VERSION,
} from 'stores/metadata/constants';
import { IMetadataState, MetadataAction } from 'stores/metadata/types';

const initialState: IMetadataState = {
  version: {
    current: 'VERSION',
    new: null,
    isUpdating: false,
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

      case METADATA_UPDATE_SET_VERSION:
        draft.version.current = action.version;

        break;

      case METADATA_UPDATE_CHECK:
        draft.version.lastCheck = action.timestamp;

        break;

      case METADATA_UPDATE_SCHEDULE:
        draft.version.new = action.version;

        break;

      case METADATA_UPDATE_EXECUTE:
        draft.version.isUpdating = true;

        break;
    }
  },
  initialState
);

export default metadataReducer;

import produce from 'immer';
import {
  ENTITYERROR_SUCCESS_SUFFIX,
  ENTITYERROR_SUFFIX,
} from 'model/stores/entityerror/constants';
import {
  EntityErrorActions,
  IEntityErrorState,
} from 'model/stores/entityerror/types';

const errorActionTypeRegexp = new RegExp(
  `(.*)_(${ENTITYERROR_SUFFIX}|${ENTITYERROR_SUCCESS_SUFFIX})`
);

const initialState: IEntityErrorState = {};

const entityErrorReducer = produce(
  (draft: IEntityErrorState, action: EntityErrorActions) => {
    const { type, id, error } = action;
    if (!id) return;

    const matches = errorActionTypeRegexp.exec(type);
    if (!matches) return;
    const [, requestName, requestState] = matches;

    switch (requestState) {
      case ENTITYERROR_SUFFIX:
        draft[id] = { ...draft[id], [requestName]: error ?? '' };

        break;

      case ENTITYERROR_SUCCESS_SUFFIX:
        if (draft[id]?.[requestName]) {
          delete draft[id][requestName];
        }

        break;
    }
  },
  initialState
);

export default entityErrorReducer;

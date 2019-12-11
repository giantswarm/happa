import produce from 'immer';

const initialState = {
  CLUSTER_LIST: false,
  CLUSTERS_DETAILS: false,
};

const loadingReducer = produce((draft, action) => {
  const { type } = action;
  const matches = /(.*)_(REQUEST|SUCCESS|FAILURE|FINISHED)/.exec(type);

  // not a *_REQUEST / *_SUCCESS /  *_FAILURE actions, so we ignore them
  if (!matches) return;

  const [, requestName, requestState] = matches;
  // Store whether a request is happening at the moment or not
  // e.g. will be true when receiving GET_TODOS_REQUEST
  //      and false when receiving GET_TODOS_SUCCESS / GET_TODOS_FAILURE
  draft[requestName] = requestState === 'REQUEST';
  return;
}, initialState);

export default loadingReducer;

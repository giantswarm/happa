import produce from 'immer';

const initialState = {
  CLUSTER_LIST: false,
  CLUSTERS_DETAILS: false,
};

const loadingReducer = produce((draft, action) => {
  const { type } = action;
  const matches = /(.*)_(REQUEST|SUCCESS|ERROR|FINISHED)/.exec(type);

  // not a *_REQUEST / *_SUCCESS / *_ERROR / *_FINISHED actions, so we ignore them
  if (!matches) return;

  const [, requestName, requestState] = matches;
  // Store whether a request is happening at the moment or not
  // e.g. will be true when receiving GET_TODOS_REQUEST
  //      and false when receiving GET_TODOS_SUCCESS / GET_TODOS_ERROR
  draft[requestName] = requestState === 'REQUEST';
  
}, initialState);

export default loadingReducer;

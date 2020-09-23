import produce from 'immer';

const initialState = {
  CLUSTERS_LIST: true,
  CLUSTER_LOAD_DETAILS: true,
  CLUSTER_NODEPOOLS_LOAD: true,
  NODEPOOL_MULTIPLE_LOAD: true,
  CLUSTERS_DETAILS: true, // all clusters
  CLUSTER_LOAD_STATUS: false,
};

const loadingReducer = produce((draft, action) => {
  const { type } = action;
  const matches = /(.*)_(REQUEST|SUCCESS|ERROR|FINISHED|NOT_FOUND)/.exec(type);

  // not a *_REQUEST / *_SUCCESS / *_ERROR / *_FINISHED actions, so we ignore them
  if (!matches) return;

  const [, requestName, requestState] = matches;
  // Store whether a request is happening at the moment or not
  // e.g. will be true when receiving GET_TODOS_REQUEST
  //      and false when receiving GET_TODOS_SUCCESS / GET_TODOS_ERROR
  draft[requestName] = requestState === 'REQUEST';
}, initialState);

export default loadingReducer;

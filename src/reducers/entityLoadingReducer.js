import produce from 'immer';

const initialState = {};

// Lets use this reducer to track API call errors where we need an ID to identify the
// item that we are having problems with getting its info, ie getCluster or getNodePool
const entityLoadingReducer = produce((draft, action) => {
  const { type, id } = action;
  const matches = /(.*)_(REQUEST|SUCCESS|ERROR|FINISHED|NOT_FOUND)/.exec(type);

  // not a *_REQUEST / *_SUCCESS / *_ERROR / *_FINISHED actions, or no id -> we ignore them
  if (!matches || !id) return;

  const [, requestName, requestState] = matches;

  // Store whether a request is happening at the moment or not
  // e.g. will be true when receiving CLUSTER_LOAD_DETAILS_REQUEST
  // and false when receiving CLUSTER_LOAD_DETAILS_SUCCESS / CLUSTER_LOAD_DETAILS_ERROR
  draft[id] = { [requestName]: requestState === 'REQUEST' };
}, initialState);

export default entityLoadingReducer;

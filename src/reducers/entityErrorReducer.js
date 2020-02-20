import produce from 'immer';

const initialState = {};

// Lets use this reducer to track API call errors where we need an ID to identify the
// item that we are having problems with getting its info, ie getCluster or getNodePool
const entityErrorReducer = produce((draft, action) => {
  const { type, id, error } = action;
  const matches = /(.*)_(SUCCESS|ERROR)/.exec(type);

  // not a *_SUCCESS / *_ERROR actions, or no id -> we ignore them
  if (!matches || !id) return;

  const [, requestName, requestState] = matches;

  switch (requestState) {
    case 'ERROR':
      draft[id] = { ...draft[id], [requestName]: error ?? '' };

      return;

    // If the actions is a SUCCESS one, lets remove the key and keep the error object as
    // minimal as possible.
    case 'SUCCESS':
      if (draft[id]?.[requestName]) {
        delete draft[id][requestName];
      }
  }
}, initialState);

export default entityErrorReducer;

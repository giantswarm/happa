import produce from 'immer';

const initialState = {};

const errorReducer = produce((draft, action) => {
  const { type, payload } = action;
  const matches = /(.*)_(SUCCESS|ERROR)/.exec(type);

  // not a *_SUCCESS / *_ERROR actions, so we ignore them
  if (!matches) return;

  const [, requestName, requestState] = matches;

  switch (requestState) {
    case 'ERROR':
      draft[requestName] = payload ?? '';

      return;

    // If the actions is a SUCCESS one, lets remove the key and keep the error object as
    // minimal as possible.
    case 'SUCCESS':
      if (draft[requestName]) {
        delete draft[requestName];
      }
  }
}, initialState);

export default errorReducer;

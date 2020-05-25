export function callAPIMiddleware({ dispatch, getState }) {
  return (next) => (action) => {
    const { types, doPerform } = action;

    if (!types) {
      // Normal action: pass it on
      return next(action);
    }

    if (!types.request || !types.success || !types.error) {
      throw new Error('One or more action types are missing.');
    }

    if (typeof doPerform !== 'function') {
      throw new Error('Expected doPerform to be a function.');
    }

    dispatch({
      type: types.request,
    });

    return doPerform(getState())
      .then((response) => {
        dispatch({
          response,
          type: types.success,
        });
      })
      .catch((error) => {
        dispatch({
          error,
          type: types.error,
        });
      });
  };
}

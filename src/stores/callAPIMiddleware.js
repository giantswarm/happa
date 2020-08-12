export function callAPIMiddleware({ dispatch, getState }) {
  return (next) => (action) => {
    const { types, doPerform, throwOnError } = action;

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

    return doPerform(getState(), dispatch)
      .then((response) => {
        dispatch({
          response,
          type: types.success,
        });

        return response;
      })
      .catch((error) => {
        dispatch({
          error: error.message,
          type: types.error,
        });

        if (throwOnError) {
          throw error;
        }

        // TODO: Remove this, this supports a pattern we want to factor out
        // eventually.
        return {
          error: error.message,
        };
      });
  };
}

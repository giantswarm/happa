export function callAPIMiddleware({ dispatch, getState }) {
  return (next) => async (action) => {
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

    try {
      const request = doPerform(getState(), dispatch);
      if (!request) {
        return Promise.resolve(next(action));
      }

      const response = await request;
      dispatch({
        response,
        type: types.success,
      });

      return response;
    } catch (err) {
      dispatch({
        error: err.message,
        type: types.error,
      });

      if (throwOnError) {
        throw err;
      }

      // TODO: Remove this, this supports a pattern we want to factor out
      // eventually.
      return {
        error: err.message,
      };
    }
  };
}

import ErrorReporter from 'utils/errors/ErrorReporter';

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

    const request = doPerform(getState(), dispatch);
    if (!request) return next(action);

    return request
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

        ErrorReporter.getInstance().notify(error);

        return {
          error: error.message,
        };
      });
  };
}

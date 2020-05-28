export interface IActionTypeCollection {
  request: string;
  success: string;
  error: string;
}

export interface IAsynchronousAction<S, R> {
  types: IActionTypeCollection;
  doPerform: (state: S) => Promise<R> | undefined;
}

export interface IAsynchronousActionParams<P, S, R> {
  actionTypePrefix: string;
  perform: (state: S, payload?: P) => Promise<R>;
  shouldPerform: (state: S) => boolean;
}

/**
 Returns an action that is meant to be intercepted by the `callAPIMiddleware`
 It takes an object that defines the action prefix, the function to call to
 perform the action, and a function to run before performing the action to check
 if the action should be performed.

 The return value of the perform function will be dispatched if the perform
 action succeeded.

 Example:

 ```
 getClusterDetails = createAsynchronousAction({
   actionTypePrefix: 'GET_CLUSTER_DETAILS',
   perform: async (state, payload) => {
     let response = ... logic that performs the action ...
     return response
   },
   shouldPerform: () => true
 });

 let payload = {clusterID: 'abc12'};
 dispatch(getClusterDetails(payload));
 ```

 When combined with callAPIMiddleware, this will dispatch:
 `{type: 'GET_CLUSTER_DETAILS_REQUEST'}`

 Followed by:
 `{type: 'GET_CLUSTER_DETAILS_SUCCESS', response: response}`

 */
export function createAsynchronousAction<P, S, R>({
  actionTypePrefix,
  perform,
  shouldPerform,
}: IAsynchronousActionParams<P, S, R>): (
  payload?: P
) => IAsynchronousAction<S, R> {
  const action = (payload?: P) => ({
    types: {
      request: `${actionTypePrefix}_REQUEST`,
      success: `${actionTypePrefix}_SUCCESS`,
      error: `${actionTypePrefix}_ERROR`,
    },
    doPerform: (state: S) =>
      shouldPerform(state) ? perform(state, payload) : undefined,
  });

  return action;
}

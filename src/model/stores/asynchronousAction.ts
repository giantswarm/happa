import { IState } from 'model/stores/state';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

export interface IAsynchronousDispatch<S>
  extends ThunkDispatch<S, void, AnyAction> {
  <R>(action: IAsynchronousAction<S, R>): Promise<R>;
}

/**
 * Refactor to support template string types once
 * TypeScript 4.1 is released.
 * https://github.com/microsoft/TypeScript/pull/40336
 */
export interface IActionTypeCollection {
  request: string;
  success: string;
  error: string;
}

export interface IAsynchronousAction<S, R> {
  // type is here to make this conform to the redux's AnyAction interface,
  // so that we can dispatch it. Even though the callApiMiddleware intercepts it,
  // and it is not a real "action" that a reducer will ever see.
  type: string;
  types: IActionTypeCollection;
  doPerform: (
    state: S,
    dispatch: IAsynchronousDispatch<S>
  ) => Promise<R> | void;
}

export interface IAsynchronousActionParams<P, S, R> {
  actionTypePrefix: string;
  perform: (
    state: S,
    dispatch: IAsynchronousDispatch<S>,
    payload?: P
  ) => Promise<R>;
  shouldPerform: (state: S) => boolean;
  throwOnError: boolean;
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
  throwOnError = false,
}: IAsynchronousActionParams<P, S, R>): (
  payload?: P
) => IAsynchronousAction<S, R> {
  const action = (payload?: P) => ({
    type: 'CALL_API_MIDDLEWARE_ACTION',
    types: {
      request: `${actionTypePrefix}_REQUEST`,
      success: `${actionTypePrefix}_SUCCESS`,
      error: `${actionTypePrefix}_ERROR`,
    },
    doPerform: (state: S, dispatch: ThunkDispatch<IState, void, AnyAction>) =>
      shouldPerform(state) ? perform(state, dispatch, payload) : undefined,
    throwOnError: throwOnError,
  });

  return action;
}

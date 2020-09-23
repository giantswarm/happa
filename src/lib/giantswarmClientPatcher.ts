import GiantSwarm from 'giantswarm';
import Auth from 'lib/auth0';
import { isJwtExpired } from 'lib/helpers';
import { IState } from 'reducers/types';
import { AnyAction, Store } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { AuthorizationTypes } from 'shared/constants';
import { auth0Login } from 'stores/user/actions';

/**
 * This class patches the client's callApi function to check
 * the JWT token before making a call to the Giant Swarm API.
 * If the token is expired, the token gets renewed first.
 * @param store - The Redux store.
 */
function monkeyPatchGiantSwarmClient(store: Store) {
  const auth = Auth.getInstance();
  const defaultClient = GiantSwarm.ApiClient.instance;
  const origCallApi = defaultClient.callApi.bind(defaultClient);

  defaultClient.callApi = async function callApi(
    path,
    httpMethod,
    pathParams,
    queryParams,
    headerParams,
    formParams,
    bodyParam,
    authNames,
    contentTypes,
    accepts,
    returnType
  ) {
    const defaultClientAuth = this.authentications['AuthorizationHeaderToken'];

    /**
     * If we're using a JWT token, and it's expired, refresh the token before making
     * any call.
     */
    if (
      defaultClientAuth.apiKeyPrefix === AuthorizationTypes.BEARER &&
      defaultClientAuth.apiKey &&
      isJwtExpired(defaultClientAuth.apiKey)
    ) {
      try {
        const result = await auth.renewToken();

        // Update state with new token.
        await (store.dispatch as ThunkDispatch<IState, void, AnyAction>)(
          auth0Login(result)
        );

        // Ensure the second attempt uses the new token.
        headerParams[
          'Authorization'
        ] = `${AuthorizationTypes.BEARER} ${result.accessToken}`;
      } catch (err) {
        /**
         * Add the `401: Unauthorized` status code, to
         * enforce correct semantics.
         */
        err.status = 401;

        return Promise.reject(err);
      }
    }

    return origCallApi(
      path,
      httpMethod,
      pathParams,
      queryParams,
      headerParams,
      formParams,
      bodyParam,
      authNames,
      contentTypes,
      accepts,
      returnType
    );
  };
}

export default monkeyPatchGiantSwarmClient;

import { auth0Login } from 'actions/userActions';
import GiantSwarm from 'giantswarm';
import Auth0 from 'lib/auth0';
import { isJwtExpired } from 'lib/helpers';
import { AuthorizationTypes } from 'shared/constants';

// monkeyPatchGiantSwarmClient will patch the client's callApi function to check
// the JWT token before making a call to the Giant Swarm API. If the token is
// expired, renew the token first.
function monkeyPatchGiantSwarmClient(store) {
  const auth0 = new Auth0();

  const defaultClient = GiantSwarm.ApiClient.instance;

  const origCallApi = defaultClient.callApi.bind(defaultClient);

  defaultClient.callApi = function callApi(
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

    // If we're using a JWT token, and it's expired, refresh the token before making
    // any call.
    if (
      defaultClientAuth.apiKeyPrefix === AuthorizationTypes.BEARER &&
      defaultClientAuth.apiKey
    ) {
      if (isJwtExpired(defaultClientAuth.apiKey)) {
        return auth0
          .renewToken()
          .then(async result => {
            // Update state with new token.
            await store.dispatch(auth0Login(result));

            // Ensure the second attempt uses the new token.
            headerParams[
              'Authorization'
            ] = `${AuthorizationTypes.BEARER} ${result.accessToken}`;

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
          })
          .catch(err => {
            err.status = 401; // Add 'status: 401' to the error object
            // so the layout component can treat auth0
            // login required errors correctly.
            throw err;
          });
      }
    }

    // JWT token is not expired, or we're not using a JWT token, so just do the call.
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

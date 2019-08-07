// A wrapper for the GiantSwarm JS Client
// It checks if the JWT token is expired and tries to renew it, before making
// the api call.

import { auth0Login } from 'actions/userActions';
import { isJwtExpired } from 'lib/helpers';
import Auth0 from 'lib/auth0';
import configureStore from '../stores/configureStore';
import GiantSwarm from 'giantswarm';

const auth0 = new Auth0();
const store = configureStore({});

var defaultClient = GiantSwarm.ApiClient.instance;

// Patch the client's callApi function to check the JWT token before making a
// call to the Giant Swarm API. If the token is expired, renew the token first.
var origCallApi = defaultClient.callApi.bind(defaultClient);

defaultClient.callApi = function callApi(
  path,
  httpMethod,
  pathParams,
  queryParams,
  collectionQueryParams,
  headerParams,
  formParams,
  bodyParam,
  authNames,
  contentTypes,
  accepts,
  returnType,
  apiBasePath
) {
  var defaultClientAuth = this.authentications['AuthorizationHeaderToken'];

  // If we're using a JWT token, and it's expired, refresh the token before making
  // any call.
  if (defaultClientAuth.apiKeyPrefix === 'Bearer' && defaultClientAuth.apiKey) {
    if (isJwtExpired(defaultClientAuth.apiKey)) {
      return auth0
        .renewToken()
        .then(result => {
          // Update state with new token.
          store.dispatch(auth0Login(result));

          // Ensure the second attempt uses the new token.
          headerParams['Authorization'] = 'Bearer ' + result.accessToken;

          return origCallApi(
            path,
            httpMethod,
            pathParams,
            queryParams,
            collectionQueryParams,
            headerParams,
            formParams,
            bodyParam,
            authNames,
            contentTypes,
            accepts,
            returnType,
            apiBasePath
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
    collectionQueryParams,
    headerParams,
    formParams,
    bodyParam,
    authNames,
    contentTypes,
    accepts,
    returnType,
    apiBasePath
  );
};

export default GiantSwarm;

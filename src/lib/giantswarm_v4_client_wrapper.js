'use strict';

// A wrapper for the GiantSwarm V4 JS Client
// It initializes the client with the right end point.

import GiantSwarmV4 from 'giantswarm-v4';
import Auth0 from '../lib/auth0';
import configureStore from '../stores/configureStore';
import { auth0Login } from '../actions/userActions';

const auth0 = new Auth0();
const store = configureStore({});

var defaultClient = GiantSwarmV4.ApiClient.instance;

function parseJwt(token) {
  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  return JSON.parse(window.atob(base64));
}

// Patch the client's callApi function to check the JWT token before making a
// call to the Giant Swarm API. If the token is expired, renew the token first.
var origCallApi = defaultClient.callApi.bind(defaultClient);

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
  var defaultClientAuth = this.authentications['AuthorizationHeaderToken'];

  // If we're using a JWT token, and it's expired, refresh the token before making
  // any call.
  if (defaultClientAuth.apiKeyPrefix === 'Bearer' && defaultClientAuth.apiKey) {
    var now = Math.round(Date.now() / 1000); // Browsers have millisecond precision, which we don't need.
    var expire = parseJwt(defaultClientAuth.apiKey).exp;

    if (now > expire) {
      return new Promise(resolve => {
        resolve(
          auth0
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
              throw err;
            })
        );
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

export default GiantSwarmV4;

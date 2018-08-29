'use strict';

// A wrapper for the GiantSwarm V4 JS Client
// It initializes the client with the right end point.

import GiantSwarmV4 from 'giantswarm-v4';
import Auth0 from '../lib/auth0';
import configureStore from '../stores/configureStore';
import { unauthorized } from '../actions/userActions';

const auth0 = new Auth0();
const store = configureStore({});

var defaultClient = GiantSwarmV4.ApiClient.instance;
defaultClient.basePath = window.config.apiEndpoint;

// Patch the client's callApi function so that 401 errors are handled with
// an attempt to get a new token, and then a recall of the original call.
// This way expired tokens are handled without the user ever noticing it.
var origCallApi = defaultClient.callApi.bind(defaultClient);

defaultClient.callApi = function callApi(path, httpMethod, pathParams,
queryParams, headerParams, formParams, bodyParam, authNames, contentTypes, accepts,
returnType) {

  return origCallApi(path, httpMethod, pathParams, queryParams, headerParams, formParams,
    bodyParam, authNames, contentTypes, accepts, returnType).catch((err) => {

      var defaultClientAuth = this.authentications['AuthorizationHeaderToken'];

      // If we're trying to log in, don't try and handle 401 errors.
      if (path === '/v4/auth-tokens/') {
        throw err;
      }

      // If the response from the Giant Swarm API is '401'
      // And we had a Bearer token (so not a giantswarm token)
      if (err.status === 401 && defaultClientAuth.apiKeyPrefix === 'Bearer') {
        // Then try to renew the token silently:
        return auth0.renewToken()
        .then((result) => {
          defaultClientAuth.apiKeyPrefix = 'Bearer';
          defaultClientAuth.apiKey = result.accessToken;

          // Since I don't have access to redux actions here now, manipulate
          // the user storage directly.
          var userData = JSON.parse(localStorage.getItem('user'));
          userData.auth.token = result.accessToken;
          localStorage.setItem('user', JSON.stringify(userData));

          // Ensure the second attempt uses the new token.
          headerParams['Authorization'] = 'Bearer ' + result.accessToken;

          return origCallApi(path, httpMethod, pathParams, queryParams, headerParams, formParams,
                             bodyParam, authNames, contentTypes, accepts, returnType);
        })
        .catch((err) => {
          store.dispatch(unauthorized());
          throw(err);
        });
      } else if (err.status == 401) {
          store.dispatch(unauthorized());
          throw(err);
      } else {
        throw err;
      }
    });
};

export default GiantSwarmV4;

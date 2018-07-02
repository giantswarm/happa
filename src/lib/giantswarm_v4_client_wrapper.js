'use strict';

// A wrapper for the GiantSwarm V4 JS Client
// It initializes the client with the right end point.

import configureStore from '../stores/configureStore';
import {unauthorized, auth0Login} from '../actions/userActions';
import GiantSwarmV4 from 'giantswarm-v4';
import Auth0 from '../lib/auth0';

const store = configureStore();
const auth0 = new Auth0();

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

      // If the response from the Giant Swarm API is '401'
      // And we had a Bearer token (so not a giantswarm token)
      if (err.status === 401 && defaultClientAuth.apiKeyPrefix === 'Bearer') {
        // Then try to renew the token silently:
        return auth0.renewToken()
        .then((result) => {
          store.dispatch(auth0Login(result));

          defaultClientAuth.apiKeyPrefix = 'Bearer';
          defaultClientAuth.apiKey = result.accessToken;

          return origCallApi(path, httpMethod, pathParams, queryParams, headerParams, formParams,
                             bodyParam, authNames, contentTypes, accepts, returnType);
        })
        .catch((err) => {
          store.dispatch(unauthorized());
          throw(err);
        });
      } else {
        store.dispatch(unauthorized());
        throw err;
      }
    });
};

export default GiantSwarmV4;

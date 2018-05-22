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
      if (err.status === 401) {
        return auth0.renewToken()
        .then((result) => {
          store.dispatch(auth0Login(result));

          var defaultClientAuth = this.authentications['AuthorizationHeaderToken'];
          defaultClientAuth.apiKeyPrefix = 'Bearer';
          defaultClientAuth.apiKey = result.idToken;

          return origCallApi(path, httpMethod, pathParams, queryParams, headerParams, formParams,
    bodyParam, authNames, contentTypes, accepts, returnType);
        })
        .catch((err) => {
          store.dispatch(unauthorized());
          throw(err);
        });
      } else {
        throw err;
      }
    });
};

export default GiantSwarmV4;

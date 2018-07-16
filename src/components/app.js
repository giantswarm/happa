'use strict';

import 'babel-polyfill';
import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { render } from 'react-dom';
import Layout from './layout';
import adminLogin from './auth/admin';
import login from './auth/login';
import logout from './auth/logout';
import signup from './signup/index';
import oauth_callback from './auth/oauth_callback.js';
// import notFound from './not_found/index';
import forgot_password_index from './forgot_password/index';
import forgot_password_set_password from './forgot_password/set_password';
// import Organizations from './organizations';
import { Provider } from 'react-redux';
import configureStore from '../stores/configureStore';
// import organizationDetail from './organizations/detail';
// import createCluster from './create_cluster';
// import clusterDetail from './organizations/cluster_detail';
// import accountSettings from './account_settings';
// import Home from './home';
import GiantSwarmV4 from 'giantswarm-v4';
import { ConnectedRouter } from 'connected-react-router';
import { createBrowserHistory } from 'history';

require('normalize.css');
require('bootstrap/dist/css/bootstrap.min.css');
require('../styles/app.scss');
require('react-datepicker/dist/react-datepicker.css');

var appContainer = document.getElementById('app');

const history = createBrowserHistory();
const store = configureStore({}, history);


var defaultClient = GiantSwarmV4.ApiClient.instance;
defaultClient.basePath = window.config.apiEndpoint;
// var defaultClientAuth = defaultClient.authentications['AuthorizationHeaderToken'];


// function requireAuth(nextState, replace) {
//   var state = store.getState();

//   if (state.app.loggedInUser) {
//     defaultClientAuth.apiKeyPrefix = state.app.loggedInUser.auth.scheme;
//     defaultClientAuth.apiKey = state.app.loggedInUser.auth.token;
//   } else {
//     replace({
//       pathname: '/login',
//       query: { nextPathname: nextState.location.pathname }
//     });
//   }
// }

render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <div>
        <Switch>
        <Route path="/admin-login" component={adminLogin} />
        <Route path="/login" component={login} />
        <Route path="/logout" component={logout} />
        <Route path="/forgot_password" component={forgot_password_index} />
        <Route path="/forgot_password/:token" component={forgot_password_set_password} />
        <Route path="/signup/:token" component={signup} />
        <Route path="/oauth/callback" component={oauth_callback} />

        <Route path='/' component={Layout} />
        </Switch>
      </div>
    </ConnectedRouter>
  </Provider>,
  appContainer
);

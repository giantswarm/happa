'use strict';

import React from 'react';
import { applyRouterMiddleware, Router, Route, IndexRoute, browserHistory, IndexRedirect } from 'react-router';
import { useScroll } from 'react-router-scroll';
import { render } from 'react-dom';
import Layout from './layout';
import gettingStarted from './getting-started/index';
import login from './login/index';
import logout from './logout/index';
import signup from './signup/index';
import notFound from './not_found/index';
// import createCluster from './create_cluster';
import forgot_password_index from './forgot_password/index';
import forgot_password_set_password from './forgot_password/set_password';
import Organizations from './organizations';
import { Provider } from 'react-redux';
import configureStore from '../stores/configureStore';
import organizationDetail from './organizations/detail';
import createCluster from './create_cluster';
import clusterDetail from './organizations/cluster_detail';
import accountSettings from './account_settings';
import Home from './home';
import AirbrakeClient from 'airbrake-js';

require('normalize.css');
require('bootstrap/dist/css/bootstrap.min.css');
require('../styles/app.scss');
require('react-datepicker/dist/react-datepicker.css');

if (window.config.environment != 'development') {
  var airbrake = new AirbrakeClient({
    projectId: 'b623d794488458d023f2fcbea93954ca',
    projectKey: 'b623d794488458d023f2fcbea93954ca',
    reporter: 'xhr',
    host: 'https://exceptions.giantswarm.io'
  });

  airbrake.addFilter(function(notice) {
    notice.context.environment = window.config.environment;
    notice.context.version = window.config.version;
    return notice;
  });
}

var appContainer = document.getElementById('app');

const store = configureStore();

function requireAuth(nextState, replace) {
  var state = store.getState();

  if (! state.app.loggedInUser) {
    replace({
      pathname: '/login',
      query: { nextPathname: nextState.location.pathname }
    });
  }
}

browserHistory.listen(() => {window.Intercom('update');});

render(
  <Provider store={store}>
    <Router history={browserHistory} render={applyRouterMiddleware(useScroll())}>
      <Route path = "/login" component={login} />
      <Route path = "/logout" component={logout} />
      <Route path = "/forgot_password" component={forgot_password_index} />
      <Route path = "/forgot_password/:token" component={forgot_password_set_password} />
      <Route path = "/signup/:token" component={signup} />

      <Route name="Home" path="/" component={Layout} onEnter={requireAuth}>
        <IndexRoute component={Home}/>

        <Route name='Create Cluster' path="new-cluster" component={createCluster} />

        <Route name='Getting Started' path="getting-started" >
          <IndexRoute component={gettingStarted} />

          <Route name="getting-started.page" path ="/getting-started/:pageId" component={gettingStarted} />
        </Route>

        <Route name="Organizations" path="organizations">
          <IndexRoute component={Organizations} />
          <Route name="organizations.detail" path="/organizations/:orgId">
            <IndexRoute component={organizationDetail} />
            <Route name="Clusters" path="/organizations/:orgId/clusters">
              <IndexRedirect to="/organizations/:orgId" />
              <Route name="clusters.detail" path="/organizations/:orgId/clusters/:clusterId" component={clusterDetail} />
            </Route>
          </Route>
        </Route>

        <Route name="Account Settings" path="/account_settings" component={accountSettings} />
        <Route path="*" component={notFound} />
      </Route>
    </Router>
  </Provider>,
  appContainer
);

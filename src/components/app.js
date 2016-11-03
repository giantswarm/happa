'use strict';

import React from 'react';
import { applyRouterMiddleware, Router, Route, IndexRoute, NotFoundRoute, browserHistory } from 'react-router';
import { useScroll } from 'react-router-scroll';
import { render } from 'react-dom';
import Layout from './layout';
import gettingStarted from './getting-started/index';
import login from './login/index';
import logout from './logout/index';
import signup from './signup/index';
import notFound from './not_found/index';
import forgot_password_index from './forgot_password/index';
import forgot_password_set_password from './forgot_password/set_password';
import Organizations from './organizations';
import { Provider } from 'react-redux';
import configureStore from '../stores/configureStore';
import organizationDetail from './organizations/detail';
import accountSettings from './account_settings';
import wip from './wip';
import Home from './home';

require('normalize.css');
require('../styles/app.scss');

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

browserHistory.listen(location => {window.Intercom('update');});

render(
  <Provider store={store}>
    <Router history={browserHistory} render={applyRouterMiddleware(useScroll())}>
      <Route path = "/login" component={login} />
      <Route path = "/logout" component={logout} />
      <Route path = "/forgot_password" component={forgot_password_index} />
      <Route path = "/forgot_password/:token" component={forgot_password_set_password} />
      <Route path = "/signup/:contactId/:token" component={signup} />

      <Route name="Home" path="/" component={Layout} onEnter={requireAuth}>
        <IndexRoute component={Home}/>

        <Route name='Getting Started' path="getting-started" >
          <IndexRoute component={gettingStarted} />

          <Route name="getting-started.page" path ="/getting-started/:pageId" component={gettingStarted} />
        </Route>

        <Route name="Organizations" path="organizations">
          <IndexRoute component={Organizations} />
          <Route name="organizations.detail" path="/organizations/:orgId" component={organizationDetail} />
        </Route>

        <Route name="Account Settings" path="/account_settings" component={accountSettings} />
        <Route path="*" component={notFound} />
      </Route>
    </Router>
  </Provider>,
  appContainer
);
